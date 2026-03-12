'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Markets', href: '/category/markets' },
  { label: 'Investing', href: '/category/investing' },
  { label: 'Personal Finance', href: '/category/personal-finance' },
  { label: 'Economy', href: '/category/economy' },
  { label: 'Business', href: '/category/business' },
  { label: 'Crypto', href: '/category/crypto' },
]

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-8 h-8" />

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="relative flex items-center justify-center w-8 h-8 rounded-lg text-[#0a1628]/45 dark:text-white/45 hover:text-[#c9a84c] dark:hover:text-[#c9a84c] transition-colors duration-200"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.svg
            key="sun"
            initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
            transition={{ duration: 0.18 }}
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </motion.svg>
        ) : (
          <motion.svg
            key="moon"
            initial={{ opacity: 0, rotate: 30, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -30, scale: 0.8 }}
            transition={{ duration: 0.18 }}
            width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  )
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Close mobile menu when route changes (back/forward navigation)
  useEffect(() => { setOpen(false) }, [pathname])

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
    <header className="sticky top-0 z-50 border-b border-[#0a1628]/10 dark:border-white/10 bg-white/95 dark:bg-[#0c1827]/95 backdrop-blur-sm transition-colors duration-200">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

        <Link href="/" className="font-serif text-lg font-bold tracking-tight text-[#0a1628] dark:text-white sm:text-2xl">
          Next Gen Finance
        </Link>

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-5 lg:gap-7 text-sm font-medium">
          {NAV_LINKS.map(({ label, href }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={[
                    'transition-colors duration-200',
                    isActive
                      ? 'text-[#c9a84c] font-semibold'
                      : 'text-[#0a1628]/65 dark:text-white/60 hover:text-[#c9a84c] dark:hover:text-[#c9a84c]',
                  ].join(' ')}
                >
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Right side — desktop */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/search"
            aria-label="Search"
            className="flex items-center gap-2 rounded-lg border border-[#0a1628]/15 dark:border-white/15 px-3 py-1.5 text-sm text-[#0a1628]/45 dark:text-white/40 transition-all hover:border-[#0a1628]/30 dark:hover:border-white/30 hover:text-[#0a1628] dark:hover:text-white/80"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="text-xs">Search</span>
            <kbd className="hidden lg:inline-flex items-center rounded bg-[#0a1628]/5 dark:bg-white/8 px-1.5 py-0.5 text-[10px] font-mono text-[#0a1628]/35 dark:text-white/30">
              ⌘K
            </kbd>
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <Link href="/search" aria-label="Search" className="p-1.5 text-[#0a1628]/55 dark:text-white/50 hover:text-[#c9a84c] transition-colors">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>
          <button onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open} className="p-1.5 text-[#0a1628] dark:text-white">
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
            className="overflow-hidden md:hidden border-t border-[#0a1628]/10 dark:border-white/10 bg-white dark:bg-[#0c1827]"
          >
            <ul className="flex flex-col px-4 py-5 gap-1">
              {NAV_LINKS.map(({ label, href }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/')
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={[
                        'flex items-center py-2.5 text-sm font-medium transition-colors',
                        isActive
                          ? 'text-[#c9a84c] font-semibold'
                          : 'text-[#0a1628] dark:text-white/80 hover:text-[#c9a84c] dark:hover:text-[#c9a84c]',
                      ].join(' ')}
                      onClick={() => setOpen(false)}
                    >
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
