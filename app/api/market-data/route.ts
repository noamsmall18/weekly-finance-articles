import { NextResponse } from 'next/server'

async function fetchYahoo(symbol: string) {
  const encoded = encodeURIComponent(symbol)
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1d&range=1d`
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      Accept: 'application/json',
    },
    next: { revalidate: 60 },
  })
  if (!res.ok) throw new Error(`Yahoo ${symbol} ${res.status}`)
  const json = await res.json()
  const meta = json?.chart?.result?.[0]?.meta
  if (!meta?.regularMarketPrice) throw new Error(`No price for ${symbol}`)
  const price: number = meta.regularMarketPrice
  const prev: number = meta.chartPreviousClose ?? meta.previousClose ?? price
  const changePercent = ((price - prev) / prev) * 100
  return { price, changePercent }
}

async function fetchBTC() {
  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
    { next: { revalidate: 60 } },
  )
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`)
  const json = await res.json()
  return {
    price: json?.bitcoin?.usd as number,
    changePercent: json?.bitcoin?.usd_24h_change as number,
  }
}

export async function GET() {
  try {
    const [sp500, dow, nasdaq, btc] = await Promise.allSettled([
      fetchYahoo('^GSPC'),
      fetchYahoo('^DJI'),
      fetchYahoo('^IXIC'),
      fetchBTC(),
    ])

    const result = {
      sp500: sp500.status === 'fulfilled' ? sp500.value : null,
      dow: dow.status === 'fulfilled' ? dow.value : null,
      nasdaq: nasdaq.status === 'fulfilled' ? nasdaq.value : null,
      btc: btc.status === 'fulfilled' ? btc.value : null,
      timestamp: Date.now(),
    }

    return NextResponse.json(result, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 })
  }
}
