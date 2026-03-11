'use client'

import { useEffect, useRef, useState } from 'react'

interface MarketItem {
  label: string
  price: number
  changePercent: number
  prefix?: string
  decimals?: number
}

interface MarketData {
  items: MarketItem[]
  marketOpen: boolean
}

function formatPrice(item: MarketItem): string {
  const formatted = item.price.toLocaleString('en-US', {
    minimumFractionDigits: item.decimals ?? 2,
    maximumFractionDigits: item.decimals ?? 2,
  })
  return item.prefix ? `${item.prefix}${formatted}` : formatted
}

function formatChange(pct: number): string {
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

const SPEED = 33 // px/s

export function MarketBar() {
  const [marketData, setMarketData] = useState<MarketData | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const posRef = useRef(0)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef<number | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/market-data')
        if (res.ok) setMarketData(await res.json())
      } catch { /* silently fail */ }
    }
    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [])

  // Start RAF only once items are loaded and the DOM element exists.
  // hasItems flips true once, RAF starts, and never restarts — data
  // updates go straight to the DOM via the ref without touching the RAF.
  const hasItems = (marketData?.items.length ?? 0) > 0

  useEffect(() => {
    if (!hasItems) return
    const track = trackRef.current
    if (!track) return

    function tick(now: number) {
      if (lastTimeRef.current === null) lastTimeRef.current = now
      const delta = (now - lastTimeRef.current) / 1000
      lastTimeRef.current = now

      const loopWidth = track!.scrollWidth / 2
      if (loopWidth > 0) {
        posRef.current += SPEED * delta
        if (posRef.current >= loopWidth) posRef.current -= loopWidth
        track!.style.transform = `translateX(-${posRef.current}px)`
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [hasItems]) // only fires once: when items go from 0 → n

  if (!marketData || marketData.items.length === 0) return null

  const items = [...marketData.items, ...marketData.items]
  const marketOpen = marketData.marketOpen

  return (
    <div className="border-b border-[#0a1628]/8 dark:border-white/8 bg-white dark:bg-[#0c1827] overflow-hidden">
      <div className="relative flex items-center h-8">

        {/* Static label */}
        <div className="relative z-10 flex-shrink-0 flex items-center gap-2 pl-4 pr-2 h-full bg-white dark:bg-[#0c1827]">
          <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
            {marketOpen ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </>
            ) : (
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#0a1628]/20 dark:bg-white/25" />
            )}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#0a1628]/70 dark:text-white/70 whitespace-nowrap pr-10">
            {marketOpen ? 'Live' : 'Closed'}
          </span>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-[#0c1827] to-transparent pointer-events-none" />
        </div>

        {/* Scrolling track */}
        <div className="flex-1 overflow-hidden ticker-mask">
          <div ref={trackRef} className="inline-flex items-center whitespace-nowrap will-change-transform">
            {items.map((item, i) => {
              const isUp = item.changePercent >= 0
              return (
                <span key={i} className="inline-flex items-center gap-2 px-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#0a1628]/40 dark:text-white/35">
                    {item.label}
                  </span>
                  <span className="text-[11px] font-semibold tabular-nums text-[#0a1628]/80 dark:text-white/70">
                    {formatPrice(item)}
                  </span>
                  <span className={[
                    'text-[10px] font-semibold tabular-nums',
                    isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400',
                  ].join(' ')}>
                    {isUp ? '▲' : '▼'} {formatChange(item.changePercent)}
                  </span>
                  <span className="text-[#0a1628]/15 dark:text-white/15 select-none ml-1">·</span>
                </span>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
