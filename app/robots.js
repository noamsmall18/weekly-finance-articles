import { getBaseUrl } from '@/lib/site'

export default function robots() {
  const baseUrl = getBaseUrl()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
