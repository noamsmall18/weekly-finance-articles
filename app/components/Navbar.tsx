import Link from 'next/link'

const NAV_LINKS = [
  { label: 'Markets', href: '/category/markets' },
  { label: 'Investing', href: '/category/investing' },
  { label: 'Personal Finance', href: '/category/personal-finance' },
  { label: 'Economy', href: '/category/economy' },
  { label: 'About', href: '/#about' },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#0a1628]/10 bg-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-serif text-base font-semibold tracking-tight text-[#0a1628] sm:text-2xl"
        >
          Weekly Finance Articles
        </Link>
        <ul className="hidden sm:flex items-center gap-4 lg:gap-6 text-sm font-medium text-[#0a1628]">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <Link href={href} className="transition-colors hover:text-[#c9a84c]">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}
