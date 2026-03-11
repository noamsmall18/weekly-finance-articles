import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { sanityFetch, urlFor } from '@/lib/sanity'
import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'
import { FadeIn, FadeInStagger, FadeInItem } from '@/app/components/FadeIn'
import { MarketBar } from '@/app/components/MarketBar'

export const metadata: Metadata = {
  title: 'All Articles',
  description: 'Browse every article published on Next Gen Finance.',
}

const ALL_POSTS_QUERY = `*[_type == "post"] | order(coalesce(publishedAt, _createdAt) desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  category,
  mainImage,
  "authorName": author->name,
  "authorSlug": author->slug.current,
  "publishedAt": coalesce(publishedAt, _createdAt),
  tags,
  "readingTime": round(length(pt::text(body)) / 1000)
}`

const CATEGORY_LABELS: Record<string, string> = {
  markets: 'Markets',
  investing: 'Investing',
  personalFinance: 'Personal Finance',
  economy: 'Economy',
  crypto: 'Crypto',
  business: 'Business',
}

function formatDate(dateString: string | null) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getCategoryLabel(value: string | null) {
  if (!value) return 'Finance'
  return CATEGORY_LABELS[value] ?? value
}

const CATEGORY_HREFS: Record<string, string> = {
  markets: '/category/markets',
  investing: '/category/investing',
  personalFinance: '/category/personal-finance',
  economy: '/category/economy',
  crypto: '/category/crypto',
  business: '/category/business',
}

export default async function ArchivePage() {
  const posts = await sanityFetch(ALL_POSTS_QUERY)
  const allPosts = Array.isArray(posts) ? (posts as Record<string, unknown>[]) : []

  // Group by category for the sidebar count
  const counts: Record<string, number> = {}
  for (const p of allPosts) {
    const cat = (p.category as string) ?? 'other'
    counts[cat] = (counts[cat] ?? 0) + 1
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c1827] transition-colors duration-200">
      <Navbar />
      <MarketBar />

      <main>
        <FadeIn>
          <section className="border-b border-[#0a1628]/10 dark:border-white/10 bg-[#0a1628]/[0.02] dark:bg-white/[0.03]">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#0a1628]/60 dark:text-white/50 hover:text-[#c9a84c] transition-colors"
              >
                <span aria-hidden>←</span> Home
              </Link>
              <h1 className="mt-4 font-serif text-3xl font-bold text-[#0a1628] dark:text-white sm:text-4xl">
                All Articles
              </h1>
              <p className="mt-1 text-sm text-[#0a1628]/60 dark:text-white/50">
                {allPosts.length} article{allPosts.length !== 1 ? 's' : ''} published
              </p>

              {/* Category filter pills */}
              <div className="mt-6 flex flex-wrap gap-2">
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <Link
                    key={value}
                    href={CATEGORY_HREFS[value] ?? '#'}
                    className="rounded-full border border-[#0a1628]/20 dark:border-white/15 px-4 py-1.5 text-sm font-medium text-[#0a1628] dark:text-white/90 transition-colors hover:border-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a1628]"
                  >
                    {label}
                    {counts[value] ? (
                      <span className="ml-1.5 text-xs text-[#0a1628]/50 dark:text-white/45">
                        {counts[value]}
                      </span>
                    ) : null}
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </FadeIn>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          {allPosts.length > 0 ? (
            <FadeInStagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {allPosts.map((post) => (
                <FadeInItem key={String(post._id)}>
                  <div className="group h-full">
                    <Link href={post.slug ? `/article/${post.slug}` : '#'} className="block h-full">
                      <article className="h-full overflow-hidden rounded-lg border border-[#0a1628]/10 dark:border-white/8 bg-white dark:bg-[#122035] transition-shadow hover:shadow-lg">
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0a1628]/5 dark:bg-white/5">
                          {post.mainImage ? (
                            <Image
                              src={urlFor(post.mainImage).width(600).height(340).url()}
                              alt={
                                (post.mainImage as { alt?: string })?.alt ??
                                (post.title as string) ??
                                'Article'
                              }
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-[#0a1628]/20 dark:text-white/15 font-serif">
                              No image
                            </div>
                          )}
                          <span className="absolute left-3 top-3 rounded px-2 py-1 text-xs font-medium uppercase tracking-wide bg-[#c9a84c] text-[#0a1628]">
                            {getCategoryLabel(post.category as string)}
                          </span>
                        </div>
                        <div className="p-5">
                          <h2 className="font-serif text-xl font-semibold leading-snug text-[#0a1628] dark:text-white/90 line-clamp-2">
                            {String(post.title ?? '')}
                          </h2>
                          {post.excerpt ? (
                            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#0a1628]/75 dark:text-white/60">
                              {String(post.excerpt)}
                            </p>
                          ) : null}
                          {Array.isArray(post.tags) && post.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {(post.tags as string[]).slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-[#0a1628]/5 dark:bg-white/[0.04] px-2.5 py-0.5 text-xs text-[#0a1628]/60 dark:text-white/50"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="mt-4 flex flex-wrap items-center gap-x-3 text-xs text-[#0a1628]/60 dark:text-white/50">
                            {post.authorName ? <span>{String(post.authorName)}</span> : null}
                            {post.publishedAt ? (
                              <span>{formatDate(post.publishedAt as string)}</span>
                            ) : null}
                            {(post.readingTime as number) > 0 ? (
                              <span>{Math.max(1, post.readingTime as number)} min read</span>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    </Link>
                  </div>
                </FadeInItem>
              ))}
            </FadeInStagger>
          ) : (
            <p className="text-[#0a1628]/60 dark:text-white/50">No articles published yet.</p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
