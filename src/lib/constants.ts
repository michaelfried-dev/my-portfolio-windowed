// Centralized constants for contact information and personal details
export const CONTACT_INFO = {
  phone: '856-905-0670',
  email: 'email@michaelfried.info',
  linkedin: 'https://www.linkedin.com/in/michael-fried/',
  github: 'https://github.com/michaelfried-dev',
} as const

export const PERSONAL_INFO = {
  name: 'Mike Fried',
  title: 'Software Engineer',
  about: `Hi, I'm Mike! I'm a software engineer who loves taking projects from an initial idea all the way to production. I specialize in building high-performance backend microservices with Kotlin, Java, and Spring, and I'm equally comfortable on the front end with React, Angular, and TypeScript. I believe AI is the biggest force multiplier in modern engineering — I treat tools like Claude Code, GitHub Copilot, and Cursor as core parts of my workflow, not add-ons, using them for everything from rapid prototyping and agentic feature builds to test generation and code review. Quality is always a priority, so I pair that speed with comprehensive automated testing at every level. I'm a quick learner who's always excited to dive into new technologies to find the best solution for the job. Feel free to connect with me!`,
} as const

export const EDUCATION = {
  school: 'Drexel University',
  location: 'Philadelphia, Pennsylvania',
  degree: 'Bachelor of Science (BS), Software Engineering',
  minor: 'Minor: Computer Science',
  date: 'August 2008 - July 2013',
} as const

export const CERTIFICATIONS = [
  {
    name: 'ICAgile Certified Professional - Agile Testing (ICP-TST)',
    date: 'Completed March 1st, 2017',
  },
  {
    name: 'ICAgile Certified Professional - Agile Test Automation (ICP-ATA)',
    date: 'Completed March 1st, 2017',
  },
] as const

export const EXPERIENCE = [
  {
    company: 'JPMorgan Chase',
    location: 'Wilmington, DE',
    title: 'Software Engineer III',
    date: 'August 2025 – Present',
    description: [
      'Develop and maintain third-party integration services that interface with the three major credit bureaus (Equifax, Experian, TransUnion), ensuring reliable, high-volume data exchange for consumer lending workflows.',
      'Design and implement a cross-region resiliency framework that intelligently routes and retries credit data requests across multiple bureaus and AWS regions, ensuring complete data retrieval even when individual bureau calls or regions fail.',
      'Build and enhance backend microservices using Java and Spring Boot, backed by Postgres and Amazon Aurora datastores.',
      'Provision and manage cloud infrastructure with Terraform and deploy containerized services to AWS ECS via Spinnaker continuous-delivery pipelines, utilizing S3 for artifact storage and configuration management.',
      'Write and maintain API integration tests using Karate and validate endpoints with Bruno for rapid manual testing and debugging.',
      'Leverage GitHub Copilot, Claude Code, and Jules to accelerate development — with nearly 100% of code AI-generated under engineering direction, reducing average feature delivery time by ~75% through agentic, multi-step implementation and AI-driven code-review workflows.',
      'Monitor application health and troubleshoot production issues using Splunk dashboards and alerts.',
    ],
  },
  {
    company: 'Personal Projects',
    title: 'Personal Portfolio Website',
    description: [
      'Developed this portfolio website using Next.js 15, React 19, TypeScript, and Tailwind CSS, featuring a responsive design with light/dark mode and smooth animations.',
      'Utilized AI development tools including Windsurf, GitHub Copilot, and Claude Code to enhance development productivity, generate tests, and implement best practices throughout the codebase.',
      'Implemented an AI-powered chatbot with a dual-API architecture that seamlessly integrates with both Hugging Face AI APIs and local LM Studio models for privacy-focused, resilient interactions.',
      'Created a fallback system that automatically switches between cloud and local AI providers based on availability, ensuring 100% uptime of the interactive assistant feature.',
      'Built a containerized deployment pipeline using Docker and GitHub Actions for automated testing, dependency management, and continuous deployment to Cloudflare Pages.',
      'Achieved 92%+ test coverage with Jest and React Testing Library, including comprehensive tests for the chatbot component and API routes.',
      'Designed a system prompt engineering solution that enables the AI assistant to accurately answer questions about my experience, skills, and background without hallucinations.',
    ],
  },
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
    location: 'Claymont, DE',
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
      'Worked as a consultant for various clients including Nemours, Capital One, Politico, and Graduate School USA, developing and maintaining enterprise applications.',
      'Developed features for the Politico and Politico PRO websites during the 2016 Election season using Brightspot CMS in Java. Designed and implemented IP-based user access for the "PRO" website for a large organization.',
      'Led the comprehensive redesign of the Graduate School USA website, orchestrating the entire project lifecycle from strategic planning through implementation and deployment, resulting in a transformative user experience that directly drove measurable revenue growth.',
      'Implemented automated testing frameworks and practices to improve code quality and reduce deployment risks.',
      'Collaborated with product teams to translate business requirements into technical solutions.',
      'Participated in agile development processes, including sprint planning, daily standups, and retrospectives.',
    ],
  },
  {
    company: 'Fiserv',
    location: 'King of Prussia, Pennsylvania',
    title: 'Software Development Engineer',
    date: 'July 2013 – January 2016',
    description: [
      'Built and maintained the Secure Lending Platform using Java and WebMethods, delivering high-precision, secure data processing for financial services.',
      'Administered multiple databases (100+ tables, packages, and stored procedures each) and managed WebLogic, Apache, and SiteMinder application servers.',
      'Integrated disparate internal systems to create a seamless end-to-end client experience across the lending workflow.',
    ],
  },
  {
    company: 'Lockheed Martin',
    location: 'Cherry Hill, New Jersey',
    title: 'Software Engineer/Web Developer',
    date: 'April 2011 – September 2012',
    description: [
      'Developed internal web applications using Java, JSP, and Google Web Toolkit, including a secure URL redirector and pages for the Lockheed Martin Engineering main site.',
      'Administered 60+ databases across multiple systems, ensuring consistent and reliable data access.',
    ],
  },
] as const

export const SKILLS = [
  {
    category: 'AI-Augmented Engineering',
    items: ['Claude Code', 'GitHub Copilot', 'LM Studio'],
  },
  {
    category: 'Programming Languages',
    items: ['Kotlin', 'Java', 'TypeScript/JavaScript', 'Swift'],
  },
  {
    category: 'Web & Mobile Frameworks',
    items: [
      'React',
      'Next.js',
      'Angular',
      'Tailwind CSS',
      'SpringBoot',
      'WebFlux',
      'Swift (iOS)',
      'XCUITest',
    ],
  },
  {
    category: 'DevOps & Cloud Platforms',
    items: [
      'AWS (ECS, S3, CloudFormation, Secrets Manager)',
      'Terraform',
      'Docker',
      'Kubernetes',
      'GitLab CI/CD',
      'GitHub Actions',
      'Spinnaker',
    ],
  },
  {
    category: 'Databases & Data Engineering',
    items: ['Postgres', 'Amazon Aurora', 'DynamoDB', 'Flyway'],
  },
  {
    category: 'Monitoring & Logging',
    items: ['Datadog', 'Splunk', 'SonarQube', 'Rollbar'],
  },
  {
    category: 'Testing & QA',
    items: [
      'Jest',
      'React Testing Library',
      'JUnit',
      'Karate',
      'Cucumber',
      'Selenium',
      'XCUITest',
      'Bruno',
    ],
  },
] as const
