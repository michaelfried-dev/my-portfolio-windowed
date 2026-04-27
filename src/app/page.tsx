import type { ComponentType, SVGProps } from 'react'
import Link from 'next/link'
import { SiGmail, SiGithub } from '@icons-pack/react-simple-icons'
import { FaLinkedin } from 'react-icons/fa'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import BuyMeACoffeeButton from '@/components/BuyMeACoffeeButton'
import { CONTACT_INFO } from '@/lib/constants'

type IconComponent = ComponentType<
  SVGProps<SVGSVGElement> & { className?: string }
>

export default function Home() {
  const links: { icon: IconComponent; href: string; label: string }[] = [
    {
      icon: SiGmail,
      href: `mailto:${CONTACT_INFO.email}`,
      label: 'Email',
    },
    {
      icon: FaLinkedin,
      href: 'https://www.linkedin.com/in/michael-fried/',
      label: 'LinkedIn',
    },
    {
      icon: SiGithub,
      href: 'https://github.com/michaelfried-dev',
      label: 'GitHub',
    },
  ]

  return (
    <div className="w600:p-[30px] w600:text-lg w400:p-5 w400:text-base p-10 text-xl leading-[1.7]">
      <div className="w400:gap-5 w600:gap-[30px] flex flex-col items-start gap-10 md:flex-row">
        {/* Profile Section - shows first on mobile, second on desktop */}
        <div className="flex w-full flex-col items-center md:order-2 md:w-1/3 md:pt-10">
          <div className="flex w-full flex-row items-center justify-center gap-4 md:flex-col">
            <Avatar className="rounded-base border-border size-[200px] border-4 shadow-[8px_8px_0_0_#000]">
              <AvatarImage
                src="/profile.jpg"
                alt="Michael Fried - Software Engineer profile photo"
              />
              <AvatarFallback className="text-6xl">MF</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-4 md:mt-4 md:w-[200px] md:flex-none">
              {links.map(({ icon: Icon, href, label }, idx) => (
                <Button
                  asChild
                  key={href}
                  variant="neutral"
                  className="flex w-full items-center justify-center gap-2"
                >
                  <Link
                    href={href}
                    aria-label={`Contact Michael Fried via ${label}`}
                    {...(href.startsWith('http')
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                    <span>{label}</span>
                  </Link>
                </Button>
              ))}
              {/* PayPal Donate Button below all contact links */}
              <div className="mt-2 flex w-full items-center justify-center">
                <BuyMeACoffeeButton />
              </div>
            </div>
          </div>
        </div>

        {/* Text Section - shows second on mobile, first on desktop */}
        <div className="w-full md:order-1 md:w-2/3">
          <Card className="bg-card text-foreground border-border rounded-base border-4 p-5 shadow-[8px_8px_0_0_#000]">
            <CardContent>
              <p>
                Hi, I&apos;m <strong>Michael</strong>! I&apos;m a software
                engineer who loves taking projects from an initial idea all the
                way to production. I specialize in building high-performance
                backend microservices with Kotlin, Java, and Spring, and
                I&apos;m equally comfortable on the front end with React,
                Angular, and TypeScript.
              </p>
              <p className="pt-[10px]">
                I&apos;m a strong advocate for AI-assisted development — I use
                tools like GitHub Copilot and Claude Code daily for everything
                from rapid prototyping and test generation to agentic,
                multi-step feature builds and code review. Quality is always a
                priority, so I pair that speed with comprehensive automated
                testing at every level. I&apos;m a quick learner who&apos;s
                always excited to dive into new technologies to find the best
                solution for the job. Feel free to connect with me!
              </p>
              <p className="pt-[20px]">
                Check out the repository for this site{' '}
                <Link
                  href="https://github.com/michaelfried-dev/my-portfolio-windowed"
                  className="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View the source code for this portfolio website on GitHub"
                >
                  here
                </Link>
                !
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
