'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function ContactButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-white/60 transition-colors hover:text-[#c9a84c] text-sm"
      >
        Contact Us
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Modal */}
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="pointer-events-auto w-full max-w-sm bg-white dark:bg-[#0f1e30] rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#0a1628]/10 dark:border-white/10">
                  <h2 className="font-serif text-lg font-bold text-[#0a1628] dark:text-white">
                    Contact Us
                  </h2>
                  <button
                    onClick={() => setOpen(false)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[#0a1628]/40 dark:text-white/40 hover:text-[#0a1628] dark:hover:text-white hover:bg-[#0a1628]/5 dark:hover:bg-white/8 transition-colors"
                    aria-label="Close"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-6 space-y-4">
                  <p className="text-sm text-[#0a1628]/60 dark:text-white/50 leading-relaxed">
                    Have a question, tip, or want to collaborate? Reach out — we would love to hear from you.
                  </p>

                  {/* Phone */}
                  <a
                    href="tel:5512153225"
                    className="flex items-center gap-3 rounded-xl border border-[#0a1628]/10 dark:border-white/10 px-4 py-3.5 transition-all hover:border-[#c9a84c] hover:bg-[#c9a84c]/5 group"
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#0a1628]/5 dark:bg-white/8 group-hover:bg-[#c9a84c]/15 transition-colors">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#0a1628]/60 dark:text-white/50 group-hover:text-[#c9a84c]">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.09-1.09a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.91v2.01z" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0a1628]/35 dark:text-white/30">Text or Call</p>
                      <p className="text-sm font-semibold text-[#0a1628] dark:text-white group-hover:text-[#c9a84c] transition-colors">
                        551-215-3225
                      </p>
                    </div>
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:noamsmall18@gmail.com"
                    className="flex items-center gap-3 rounded-xl border border-[#0a1628]/10 dark:border-white/10 px-4 py-3.5 transition-all hover:border-[#c9a84c] hover:bg-[#c9a84c]/5 group"
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#0a1628]/5 dark:bg-white/8 group-hover:bg-[#c9a84c]/15 transition-colors">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#0a1628]/60 dark:text-white/50 group-hover:text-[#c9a84c]">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#0a1628]/35 dark:text-white/30">Email</p>
                      <p className="text-sm font-semibold text-[#0a1628] dark:text-white group-hover:text-[#c9a84c] transition-colors">
                        noamsmall18@gmail.com
                      </p>
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
