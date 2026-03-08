import Image from 'next/image'
import Link from 'next/link'
import { sanityFetch, urlFor } from '@/lib/sanity'
import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'

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
  publishedAt
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
        {/* Hero section — most recent article */}
        {heroPost && (
          <section className="border-b border-[#0a1628]/10">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-18">
              <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 lg:items-center">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-[#0a1628]/5 sm:aspect-[2/1]">
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
                <div className="flex flex-col justify-center">
                  <span className="mb-2 inline-block w-fit rounded px-3 py-1 text-xs font-medium uppercase tracking-wide text-[#0a1628] bg-[#c9a84c]/20 text-[#c9a84c]">
                    {getCategoryLabel(heroPost.category)}
                  </span>
                  <h1 className="font-serif text-3xl font-bold leading-tight text-[#0a1628] sm:text-4xl lg:text-5xl">
                    {heroPost.title}
                  </h1>
                  {heroPost.excerpt && (
                    <p className="mt-4 text-lg leading-relaxed text-[#0a1628]/80">
                      {heroPost.excerpt}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#0a1628]/70">
                    {heroPost.authorName && <span>{heroPost.authorName}</span>}
                    {heroPost.publishedAt && (
                      <span>{formatDate(heroPost.publishedAt)}</span>
                    )}
                  </div>
                  {heroPost.slug && (
                    <Link
                      href={`/article/${heroPost.slug}`}
                      className="mt-6 inline-flex w-fit items-center justify-center rounded bg-[#c9a84c] px-6 py-3 text-sm font-semibold text-[#0a1628] transition-colors hover:bg-[#b8963d]"
                    >
                      Read More
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Category quick-links */}
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
                  className="rounded-full border border-[#0a1628]/20 px-4 py-1.5 text-sm font-medium text-[#0a1628] transition-colors hover:border-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a1628]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Empty state */}
        {!heroPost && (
          <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8 text-center">
            <p className="font-serif text-2xl font-bold text-[#0a1628]">No articles yet</p>
            <p className="mt-3 text-[#0a1628]/70">Check back soon — new articles are published weekly.</p>
          </section>
        )}

        {/* Article grid — 6 most recent */}
        {gridPosts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <h2 className="font-serif text-2xl font-bold text-[#0a1628] sm:text-3xl">
            Latest Articles
          </h2>
          <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {gridPosts.map((post: Record<string, unknown>) => (
              <li key={String(post._id)} className="group">
                <Link href={post.slug ? `/article/${post.slug}` : '#'} className="block">
                  <article className="overflow-hidden rounded-lg border border-[#0a1628]/10 bg-white transition-shadow hover:shadow-lg">
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0a1628]/5">
                      {post.mainImage ? (
                        <Image
                          src={urlFor(post.mainImage).width(600).height(340).url()}
                          alt={(post.mainImage as { alt?: string })?.alt ?? (post.title as string) ?? 'Article'}
                          fill
                          className="object-cover transition-transform group-hover:scale-[1.02]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-[#0a1628]/20 font-serif">
                          No image
                        </div>
                      )}
                      <span className="absolute left-3 top-3 rounded px-2 py-1 text-xs font-medium uppercase tracking-wide bg-[#c9a84c] text-[#0a1628]">
                        {getCategoryLabel(post.category as string)}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="font-serif text-xl font-semibold leading-snug text-[#0a1628] line-clamp-2">
                        {String(post.title ?? '')}
                      </h3>
                      {post.excerpt ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#0a1628]/75">
                          {String(post.excerpt)}
                        </p>
                      ) : null}
                      <div className="mt-4 flex flex-wrap items-center gap-x-3 text-xs text-[#0a1628]/60">
                        {post.authorName ? (
                          <span>{String(post.authorName)}</span>
                        ) : null}
                        {post.publishedAt ? (
                          <span>{formatDate(post.publishedAt as string)}</span>
                        ) : null}
                      </div>
                    </div>
                  </article>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        )}

        {/* About section (anchor for nav) */}
        <section id="about" className="border-t border-[#0a1628]/10 bg-[#0a1628]/[0.02]">
          <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <h2 className="font-serif text-2xl font-bold text-[#0a1628]">About</h2>
            <p className="mt-4 max-w-2xl text-[#0a1628]/80 leading-relaxed">
              Weekly Finance Articles brings you clear, thoughtful coverage of markets, investing, personal finance, and the economy. Our goal is to help you make better decisions with your money.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
