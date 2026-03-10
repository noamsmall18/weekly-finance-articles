import Image from 'next/image'
import Link from 'next/link'
import { sanityFetch, urlFor } from '@/lib/sanity'
import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'
import { FadeIn, FadeInStagger, FadeInItem } from '@/app/components/FadeIn'

const CATEGORY_LABELS: Record<string, string> = {
  markets: 'Markets',
  investing: 'Investing',
  personalFinance: 'Personal Finance',
  economy: 'Economy',
  crypto: 'Crypto',
}

const HOMEPAGE_QUERY = `*[_type == "post"] | order(publishedAt desc) [0...7] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  category,
  mainImage,
  "authorName": author->name,
  "authorSlug": author->slug.current,
  publishedAt,
  tags
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

export default async function Home() {
  const posts = await sanityFetch(HOMEPAGE_QUERY)
  const heroPost = Array.isArray(posts) && posts.length > 0 ? posts[0] : null
  const gridPosts = Array.isArray(posts) && posts.length > 1 ? posts.slice(1, 7) : []

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main>
        {/* Hero section */}
        {heroPost && (
          <section className="border-b border-[#0a1628]/10">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-18">
              <div className="grid gap-8 lg:grid-cols-2 lg:gap-14 lg:items-center">
                <FadeIn direction="left">
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#0a1628]/5 shadow-lg">
                    {heroPost.mainImage ? (
                      <Image
                        src={urlFor(heroPost.mainImage).width(800).height(450).url()}
                        alt={heroPost.mainImage?.alt ?? heroPost.title ?? 'Featured article'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        priority
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[#0a1628]/30 font-serif text-2xl">
                        No image
                      </div>
                    )}
                  </div>
                </FadeIn>

                <FadeIn direction="right" delay={0.1}>
                  <div className="flex flex-col justify-center">
                    <span className="mb-3 inline-block w-fit rounded px-3 py-1 text-xs font-semibold uppercase tracking-widest bg-[#c9a84c]/20 text-[#c9a84c]">
                      {getCategoryLabel(heroPost.category)}
                    </span>
                    <h1 className="font-serif text-3xl font-bold leading-tight text-[#0a1628] sm:text-4xl lg:text-5xl">
                      {heroPost.title}
                    </h1>
                    {heroPost.excerpt && (
                      <p className="mt-4 text-lg leading-relaxed text-[#0a1628]/75">
                        {heroPost.excerpt}
                      </p>
                    )}
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#0a1628]/60">
                      {heroPost.authorName && (
                        heroPost.authorSlug ? (
                          <Link href={`/author/${heroPost.authorSlug}`} className="hover:text-[#c9a84c] transition-colors">
                            {heroPost.authorName}
                          </Link>
                        ) : (
                          <span>{heroPost.authorName}</span>
                        )
                      )}
                      {heroPost.publishedAt && (
                        <span>{formatDate(heroPost.publishedAt)}</span>
                      )}
                    </div>
                    {heroPost.slug && (
                      <Link
                        href={`/article/${heroPost.slug}`}
                        className="mt-6 inline-flex w-fit items-center justify-center rounded-lg bg-[#c9a84c] px-6 py-3 text-sm font-semibold text-[#0a1628] transition-all duration-200 hover:bg-[#b8963d] hover:shadow-md"
                      >
                        Read Article →
                      </Link>
                    )}
                  </div>
                </FadeIn>
              </div>
            </div>
          </section>
        )}

        {/* Category quick-links */}
        <FadeIn>
          <section className="border-b border-[#0a1628]/10">
            <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Markets', href: '/category/markets' },
                  { label: 'Investing', href: '/category/investing' },
                  { label: 'Personal Finance', href: '/category/personal-finance' },
                  { label: 'Economy', href: '/category/economy' },
                  { label: 'Crypto', href: '/category/crypto' },
                ].map(({ label, href }) => (
                  <Link
                    key={href}
                    href={href}
                    className="rounded-full border border-[#0a1628]/20 px-4 py-1.5 text-sm font-medium text-[#0a1628] transition-all duration-200 hover:border-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a1628]"
                  >
                    {label}
                  </Link>
                ))}
                <Link
                  href="/archive"
                  className="rounded-full border border-[#0a1628]/20 px-4 py-1.5 text-sm font-medium text-[#0a1628] transition-all duration-200 hover:border-[#0a1628] hover:bg-[#0a1628] hover:text-white"
                >
                  All Articles →
                </Link>
              </div>
            </div>
          </section>
        </FadeIn>

        {/* Empty state */}
        {!heroPost && (
          <FadeIn>
            <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8 text-center">
              <p className="font-serif text-2xl font-bold text-[#0a1628]">No articles yet</p>
              <p className="mt-3 text-[#0a1628]/70">
                Check back soon — new articles are published weekly.
              </p>
            </section>
          </FadeIn>
        )}

        {/* Article grid */}
        {gridPosts.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <FadeIn>
              <h2 className="font-serif text-2xl font-bold text-[#0a1628] sm:text-3xl">
                Latest Articles
              </h2>
            </FadeIn>
            <FadeInStagger className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {gridPosts.map((post: Record<string, unknown>) => (
                <FadeInItem key={String(post._id)}>
                  <div className="group h-full">
                    <Link href={post.slug ? `/article/${post.slug}` : '#'} className="block h-full">
                      <article className="h-full overflow-hidden rounded-xl border border-[#0a1628]/10 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0a1628]/5">
                          {post.mainImage ? (
                            <Image
                              src={urlFor(post.mainImage).width(600).height(340).url()}
                              alt={(post.mainImage as { alt?: string })?.alt ?? (post.title as string) ?? 'Article'}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-[#0a1628]/20 font-serif">
                              No image
                            </div>
                          )}
                          <span className="absolute left-3 top-3 rounded px-2 py-1 text-xs font-semibold uppercase tracking-wide bg-[#c9a84c] text-[#0a1628]">
                            {getCategoryLabel(post.category as string)}
                          </span>
                        </div>
                        <div className="p-5">
                          <h3 className="font-serif text-xl font-semibold leading-snug text-[#0a1628] line-clamp-2">
                            {String(post.title ?? '')}
                          </h3>
                          {post.excerpt ? (
                            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#0a1628]/70">
                              {String(post.excerpt)}
                            </p>
                          ) : null}
                          {Array.isArray(post.tags) && (post.tags as string[]).length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {(post.tags as string[]).slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-[#0a1628]/5 px-2.5 py-0.5 text-xs text-[#0a1628]/55"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="mt-4 flex flex-wrap items-center gap-x-3 text-xs text-[#0a1628]/55">
                            {post.authorName ? <span>{String(post.authorName)}</span> : null}
                            {post.publishedAt ? (
                              <span>{formatDate(post.publishedAt as string)}</span>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    </Link>
                  </div>
                </FadeInItem>
              ))}
            </FadeInStagger>

            <FadeIn delay={0.2}>
              <div className="mt-10 text-center">
                <Link
                  href="/archive"
                  className="inline-flex items-center gap-2 rounded-lg border border-[#0a1628]/20 px-6 py-3 text-sm font-semibold text-[#0a1628] transition-all duration-200 hover:border-[#0a1628] hover:bg-[#0a1628] hover:text-white"
                >
                  View all articles →
                </Link>
              </div>
            </FadeIn>
          </section>
        )}

        {/* About Us section */}
        <FadeIn>
          <section id="about" className="border-t border-[#0a1628]/10 bg-[#0a1628]/[0.02]">
            <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
              <h2 className="font-serif text-2xl font-bold text-[#0a1628]">About Us</h2>
              <p className="mt-5 max-w-2xl text-[#0a1628]/80 leading-relaxed text-lg">
                At Next Gen Finance, we believe financial literacy is one of the most powerful tools a young person can have — and we&apos;re on a mission to help build it. Our team of passionate, self-driven teenagers delivers well-researched, clearly written coverage of markets, business, and the economy. We don&apos;t simplify the subject. We make it accessible. Because understanding finance shouldn&apos;t have to wait.
              </p>
            </div>
          </section>
        </FadeIn>
      </main>

      <Footer />
    </div>
  )
}
