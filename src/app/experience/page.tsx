import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function ExperiencePage() {
  const experience = [
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
        'Created and maintained web pages on multiple company websites, including Lockheed Martin Engineering\'s main site, using GWT, JSP, HTML, and other web-related technologies.',
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

  

  return (
    <div className="w600:p-[30px] w600:text-lg w400:p-5 w400:text-base p-10 text-xl leading-[1.7]">
      {experience.map((job, index) => (
        <Card key={index} className="border-border bg-card text-foreground rounded-base mb-10 border-4 p-5 shadow-[8px_8px_0_0_#000]">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{job.company}</CardTitle>
            <p className="pt-1 text-xl font-semibold">{job.title}</p>
          </CardHeader>
          <CardContent>
            <p className="font-semibold">
              {job.location} | {job.date}
            </p>
            <ul className="list-outside list-disc pt-2 pl-5">
              {job.description.map((item, i) => (
                <li key={i} className="mb-2 font-normal">{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}

      
    </div>
  )
}
