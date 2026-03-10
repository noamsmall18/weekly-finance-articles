import Image from 'next/image'
import Link from 'next/link'
import { sanityFetch, urlFor } from '@/lib/sanity'
import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'
import { NewsletterSignup } from '@/app/components/NewsletterSignup'
import { FadeIn, FadeInStagger, FadeInItem } from '@/app/components/FadeIn'
import { HeadlineTicker } from '@/app/components/HeadlineTicker'

const CATEGORY_LABELS: Record<string, string> = {
  markets: 'Markets',
  investing: 'Investing',
  personalFinance: 'Personal Finance',
  economy: 'Economy',
  crypto: 'Crypto',
  business: 'Business',
}

const HOMEPAGE_QUERY = `*[_type == "post"] | order(coalesce(publishedAt, _createdAt) desc) [0...7] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  category,
  mainImage,
  "authorName": author->name,
  "publishedAt": coalesce(publishedAt, _createdAt),
  tags
}`

const TICKER_QUERY = `*[_type == "post"] | order(coalesce(publishedAt, _createdAt) desc) [0...14] {
  title,
  "slug": slug.current,
  category
}`

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

function isNew(dateString: string | null): boolean {
  if (!dateString) return false
  return Date.now() - new Date(dateString).getTime() < 24 * 60 * 60 * 1000
}

