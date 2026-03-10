import Link from 'next/link'
import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0c1827] transition-colors duration-200">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-32 text-center sm:px-6 lg:px-8">
        <p className="font-serif text-[7rem] font-bold leading-none text-[#0a1628]/5 dark:text-white/[0.04] select-none">
          404
        </p>
        <p className="font-serif text-5xl font-bold text-[#c9a84c] -mt-12">404</p>
        <h1 className="mt-4 font-serif text-2xl font-bold text-[#0a1628] dark:text-white sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-3 text-[#0a1628]/60 dark:text-white/50 max-w-sm mx-auto leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0a1628] dark:bg-white/10 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#c9a84c] hover:text-[#0a1628]"
          >
            Back to Home
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#0a1628]/20 dark:border-white/15 px-6 py-3 text-sm font-semibold text-[#0a1628] dark:text-white/90 transition-all hover:border-[#0a1628] dark:hover:border-white/40 hover:bg-[#0a1628] dark:hover:bg-white dark:hover:text-[#0a1628] hover:text-white"
          >
            Search articles
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  )
}
