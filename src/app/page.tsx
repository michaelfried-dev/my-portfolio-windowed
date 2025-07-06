import Image from 'next/image'
import {
  IconType,
  SiGmail,
  SiLinkedin,
} from '@icons-pack/react-simple-icons'
import { FaPhone } from 'react-icons/fa'
import { Card, CardContent } from '@/components/ui/card'

export default function Home() {
  const links: { icon: any; href: string; label: string }[] = [
    {
      icon: SiGmail,
      href: 'mailto:EMAIL@MICHAELFRIED.INFO',
      label: 'Email',
    },
    {
      icon: SiLinkedin,
      href: 'https://www.linkedin.com/in/michael-fried/',
      label: 'LinkedIn',
    },
    {
      icon: FaPhone,
      href: 'tel:8569050670',
      label: 'Phone',
    },
  ]

  return (
    <div className="w600:p-[30px] w600:text-lg w400:p-5 w400:text-base p-10 text-xl leading-[1.7]">
      <div className="flex flex-col md:flex-row items-start gap-10">
        <div className="md:w-2/3">
          <Card className="bg-card text-foreground border-border rounded-base border-4 p-5 shadow-[8px_8px_0_0_#000]">
            <CardContent>
              <p>
                Hi, I'm Michael! As a software engineer, I enjoy taking projects all the way from an initial idea to a fully-realized product. I'm comfortable in both Agile and traditional development environments, and I have a passion for building high-performance backend microservices using tools like Kotlin, Java, and Spring. I also have experience with front-end development for both web and iOS.
                <br /><br />
                I believe that quality is key, so I always focus on creating comprehensive automated tests to ensure everything runs smoothly. I'm a quick learner and I'm always excited to dive into new technologies to find the best solutions for the job. Feel free to connect with me!
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="md:w-1/3 flex flex-col items-center justify-center pt-5">
          <Image
            src="/profile.jpg"
            alt="Michael Fried"
            width={200}
            height={200}
            className="rounded-base border-4 border-border shadow-[8px_8px_0_0_#000]"
          />
          <div className="mt-5 flex flex-col gap-4 items-start">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-main flex items-center gap-3 group"
              >
                <link.icon className="h-6 w-6" />
                <span className="text-lg group-hover:underline">{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
