'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || status === 'loading') return
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setStatus(res.ok ? 'success' : 'error')
      if (res.ok) setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="border-t border-[#0a1628]/10 dark:border-white/10 bg-[#0a1628]/[0.02] dark:bg-white/[0.03]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg text-center">
          <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-[#c9a84c] mb-3">
            Newsletter
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#0a1628] dark:text-white sm:text-3xl">
            Stay ahead of the markets
          </h2>
          <p className="mt-3 text-sm text-[#0a1628]/60 dark:text-white/50 leading-relaxed">
            Get weekly insights delivered to your inbox. No spam, ever.
          </p>

          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.p
                key="success"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-[#c9a84c] font-medium text-sm"
              >
                You are in. Welcome to Next Gen Finance.
              </motion.p>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="mt-6 flex flex-col gap-3 sm:flex-row"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 rounded-lg border border-[#0a1628]/20 dark:border-white/15 bg-white dark:bg-white/5 px-4 py-3 text-sm text-[#0a1628] dark:text-white placeholder:text-[#0a1628]/35 dark:placeholder:text-white/30 outline-none focus:border-[#c9a84c] focus:ring-2 focus:ring-[#c9a84c]/15 transition"
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="rounded-lg bg-[#c9a84c] px-6 py-3 text-sm font-semibold text-[#0a1628] transition hover:bg-[#b8963d] disabled:opacity-60 whitespace-nowrap"
                >
                  {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {status === 'error' && (
            <p className="mt-2 text-xs text-red-500 dark:text-red-400">Something went wrong. Please try again.</p>
          )}
        </div>
      </div>
    </section>
  )
}
