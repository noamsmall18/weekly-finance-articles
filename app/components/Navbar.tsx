'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

const NAV_LINKS = [
  { label: 'Markets', href: '/category/markets' },
  { label: 'Investing', href: '/category/investing' },
  { label: 'Personal Finance', href: '/category/personal-finance' },
  { label: 'Economy', href: '/category/economy' },
  { label: 'Crypto', href: '/category/crypto' },
  { label: 'Archive', href: '/archive' },
  { label: 'About Us', href: '/#about' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)

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
        <ul className="hidden md:flex items-center gap-4 lg:gap-6 text-sm font-medium text-[#0a1628]">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={href}>
              <Link href={href} className="transition-colors hover:text-[#c9a84c]">
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/search"
              aria-label="Search"
              className="transition-colors text-[#0a1628]/60 hover:text-[#c9a84c]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </Link>
          </li>
        </ul>

        {/* Mobile right side */}
        <div className="flex items-center gap-3 md:hidden">
          <Link
            href="/search"
            aria-label="Search"
            className="text-[#0a1628]/60 hover:text-[#c9a84c] transition-colors p-1"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </Link>

          {/* Hamburger */}
          <button
            onClick={() => setOpen(!open)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
            className="p-1.5 text-[#0a1628]"
          >
            <div className="flex flex-col gap-[5px]">
              <motion.span
                className="block h-[2px] w-6 rounded-full bg-current origin-center"
                animate={open ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.22 }}
              />
              <motion.span
                className="block h-[2px] w-6 rounded-full bg-current"
                animate={open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.22 }}
              />
              <motion.span
                className="block h-[2px] w-6 rounded-full bg-current origin-center"
                animate={open ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.22 }}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
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
                  <Link
                    href={href}
                    className="flex items-center py-2.5 text-sm font-medium text-[#0a1628] hover:text-[#c9a84c] transition-colors"
                    onClick={() => setOpen(false)}
                  >
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
