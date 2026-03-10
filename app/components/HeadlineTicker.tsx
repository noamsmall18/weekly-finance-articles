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
    <div className="border-b border-[#0a1628]/10 dark:border-white/10 bg-[#0a1628]/[0.02] dark:bg-white/[0.03] overflow-hidden flex items-stretch">
      {/* Static label */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border-r border-[#0a1628]/10 dark:border-white/10">
        <span className="block h-1.5 w-1.5 rounded-full bg-[#c9a84c] flex-shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a1628]/50 dark:text-white/45 whitespace-nowrap">
          Latest
        </span>
      </div>

      {/* Scrolling headlines */}
      <div className="overflow-hidden flex-1">
        <div className="animate-ticker flex whitespace-nowrap py-2">
          {items.map((post, i) => (
            <Link
              key={i}
              href={`/article/${post.slug}`}
              className="inline-flex items-center gap-2 px-5 text-xs text-[#0a1628]/60 dark:text-white/50 hover:text-[#c9a84c] dark:hover:text-[#c9a84c] transition-colors"
            >
              {post.category && (
                <span className="text-[#c9a84c] font-semibold text-[10px] uppercase tracking-widest">
                  {CATEGORY_LABELS[post.category] ?? post.category}
                </span>
              )}
              <span>{post.title}</span>
              <span className="text-[#0a1628]/15 dark:text-white/15 ml-3">|</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
