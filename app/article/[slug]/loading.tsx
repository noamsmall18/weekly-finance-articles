import React from 'react'
import { Navbar } from '@/app/components/Navbar'
import { Footer } from '@/app/components/Footer'

function Skeleton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`animate-pulse rounded-lg bg-[#0a1628]/6 dark:bg-white/[0.06] ${className ?? ''}`} style={style} />
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0c1827] transition-colors duration-200">
      <Navbar />

      {/* Hero image skeleton */}
      <Skeleton className="aspect-[21/9] w-full rounded-none" />

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="flex gap-14">
          <div className="min-w-0 flex-1 max-w-3xl">
            {/* Category + tags */}
            <div className="flex gap-2 mb-5">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
            {/* Title */}
            <Skeleton className="h-12 w-full" />
            <Skeleton className="mt-3 h-12 w-3/4" />
            {/* Meta */}
            <div className="mt-5 flex gap-4 pb-6 border-b border-[#0a1628]/10 dark:border-white/10">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-20" />
            </div>
            {/* Body paragraphs */}
            <div className="mt-8 space-y-4">
              {[...Array(12)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-4"
                  style={{ width: i % 4 === 3 ? '65%' : i % 4 === 1 ? '88%' : '100%' }}
                />
              ))}
            </div>
          </div>
          {/* TOC sidebar skeleton */}
          <div className="hidden xl:block w-60 flex-shrink-0">
            <Skeleton className="h-3 w-16 mb-4" />
            <div className="space-y-3 border-l border-[#0a1628]/10 dark:border-white/10 pl-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-3" style={{ width: i % 2 === 0 ? '80%' : '60%' }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
