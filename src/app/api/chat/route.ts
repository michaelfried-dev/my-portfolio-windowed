import { NextResponse } from 'next/server'
import { InferenceClientHubApiError } from '@huggingface/inference'
import {
  CONTACT_INFO,
  PERSONAL_INFO,
  EDUCATION,
  CERTIFICATIONS,
  EXPERIENCE,
} from '@/lib/constants'
export const runtime = 'edge'

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
    console.log('[DEBUG] LM Studio URL not configured, skipping fallback')
    return null
  }

  console.log('[DEBUG] Attempting LM Studio fallback:', lmStudioUrl)

  try {
    const systemPrompt = `You are a helpful assistant that answers questions about the following resume and portfolio content. Provide direct, concise answers that include relevant emojis and colorful language to make your responses engaging and visually appealing. Use markdown formatting when appropriate to highlight important points.

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
      console.log('[DEBUG] LM Studio API error: Response is undefined')
      return null
    }

    if (!response.ok) {
      console.log(
        '[DEBUG] LM Studio API error:',
        response.status,
        response.statusText,
      )
      return null
    }

    const data = await response.json()
    let answer =
      data.choices?.[0]?.message?.content || 'No answer found from LM Studio.'

    // Post-process to remove any thinking/reasoning content that slipped through
    answer = cleanThinkingContent(answer)

    console.log('[DEBUG] LM Studio fallback successful')
    return { answer }
  } catch (error) {
    console.log('[DEBUG] LM Studio fallback failed:', error)
    return null
  }
}

export async function POST(req: Request) {
  console.log('API route hit')

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

  try {
    // Verify content type
    const contentType = req.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 415, headers: safariHeaders },
      )
    }

    // Parse and validate request body
    let requestBody
    try {
      requestBody = await req.json()
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400, headers: safariHeaders },
      )
    }

    // Only require question in the request body
    const { question } = requestBody
    if (typeof requestBody.question !== 'string') {
      return NextResponse.json(
        { error: 'Invalid question format' },
        { status: 400, headers: safariHeaders },
      )
    }

    if (requestBody.question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question cannot be empty' },
        { status: 400, headers: safariHeaders },
      )
    }

    if (requestBody.question.length > 10000) {
      return NextResponse.json(
        { error: 'Question too long' },
        { status: 400, headers: safariHeaders },
      )
    }

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
        return `Company: ${job.company}\nTitle: ${job.title}\nLocation: ${job.location}\nDate: ${job.date}\nDescription: ${job.description.join(' ')}\n`
      }).join('\n')

      // Education
      const eduText = `Education: ${EDUCATION.degree}\n${EDUCATION.school} | ${EDUCATION.location} | ${EDUCATION.date}\n${EDUCATION.minor}\n${EDUCATION.gpa}\n`

      // Certifications
      let certText = CERTIFICATIONS.map(
        (cert) => `Certification: ${cert.name} (${cert.date})`,
      ).join('\n')

      context = `${homeText}\n\n${expText}\n${eduText}\n${certText}`
    } catch (extractErr) {
      console.error(
        '[DEBUG] Failed to extract resume context from source files:',
        extractErr,
      )
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
      console.log('[DEBUG] Using LM Studio as primary API')
      try {
        // Try LM Studio first
        const lmStudioResult = await tryLmStudioFallback(question, context)

        if (lmStudioResult) {
          console.log('[DEBUG] LM Studio primary call successful')
          const lmStudioModel = process.env.LM_STUDIO_MODEL || 'local-model'
          return NextResponse.json(
            {
              answer: lmStudioResult.answer,
              usedLmStudio: true,
              lmStudioModel: lmStudioModel,
            },
            { headers: safariHeaders },
          )
        }

        console.log(
          '[DEBUG] LM Studio primary call failed, falling back to Hugging Face',
        )
        // Fall back to Hugging Face if LM Studio fails
      } catch (lmError) {
        console.log('[DEBUG] LM Studio primary call error:', lmError)
        // Continue to Hugging Face as fallback
      }
    }

    // Use Hugging Face (either as primary or fallback)
    if (!apiKey) {
      console.log('[DEBUG] HUGGINGFACE_API_KEY is missing or not loaded')

      // If LM Studio is enabled but wasn't used first or failed, try it now
      if (enableLmStudioFallback && !useLmStudioFirst) {
        console.log(
          '[DEBUG] Attempting LM Studio due to missing Hugging Face API key',
        )
        const fallbackResult = await tryLmStudioFallback(question, context)

        if (fallbackResult) {
          return NextResponse.json(
            {
              answer: fallbackResult.answer,
              usedLmStudio: true,
            },
            { headers: safariHeaders },
          )
        }
      }

      return NextResponse.json(
        {
          error:
            "I'm experiencing some technical difficulties right now and can't answer your question. Please feel free to reach out to me directly via LinkedIn https://www.linkedin.com/in/michael-fried/ or by email at Email@MichaelFried.info. I'd be happy to help you personally!",
        },
        { status: 500 },
      )
    }

    console.log(
      `[DEBUG] HUGGINGFACE_API_KEY loaded: ${apiKey.slice(0, 6)}... (length: ${apiKey.length})`,
    )
    console.log('[DEBUG] Using Hugging Face API')

    try {
      // Force 402 for testing if enabled
      if (forceHuggingFace402) {
        console.log('[DEBUG] Forcing Hugging Face 402 response for testing')
        throw { httpResponse: { status: 402 } }
      }

      const { InferenceClient } = await import('@huggingface/inference')
      const client = new InferenceClient(apiKey)
      const huggingFaceModel =
        process.env.HUGGINGFACE_MODEL || 'google/gemma-7b-it'
      const systemPrompt = `You are a helpful assistant that answers questions about the following resume and portfolio content. Provide direct, concise answers that include relevant emojis and colorful language to make your responses engaging and visually appealing. Use markdown formatting when appropriate to highlight important points. Context:\n${context}`
      console.log(`[DEBUG] Using Hugging Face model: ${huggingFaceModel}`)
      const result = await client.chatCompletion({
        model: huggingFaceModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
      })
      let answer = result.choices?.[0]?.message?.content || 'No answer found.'
      return NextResponse.json({ answer }, { headers: safariHeaders })
    } catch (err: any) {
      console.log('[DEBUG] Hugging Face InferenceClient error:', err)

      // Handle 402 errors from Hugging Face API
      if (err.httpResponse && err.httpResponse.status === 402) {
        console.log('[DEBUG] Hugging Face 402 error detected')

        // Try LM Studio fallback if enabled and not already used as primary
        if (enableLmStudioFallback && !useLmStudioFirst) {
          console.log('[DEBUG] Attempting LM Studio fallback due to 402 error')
          const fallbackResult = await tryLmStudioFallback(question, context)

          if (fallbackResult) {
            const lmStudioModel = process.env.LM_STUDIO_MODEL || 'local-model'
            return NextResponse.json(
              {
                answer: fallbackResult.answer,
                usedLmStudio: true,
                lmStudioModel: lmStudioModel,
              },
              { headers: safariHeaders },
            )
          }

          console.log('[DEBUG] LM Studio fallback failed, returning 402 error')
        }

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
        console.log(
          '[DEBUG] Attempting LM Studio fallback due to other Hugging Face error',
        )
        const fallbackResult = await tryLmStudioFallback(question, context)

        if (fallbackResult) {
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
      return NextResponse.json(
        {
          error:
            "I'm experiencing some technical difficulties right now and can't answer your question. Please feel free to reach out to me directly via LinkedIn https://www.linkedin.com/in/michael-fried/ or by email at Email@MichaelFried.info. I'd be happy to help you personally!",
        },
        { status: 500, headers: safariHeaders },
      )
    }
  } catch (error) {
    console.log('Chat API error:', error)
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
