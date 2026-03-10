import type { Metadata } from 'next'
import Link from 'next/link'
import { sanityFetch } from '@/lib/sanity'
import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'
import { SearchClient } from './SearchClient'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search all articles on Next Gen Finance.',
}

const ALL_POSTS_QUERY = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  "slug": slug.current,
  excerpt,
  category,
  mainImage,
  "authorName": author->name,
  publishedAt,
  tags
}`

export default async function SearchPage() {
  const posts = await sanityFetch(ALL_POSTS_QUERY)

  return (
    <div className="min-h-screen bg-white dark:bg-[#0c1827] transition-colors duration-200">
      <Navbar />

      <main>
        <section className="border-b border-[#0a1628]/10 dark:border-white/10 bg-[#0a1628]/[0.02] dark:bg-white/[0.03]">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#0a1628]/60 dark:text-white/50 hover:text-[#c9a84c] transition-colors"
            >
              <span aria-hidden>←</span> Home
            </Link>
            <h1 className="mt-4 font-serif text-3xl font-bold text-[#0a1628] dark:text-white sm:text-4xl">
              Search
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <SearchClient posts={Array.isArray(posts) ? posts : []} />
        </section>
      </main>

      <Footer />
    </div>
  )
}
