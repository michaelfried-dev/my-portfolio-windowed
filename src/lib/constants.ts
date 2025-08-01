// Centralized constants for contact information and personal details
export const CONTACT_INFO = {
  phone: '856-905-0670',
  email: 'email@michaelfried.info',
  linkedin: 'https://www.linkedin.com/in/michael-fried/',
  github: 'https://github.com/michaelfried-dev',
} as const

export const PERSONAL_INFO = {
  name: 'Michael Fried',
  title: 'Software Engineer',
  about: `Hi, I'm Michael! As a software engineer, I enjoy taking projects all the way from an initial idea to a fully-realized product. I'm comfortable in both Agile and traditional development environments, and I have a passion for building high-performance backend microservices using tools like Kotlin, Java, and Spring. I also have experience with front-end development for both web and iOS. I believe that quality is key, so I always focus on creating comprehensive automated tests to ensure everything runs smoothly. I'm a quick learner and I'm always excited to dive into new technologies to find the best solutions for the job. Feel free to connect with me!`,
} as const

export const EDUCATION = {
  school: 'Drexel University',
  location: 'Philadelphia, Pennsylvania',
  degree: 'Bachelor of Science (BS), Software Engineering',
  minor: 'Minor: Computer Science',
  date: 'August 2008 - July 2013',
  gpa: 'Cumulative GPA: 3.37',
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
    location: 'San Francisco, CA',
    title: 'Software Engineer',
    date: 'September 2021 - December 2022',
    description: [
      'Developed and maintained high-performance backend microservices using Kotlin and Spring for financial technology applications.',
      'Implemented comprehensive automated testing strategies, including unit, integration, and end-to-end tests to ensure code quality and reliability.',
      'Collaborated with cross-functional teams to design and implement new features, working closely with product managers, designers, and other engineers.',
      'Participated in code reviews and contributed to establishing coding standards and best practices across the engineering organization.',
      'Worked with cloud infrastructure and deployment pipelines to ensure smooth and reliable software releases.',
      'Contributed to the architecture and design of scalable systems to handle high-volume financial transactions.',
    ],
  },
  {
    company: 'Comcast',
    location: 'Philadelphia, PA',
    title: 'Software Engineer',
    date: 'July 2019 - September 2021',
    description: [
      'Developed and maintained backend services and APIs using Java and Spring framework for telecommunications applications.',
      'Implemented automated testing frameworks and practices to improve code quality and reduce deployment risks.',
      'Collaborated with product teams to translate business requirements into technical solutions.',
      'Participated in agile development processes, including sprint planning, daily standups, and retrospectives.',
      'Worked on performance optimization and scalability improvements for high-traffic applications.',
      'Contributed to the migration of legacy systems to modern cloud-based architectures.',
    ],
  },
  {
    company: 'Lockheed Martin',
    location: 'King of Prussia, PA',
    title: 'Software Engineer',
    date: 'June 2013 - July 2019',
    description: [
      'Developed and maintained software applications for defense and aerospace systems using Java and C++.',
      'Implemented rigorous testing procedures and quality assurance processes to meet strict defense industry standards.',
      'Collaborated with systems engineers and other stakeholders to design and implement complex software solutions.',
      'Participated in the full software development lifecycle, from requirements analysis to deployment and maintenance.',
      'Worked on real-time systems and embedded software development for mission-critical applications.',
      'Contributed to the development of automated testing tools and frameworks to improve development efficiency.',
    ],
  },
] as const
