import Link from 'next/link'

const CATEGORY_LABELS: Record<string, string> = {
  markets: 'Markets',
  investing: 'Investing',
  personalFinance: 'Personal Finance',
  economy: 'Economy',
  crypto: 'Crypto',
}

interface TickerPost {
  title: string
  slug: string
  category?: string
}

export function HeadlineTicker({ posts }: { posts: TickerPost[] }) {
  if (!posts || posts.length === 0) return null
  const items = [...posts, ...posts]

  return (
    <div className="border-b border-[#0a1628]/8 dark:border-white/8 overflow-hidden">
      <div className="relative flex items-center">
        {/* Static label — sits on top of the fade */}
        <div className="relative z-10 flex-shrink-0 flex items-center gap-2 pl-4 pr-3 py-2.5 bg-white dark:bg-[#0c1827]">
          <span className="block h-1.5 w-1.5 rounded-full bg-[#c9a84c] flex-shrink-0 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#0a1628]/45 dark:text-white/40 whitespace-nowrap">
            Latest
          </span>
          {/* Gradient fade from label into scrolling area */}
          <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white dark:from-[#0c1827] to-transparent pointer-events-none" />
        </div>

        {/* Scrolling headlines with edge fades */}
        <div className="overflow-hidden flex-1 ticker-mask">
          <div className="animate-ticker flex whitespace-nowrap py-2.5">
            {items.map((post, i) => (
              <Link
                key={i}
                href={`/article/${post.slug}`}
                className="inline-flex items-center gap-2.5 px-6 text-[11px] text-[#0a1628]/55 dark:text-white/45 hover:text-[#c9a84c] dark:hover:text-[#c9a84c] transition-colors duration-200"
              >
                {post.category && (
                  <span className="text-[#c9a84c]/80 font-semibold text-[9px] uppercase tracking-[0.18em]">
                    {CATEGORY_LABELS[post.category] ?? post.category}
                  </span>
                )}
                <span className="font-medium">{post.title}</span>
                <span className="text-[#0a1628]/12 dark:text-white/12 select-none">·</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
