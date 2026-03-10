'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { urlFor } from '@/lib/sanity'

const CATEGORY_LABELS: Record<string, string> = {
  markets: 'Markets',
  investing: 'Investing',
  personalFinance: 'Personal Finance',
  economy: 'Economy',
  crypto: 'Crypto',
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

interface Post {
  _id: string
  title?: string
  slug?: string
  excerpt?: string
  category?: string
  mainImage?: unknown
  authorName?: string
  publishedAt?: string
  tags?: string[]
}

export function SearchClient({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    if (!query.trim()) return posts
    const q = query.toLowerCase()
    return posts.filter(
      (p) =>
        p.title?.toLowerCase().includes(q) ||
        p.excerpt?.toLowerCase().includes(q) ||
        p.authorName?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        CATEGORY_LABELS[p.category ?? '']?.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q)),
    )
  }, [query, posts])

  return (
    <>
      {/* Search input */}
      <div className="relative mt-6">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0a1628]/40 dark:text-white/35">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles, topics, authors…"
          autoFocus
          className="w-full rounded-xl border border-[#0a1628]/20 dark:border-white/15 bg-white dark:bg-white/5 py-3.5 pl-11 pr-4 text-base text-[#0a1628] dark:text-white placeholder:text-[#0a1628]/40 dark:placeholder:text-white/30 outline-none focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/20 transition"
        />
      </div>

      <p className="mt-4 text-sm text-[#0a1628]/50 dark:text-white/45">
        {query.trim()
          ? `${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`
          : `${posts.length} articles total`}
      </p>

      {/* Results */}
      <div className="mt-8">
        <AnimatePresence mode="popLayout">
          {results.length > 0 ? (
            <motion.ul
              key="results"
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {results.map((post, i) => (
                <motion.li
                  key={post._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className="group"
                >
                  <Link href={post.slug ? `/article/${post.slug}` : '#'} className="block">
                    <article className="overflow-hidden rounded-lg border border-[#0a1628]/10 dark:border-white/8 bg-white dark:bg-[#122035] transition-shadow hover:shadow-lg">
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#0a1628]/5 dark:bg-white/5">
                        {post.mainImage ? (
                          <Image
                            src={urlFor(post.mainImage).width(600).height(340).url()}
                            alt={(post.mainImage as { alt?: string })?.alt ?? post.title ?? 'Article'}
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
                          {getCategoryLabel(post.category ?? null)}
                        </span>
                      </div>
                      <div className="p-5">
                        <h2 className="font-serif text-xl font-semibold leading-snug text-[#0a1628] dark:text-white/90 line-clamp-2">
                          {post.title ?? ''}
                        </h2>
                        {post.excerpt ? (
                          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#0a1628]/75 dark:text-white/60">
                            {post.excerpt}
                          </p>
                        ) : null}
                        <div className="mt-4 flex flex-wrap items-center gap-x-3 text-xs text-[#0a1628]/60 dark:text-white/50">
                          {post.authorName && <span>{post.authorName}</span>}
                          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-[#0a1628]/60 dark:text-white/50"
            >
              No articles found for &ldquo;{query}&rdquo;.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
