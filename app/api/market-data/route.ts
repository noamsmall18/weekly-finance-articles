import { NextResponse } from 'next/server'

export interface MarketItem {
  label: string
  price: number
  changePercent: number
  prefix?: string
  decimals?: number
}

const YAHOO_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  Accept: '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  Origin: 'https://finance.yahoo.com',
  Referer: 'https://finance.yahoo.com/',
}

// Compute the most recent session's % change from a closes array + live price.
//
// Yahoo's chartPreviousClose = close from BEFORE the chart window (5+ days ago),
// so we ignore it entirely and derive everything from the closes array.
//
// Two cases:
//   Live market  → price has moved away from the last close in the array
//                  → changePercent = (price - closes[-1]) / closes[-1]
//   Closed/weekend → price ≈ closes[-1] (both are the last settlement)
//                  → skip any trailing duplicate candles, then
//                    changePercent = (closes[i] - closes[i-1]) / closes[i-1]
function calcChange(price: number, rawCloses: (number | null)[]): number {
  const closes = rawCloses.filter((c): c is number => c !== null && c > 0)
  if (closes.length < 2) return 0

  const lastClose = closes[closes.length - 1]
  const diffRatio = Math.abs(price - lastClose) / lastClose

  // Live market: price has diverged from the last settled close
  if (diffRatio > 0.0002) {
    return ((price - lastClose) / lastClose) * 100
  }

  // Closed / weekend: find the last pair of distinct closes
  let i = closes.length - 1
  while (i > 0 && Math.abs(closes[i] - closes[i - 1]) / closes[i - 1] < 0.0002) {
    i--
  }
  if (i > 0) {
    return ((closes[i] - closes[i - 1]) / closes[i - 1]) * 100
  }
  return 0
}

async function fetchYahoo(
  label: string,
  symbol: string,
  opts?: Partial<MarketItem>,
): Promise<MarketItem> {
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`
  const res = await fetch(url, { headers: YAHOO_HEADERS, cache: 'no-store' })
  if (!res.ok) throw new Error(`Yahoo ${symbol}: HTTP ${res.status}`)
  const json = await res.json()
  const result = json?.chart?.result?.[0]
  const meta = result?.meta
  if (!meta?.regularMarketPrice) throw new Error(`Yahoo ${symbol}: no price`)

  const price: number = meta.regularMarketPrice
  const rawCloses: (number | null)[] = result?.indicators?.quote?.[0]?.close ?? []
  const changePercent = calcChange(price, rawCloses)

  return { label, price, changePercent, ...opts }
}

// Finnhub — real-time, requires API key (falls back to Yahoo if key missing)
async function fetchFinnhub(
  label: string,
  symbol: string,
  yahooSymbol: string,
  opts?: Partial<MarketItem>,
): Promise<MarketItem> {
  const token = process.env.FINNHUB_API_KEY
  if (token) {
    try {
      const res = await fetch(
        `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`,
        { cache: 'no-store' },
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
  return fetchYahoo(label, yahooSymbol, opts)
}

// CoinGecko — free, no key needed
async function fetchBTC(): Promise<MarketItem> {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
    { cache: 'no-store' },
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
    fetchFinnhub('S&P 500', '^GSPC', '^GSPC', { decimals: 2 }),
    fetchFinnhub('DOW', '^DJI', '^DJI', { decimals: 2 }),
    fetchFinnhub('NASDAQ', '^IXIC', '^IXIC', { decimals: 2 }),
    fetchFinnhub('RUSSELL 2000', '^RUT', '^RUT', { decimals: 2 }),
    fetchYahoo('GOLD', 'GC=F', { prefix: '$', decimals: 2 }),
    fetchYahoo('SILVER', 'SI=F', { prefix: '$', decimals: 2 }),
    fetchYahoo('OIL (WTI)', 'CL=F', { prefix: '$', decimals: 2 }),
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
