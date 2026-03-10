'use client'

import { useEffect, useState } from 'react'

interface MarketItem {
  price: number
  changePercent: number
}

interface MarketData {
  sp500: MarketItem | null
  dow: MarketItem | null
  nasdaq: MarketItem | null
  btc: MarketItem | null
  marketOpen: boolean
  timestamp: number
}

function formatPrice(price: number, isCrypto = false): string {
  if (isCrypto) {
    return '$' + price.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatChange(pct: number): string {
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

function Ticker({
  label,
  item,
  isCrypto = false,
}: {
  label: string
  item: MarketItem | null
  isCrypto?: boolean
}) {
  if (!item) return null
  const isUp = item.changePercent >= 0

  return (
    <span className="inline-flex items-center gap-2 px-4">
      <span className="text-[#0a1628]/40 dark:text-white/35 text-[10px] font-bold uppercase tracking-[0.12em]">
        {label}
      </span>
      <span className="text-[11px] font-semibold text-[#0a1628]/75 dark:text-white/70 tabular-nums">
        {formatPrice(item.price, isCrypto)}
      </span>
      <span
        className={[
          'text-[10px] font-semibold tabular-nums',
          isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400',
        ].join(' ')}
      >
        {formatChange(item.changePercent)}
      </span>
    </span>
  )
}

export function MarketBar() {
  const [data, setData] = useState<MarketData | null>(null)
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const res = await fetch('/api/market-data')
      if (res.ok) setData(await res.json())
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30_000)
    return () => clearInterval(interval)
  }, [])

  const hasAnyData = data?.sp500 || data?.dow || data?.nasdaq || data?.btc
  if (!loading && !hasAnyData) return null

  const marketOpen = data?.marketOpen ?? false

  return (
    <div className="border-b border-[#0a1628]/8 dark:border-white/8 overflow-x-auto scrollbar-none">
      <div className="flex items-center min-w-max mx-auto px-2 py-1.5">

        {/* Market status indicator */}
        <span className="flex-shrink-0 flex items-center gap-1.5 pl-2 pr-3">
          <span className="relative flex h-1.5 w-1.5">
            {marketOpen ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </>
            ) : (
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#0a1628]/25 dark:bg-white/25" />
            )}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#0a1628]/35 dark:text-white/30">
            {marketOpen ? 'Live' : 'Closed'}
          </span>
        </span>

        <span className="text-[#0a1628]/12 dark:text-white/12 text-xs select-none">|</span>

        {loading ? (
          <span className="flex items-center gap-6 px-4">
            {['S&P 500', 'DOW', 'NASDAQ', 'BTC'].map((label) => (
              <span key={label} className="flex items-center gap-2">
                <span className="text-[10px] text-[#0a1628]/30 dark:text-white/25 uppercase tracking-widest font-bold">
                  {label}
                </span>
                <span className="h-2.5 w-16 rounded bg-[#0a1628]/6 dark:bg-white/6 animate-pulse" />
              </span>
            ))}
          </span>
        ) : (
          <>
            <Ticker label="S&P 500" item={data?.sp500 ?? null} />
            {data?.dow && (
              <>
                <span className="text-[#0a1628]/12 dark:text-white/12 text-xs select-none">|</span>
                <Ticker label="DOW" item={data.dow} />
              </>
            )}
            {data?.nasdaq && (
              <>
                <span className="text-[#0a1628]/12 dark:text-white/12 text-xs select-none">|</span>
                <Ticker label="NASDAQ" item={data.nasdaq} />
              </>
            )}
            {data?.btc && (
              <>
                <span className="text-[#0a1628]/12 dark:text-white/12 text-xs select-none">|</span>
                <Ticker label="BTC" item={data.btc} isCrypto />
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
