import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'Markets', href: '/category/markets' },
  { label: 'Investing', href: '/category/investing' },
  { label: 'Personal Finance', href: '/category/personal-finance' },
  { label: 'Economy', href: '/category/economy' },
  { label: 'Crypto', href: '/category/crypto' },
]

export function Footer() {
  return (
    <footer className="border-t border-[#0a1628]/10 bg-[#0a1628] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="font-serif text-lg font-semibold hover:text-[#c9a84c] transition-colors">
              Weekly Finance Articles
            </Link>
            <p className="mt-2 max-w-xs text-sm text-white/70 leading-relaxed">
              Clear, thoughtful coverage of markets, investing, and personal finance — published weekly.
            </p>
          </div>
          <nav aria-label="Footer navigation">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/40">Topics</p>
            <ul className="mt-3 space-y-2 text-sm">
              {FOOTER_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="text-white/75 transition-colors hover:text-[#c9a84c]">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-8 border-t border-white/10 pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} Weekly Finance Articles. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
