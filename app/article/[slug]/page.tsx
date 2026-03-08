import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PortableText } from 'next-sanity'
import { sanityFetch, urlFor } from '@/lib/sanity'
import { getBaseUrl } from '@/lib/site'
import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'

const CATEGORY_LABELS: Record<string, string> = {
  markets: 'Markets',
  investing: 'Investing',
  personalFinance: 'Personal Finance',
  economy: 'Economy',
  crypto: 'Crypto',
}

const SLUGS_QUERY = `*[_type == "post" && defined(slug.current)]{ "slug": slug.current }`

const ARTICLE_QUERY = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  _updatedAt,
  title,
  "slug": slug.current,
  excerpt,
  category,
  mainImage,
  "authorName": author->name,
  publishedAt,
  body
}`

const RELATED_QUERY = `*[_type == "post" && _id != $id] | order(select(category == $category => 0, 1), publishedAt desc) [0...3] {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  category,
  mainImage,
  "authorName": author->name,
  publishedAt
}`

export const dynamicParams = true

export async function generateStaticParams() {
  const posts = await sanityFetch(SLUGS_QUERY)
  return Array.isArray(posts)
    ? posts.map((p: { slug: string }) => ({ slug: p.slug }))
    : []
}

function estimateReadingTime(body: unknown): number {
  if (!Array.isArray(body)) return 1
  const text = body
    .filter((b: { _type?: string }) => b?._type === 'block')
    .flatMap((b: { children?: { text?: string }[] }) =>
      (b?.children ?? []).map((c) => c?.text ?? '')
    )
    .join(' ')
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
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

const portableTextComponents = {
  types: {
    image: ({ value }: { value?: { asset?: unknown; alt?: string } }) => {
      if (!value?.asset) return null
      return (
        <div className="relative my-8 aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={urlFor(value).width(800).height(450).url()}
            alt={value.alt ?? 'Article image'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>
      )
    },
  },
  block: {
    h1: (props: { children?: React.ReactNode }) => (
      <h1 className="mt-10 font-serif text-3xl font-bold text-[#0a1628] first:mt-0">
        {props.children}
      </h1>
    ),
    h2: (props: { children?: React.ReactNode }) => (
      <h2 className="mt-8 font-serif text-2xl font-bold text-[#0a1628]">{props.children}</h2>
    ),
    h3: (props: { children?: React.ReactNode }) => (
      <h3 className="mt-6 font-serif text-xl font-bold text-[#0a1628]">{props.children}</h3>
    ),
    h4: (props: { children?: React.ReactNode }) => (
      <h4 className="mt-4 font-serif text-lg font-bold text-[#0a1628]">{props.children}</h4>
    ),
    blockquote: (props: { children?: React.ReactNode }) => (
      <blockquote className="my-6 border-l-4 border-[#c9a84c] pl-6 italic text-[#0a1628]/80">
        {props.children}
      </blockquote>
    ),
    normal: (props: { children?: React.ReactNode }) => (
      <p className="mb-4 leading-relaxed text-[#0a1628]/90">{props.children}</p>
    ),
  },
  list: {
    bullet: (props: { children?: React.ReactNode }) => (
      <ul className="mb-4 ml-6 list-disc space-y-2 text-[#0a1628]/90">{props.children}</ul>
    ),
    number: (props: { children?: React.ReactNode }) => (
      <ol className="mb-4 ml-6 list-decimal space-y-2 text-[#0a1628]/90">{props.children}</ol>
    ),
  },
  listItem: {
    bullet: (props: { children?: React.ReactNode }) => <li>{props.children}</li>,
    number: (props: { children?: React.ReactNode }) => <li>{props.children}</li>,
  },
  marks: {
    link: ({ children, value }: { children?: React.ReactNode; value?: { href?: string } }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#c9a84c] underline underline-offset-2 transition-colors hover:text-[#b8963d]"
      >
        {children}
      </a>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-semibold text-[#0a1628]">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic">{children}</em>
    ),
  },
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await sanityFetch(ARTICLE_QUERY, { slug })

  if (!article) {
    return {
      title: 'Article not found',
    }
  }

  const baseUrl = getBaseUrl()
  const title = article.title ?? 'Article'
  const description =
    (article.excerpt as string) ??
    'Read this article on Weekly Finance Articles.'
  const imageUrl = article.mainImage
    ? urlFor(article.mainImage).width(1200).height(630).url()
    : undefined

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: article.publishedAt as string | undefined,
      authors: article.authorName ? [article.authorName as string] : undefined,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : undefined,
      url: `${baseUrl}/article/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await sanityFetch(ARTICLE_QUERY, { slug })

  if (!article) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="font-serif text-2xl font-bold text-[#0a1628]">
            Article not found
          </h1>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 text-[#c9a84c] hover:underline"
          >
            ← Back to Home
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const relatedPosts = await sanityFetch(RELATED_QUERY, { id: article._id, category: article.category ?? null })

  const baseUrl = getBaseUrl()
  const articleUrl = `${baseUrl}/article/${article.slug}`
  const imageUrl = article.mainImage
    ? urlFor(article.mainImage).width(1200).height(630).url()
    : undefined

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt ?? article.title,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: article.publishedAt ?? undefined,
    dateModified: (article._updatedAt ?? article.publishedAt) ?? undefined,
    author: article.authorName
      ? {
          '@type': 'Person',
          name: article.authorName,
        }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'Weekly Finance Articles',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
  }

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main>
        {/* Back to Home link */}
        <div className="border-b border-[#0a1628]/10">
          <div className="mx-auto max-w-3xl px-4 py-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#0a1628]/70 transition-colors hover:text-[#c9a84c]"
            >
              <span aria-hidden>←</span>
              Back to Home
            </Link>
          </div>
        </div>

        {/* Hero image */}
        <section className="border-b border-[#0a1628]/10">
          <div className="relative aspect-[21/9] w-full overflow-hidden bg-[#0a1628]/5">
            {article.mainImage ? (
              <Image
                src={urlFor(article.mainImage).width(1200).height(514).url()}
                alt={article.mainImage?.alt ?? article.title ?? 'Article hero'}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[#0a1628]/20 font-serif text-2xl">
                No image
              </div>
            )}
          </div>
        </section>

        {/* Article content */}
        <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <h1 className="font-serif text-4xl font-bold leading-tight text-[#0a1628] sm:text-5xl">
            {article.title}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
            {article.authorName && (
              <span className="text-[#0a1628]/80">{article.authorName}</span>
            )}
            {article.publishedAt && (
              <span className="text-[#0a1628]/70">{formatDate(article.publishedAt)}</span>
            )}
            {article.category && (
              <span className="rounded px-3 py-1 text-xs font-medium uppercase tracking-wide bg-[#c9a84c]/20 text-[#c9a84c]">
                {getCategoryLabel(article.category)}
              </span>
            )}
          </div>

          {article.body && article.body.length > 0 && (
            <p className="mt-3 text-sm text-[#0a1628]/50">
              {estimateReadingTime(article.body)} min read
            </p>
          )}

          {article.body && article.body.length > 0 && (
            <div className="prose prose-lg mt-10 max-w-none">
              <PortableText value={article.body} components={portableTextComponents as never} />
            </div>
          )}
        </article>

        {/* Related articles */}
        {Array.isArray(relatedPosts) && relatedPosts.length > 0 && (
          <section className="border-t border-[#0a1628]/10 bg-[#0a1628]/[0.02]">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
              <h2 className="font-serif text-2xl font-bold text-[#0a1628] sm:text-3xl">
                Related Articles
              </h2>
              <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((post: Record<string, unknown>) => (
                  <li key={String(post._id)} className="group">
                    <Link
                      href={post.slug ? `/article/${post.slug}` : '#'}
                      className="block"
                    >
                      <article className="overflow-hidden rounded-lg border border-[#0a1628]/10 bg-white transition-shadow hover:shadow-lg">
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
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
