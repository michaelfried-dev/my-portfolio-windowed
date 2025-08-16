import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://michaelfried.dev'

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/experience`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/education`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/certifications`,
      lastModified: new Date(),
    },
  ]
}
