import { NextResponse } from 'next/server'
import { InferenceClientHubApiError } from '@huggingface/inference'
import {
  CONTACT_INFO,
  PERSONAL_INFO,
  EDUCATION,
  CERTIFICATIONS,
  EXPERIENCE,
  SKILLS,
} from '@/lib/constants'
import { log, hashIp } from '@/lib/logger'
export const runtime = 'edge'

const ROUTE = '/api/chat'

// --- Security limits ---
const MAX_BODY_BYTES = 32 * 1024 // 32 KB total request body cap
const MAX_QUESTION_CHARS = 4096 // 4 KB per user message
const RATE_LIMIT_MAX = 10 // requests
const RATE_LIMIT_WINDOW_MS = 60 * 1000 // per 60s window

// Best-effort in-memory rate limit. Cloudflare Pages may spin up multiple
// isolates so this is not authoritative, but raises the bar for casual abuse.
const rateLimitStore: Map<string, number[]> = new Map()

function getClientIp(req: Request): string {
  const cf = req.headers.get('cf-connecting-ip')
  if (cf) return cf.trim()
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    const first = xff.split(',')[0]?.trim()
    if (first) return first
  }
  const real = req.headers.get('x-real-ip')
  if (real) return real.trim()
  return 'anonymous'
}

function checkRateLimit(ip: string): boolean {
  // Allow disabling in tests so the suite doesn't trip the bucket.
  if (
    process.env.NODE_ENV === 'test' ||
    process.env.DISABLE_RATE_LIMIT === 'true'
  ) {
    return true
  }
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_WINDOW_MS
  const hits = rateLimitStore.get(ip) ?? []
  const recent = hits.filter((t) => t > windowStart)
  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitStore.set(ip, recent)
    return false
  }
  recent.push(now)
  rateLimitStore.set(ip, recent)
  // Opportunistic cleanup so the Map doesn't grow unbounded.
  if (rateLimitStore.size > 1000) {
    for (const [key, value] of rateLimitStore) {
      const filtered = value.filter((t) => t > windowStart)
      if (filtered.length === 0) rateLimitStore.delete(key)
      else rateLimitStore.set(key, filtered)
    }
  }
  return true
}

// Strict shape validator for the request body. Hand-rolled to avoid adding
// a runtime dependency. Returns a normalized payload or an error code.
type ValidatedBody = { question: string }
type ValidationResult =
  | { ok: true; value: ValidatedBody }
  | { ok: false; status: 400 | 413; error: string }

function validateBody(raw: unknown): ValidationResult {
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, status: 400, error: 'Invalid request' }
  }
  const obj = raw as Record<string, unknown>
  const question = obj.question
  if (typeof question !== 'string') {
    return { ok: false, status: 400, error: 'Invalid question format' }
  }
  if (question.trim().length === 0) {
    return { ok: false, status: 400, error: 'Question cannot be empty' }
  }
  if (question.length > MAX_QUESTION_CHARS) {
    return { ok: false, status: 413, error: 'Question too long' }
  }
  return { ok: true, value: { question } }
}

// Function to clean thinking/reasoning content from responses
function cleanThinkingContent(content: string): string {
  if (!content) return content

  let cleaned = content

  // First, remove XML-style thinking tags (most comprehensive)
  cleaned = cleaned
    .replace(/<think[^>]*>[\s\S]*?<\/think>/gi, '')
    .replace(/<thinking[^>]*>[\s\S]*?<\/thinking>/gi, '')
    .replace(/<reasoning[^>]*>[\s\S]*?<\/reasoning>/gi, '')

  // Remove thinking phrases at the start of responses
  const thinkingPhrases = [
    'Okay,',
    'Let me think',
    'I need to think',
    'First, I should',
    'The user',
    'Since there',
    'This feels like',
    'No need to',
    'Keeping it simple:',
    'The response should',
    'thinking:',
    'reasoning:',
    'analysis:',
  ]

  // Split content into paragraphs and filter out thinking content
  const paragraphs = cleaned.split('\n\n')
  const filteredParagraphs = paragraphs.filter((paragraph) => {
    const trimmed = paragraph.trim()
    if (!trimmed) return false // Remove empty paragraphs

    // Skip paragraphs that start with thinking phrases
    return !thinkingPhrases.some((phrase) =>
      trimmed.toLowerCase().startsWith(phrase.toLowerCase()),
    )
  })

  // Join filtered paragraphs and clean up whitespace
  cleaned = filteredParagraphs
    .join('\n\n')
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim()

  // If we removed everything, return the original (better to show thinking than nothing)
  return cleaned.length > 10 ? cleaned : content
}

