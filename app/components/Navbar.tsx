'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Markets', href: '/category/markets' },
  { label: 'Investing', href: '/category/investing' },
  { label: 'Personal Finance', href: '/category/personal-finance' },
  { label: 'Economy', href: '/category/economy' },
  { label: 'Crypto', href: '/category/crypto' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        router.push('/search')
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [router])

  return (
    <header className="sticky top-0 z-50 border-b border-[#0a1628]/10 bg-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

        <Link
          href="/"
          className="font-serif text-lg font-bold tracking-tight text-[#0a1628] sm:text-2xl"
        >
          Next Gen Finance
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <Link href={href} className="text-[#0a1628]/70 transition-colors hover:text-[#c9a84c]">
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Search — desktop */}
        <Link
          href="/search"
          aria-label="Search (⌘K)"
          className="hidden md:flex items-center gap-2 rounded-lg border border-[#0a1628]/15 px-3 py-1.5 text-sm text-[#0a1628]/45 transition-all hover:border-[#0a1628]/30 hover:text-[#0a1628]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="text-xs">Search</span>
          <kbd className="hidden lg:inline-flex items-center rounded bg-[#0a1628]/5 px-1.5 py-0.5 text-[10px] font-mono text-[#0a1628]/35">
            ⌘K
          </kbd>
        </Link>

        {/* Mobile */}
        <div className="flex items-center gap-3 md:hidden">
          <Link href="/search" aria-label="Search" className="p-1.5 text-[#0a1628]/55 hover:text-[#c9a84c] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>

          <button onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open} className="p-1.5 text-[#0a1628]">
            <div className="flex flex-col gap-[5px]">
              <motion.span className="block h-[2px] w-6 rounded-full bg-current origin-center" animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.22 }} />
              <motion.span className="block h-[2px] w-6 rounded-full bg-current" animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }} transition={{ duration: 0.22 }} />
              <motion.span className="block h-[2px] w-6 rounded-full bg-current origin-center" animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }} transition={{ duration: 0.22 }} />
            </div>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className="overflow-hidden md:hidden border-t border-[#0a1628]/10 bg-white"
          >
            <ul className="flex flex-col px-4 py-5 gap-1">
              {NAV_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link href={href} className="flex items-center py-2.5 text-sm font-medium text-[#0a1628] hover:text-[#c9a84c] transition-colors" onClick={() => setOpen(false)}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
