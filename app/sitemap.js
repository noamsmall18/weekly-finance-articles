import { sanityFetch } from '@/lib/sanity'
import { getBaseUrl } from '@/lib/site'

const POSTS_QUERY = `*[_type == "post" && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc) {
  "slug": slug.current,
  "lastModified": coalesce(_updatedAt, publishedAt, _createdAt)
}`

const AUTHORS_QUERY = `*[_type == "author" && defined(slug.current)] {
  "slug": slug.current,
  "_updatedAt": _updatedAt
}`

const CATEGORY_SLUGS = [
  'markets',
  'investing',
  'personal-finance',
  'economy',
  'crypto',
  'business',
]

export default async function sitemap() {
  const baseUrl = getBaseUrl()
  const now = new Date()

  const [posts, authors] = await Promise.all([
    sanityFetch(POSTS_QUERY),
    sanityFetch(AUTHORS_QUERY),
  ])

  const postUrls = Array.isArray(posts)
    ? posts
        .filter((post) => post.slug)
        .map((post) => ({
          url: `${baseUrl}/article/${post.slug}`,
          lastModified: post.lastModified ? new Date(post.lastModified) : now,
          changeFrequency: 'weekly',
          priority: 0.8,
        }))
    : []

  const authorUrls = Array.isArray(authors)
    ? authors
        .filter((a) => a.slug)
        .map((a) => ({
          url: `${baseUrl}/author/${a.slug}`,
          lastModified: a._updatedAt ? new Date(a._updatedAt) : now,
          changeFrequency: 'monthly',
          priority: 0.5,
        }))
    : []

  const categoryUrls = CATEGORY_SLUGS.map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/archive`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    ...categoryUrls,
    ...postUrls,
    ...authorUrls,
  ]
}