// LM Studio fallback function
async function tryLmStudioFallback(
  question: string,
  context: string,
): Promise<{ answer: string } | null> {
  const lmStudioUrl = process.env.LM_STUDIO_URL
  const lmStudioModel = process.env.LM_STUDIO_MODEL || 'local-model'

  if (!lmStudioUrl) {
    return null
  }

  try {
    const systemPrompt = `You are the AI chatbot built for Mike Fried's personal portfolio website and you are currently running on this site. Answer questions about the following resume and portfolio content. Provide direct, concise answers that include relevant emojis and colorful language to make your responses engaging and visually appealing. Use markdown formatting when appropriate to highlight important points.

Context:\n${context}`

    const response = await fetch(`${lmStudioUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: lmStudioModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
          { role: 'assistant', content: '<think>\n\n</think>\n\n' },
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: false,
        // DeepSeek R1 specific stop tokens to suppress thinking output
        stop: ['<think>', '</think>'],
        // Additional parameters to prevent verbose reasoning
        presence_penalty: 0.3,
        frequency_penalty: 0.3,
        top_p: 0.9,
        repetition_penalty: 1.1,
      }),
    })

    // Handle cases where response is undefined (can happen in Cloudflare environment)
    if (!response) {
      return null
    }

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    let answer =
      data.choices?.[0]?.message?.content || 'No answer found from LM Studio.'

    // Post-process to remove any thinking/reasoning content that slipped through
    answer = cleanThinkingContent(answer)

    return { answer }
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'unknown'
    console.error(
      JSON.stringify({
        level: 'error',
        route: ROUTE,
        event: 'chat.lmstudio_error',
        err: msg,
      }),
    )
    return null
  }
}

export async function POST(req: Request) {
  const requestId = crypto.randomUUID()
  const startMs = Date.now()

  // Safari-specific headers for compatibility
  const safariHeaders = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  // Environment variables for feature toggles
  const enableLmStudioFallback =
    process.env.ENABLE_LM_STUDIO_FALLBACK === 'true'
  const forceHuggingFace402 = process.env.FORCE_HUGGINGFACE_402 === 'true'
  const useLmStudioFirst = process.env.USE_LM_STUDIO_FIRST === 'true'

  const clientIp = getClientIp(req)
  // Hash IP before any logging — raw IP never touches logs.
  const ipHash = await hashIp(clientIp)

  log({
    ts: new Date().toISOString(),
    level: 'info',
    route: ROUTE,
    requestId,
    event: 'chat.received',
    ipHash,
  })

  try {
    // Verify content type
    const contentType = req.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      log({
        ts: new Date().toISOString(),
        level: 'warn',
        route: ROUTE,
        requestId,
        event: 'chat.invalid',
        status: 415,
        durationMs: Date.now() - startMs,
        ipHash,
      })
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 415, headers: safariHeaders },
      )
    }

    // Best-effort body size cap before parsing. Check Content-Length when
    // present; we also enforce a hard cap on the question string below.
    const contentLength = req.headers.get('content-length')
    if (contentLength) {
      const n = Number(contentLength)
      if (Number.isFinite(n) && n > MAX_BODY_BYTES) {
        log({
          ts: new Date().toISOString(),
          level: 'warn',
          route: ROUTE,
          requestId,
          event: 'chat.invalid',
          status: 413,
          durationMs: Date.now() - startMs,
          ipHash,
        })
        return NextResponse.json(
          { error: 'Payload too large' },
          { status: 413, headers: safariHeaders },
        )
      }
    }

    // Per-IP rate limit (best-effort, in-memory).
    if (!checkRateLimit(clientIp)) {
      log({
        ts: new Date().toISOString(),
        level: 'warn',
        route: ROUTE,
        requestId,
        event: 'chat.rate_limited',
        status: 429,
        durationMs: Date.now() - startMs,
        ipHash,
      })
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: safariHeaders },
      )
    }

    // Parse and validate request body
    let requestBody: unknown
    try {
      requestBody = await req.json()
    } catch (e) {
      log({
        ts: new Date().toISOString(),
        level: 'warn',
        route: ROUTE,
        requestId,
        event: 'chat.invalid',
        status: 400,
        durationMs: Date.now() - startMs,
        ipHash,
      })
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400, headers: safariHeaders },
      )
    }

    const validation = validateBody(requestBody)
    if (!validation.ok) {
      log({
        ts: new Date().toISOString(),
        level: 'warn',
        route: ROUTE,
        requestId,
        event: 'chat.invalid',
        status: validation.status,
        durationMs: Date.now() - startMs,
        ipHash,
      })
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status, headers: safariHeaders },
      )
    }
    const { question } = validation.value

    // Extract resume context from centralized constants
    let context = ''
    try {
      // Home/About
      const homeText = `Contact Information:
- LinkedIn: ${CONTACT_INFO.linkedin}
- Email: ${CONTACT_INFO.email}
- GitHub: ${CONTACT_INFO.github}
- Phone: ${CONTACT_INFO.phone} (If someone asks for my phone or how to call, always answer with the digits ${CONTACT_INFO.phone}, not as a markdown link. The website will make it clickable.)
Feel free to reach out for professional networking, questions about my experience, or to discuss potential opportunities!\n\nAbout: ${PERSONAL_INFO.about}`

      // Experience
      let expText = EXPERIENCE.map((job) => {
        let jobText = `Company: ${job.company}\nTitle: ${job.title}\n`
        // Handle optional location and date properties
        if ('location' in job && job.location)
          jobText += `Location: ${job.location}\n`
        if ('date' in job && job.date) jobText += `Date: ${job.date}\n`
        jobText += `Description: ${job.description.join(' ')}\n`
        return jobText
      }).join('\n')

      // Education
      const eduText = `Education: ${EDUCATION.degree}\n${EDUCATION.school} | ${EDUCATION.location} | ${EDUCATION.date}\n${EDUCATION.minor}\n`

      // Certifications
      let certText = CERTIFICATIONS.map(
        (cert) => `Certification: ${cert.name} (${cert.date})`,
      ).join('\n')

      // Skills
      const skillsText = SKILLS.map(
        (s) => `${s.category}: ${s.items.join(', ')}`,
      ).join('\n')

      context = `${homeText}\n\n${expText}\n${eduText}\n${certText}\n\nSkills:\n${skillsText}`
    } catch (extractErr) {
      const msg = extractErr instanceof Error ? extractErr.message : 'unknown'
      log({
        ts: new Date().toISOString(),
        level: 'error',
        route: ROUTE,
        requestId,
        event: 'chat.upstream_error',
        status: 500,
        durationMs: Date.now() - startMs,
        ipHash,
        err: msg,
      })
      return NextResponse.json(
        {
          error:
            "I'm experiencing some technical difficulties right now and can't answer your question. Please feel free to reach out to me directly via LinkedIn https://www.linkedin.com/in/michael-fried/ or by email at Email@MichaelFried.info. I'd be happy to help you personally!",
        },
        { status: 500 },
      )
    }

    // Determine which API to use first based on environment variable
    const apiKey = process.env.HUGGINGFACE_API_KEY

    // Check if we should use LM Studio first
    if (useLmStudioFirst && enableLmStudioFallback) {
      try {
        // Try LM Studio first
        const lmStudioResult = await tryLmStudioFallback(question, context)

        if (lmStudioResult) {
          const lmStudioModel = process.env.LM_STUDIO_MODEL || 'local-model'
          log({
            ts: new Date().toISOString(),
            level: 'info',
            route: ROUTE,
            requestId,
            event: 'chat.completed',
            status: 200,
            durationMs: Date.now() - startMs,
            ipHash,
            backend: 'lmstudio-primary',
          })
          return NextResponse.json(
            {
              answer: lmStudioResult.answer,
              usedLmStudio: true,
              lmStudioModel: lmStudioModel,
            },
            { headers: safariHeaders },
          )
        }

        // Fall back to Hugging Face if LM Studio fails
      } catch (lmError) {
        const lmMsg = lmError instanceof Error ? lmError.message : 'unknown'
        log({
          ts: new Date().toISOString(),
          level: 'error',
          route: ROUTE,
          requestId,
          event: 'chat.upstream_error',
          ipHash,
          err: lmMsg,
          backend: 'lmstudio-primary',
        })
        // Continue to Hugging Face as fallback
      }
    }

    // Use Hugging Face (either as primary or fallback)
    if (!apiKey) {
      // If LM Studio is enabled but wasn't used first or failed, try it now
      if (enableLmStudioFallback && !useLmStudioFirst) {
        const fallbackResult = await tryLmStudioFallback(question, context)

        if (fallbackResult) {
          log({
            ts: new Date().toISOString(),
            level: 'info',
            route: ROUTE,
            requestId,
            event: 'chat.completed',
            status: 200,
            durationMs: Date.now() - startMs,
            ipHash,
            backend: 'lmstudio-fallback',
          })
          return NextResponse.json(
            {
              answer: fallbackResult.answer,
              usedLmStudio: true,
            },
            { headers: safariHeaders },
          )
        }
      }

      log({
        ts: new Date().toISOString(),
        level: 'error',
        route: ROUTE,
        requestId,
        event: 'chat.upstream_error',
        status: 500,
        durationMs: Date.now() - startMs,
        ipHash,
        err: 'HUGGINGFACE_API_KEY not configured',
      })
      return NextResponse.json(
        {
          error:
            "I'm experiencing some technical difficulties right now and can't answer your question. Please feel free to reach out to me directly via LinkedIn https://www.linkedin.com/in/michael-fried/ or by email at Email@MichaelFried.info. I'd be happy to help you personally!",
        },
        { status: 500 },
      )
    }

    // NOTE: never log any portion of the API key.
    try {
      // Force 402 for testing if enabled
      if (forceHuggingFace402) {
        throw { httpResponse: { status: 402 } }
      }

      const { InferenceClient } = await import('@huggingface/inference')
      const client = new InferenceClient(apiKey)
      const huggingFaceModel =
        process.env.HUGGINGFACE_MODEL || 'google/gemma-7b-it'
      const systemPrompt = `You are the AI chatbot built for Mike Fried's personal portfolio website and you are currently running on this site. Answer questions about the following resume and portfolio content. Provide direct, concise answers that include relevant emojis and colorful language to make your responses engaging and visually appealing. Use markdown formatting when appropriate to highlight important points. Context:\n${context}`
      const result = await client.chatCompletion({
        model: huggingFaceModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
      })
      let answer = result.choices?.[0]?.message?.content || 'No answer found.'
      log({
        ts: new Date().toISOString(),
        level: 'info',
        route: ROUTE,
        requestId,
        event: 'chat.completed',
        status: 200,
        durationMs: Date.now() - startMs,
        ipHash,
        backend: 'huggingface',
      })
      return NextResponse.json({ answer }, { headers: safariHeaders })
    } catch (err: any) {
      // Avoid logging the full error object: Hugging Face errors may include
      // request URLs / headers (Authorization) and other upstream metadata.
      const safeMessage =
        typeof err?.message === 'string' ? err.message : 'unknown'
      const safeStatus = err?.httpResponse?.status ?? 'n/a'
      log({
        ts: new Date().toISOString(),
        level: 'error',
        route: ROUTE,
        requestId,
        event: 'chat.upstream_error',
        ipHash,
        err: `status=${safeStatus} msg=${safeMessage}`,
        backend: 'huggingface',
      })

      // Handle 402 errors from Hugging Face API
      if (err.httpResponse && err.httpResponse.status === 402) {
        // Try LM Studio fallback if enabled and not already used as primary
        if (enableLmStudioFallback && !useLmStudioFirst) {
          const fallbackResult = await tryLmStudioFallback(question, context)

          if (fallbackResult) {
            const lmStudioModel = process.env.LM_STUDIO_MODEL || 'local-model'
            log({
              ts: new Date().toISOString(),
              level: 'info',
              route: ROUTE,
              requestId,
              event: 'chat.completed',
              status: 200,
              durationMs: Date.now() - startMs,
              ipHash,
              backend: 'lmstudio-fallback',
            })
            return NextResponse.json(
              {
                answer: fallbackResult.answer,
                usedLmStudio: true,
                lmStudioModel: lmStudioModel,
              },
              { headers: safariHeaders },
            )
          }
        }

        log({
          ts: new Date().toISOString(),
          level: 'warn',
          route: ROUTE,
          requestId,
          event: 'chat.upstream_error',
          status: 402,
          durationMs: Date.now() - startMs,
          ipHash,
        })
        return NextResponse.json(
          {
            error:
              "I'm sorry, but I've hit my message limit for the month and can't answer more questions right now. If you need to reach me, please contact me via LinkedIn https://www.linkedin.com/in/michael-fried/ or by email at Email@MichaelFried.info. Thank you for your understanding!",
          },
          { status: 402, headers: safariHeaders },
        )
      }

      // For other errors, try LM Studio fallback if enabled and not already used as primary
      if (enableLmStudioFallback && !useLmStudioFirst) {
        const fallbackResult = await tryLmStudioFallback(question, context)

        if (fallbackResult) {
          log({
            ts: new Date().toISOString(),
            level: 'info',
            route: ROUTE,
            requestId,
            event: 'chat.completed',
            status: 200,
            durationMs: Date.now() - startMs,
            ipHash,
            backend: 'lmstudio-fallback',
          })
          return NextResponse.json(
            {
              answer: fallbackResult.answer,
              usedLmStudio: true,
            },
            { headers: safariHeaders },
          )
        }
      }

      // All other errors - provide friendly message with contact info
      log({
        ts: new Date().toISOString(),
        level: 'error',
        route: ROUTE,
        requestId,
        event: 'chat.upstream_error',
        status: 500,
        durationMs: Date.now() - startMs,
        ipHash,
      })
      return NextResponse.json(
        {
          error:
            "I'm experiencing some technical difficulties right now and can't answer your question. Please feel free to reach out to me directly via LinkedIn https://www.linkedin.com/in/michael-fried/ or by email at Email@MichaelFried.info. I'd be happy to help you personally!",
        },
        { status: 500, headers: safariHeaders },
      )
    }
  } catch (error) {
    // Server-side log only; never echo error contents back to the client.
    const msg = error instanceof Error ? error.message : 'unknown'
    log({
      ts: new Date().toISOString(),
      level: 'error',
      route: ROUTE,
      requestId,
      event: 'chat.upstream_error',
      status: 500,
      durationMs: Date.now() - startMs,
      ipHash,
      err: msg,
    })
    return NextResponse.json(
      {
        error:
          "I'm experiencing some technical difficulties right now and can't answer your question. Please feel free to reach out to me directly via LinkedIn https://www.linkedin.com/in/michael-fried/ or by email at Email@MichaelFried.info. I'd be happy to help you personally!",
      },
      {
        status: 500,
        headers: safariHeaders,
      },
    )
  }
}
