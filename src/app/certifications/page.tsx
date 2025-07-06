import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CertificationsPage() {
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

  return (
    <div className="w600:p-[30px] w600:text-lg w400:p-5 w400:text-base p-10 text-xl leading-[1.7]">
      <Card className="border-border bg-card text-foreground rounded-base mt-10 border-4 p-5 shadow-[8px_8px_0_0_#000]">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Certifications</CardTitle>
        </CardHeader>
        <CardContent>
          {certifications.map((cert, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-2xl font-bold">{cert.name}</h3>
              <p className="text-main-foreground font-semibold">{cert.date}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
