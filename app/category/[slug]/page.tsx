import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
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

const SLUG_TO_CATEGORY: Record<string, string> = {
  markets: 'markets',
  investing: 'investing',
  'personal-finance': 'personalFinance',
  economy: 'economy',
  crypto: 'crypto',
}

const CATEGORY_QUERY = `*[_type == "post" && category == $category] | order(publishedAt desc) {
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

export function generateStaticParams() {
  return Object.keys(SLUG_TO_CATEGORY).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const category = SLUG_TO_CATEGORY[slug]
  if (!category) return { title: 'Category not found' }
  const label = CATEGORY_LABELS[category]
  return {
    title: label,
    description: `Browse all ${label} articles on Next Gen Finance.`,
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = SLUG_TO_CATEGORY[slug]
  if (!category) notFound()

  const posts = await sanityFetch(CATEGORY_QUERY, { category })
  const label = CATEGORY_LABELS[category]
  const count = Array.isArray(posts) ? posts.length : 0

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c1827] transition-colors duration-200">
      <Navbar />

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
                {label}
              </h1>
              <p className="mt-1 text-sm text-[#0a1628]/60 dark:text-white/50">
                {count} article{count !== 1 ? 's' : ''}
              </p>
            </div>
          </section>
        </FadeIn>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          {Array.isArray(posts) && posts.length > 0 ? (
            <FadeInStagger className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {(posts as Record<string, unknown>[]).map((post) => (
                <FadeInItem key={String(post._id)}>
                  <div className="group h-full">
                    <Link href={post.slug ? `/article/${post.slug}` : '#'} className="block h-full">
                      <article className="h-full overflow-hidden rounded-xl border border-[#0a1628]/10 dark:border-white/8 bg-white dark:bg-[#122035] transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
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
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-[#0a1628]/20 dark:text-white/15 font-serif">
                              No image
                            </div>
                          )}
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
                          {Array.isArray(post.tags) && (post.tags as string[]).length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1">
                              {(post.tags as string[]).slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full bg-[#0a1628]/5 dark:bg-white/[0.04] px-2.5 py-0.5 text-xs text-[#0a1628]/55 dark:text-white/50"
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
                          </div>
                        </div>
                      </article>
                    </Link>
                  </div>
                </FadeInItem>
              ))}
            </FadeInStagger>
          ) : (
            <p className="text-[#0a1628]/60 dark:text-white/50">No articles in this category yet.</p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
