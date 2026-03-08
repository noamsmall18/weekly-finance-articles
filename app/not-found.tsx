import Link from 'next/link'
import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <p className="font-serif text-6xl font-bold text-[#c9a84c]">404</p>
        <h1 className="mt-4 font-serif text-2xl font-bold text-[#0a1628] sm:text-3xl">
          Page not found
        </h1>
        <p className="mt-3 text-[#0a1628]/70">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 rounded bg-[#c9a84c] px-6 py-3 text-sm font-semibold text-[#0a1628] transition-colors hover:bg-[#b8963d]"
        >
          ← Back to Home
        </Link>
      </main>
      <Footer />
    </div>
  )
}
