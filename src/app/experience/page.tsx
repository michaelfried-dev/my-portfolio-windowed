import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EXPERIENCE } from '@/lib/constants'

export default function ExperiencePage() {
  const experience = EXPERIENCE

  return (
    <div className="w600:p-[30px] w600:text-lg w400:p-5 w400:text-base p-10 text-xl leading-[1.7]">
      {experience.map((job, index) => (
        <Card
          key={index}
          className="border-border bg-card text-foreground rounded-base mb-10 border-4 p-5 shadow-[8px_8px_0_0_#000]"
        >
          <CardHeader>
            <CardTitle className="text-3xl font-bold">{job.company}</CardTitle>
            <p className="pt-1 text-xl font-semibold">{job.title}</p>
          </CardHeader>
          <CardContent>
            {/* Handle optional location and date properties */}
            {(() => {
              // Type guard to check if job has location property
              const hasLocation =
                'location' in job && typeof job.location === 'string'
              // Type guard to check if job has date property
              const hasDate = 'date' in job && typeof job.date === 'string'

              if (hasLocation && hasDate) {
                return (
                  <p className="font-semibold">
                    {job.location} | {job.date}
                  </p>
                )
              } else if (hasLocation) {
                return <p className="font-semibold">{job.location}</p>
              } else if (hasDate) {
                return <p className="font-semibold">{job.date}</p>
              }
              return null
            })()}
            <ul className="list-outside list-disc pt-2 pl-5">
              {job.description.map((item, i) => (
                <li key={i} className="mb-2 font-normal">
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
