import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { PortableText } from 'next-sanity'
import { sanityFetch, urlFor } from '@/lib/sanity'
import { getBaseUrl } from '@/lib/site'
import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'
import { ReadingProgressBar } from '@/app/components/ReadingProgressBar'
import { ShareButtons } from '@/app/components/ShareButtons'
import { BackToTop } from '@/app/components/BackToTop'
import { TableOfContents } from '@/app/components/TableOfContents'
import type { TocHeading } from '@/app/components/TableOfContents'
import { FadeIn, FadeInStagger, FadeInItem } from '@/app/components/FadeIn'

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
  "authorSlug": author->slug.current,
  publishedAt,
  body,
  tags
}`

const RELATED_QUERY = `*[_type == "post" && _id != $id && defined(publishedAt)] | order(select(category == $category => 0, 1), publishedAt desc) [0...3] {
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

// Extract headings from body blocks for the TOC
function extractHeadings(body: unknown): TocHeading[] {
  if (!Array.isArray(body)) return []
  return body
    .filter(
      (b: Record<string, unknown>) =>
        b._type === 'block' && ['h2', 'h3'].includes(b.style as string),
    )
    .map((b: Record<string, unknown>) => {
      const children = (b.children as Array<{ text?: string }>) ?? []
      const text = children.map((c) => c.text ?? '').join('')
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
      return { text, level: b.style as string, id }
    })
    .filter((h) => h.text.length > 0)
}

function makeHeadingId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function estimateReadingTime(body: unknown): number {
  if (!Array.isArray(body)) return 1
  const text = body
    .filter((b: { _type?: string }) => b?._type === 'block')
    .flatMap((b: { children?: { text?: string }[] }) =>
      (b?.children ?? []).map((c) => c?.text ?? ''),
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

function isNew(dateString: string | null): boolean {
  if (!dateString) return false
  return Date.now() - new Date(dateString).getTime() < 24 * 60 * 60 * 1000
}

// PortableText renderers — headings get IDs for TOC anchor scrolling
const portableTextComponents = {
  types: {
    image: ({ value }: { value?: { asset?: unknown; alt?: string } }) => {
      if (!value?.asset) return null
      return (
        <figure className="relative my-8 aspect-video w-full overflow-hidden rounded-xl shadow-sm">
          <Image
            src={urlFor(value).width(800).height(450).url()}
            alt={value.alt ?? 'Article image'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 800px"
          />
          {value.alt && (
            <figcaption className="mt-2 text-center text-xs text-[#0a1628]/40">
              {value.alt}
            </figcaption>
          )}
        </figure>
      )
    },
  },
  block: {
    h1: ({ value, children }: { value?: Record<string, unknown>; children?: React.ReactNode }) => {
      const text = ((value?.children as Array<{ text?: string }>) ?? []).map((c) => c.text ?? '').join('')
      return (
        <h1 id={makeHeadingId(text)} className="mt-10 scroll-mt-24 font-serif text-3xl font-bold text-[#0a1628] first:mt-0">
          {children}
        </h1>
      )
    },
    h2: ({ value, children }: { value?: Record<string, unknown>; children?: React.ReactNode }) => {
      const text = ((value?.children as Array<{ text?: string }>) ?? []).map((c) => c.text ?? '').join('')
      return (
        <h2 id={makeHeadingId(text)} className="mt-10 scroll-mt-24 font-serif text-2xl font-bold text-[#0a1628]">
          {children}
        </h2>
      )
    },
    h3: ({ value, children }: { value?: Record<string, unknown>; children?: React.ReactNode }) => {
      const text = ((value?.children as Array<{ text?: string }>) ?? []).map((c) => c.text ?? '').join('')
      return (
        <h3 id={makeHeadingId(text)} className="mt-8 scroll-mt-24 font-serif text-xl font-bold text-[#0a1628]">
          {children}
        </h3>
      )
    },
    h4: (props: { children?: React.ReactNode }) => (
      <h4 className="mt-6 font-serif text-lg font-bold text-[#0a1628]">{props.children}</h4>
    ),
    blockquote: (props: { children?: React.ReactNode }) => (
      <blockquote className="my-8 border-l-4 border-[#c9a84c] bg-[#c9a84c]/5 pl-6 pr-4 py-4 rounded-r-lg italic text-[#0a1628]/80 text-lg leading-relaxed">
        {props.children}
      </blockquote>
    ),
    normal: (props: { children?: React.ReactNode }) => (
      <p className="mb-5 leading-[1.9] text-[#0a1628]/85 text-[1.05rem]">{props.children}</p>
    ),
  },
  list: {
    bullet: (props: { children?: React.ReactNode }) => (
      <ul className="mb-5 ml-6 list-disc space-y-2 text-[#0a1628]/85">{props.children}</ul>
    ),
    number: (props: { children?: React.ReactNode }) => (
      <ol className="mb-5 ml-6 list-decimal space-y-2 text-[#0a1628]/85">{props.children}</ol>
    ),
  },
  listItem: {
    bullet: (props: { children?: React.ReactNode }) => (
      <li className="leading-relaxed">{props.children}</li>
    ),
    number: (props: { children?: React.ReactNode }) => (
      <li className="leading-relaxed">{props.children}</li>
    ),
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

  if (!article) return { title: 'Article not found' }

  const baseUrl = getBaseUrl()
  const title = article.title ?? 'Article'
  const description = (article.excerpt as string) ?? 'Read this article on Next Gen Finance.'
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
          <h1 className="font-serif text-2xl font-bold text-[#0a1628]">Article not found</h1>
          <Link href="/" className="mt-4 inline-flex items-center gap-2 text-[#c9a84c] hover:underline">
            ← Back to Home
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const relatedPosts = await sanityFetch(RELATED_QUERY, {
    id: article._id,
    category: article.category ?? null,
  })

  const baseUrl = getBaseUrl()
  const articleUrl = `${baseUrl}/article/${article.slug}`
  const imageUrl = article.mainImage
    ? urlFor(article.mainImage).width(1200).height(630).url()
    : undefined

  const headings = extractHeadings(article.body)
  const readingTime = estimateReadingTime(article.body)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt ?? article.title,
    image: imageUrl ? [imageUrl] : undefined,
    datePublished: article.publishedAt ?? undefined,
    dateModified: (article._updatedAt ?? article.publishedAt) ?? undefined,
    author: article.authorName ? { '@type': 'Person', name: article.authorName } : undefined,
    publisher: { '@type': 'Organization', name: 'Next Gen Finance' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
  }

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReadingProgressBar />
      <BackToTop />
      <Navbar />

      <main>
        {/* Back link */}
        <div className="border-b border-[#0a1628]/10">
          <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#0a1628]/55 transition-colors hover:text-[#c9a84c]"
            >
              <span aria-hidden>←</span> Back to Home
            </Link>
          </div>
        </div>

        {/* Hero image */}
        <FadeIn direction="none">
          <section>
            <div className="relative aspect-[21/9] w-full overflow-hidden bg-[#0a1628]/5">
              {article.mainImage ? (
                <Image
                  src={urlFor(article.mainImage).width(1400).height(600).url()}
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
        </FadeIn>

        {/* Article layout — content + TOC sidebar on XL */}
        <FadeIn delay={0.05}>
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="flex gap-14 xl:gap-16">
              {/* Main article */}
              <article className="min-w-0 flex-1 max-w-3xl">
                {/* Meta */}
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  {article.category && (
                    <span className="rounded px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] bg-[#c9a84c]/20 text-[#c9a84c]">
                      {getCategoryLabel(article.category)}
                    </span>
                  )}
                  {isNew(article.publishedAt) && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#c9a84c] px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#0a1628]">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0a1628] opacity-60" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#0a1628]" />
                      </span>
                      New
                    </span>
                  )}
                  {Array.isArray(article.tags) &&
                    (article.tags as string[]).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#0a1628]/5 px-3 py-1 text-xs text-[#0a1628]/50"
                      >
                        {tag}
                      </span>
                    ))}
                </div>

                <h1 className="font-serif text-4xl font-bold leading-tight text-[#0a1628] sm:text-5xl">
                  {article.title}
                </h1>

                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 pb-6 border-b border-[#0a1628]/10">
                  {article.authorName && (
                    article.authorSlug ? (
                      <Link
                        href={`/author/${article.authorSlug}`}
                        className="font-medium text-[#0a1628] hover:text-[#c9a84c] transition-colors"
                      >
                        {article.authorName}
                      </Link>
                    ) : (
                      <span className="font-medium text-[#0a1628]">{article.authorName}</span>
                    )
                  )}
                  {article.publishedAt && (
                    <span className="text-sm text-[#0a1628]/55">{formatDate(article.publishedAt)}</span>
                  )}
                  <span className="flex items-center gap-1.5 text-sm text-[#0a1628]/40">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {readingTime} min read
                  </span>
                </div>

                {/* Body */}
                {article.body && article.body.length > 0 && (
                  <div className="prose prose-lg mt-8 max-w-none">
                    <PortableText
                      value={article.body}
                      components={portableTextComponents as never}
                    />
                  </div>
                )}

                {/* Share */}
                <div className="mt-12 pt-8 border-t border-[#0a1628]/10">
                  <ShareButtons url={articleUrl} title={article.title ?? 'Article'} />
                </div>
              </article>

              {/* TOC sidebar — only on XL+ */}
              {headings.length > 1 && (
                <aside className="hidden xl:block w-60 flex-shrink-0">
                  <TableOfContents headings={headings} />
                </aside>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Related articles */}
        {Array.isArray(relatedPosts) && relatedPosts.length > 0 && (
          <section className="border-t border-[#0a1628]/10 bg-[#0a1628]/[0.02]">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
              <FadeIn>
                <h2 className="font-serif text-2xl font-bold text-[#0a1628] sm:text-3xl">
                  Related Articles
                </h2>
              </FadeIn>
              <FadeInStagger className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((post: Record<string, unknown>) => (
                  <FadeInItem key={String(post._id)}>
                    <Link href={post.slug ? `/article/${post.slug}` : '#'} className="block group h-full">
                      <article className="h-full overflow-hidden rounded-xl border border-[#0a1628]/10 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0a1628]/5">
                          {post.mainImage ? (
                            <Image
                              src={urlFor(post.mainImage).width(600).height(340).url()}
                              alt={(post.mainImage as { alt?: string })?.alt ?? (post.title as string) ?? 'Article'}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-[#0a1628]/20 font-serif">
                              No image
                            </div>
                          )}
                          <span className="absolute left-3 top-3 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-[#c9a84c] text-[#0a1628]">
                            {getCategoryLabel(post.category as string)}
                          </span>
                        </div>
                        <div className="p-5">
                          <h3 className="font-serif text-xl font-semibold leading-snug text-[#0a1628] line-clamp-2 group-hover:text-[#c9a84c] transition-colors duration-200">
                            {String(post.title ?? '')}
                          </h3>
                          {post.excerpt ? (
                            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#0a1628]/65">
                              {String(post.excerpt)}
                            </p>
                          ) : null}
                          <div className="mt-4 flex flex-wrap items-center gap-x-3 text-xs text-[#0a1628]/50">
                            {post.authorName ? <span>{String(post.authorName)}</span> : null}
                            {post.publishedAt ? <span>{formatDate(post.publishedAt as string)}</span> : null}
                          </div>
                        </div>
                      </article>
                    </Link>
                  </FadeInItem>
                ))}
              </FadeInStagger>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
