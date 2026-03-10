import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'Markets', href: '/category/markets' },
  { label: 'Investing', href: '/category/investing' },
  { label: 'Personal Finance', href: '/category/personal-finance' },
  { label: 'Economy', href: '/category/economy' },
  { label: 'Crypto', href: '/category/crypto' },
  { label: 'Archive', href: '/archive' },
]

export function Footer() {
  return (
    <footer className="border-t border-[#0a1628]/10 bg-[#0a1628] text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Link href="/" className="font-serif text-xl font-bold hover:text-[#c9a84c] transition-colors">
              Next Gen Finance
            </Link>
            <p className="mt-3 text-sm text-white/60 leading-relaxed">
              Financial literacy for the next generation. Clear, well-researched coverage of markets, business, and the economy — written by passionate young journalists.
            </p>
          </div>

          <div className="flex gap-14">
            <nav aria-label="Footer topics">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35 mb-4">Topics</p>
              <ul className="space-y-2.5 text-sm">
                {FOOTER_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-white/65 transition-colors hover:text-[#c9a84c]">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Footer pages">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35 mb-4">More</p>
              <ul className="space-y-2.5 text-sm">
                {[
                  { label: 'Search', href: '/search' },
                  { label: 'About Us', href: '/#about' },
                ].map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-white/65 transition-colors hover:text-[#c9a84c]">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} Next Gen Finance. All rights reserved.
          </p>
          <p className="text-xs text-white/25 font-serif italic">
            Empowering the next generation of investors.
          </p>
        </div>
      </div>
    </footer>
  )
}
