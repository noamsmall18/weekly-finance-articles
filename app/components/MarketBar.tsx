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
  timestamp: number
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

export function MarketBar() {
  const [data, setData] = useState<MarketData | null>(null)
  // Keep a ref so the interval always reads latest data without re-subscribing
  const dataRef = useRef<MarketData | null>(null)

  async function load() {
    try {
      const res = await fetch('/api/market-data')
      if (!res.ok) return
      const json: MarketData = await res.json()
      dataRef.current = json
      setData(json)
    } catch {
      // silently fail — bar just won't update
    }
  }

  useEffect(() => {
    load()
    const id = setInterval(load, 30_000)
    return () => clearInterval(id)
  }, [])

  // Don't render until we have data
  if (!data || data.items.length === 0) return null

  // Duplicate items for seamless loop
  const items = [...data.items, ...data.items]
  const marketOpen = data.marketOpen

  return (
    <div className="border-b border-[#0a1628]/8 dark:border-white/8 bg-white dark:bg-[#0c1827]">
      <div className="relative flex items-center h-8">

        {/* Static left label — overlaps the scroll */}
        <div className="relative z-10 flex-shrink-0 flex items-center gap-2 pl-4 pr-4 h-full bg-white dark:bg-[#0c1827]">
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
          <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#0a1628]/40 dark:text-white/35 whitespace-nowrap">
            {marketOpen ? 'Markets' : 'Closed'}
          </span>
          {/* Gradient fade from label into scrolling area */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-[#0c1827] to-transparent pointer-events-none" />
        </div>

        {/* Scrolling prices */}
        <div className="overflow-hidden flex-1 ticker-mask">
          <div className="animate-ticker flex items-center whitespace-nowrap">
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
                  <span className="text-[#0a1628]/12 dark:text-white/12 text-xs select-none ml-2">·</span>
                </span>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
