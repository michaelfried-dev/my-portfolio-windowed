import { NextResponse } from 'next/server';
import { InferenceClientHubApiError } from '@huggingface/inference';
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

    // Dynamically import and extract resume context from portfolio source files
    let context = ''
    try {
      // Home/About
      const homeModule = await import('../../page')
      const homeText = `Contact Information:
- LinkedIn: https://www.linkedin.com/in/michael-fried/
- Email: email@michaelfried.info
- GitHub: https://github.com/michaelfried-dev
- Phone: 856-905-0670 (If someone asks for my phone or how to call, always answer with the digits 856-905-0670, not as a markdown link. The website will make it clickable.)
Feel free to reach out for professional networking, questions about my experience, or to discuss potential opportunities!\n\nAbout: Hi, I'm Michael! As a software engineer, I enjoy taking projects all the way from an initial idea to a fully-realized product. I'm comfortable in both Agile and traditional development environments, and I have a passion for building high-performance backend microservices using tools like Kotlin, Java, and Spring. I also have experience with front-end development for both web and iOS. I believe that quality is key, so I always focus on creating comprehensive automated tests to ensure everything runs smoothly. I'm a quick learner and I'm always excited to dive into new technologies to find the best solutions for the job. Feel free to connect with me!`

      // Experience
      const experienceModule = await import('../../experience/page')
      const experienceArr = [
        {
          company: 'Lincoln Financial Group',
          location: 'Philadelphia, PA',
          title: 'Software Engineer',
          date: 'January 2023 - November 2024',
          description: [
            'Designed and implemented high-volume web microservices using Java, Kotlin, Spring WebFlux, and Angular for financial industry applications.',
            'Managed GitLab repositories and CI/CD pipelines, integrating code scans and tests to ensure quality and security, and deploying code to AWS ECS instances.',
            'Deployed web services and web UI applications to ECS clusters using AWS CloudFormation, integrating AWS secrets for enhanced security.',
            'Developed front-end applications using Angular and Typescript to interact with back-end APIs.',
            'Analyzed server logs using Splunk to identify and troubleshoot issues.',
            'Developed automated UI tests in Java, Kotlin, and Typescript to ensure the quality of UI applications.',
            'Mentored team members to facilitate knowledge transfer and enhance team productivity.',
            'Collaborated with UX/UI designers, development teams, and product managers to deliver seamless user experiences, adhering to Agile methodologies.',
            'Established and maintained coding standards, conducted code reviews, and implemented CI/CD pipelines to ensure high-quality, maintainable code.',
            'Managed end-to-end feature development, from prototyping to deployment, ensuring on-time delivery and alignment with business goals.',
          ],
        },
        {
          company: 'SoFi',
          location: 'Claymont, Delaware',
          title: 'Software Engineer',
          date: 'January 2020 - January 2023',
          description: [
            'Architected and implemented high-volume web microservices using Java, Kotlin, Spring, Postgres, and Kafka Messaging for financial industry applications.',
            'Managed Postgres and DynamoDB datastores using Flyway to perform data migrations and maintain data consistency.',
            'Developed unit, component, and integration test suites to validate software functionality and performance.',
            'Created and supported CI/CD pipelines in GitLab, encompassing builds, validation, and deployment processes. Additionally, integrated Sonarqube for code analysis.',
            'Utilized Kraken and Kubernetes for rapid code development, establishing isolated test environments.',
            'Supported production environments with an on-call rotation managed through Opsgenie, ensuring system reliability and uptime.',
            'Created monitors, alerts, and dashboards in Datadog APM and Rollbar to monitor and maintain stability in production environments.',
          ],
        },
        {
          company: 'Agile Trailblazers',
          location: 'Media, Pennsylvania',
          title: 'Software Development Engineer',
          date: 'February 2016 - December 2019',
          description: [
            'Developed software using Agile methodologies, creating iterative software and producing viable products at regular intervals in a fast-paced environment.',
            'Tracked issues using Jira, facilitating team collaboration to find the best solutions in alignment with Agile practices.',
            'Adapted to changes in team size, maintaining effective communication to ensure seamless development.',
            'Managed code using Git and GitHub, fostering effective team-based development.',
            'Created automated unit tests using frameworks like Junit, Postman, Newman, and Selenium to ensure functionality and expected behavior.',
          ],
        },
        {
          company: 'Fiserv',
          location: 'King of Prussia, Pennsylvania',
          title: 'Software Development Engineer',
          date: 'July 2013 – January 2016',
          description: [
            'Developed software for the Secure Lending Platform utilizing Java, Webmethods, and web-related technologies, thereby ensuring high precision and data security within the financial industry.',
            'Administered multiple databases, each containing over 100 tables, packages, and procedures, thereby ensuring data consistency, reliability, and security.',
            'Collaborated with multiple teams and high-profile clients to resolve technological and code issues, ensuring a positive user experience.',
            'Utilized multiple tracking systems to monitor issues and new developments.',
            'Managed development servers hosting technologies such as WebLogic, WebMethods, Apache, and SiteMinder, thereby ensuring seamless integration of services.',
            'Managed code using versioning systems like SVN and Perforce, thereby ensuring organized code storage for deployment.',
            'Integrated software with various systems, thereby creating a seamless client experience.',
          ],
        },
        {
          company: 'Lockheed Martin',
          location: 'Cherry Hill, New Jersey',
          title: 'Software Engineer/Web Developer',
          date: 'April 2011 – September 2012',
          description: [
            'Developed web applications using Java, JSP, and the Google Web Toolkit, including a URL redirector for secure internal link creation.',
            "Created and maintained web pages on multiple company websites, including Lockheed Martin Engineering's main site, using GWT, JSP, HTML, and other web-related technologies.",
            'Administered over 60 databases across multiple systems, ensuring consistent and reliable data provision.',
            'Supported various computer-related projects, creating custom web pages and applications for specific uses.',
          ],
        },
        {
          company: 'Wharton Business School',
          location: 'Philadelphia, Pennsylvania',
          title: 'Computer Support Representative',
          date: 'March 2010 – September 2010',
          description: [
            'Evaluated and identified software problems and solutions for computing equipment, email, and wireless networking to ensure students had necessary equipment.',
            'Documented, installed, and configured software including wireless security and MS Office on various systems and devices (Windows, Mac OS, Android, iOS, Blackberry).',
            'Documented, installed, and configured software and hardware, including hard drive replacement and memory upgrades.',
            'Resolved student account issues, ensuring uninterrupted learning.',
            'Managed a team of student workers to provide efficient service to Wharton Business School students.',
            'Tracked student issues using a ticketing system, ensuring timely resolution.',
          ],
        },
      ]
      let expText = experienceArr
        .map((job) => {
          return `Company: ${job.company}\nTitle: ${job.title}\nLocation: ${job.location}\nDate: ${job.date}\nDescription: ${job.description.join(' ')}\n`
        })
        .join('\n')

      // Education
      const educationModule = await import('../../education/page')
      const education = {
        school: 'Drexel University',
        location: 'Philadelphia, Pennsylvania',
        degree: 'Bachelor of Science (BS), Software Engineering',
        minor: 'Minor: Computer Science',
        date: 'August 2008 - July 2013',
        gpa: 'Cumulative GPA: 3.37',
      }
      const eduText = `Education: ${education.degree}\n${education.school} | ${education.location} | ${education.date}\n${education.minor}\n${education.gpa}\n`

      // Certifications
      const certModule = await import('../../certifications/page')
      const certifications = [
        {
          name: 'ICAgile Certified Professional - Agile Testing (ICP-TST)',
          date: 'Completed March 1st, 2017',
        },
        {
          name: 'ICAgile Certified Professional - Agile Test Automation (ICP-ATA)',
          date: 'Completed March 1st, 2017',
        },
      ]
      let certText = certifications
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
