import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        {/* Hero image skeleton */}
        <div className="relative aspect-[21/9] w-full animate-pulse bg-[#0a1628]/5" />

        {/* Article content skeleton */}
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="h-10 w-3/4 animate-pulse rounded bg-[#0a1628]/5" />
          <div className="mt-3 h-10 w-1/2 animate-pulse rounded bg-[#0a1628]/5" />
          <div className="mt-4 flex gap-3">
            <div className="h-4 w-24 animate-pulse rounded bg-[#0a1628]/5" />
            <div className="h-4 w-32 animate-pulse rounded bg-[#0a1628]/5" />
            <div className="h-4 w-16 animate-pulse rounded bg-[#0a1628]/5" />
          </div>
          <div className="mt-10 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-4 animate-pulse rounded bg-[#0a1628]/5"
                style={{ width: i % 3 === 2 ? '70%' : '100%' }}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
