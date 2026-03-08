import Link from 'next/link'

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#0a1628]/10 bg-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="font-serif text-xl font-semibold tracking-tight text-[#0a1628] sm:text-2xl"
        >
          Weekly Finance Articles
        </Link>
        <ul className="flex items-center gap-6 text-sm font-medium text-[#0a1628]">
          <li>
            <Link href="/" className="transition-colors hover:text-[#c9a84c]">
              Markets
            </Link>
          </li>
          <li>
            <Link href="/" className="transition-colors hover:text-[#c9a84c]">
              Investing
            </Link>
          </li>
          <li>
            <Link href="/" className="transition-colors hover:text-[#c9a84c]">
              Personal Finance
            </Link>
          </li>
          <li>
            <Link href="/#about" className="transition-colors hover:text-[#c9a84c]">
              About
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}
