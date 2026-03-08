import { sanityFetch } from '@/lib/sanity'
import { getBaseUrl } from '@/lib/site'

const POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  "slug": slug.current,
  publishedAt
}`

export default async function sitemap() {
  const baseUrl = getBaseUrl()

  const posts = await sanityFetch(POSTS_QUERY)
  const postUrls = Array.isArray(posts)
    ? posts
        .filter((post) => post.slug)
        .map((post) => ({
          url: `${baseUrl}/article/${post.slug}`,
          lastModified: post.publishedAt ? new Date(post.publishedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        }))
    : []

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...postUrls,
  ]
}
