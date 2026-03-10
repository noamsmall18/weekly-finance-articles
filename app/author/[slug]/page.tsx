import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PortableText } from 'next-sanity'
import { notFound } from 'next/navigation'
import { sanityFetch, urlFor } from '@/lib/sanity'
import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'
import { FadeIn, FadeInStagger, FadeInItem } from '@/app/components/FadeIn'
import { MarketBar } from '@/app/components/MarketBar'

const CATEGORY_LABELS: Record<string, string> = {
  markets: 'Markets',
  investing: 'Investing',
  personalFinance: 'Personal Finance',
  economy: 'Economy',
  crypto: 'Crypto',
  business: 'Business',
}

const AUTHOR_SLUGS_QUERY = `*[_type == "author" && defined(slug.current)]{ "slug": slug.current }`

const AUTHOR_QUERY = `*[_type == "author" && slug.current == $slug][0] {
  _id,
  name,
  "slug": slug.current,
  image,
  bio
}`

const AUTHOR_POSTS_QUERY = `*[_type == "post" && author._ref == $authorId] | order(coalesce(publishedAt, _createdAt) desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  category,
  mainImage,
  "publishedAt": coalesce(publishedAt, _createdAt),
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

export async function generateStaticParams() {
  const authors = await sanityFetch(AUTHOR_SLUGS_QUERY)
  return Array.isArray(authors)
    ? (authors as { slug: string }[]).map((a) => ({ slug: a.slug }))
    : []
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const author = await sanityFetch(AUTHOR_QUERY, { slug })
  if (!author) return { title: 'Author not found' }
  return {
    title: (author as { name?: string }).name ?? 'Author',
    description: `Articles by ${(author as { name?: string }).name ?? 'this author'} on Next Gen Finance.`,
  }
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const author = await sanityFetch(AUTHOR_QUERY, { slug })

  if (!author) notFound()

  const a = author as {
    _id: string
    name?: string
    slug?: string
    image?: Record<string, unknown>
    bio?: unknown[]
  }

  const posts = await sanityFetch(AUTHOR_POSTS_QUERY, { authorId: a._id })
  const allPosts = Array.isArray(posts) ? (posts as Record<string, unknown>[]) : []

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <MarketBar />

      <main>
        <FadeIn>
          <section className="border-b border-[#0a1628]/10 bg-[#0a1628]/[0.02]">
            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-[#0a1628]/60 hover:text-[#c9a84c] transition-colors"
              >
                <span aria-hidden>←</span> Home
              </Link>

              <div className="mt-6 flex items-center gap-5">
                {a.image && (
                  <div className="relative h-20 w-20 overflow-hidden rounded-full bg-[#0a1628]/5 flex-shrink-0">
                    <Image
                      src={urlFor(a.image).width(160).height(160).url()}
                      alt={a.name ?? 'Author'}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                )}
                <div>
                  <h1 className="font-serif text-2xl font-bold text-[#0a1628] sm:text-3xl">
                    {a.name}
                  </h1>
                  <p className="mt-0.5 text-sm text-[#0a1628]/60">
                    {allPosts.length} article{allPosts.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {Array.isArray(a.bio) && a.bio.length > 0 && (
                <div className="mt-5 text-[#0a1628]/80 leading-relaxed">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <PortableText value={a.bio as any} />
                </div>
              )}
            </div>
          </section>
        </FadeIn>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          {allPosts.length > 0 ? (
            <>
              <FadeIn>
                <h2 className="font-serif text-xl font-bold text-[#0a1628]">Articles</h2>
              </FadeIn>
              <FadeInStagger className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {allPosts.map((post) => (
                  <FadeInItem key={String(post._id)}>
                    <div className="group h-full">
                      <Link href={post.slug ? `/article/${post.slug}` : '#'} className="block h-full">
                        <article className="h-full overflow-hidden rounded-lg border border-[#0a1628]/10 bg-white transition-shadow hover:shadow-lg">
                          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0a1628]/5">
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
                            {post.publishedAt ? (
                              <p className="mt-4 text-xs text-[#0a1628]/60">
                                {formatDate(post.publishedAt as string)}
                              </p>
                            ) : null}
                          </div>
                        </article>
                      </Link>
                    </div>
                  </FadeInItem>
                ))}
              </FadeInStagger>
            </>
          ) : (
            <p className="text-[#0a1628]/60">No articles yet.</p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
