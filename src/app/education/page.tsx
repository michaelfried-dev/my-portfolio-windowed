import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function EducationPage() {
  const education = {
    school: 'Drexel University',
    location: 'Philadelphia, Pennsylvania',
    degree: 'Bachelor of Science (BS), Software Engineering',
    minor: 'Minor: Computer Science',
    date: 'August 2008 - July 2013',
    gpa: 'Cumulative GPA: 3.37',
  }

  return (
    <div className="w600:p-[30px] w600:text-lg w400:p-5 w400:text-base p-10 text-xl leading-[1.7]">
      <Card className="border-border bg-card text-foreground rounded-base mt-10 border-4 p-5 shadow-[8px_8px_0_0_#000]">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Education</CardTitle>
        </CardHeader>
        <CardContent>
          <h3 className="text-2xl font-bold">{education.degree}</h3>
          <p className="text-main-foreground font-semibold">
            {education.school} | {education.location} | {education.date}
          </p>
          <p>{education.minor}</p>
          <p>{education.gpa}</p>
        </CardContent>
      </Card>
    </div>
  )
}
