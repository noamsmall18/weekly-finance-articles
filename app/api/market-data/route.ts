import { NextResponse } from 'next/server'

export interface MarketItem {
  label: string
  price: number
  changePercent: number
  prefix?: string
  decimals?: number
}

// Yahoo Finance — free, no key, works for indices + commodities
async function fetchYahoo(label: string, symbol: string, opts?: Partial<MarketItem>): Promise<MarketItem> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
    next: { revalidate: 30 },
  })
  if (!res.ok) throw new Error(`Yahoo ${symbol} ${res.status}`)
  const json = await res.json()
  const meta = json?.chart?.result?.[0]?.meta
  if (!meta?.regularMarketPrice) throw new Error(`No price for ${symbol}`)
  const price: number = meta.regularMarketPrice
  const prev: number = meta.chartPreviousClose ?? meta.previousClose ?? price
  const changePercent = prev ? ((price - prev) / prev) * 100 : 0
  return { label, price, changePercent, ...opts }
}

// Finnhub — real-time, requires API key (falls back to Yahoo if key missing)
async function fetchFinnhub(label: string, symbol: string, yahooSymbol: string, opts?: Partial<MarketItem>): Promise<MarketItem> {
  const token = process.env.FINNHUB_API_KEY
  if (token) {
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`,
        { next: { revalidate: 30 } },
      )
      if (res.ok) {
        const d = await res.json()
        if (d.c && d.c !== 0) {
          return { label, price: d.c as number, changePercent: d.dp as number, ...opts }
        }
      }
    } catch {
      // fall through to Yahoo
    }
  }
  // Fallback: Yahoo Finance
  return fetchYahoo(label, yahooSymbol, opts)
}

// CoinGecko — free, no key needed
async function fetchBTC(): Promise<MarketItem> {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
    { next: { revalidate: 30 } },
  )
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`)
  const json = await res.json()
  return {
    label: 'BTC',
    price: json.bitcoin.usd as number,
    changePercent: json.bitcoin.usd_24h_change as number,
    prefix: '$',
    decimals: 0,
  }
}

function isMarketOpen(): boolean {
  const now = new Date()
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const day = et.getDay()
  if (day === 0 || day === 6) return false
  const mins = et.getHours() * 60 + et.getMinutes()
  return mins >= 9 * 60 + 30 && mins < 16 * 60
}

export async function GET() {
  const results = await Promise.allSettled([
    fetchFinnhub('S&P 500',      '^GSPC', '^GSPC',  { decimals: 2 }),
    fetchFinnhub('DOW',          '^DJI',  '^DJI',   { decimals: 2 }),
    fetchFinnhub('NASDAQ',       '^IXIC', '^IXIC',  { decimals: 2 }),
    fetchFinnhub('RUSSELL 2000', '^RUT',  '^RUT',   { decimals: 2 }),
    fetchYahoo('GOLD',     'GC=F', { prefix: '$', decimals: 2 }),
    fetchYahoo('SILVER',   'SI=F', { prefix: '$', decimals: 2 }),
    fetchYahoo('OIL (WTI)','CL=F', { prefix: '$', decimals: 2 }),
    fetchBTC(),
  ])

  const items: MarketItem[] = results
    .filter((r): r is PromiseFulfilledResult<MarketItem> => r.status === 'fulfilled')
    .map((r) => r.value)

  return NextResponse.json(
    { items, marketOpen: isMarketOpen(), timestamp: Date.now() },
    { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=15' } },
  )
}
