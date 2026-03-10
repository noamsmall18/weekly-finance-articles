import Image from 'next/image'
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
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link href="/" className="inline-block">
              <Image
                src="/logo.jpg"
                alt="Next Gen Finance"
                width={1024}
                height={559}
                className="h-10 w-auto"
              />
            </Link>
            <p className="mt-3 max-w-xs text-sm text-white/70 leading-relaxed">
              Financial literacy for the next generation — clear, well-researched coverage published weekly.
            </p>
          </div>

          <div className="flex gap-12 sm:gap-16">
            <nav aria-label="Footer topics">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                Topics
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {FOOTER_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-white/75 transition-colors hover:text-[#c9a84c]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav aria-label="Footer pages">
              <p className="text-xs font-semibold uppercase tracking-widest text-white/40">
                Pages
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                {[
                  { label: 'Search', href: '/search' },
                  { label: 'About Us', href: '/#about' },
                ].map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-white/75 transition-colors hover:text-[#c9a84c]"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <p className="mt-10 border-t border-white/10 pt-6 text-xs text-white/40">
          © {new Date().getFullYear()} Next Gen Finance. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
