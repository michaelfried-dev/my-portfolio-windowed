import { NextResponse } from 'next/server';
import { InferenceClientHubApiError } from '@huggingface/inference';
import { CONTACT_INFO, PERSONAL_INFO, EDUCATION, CERTIFICATIONS, EXPERIENCE } from '@/lib/constants';
export const runtime = 'edge'

export async function POST(req: Request) {
  console.log('API route hit');
  try {
    // Verify content type
    const contentType = req.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 415 },
      )
    }

    // Parse and validate request body
    let requestBody
    try {
      requestBody = await req.json()
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid JSON format' },
        { status: 400 },
      )
    }

    // Only require question in the request body
    const { question } = requestBody
    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Request must include a string question.' },
        { status: 400 },
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
      let expText = EXPERIENCE
        .map((job) => {
          return `Company: ${job.company}\nTitle: ${job.title}\nLocation: ${job.location}\nDate: ${job.date}\nDescription: ${job.description.join(' ')}\n`
        })
        .join('\n')

      // Education
      const eduText = `Education: ${EDUCATION.degree}\n${EDUCATION.school} | ${EDUCATION.location} | ${EDUCATION.date}\n${EDUCATION.minor}\n${EDUCATION.gpa}\n`

      // Certifications
      let certText = CERTIFICATIONS
        .map((cert) => `Certification: ${cert.name} (${cert.date})`)
        .join('\n')

      context = `${homeText}\n\n${expText}\n${eduText}\n${certText}`
    } catch (extractErr) {
      console.error(
        '[DEBUG] Failed to extract resume context from source files:',
        extractErr,
      )
      return NextResponse.json(
        { error: 'Failed to extract resume context from site source files.' },
        { status: 500 },
      )
    }

    // Use Hugging Face InferenceClient for chatCompletion
    const apiKey = process.env.HUGGINGFACE_API_KEY
    if (!apiKey) {
      console.error('[DEBUG] HUGGINGFACE_API_KEY is missing or not loaded')
      return NextResponse.json(
        { error: 'Hugging Face API key not set' },
        { status: 500 },
      )
    }
    console.log(
      `[DEBUG] HUGGINGFACE_API_KEY loaded: ${apiKey.slice(0, 6)}... (length: ${apiKey.length})`,
    )
    console.log(
      '[DEBUG] Sending question to Hugging Face (InferenceClient):',
      question,
    )
    try {
      const { InferenceClient } = await import('@huggingface/inference');
      const client = new InferenceClient(apiKey);
      const systemPrompt = `You are a helpful assistant that answers questions about the following resume and portfolio content. Context:\n${context}`;
      const result = await client.chatCompletion({
        model: 'deepseek-ai/DeepSeek-V3-0324',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
      });
      let answer = result.choices?.[0]?.message?.content || 'No answer found.';
      return NextResponse.json(
        { answer },
        { headers: { 'Content-Type': 'application/json' } },
      );
    } catch (err: any) {
      console.log('CATCH block hit');
      console.error('[DEBUG] Hugging Face InferenceClient error:', err);

      // Robustly handle 402 errors from Hugging Face API
      if (err.httpResponse && err.httpResponse.status === 402) {
        return NextResponse.json(
          { error: "I'm sorry, but I've hit my message limit for the month and can't answer more questions right now. If you need to reach me, please contact me via LinkedIn https://www.linkedin.com/in/michael-fried/ or by email at Email@MichaelFried.info. Thank you for your understanding!" },
          { status: 402 }
        );
      }
      // All other errors
      return NextResponse.json(
        { error: 'Failed to process request via Hugging Face InferenceClient' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    )
  }
}
