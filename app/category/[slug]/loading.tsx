import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'

export default function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <section className="border-b border-[#0a1628]/10 bg-[#0a1628]/[0.02]">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="h-4 w-20 animate-pulse rounded bg-[#0a1628]/5" />
            <div className="mt-4 h-10 w-48 animate-pulse rounded bg-[#0a1628]/5" />
            <div className="mt-2 h-4 w-20 animate-pulse rounded bg-[#0a1628]/5" />
          </div>
        </section>
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <li key={i}>
                <div className="overflow-hidden rounded-lg border border-[#0a1628]/10">
                  <div className="aspect-[16/10] w-full animate-pulse bg-[#0a1628]/5" />
                  <div className="space-y-2 p-5">
                    <div className="h-5 w-full animate-pulse rounded bg-[#0a1628]/5" />
                    <div className="h-5 w-3/4 animate-pulse rounded bg-[#0a1628]/5" />
                    <div className="h-4 w-1/2 animate-pulse rounded bg-[#0a1628]/5" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Footer />
    </div>
  )
}
