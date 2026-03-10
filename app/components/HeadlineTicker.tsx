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

  // Duplicate so the loop is seamless
  const items = [...posts, ...posts]

  return (
    <div className="border-b border-[#0a1628]/10 bg-[#0a1628] overflow-hidden flex items-stretch">
      {/* Fixed label */}
      <div className="flex-shrink-0 flex items-center bg-[#c9a84c] px-4 py-2 z-10">
        <span className="text-[#0a1628] text-[10px] font-black uppercase tracking-[0.2em]">
          Latest
        </span>
      </div>

      {/* Scrolling ticker */}
      <div className="overflow-hidden flex-1 relative">
        <div className="animate-ticker flex gap-0 whitespace-nowrap py-2">
          {items.map((post, i) => (
            <Link
              key={i}
              href={`/article/${post.slug}`}
              className="inline-flex items-center gap-2 px-6 text-sm text-white/80 hover:text-white transition-colors group"
            >
              {post.category && (
                <span className="text-[#c9a84c] text-[10px] font-bold uppercase tracking-widest">
                  {CATEGORY_LABELS[post.category] ?? post.category}
                </span>
              )}
              <span className="group-hover:text-[#c9a84c] transition-colors">
                {post.title}
              </span>
              <span className="text-white/20 text-xs ml-2">•</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
