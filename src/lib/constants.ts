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
      'Worked as a consultant for various clients including Nemours, Capital One, Politico, Graduate School USA, developing and maintaining enterprise applications.',
      'Built the new Nemours app platform, developing iOS applications in Swift and web applications in Angular that connected with backend APIs. Created comprehensive unit tests and automated test suites using XCUITest Framework, Fastlane, Cucumber, Selenium, Ruby, and Postman. Configured and administered Bamboo for complete CI/CD processes.',
      'Built the internal Credit Disputes application using Java and the WaveMaker platform, managing the complete application lifecycle from development to production releases. Conducted manual application testing using Zephyr to track test results.',
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
] as const
