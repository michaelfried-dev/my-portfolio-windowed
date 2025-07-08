import Image from 'next/image'
import Link from 'next/link'
import {
  IconType,
  SiGmail,
  SiGithub, // Import Github icon
  SiLinkedin,
} from '@icons-pack/react-simple-icons'
import { FaPhone } from 'react-icons/fa'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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
      icon: SiGithub,
      href: 'https://github.com/michaelfried-dev/my-portfolio-windowed',
      label: 'GitHub',
    },
    {
      icon: FaPhone,
      href: 'tel:8569050670',
      label: 'Phone',
    },
  ]

  return (
    <div className="w600:p-[30px] w600:text-lg w400:p-5 w400:text-base p-10 text-xl leading-[1.7]">
      <div className="flex flex-col md:flex-row items-start gap-10 w400:gap-5 w600:gap-[30px]">
        {/* Profile Section - shows first on mobile, second on desktop */}
        <div className="w-full md:w-1/3 flex flex-col items-center md:pt-10 md:order-2">
          <div className="flex w-full flex-row items-center justify-center gap-4 md:flex-col">
            <Avatar className="size-[200px] rounded-base border-4 border-border shadow-[8px_8px_0_0_#000]">
              <AvatarImage src="/profile.jpg" />
              <AvatarFallback className="text-6xl">MF</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-4 md:mt-4 md:w-[200px] md:flex-none">
              {links.map(({ icon: Icon, href, label }) => (
                <Button
                  asChild
                  key={href}
                  variant="neutral"
                  className="flex w-full items-center justify-center gap-2"
                >
                  <Link href={href}>
                    <Icon className="size-5" />
                    <span>{label}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Text Section - shows second on mobile, first on desktop */}
        <div className="w-full md:w-2/3 md:order-1">
          <Card className="bg-card text-foreground border-border rounded-base border-4 p-5 shadow-[8px_8px_0_0_#000]">
            <CardContent>
              <p>
                Hi, I&apos;m Michael! As a software engineer, I enjoy taking projects
                all the way from an initial idea to a fully-realized product.
                I&apos;m comfortable in both Agile and traditional development
                environments, and I have a passion for building high-performance
                backend microservices using tools like Kotlin, Java, and Spring.
                I also have experience with front-end development for both web
                and iOS.
                <br /><br />
                I believe that quality is key, so I always focus on creating
                comprehensive automated tests to ensure everything runs
                smoothly. I&apos;m a quick learner and I&apos;m always excited to dive
                into new technologies to find the best solutions for the job.
                Feel free to connect with me!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
