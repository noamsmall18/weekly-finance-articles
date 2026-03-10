import { NextResponse } from 'next/server'

const FINNHUB_TOKEN = process.env.FINNHUB_API_KEY

async function fetchFinnhub(symbol: string) {
  if (!FINNHUB_TOKEN) throw new Error('No Finnhub API key')
  const res = await fetch(
    `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_TOKEN}`,
    { next: { revalidate: 30 } },
  )
  if (!res.ok) throw new Error(`Finnhub ${symbol} ${res.status}`)
  const data = await res.json()
  // c = current price, dp = % change from previous close, pc = previous close
  if (!data.c || data.c === 0) throw new Error(`No data for ${symbol}`)
  return { price: data.c as number, changePercent: data.dp as number }
}

async function fetchBTC() {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
    { next: { revalidate: 30 } },
  )
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`)
  const json = await res.json()
  return {
    price: json?.bitcoin?.usd as number,
    changePercent: json?.bitcoin?.usd_24h_change as number,
  }
}

function isMarketOpen(): boolean {
  // US market hours: Mon–Fri 9:30am–4:00pm ET
  const now = new Date()
  const et = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
  const day = et.getDay() // 0=Sun, 6=Sat
  if (day === 0 || day === 6) return false
  const hours = et.getHours()
  const minutes = et.getMinutes()
  const time = hours * 60 + minutes
  return time >= 9 * 60 + 30 && time < 16 * 60
}

export async function GET() {
  const [sp500, dow, nasdaq, btc] = await Promise.allSettled([
    fetchFinnhub('^GSPC'),
    fetchFinnhub('^DJI'),
    fetchFinnhub('^IXIC'),
    fetchBTC(),
  ])

  const result = {
    sp500: sp500.status === 'fulfilled' ? sp500.value : null,
    dow: dow.status === 'fulfilled' ? dow.value : null,
    nasdaq: nasdaq.status === 'fulfilled' ? nasdaq.value : null,
    btc: btc.status === 'fulfilled' ? btc.value : null,
    marketOpen: isMarketOpen(),
    timestamp: Date.now(),
  }

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=15' },
  })
}