export default async function Home() {
  const [posts, tickerPosts] = await Promise.all([
    sanityFetch(HOMEPAGE_QUERY),
    sanityFetch(TICKER_QUERY),
  ])

  const heroPost = Array.isArray(posts) && posts.length > 0 ? posts[0] : null
  const gridPosts = Array.isArray(posts) && posts.length > 1 ? posts.slice(1, 7) : []

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c1827] transition-colors duration-200">
      <Navbar />

      {Array.isArray(tickerPosts) && tickerPosts.length > 0 && (
        <HeadlineTicker posts={tickerPosts} />
      )}

      <main>
        {/* Hero */}
        {heroPost && (
          <section className="border-b border-[#0a1628]/10 dark:border-white/10">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
              <div className="grid gap-8 lg:grid-cols-2 lg:gap-14 lg:items-center">
                <FadeIn direction="left">
                  <Link href={`/article/${heroPost.slug}`} className="block group">
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#0a1628]/5 dark:bg-white/5 shadow-lg">
                      {heroPost.mainImage ? (
                        <Image
                          src={urlFor(heroPost.mainImage).width(900).height(562).url()}
                          alt={heroPost.mainImage?.alt ?? heroPost.title ?? 'Featured article'}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          priority
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[#0a1628]/30 dark:text-white/20 font-serif text-2xl">
                          No image
                        </div>
                      )}
                    </div>
                  </Link>
                </FadeIn>

                <FadeIn direction="right" delay={0.1}>
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-block rounded px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] bg-[#c9a84c]/20 text-[#c9a84c]">
                        {getCategoryLabel(heroPost.category)}
                      </span>
                      {isNew(heroPost.publishedAt) && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c9a84c] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#0a1628]">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0a1628] opacity-60" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#0a1628]" />
                          </span>
                          New
                        </span>
                      )}
                    </div>

                    <h1 className="font-serif text-3xl font-bold leading-tight text-[#0a1628] dark:text-white sm:text-4xl lg:text-[2.6rem] lg:leading-[1.15]">
                      {heroPost.title}
                    </h1>

                    {heroPost.excerpt && (
                      <p className="mt-4 text-[1.05rem] leading-relaxed text-[#0a1628]/65 dark:text-white/55">
                        {heroPost.excerpt}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#0a1628]/50 dark:text-white/45">
                      {heroPost.authorName && <span>{heroPost.authorName}</span>}
                      {heroPost.publishedAt && <span>{formatDate(heroPost.publishedAt)}</span>}
                    </div>

                    {heroPost.slug && (
                      <Link
                        href={`/article/${heroPost.slug}`}
                        className="group mt-6 inline-flex w-fit items-center gap-2 rounded-lg bg-[#0a1628] dark:bg-[#c9a84c] px-6 py-3 text-sm font-semibold text-white dark:text-[#0a1628] transition-all duration-200 hover:bg-[#c9a84c] hover:text-[#0a1628] dark:hover:bg-[#b8963d]"
                      >
                        Read Article
                        <svg
                          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                          className="transition-transform duration-200 group-hover:translate-x-1"
                        >
                          <line x1="5" y1="12" x2="19" y2="12" />
                          <polyline points="12 5 19 12 12 19" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </FadeIn>
              </div>
            </div>
          </section>
        )}

        {/* Category strip */}
        <FadeIn>
          <section className="border-b border-[#0a1628]/10 dark:border-white/10">
            <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Markets', href: '/category/markets' },
                  { label: 'Investing', href: '/category/investing' },
                  { label: 'Personal Finance', href: '/category/personal-finance' },
                  { label: 'Economy', href: '/category/economy' },
                  { label: 'Business', href: '/category/business' },
                  { label: 'Crypto', href: '/category/crypto' },
                ].map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-full border border-[#0a1628]/20 dark:border-white/15 px-4 py-1.5 text-sm font-medium text-[#0a1628] dark:text-white/70 transition-all duration-200 hover:border-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a1628]"
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  href="/archive"
                  className="rounded-full border border-[#0a1628]/15 dark:border-white/10 px-4 py-1.5 text-sm font-medium text-[#0a1628]/55 dark:text-white/45 transition-all duration-200 hover:border-[#0a1628] dark:hover:border-white/40 hover:text-[#0a1628] dark:hover:text-white"
                >
                  All Articles →
                </Link>
              </div>
            </div>
          </section>
        </FadeIn>

        {!heroPost && (
          <FadeIn>
            <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8 text-center">
              <p className="font-serif text-2xl font-bold text-[#0a1628] dark:text-white">No articles yet</p>
              <p className="mt-3 text-[#0a1628]/65 dark:text-white/50">Check back soon. New articles are published weekly.</p>
            </section>
          </FadeIn>
        )}

        {/* Article grid */}
        {gridPosts.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <FadeIn>
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-2xl font-bold text-[#0a1628] dark:text-white sm:text-3xl">
                  Latest Articles
                </h2>
                <Link href="/archive" className="text-sm font-medium text-[#0a1628]/50 dark:text-white/40 hover:text-[#c9a84c] dark:hover:text-[#c9a84c] transition-colors">
                  View all →
                </Link>
              </div>
            </FadeIn>

            <FadeInStagger className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {gridPosts.map((post: Record<string, unknown>) => (
                <FadeInItem key={String(post._id)}>
                  <Link href={post.slug ? `/article/${post.slug}` : '#'} className="block group h-full">
                    <article className="h-full overflow-hidden rounded-xl border border-[#0a1628]/10 dark:border-white/[0.07] bg-white dark:bg-[#122035] transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 hover:border-[#0a1628]/20 dark:hover:border-white/15">
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0a1628]/5 dark:bg-white/5">
                        {post.mainImage ? (
                          <Image
                            src={urlFor(post.mainImage).width(600).height(340).url()}
                            alt={(post.mainImage as { alt?: string })?.alt ?? (post.title as string) ?? 'Article'}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-[#0a1628]/20 dark:text-white/15 font-serif">No image</div>
                        )}
                        {/* Subtle gradient overlay on image bottom */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute left-3 top-3 flex items-center gap-1.5">
                          <span className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-[#c9a84c] text-[#0a1628]">
                            {getCategoryLabel(post.category as string)}
                          </span>
                          {isNew(post.publishedAt as string) && (
                            <span className="rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-white dark:bg-[#0c1827] text-[#0a1628] dark:text-white">New</span>
                          )}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-serif text-xl font-semibold leading-snug text-[#0a1628] dark:text-white/90 line-clamp-2 group-hover:text-[#c9a84c] transition-colors duration-200">
                          {String(post.title ?? '')}
                        </h3>
                        {post.excerpt ? (
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#0a1628]/60 dark:text-white/50">
                            {String(post.excerpt)}
                          </p>
                        ) : null}
                        {Array.isArray(post.tags) && (post.tags as string[]).length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {(post.tags as string[]).slice(0, 3).map((tag) => (
                              <span key={tag} className="rounded-full bg-[#0a1628]/5 dark:bg-white/8 px-2.5 py-0.5 text-xs text-[#0a1628]/50 dark:text-white/45">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-4 flex flex-wrap items-center gap-x-3 text-xs text-[#0a1628]/45 dark:text-white/40">
                          {post.authorName ? <span>{String(post.authorName)}</span> : null}
                          {post.publishedAt ? <span>{formatDate(post.publishedAt as string)}</span> : null}
                        </div>
                      </div>
                    </article>
                  </Link>
                </FadeInItem>
              ))}
            </FadeInStagger>
          </section>
        )}

        {/* About Us */}
        <FadeIn>
          <section id="about" className="border-t border-[#0a1628]/10 dark:border-white/10 bg-[#0a1628]/[0.02] dark:bg-white/[0.03]">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
              <h2 className="font-serif text-2xl font-bold text-[#0a1628] dark:text-white">About Us</h2>
              <p className="mt-5 max-w-2xl text-[#0a1628]/75 dark:text-white/60 leading-relaxed text-lg">
                At Next Gen Finance, we believe financial literacy is one of the most powerful tools a young person can have. We are on a mission to help build it. Our team of passionate, dedicated teenagers delivers thoroughly researched, clearly written coverage of markets, business, and the economy. We do not simplify the subject. We make it accessible. Because understanding finance should not have to wait.
              </p>
            </div>
          </section>
        </FadeIn>
      </main>

      <NewsletterSignup />
      <Footer />
    </div>
  )
}
