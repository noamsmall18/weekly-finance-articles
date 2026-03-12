import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { Resend } from 'resend'
import { TwitterApi } from 'twitter-api-v2'
import crypto from 'crypto'

const CATEGORY_LABELS: Record<string, string> = {
  markets: 'Markets',
  investing: 'Investing',
  personalFinance: 'Personal Finance',
  economy: 'Economy',
  crypto: 'Crypto',
  business: 'Business',
}

const CATEGORY_EMOJIS: Record<string, string> = {
  markets: '📈',
  investing: '💰',
  personalFinance: '💵',
  economy: '🏛️',
  crypto: '₿',
  business: '🏢',
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Span {
  _type: string
  text?: string
  marks?: string[]
}

interface PortableBlock {
  _type: string
  style?: string
  listItem?: string
  children?: Span[]
}

interface Article {
  title?: string
  slug?: string
  excerpt?: string
  category?: string
  imageRef?: string
  publishedAt?: string
  _createdAt?: string
  body?: PortableBlock[]
  tags?: string[]
}

// ─── Webhook Signature ───────────────────────────────────────────────────────

function verifySignature(rawBody: string, signatureHeader: string, secret: string): boolean {
  try {
    const parts = Object.fromEntries(
      signatureHeader.split(',').map((p) => p.split('=') as [string, string]),
    )
    const { t, v1 } = parts
    if (!t || !v1) return false
    const expected = crypto
      .createHmac('sha256', secret)
      .update(`${t}.${rawBody}`)
      .digest('hex')
    return crypto.timingSafeEqual(Buffer.from(v1, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

// ─── Sanity Image URL ────────────────────────────────────────────────────────

function buildImageUrl(ref: string, projectId: string, dataset: string): string {
  const [, id, dimensions, format] = ref.split('-')
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}?w=600&h=340&fit=crop&auto=format`
}

// ─── PortableText Converters ─────────────────────────────────────────────────

function blockPlainText(block: PortableBlock): string {
  return (block.children ?? []).map((c) => c.text ?? '').join('')
}

function toMarkdown(body: PortableBlock[]): string {
  if (!Array.isArray(body)) return ''
  const lines: string[] = []
  let listCounter = 1

  for (const block of body) {
    if (block._type !== 'block') continue

    const inlineText = (block.children ?? [])
      .map((c) => {
        let t = c.text ?? ''
        if (c.marks?.includes('strong')) t = `**${t}**`
        if (c.marks?.includes('em')) t = `*${t}*`
        return t
      })
      .join('')

    if (block.listItem === 'bullet') {
      lines.push(`- ${inlineText}`)
      continue
    }
    if (block.listItem === 'number') {
      lines.push(`${listCounter}. ${inlineText}`)
      listCounter++
      continue
    }
    listCounter = 1

    switch (block.style) {
      case 'h1': lines.push(`# ${inlineText}`, ''); break
      case 'h2': lines.push(`## ${inlineText}`, ''); break
      case 'h3': lines.push(`### ${inlineText}`, ''); break
      case 'h4': lines.push(`#### ${inlineText}`, ''); break
      case 'blockquote': lines.push(`> ${inlineText}`, ''); break
      default:
        if (inlineText.trim()) lines.push(inlineText, '')
        break
    }
  }

  return lines.join('\n')
}

function toHtml(body: PortableBlock[]): string {
  if (!Array.isArray(body)) return ''
  const blocks: string[] = []

  for (const block of body) {
    if (block._type !== 'block') continue

    const inlineHtml = (block.children ?? [])
      .map((c) => {
        let t = (c.text ?? '')
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        if (c.marks?.includes('strong')) t = `<strong>${t}</strong>`
        if (c.marks?.includes('em')) t = `<em>${t}</em>`
        return t
      })
      .join('')

    switch (block.style) {
      case 'h1': blocks.push(`<h1>${inlineHtml}</h1>`); break
      case 'h2': blocks.push(`<h2>${inlineHtml}</h2>`); break
      case 'h3': blocks.push(`<h3>${inlineHtml}</h3>`); break
      case 'h4': blocks.push(`<h4>${inlineHtml}</h4>`); break
      case 'blockquote': blocks.push(`<blockquote><p>${inlineHtml}</p></blockquote>`); break
      default:
        if (inlineHtml.trim()) blocks.push(`<p>${inlineHtml}</p>`)
        break
    }
  }

  return blocks.join('\n')
}

// ─── X (Twitter) Thread ──────────────────────────────────────────────────────

function buildXThread(article: Article, siteUrl: string): string[] {
  const url = `${siteUrl}/article/${article.slug}`
  const emoji = CATEGORY_EMOJIS[article.category ?? ''] ?? '📊'
  const category = (CATEGORY_LABELS[article.category ?? ''] ?? 'Finance').toUpperCase()
  const excerpt = (article.excerpt ?? '').replace(/^"|"$/g, '').trim()
  const tweets: string[] = []

  // Tweet 1: hook
  const hookBody = excerpt ? `\n\n${excerpt}` : ''
  const hook = `${emoji} ${category}\n\n${article.title ?? ''}${hookBody}`
  tweets.push(hook.slice(0, 280))

  // Middle tweets: one per H2 section
  if (Array.isArray(article.body)) {
    const blocks = article.body as PortableBlock[]
    for (let i = 0; i < blocks.length && tweets.length < 8; i++) {
      const block = blocks[i]
      if (block._type !== 'block' || block.style !== 'h2') continue

      const heading = blockPlainText(block).toUpperCase()
      const nextBlock = blocks[i + 1]
      const para =
        nextBlock?._type === 'block' && nextBlock.style === 'normal'
          ? blockPlainText(nextBlock)
          : ''

      const text = para
        ? `${heading}\n\n${para.length > 220 ? para.slice(0, 220) + '…' : para}`
        : heading

      if (text.trim()) tweets.push(text.slice(0, 280))
    }
  }

  // Final tweet: CTA
  const handle = process.env.X_HANDLE
  const follow = handle ? `\n\nFollow @${handle} for weekly finance coverage 📈` : ''
  tweets.push(`Read the full article:\n${url}${follow}`.slice(0, 280))

  return tweets
}

async function postXThread(article: Article, siteUrl: string): Promise<void> {
  const appKey = process.env.X_API_KEY
  const appSecret = process.env.X_API_SECRET
  const accessToken = process.env.X_ACCESS_TOKEN
  const accessSecret = process.env.X_ACCESS_TOKEN_SECRET
  if (!appKey || !appSecret || !accessToken || !accessSecret) return

  const client = new TwitterApi({ appKey, appSecret, accessToken, accessSecret })
  const tweets = buildXThread(article, siteUrl)

  let lastId: string | undefined
  for (const text of tweets) {
    const res = await client.v2.tweet({
      text,
      ...(lastId ? { reply: { in_reply_to_tweet_id: lastId } } : {}),
    })
    lastId = res.data.id
  }

  console.log(`X thread posted for "${article.title}" (${tweets.length} tweets)`)
}

// ─── Reddit ──────────────────────────────────────────────────────────────────

async function postToReddit(article: Article, siteUrl: string): Promise<void> {
  const clientId = process.env.REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET
  const username = process.env.REDDIT_USERNAME
  const password = process.env.REDDIT_PASSWORD
  const subredditsEnv = process.env.REDDIT_SUBREDDITS
  if (!clientId || !clientSecret || !username || !password || !subredditsEnv) return

  // Get OAuth token
  const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token', {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'NextGenFinance/1.0 by NextGenFinance',
    },
    body: new URLSearchParams({ grant_type: 'password', username, password }),
  })
  if (!tokenRes.ok) throw new Error(`Reddit auth failed: ${tokenRes.status}`)
  const { access_token: token } = await tokenRes.json()

  const url = `${siteUrl}/article/${article.slug}`
  const markdown = Array.isArray(article.body) ? toMarkdown(article.body) : ''
  const postBody = `${markdown}\n\n---\n\n*Originally published on [Next Gen Finance](${url})*`

  const subreddits = subredditsEnv.split(',').map((s) => s.trim()).filter(Boolean)

  for (const sr of subreddits) {
    const res = await fetch('https://oauth.reddit.com/api/submit', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'NextGenFinance/1.0 by NextGenFinance',
      },
      body: new URLSearchParams({
        sr,
        kind: 'self',
        title: article.title ?? '',
        text: postBody,
        nsfw: 'false',
        spoiler: 'false',
      }),
    })
    const data = await res.json()
    if (data?.json?.errors?.length) {
      console.error(`Reddit post error on r/${sr}:`, data.json.errors)
    } else {
      console.log(`Reddit post submitted to r/${sr}`)
    }
  }
}

// ─── Medium ──────────────────────────────────────────────────────────────────

async function postToMedium(article: Article, siteUrl: string): Promise<void> {
  const token = process.env.MEDIUM_INTEGRATION_TOKEN
  if (!token) return

  // Get Medium user ID
  const meRes = await fetch('https://api.medium.com/v1/me', {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  })
  if (!meRes.ok) throw new Error(`Medium auth failed: ${meRes.status}`)
  const { data: me } = await meRes.json()

  const url = `${siteUrl}/article/${article.slug}`
  const html = Array.isArray(article.body) ? toHtml(article.body) : ''
  const content = `${html}\n<p><em>Originally published on <a href="${url}">Next Gen Finance</a>.</em></p>`

  const postRes = await fetch(`https://api.medium.com/v1/users/${me.id}/posts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: article.title ?? '',
      contentFormat: 'html',
      content,
      tags: Array.isArray(article.tags) ? article.tags.slice(0, 5) : [],
      publishStatus: 'public',
      canonicalUrl: url,
    }),
  })

  if (!postRes.ok) throw new Error(`Medium post failed: ${postRes.status}`)
  console.log(`Medium post published for "${article.title}"`)
}

// ─── Newsletter Email ─────────────────────────────────────────────────────────

function emailHtml({
  title, excerpt, slug, category, imageRef, siteUrl, projectId, dataset,
}: {
  title: string; excerpt?: string; slug: string; category?: string
  imageRef?: string; siteUrl: string; projectId: string; dataset: string
}): string {
  const articleUrl = `${siteUrl}/article/${slug}`
  const categoryLabel = CATEGORY_LABELS[category ?? ''] ?? category ?? 'Finance'
  const imageUrl = imageRef ? buildImageUrl(imageRef, projectId, dataset) : null

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#0a1628;padding:24px 32px;">
              <a href="${siteUrl}" style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#ffffff;text-decoration:none;">Next Gen Finance</a>
              <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.45);">Financial literacy for the next generation</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 32px 0;">
              <span style="display:inline-block;background:#c9a84c;color:#0a1628;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;padding:4px 10px;border-radius:4px;">${categoryLabel}</span>
              <p style="margin:12px 0 0;font-size:12px;color:#888;">New article just published</p>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 32px 0;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#0a1628;line-height:1.25;">${title}</h1>
            </td>
          </tr>
          ${excerpt ? `<tr><td style="padding:14px 32px 0;"><p style="margin:0;font-size:15px;line-height:1.65;color:#4a5568;">${excerpt}</p></td></tr>` : ''}
          ${imageUrl ? `<tr><td style="padding:24px 32px 0;"><a href="${articleUrl}"><img src="${imageUrl}" alt="${title}" width="536" style="width:100%;max-width:536px;border-radius:8px;display:block;" /></a></td></tr>` : ''}
          <tr>
            <td style="padding:28px 32px 32px;">
              <a href="${articleUrl}" style="display:inline-block;background:#0a1628;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:8px;">Read the full article →</a>
            </td>
          </tr>
          <tr><td style="padding:0 32px;"><hr style="border:none;border-top:1px solid #eee;margin:0;" /></td></tr>
          <tr>
            <td style="padding:20px 32px 28px;">
              <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">
                You are receiving this because you subscribed to Next Gen Finance.<br/>
                The content in this email is for informational purposes only and does not constitute financial advice.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Webhook Handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signatureHeader = req.headers.get('sanity-webhook-signature') ?? ''
  const webhookSecret = process.env.SANITY_WEBHOOK_SECRET ?? ''

  if (webhookSecret && !verifySignature(rawBody, signatureHeader, webhookSecret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const docId = payload._id as string
  const docType = payload._type as string
  if (docType !== 'post' || docId?.startsWith('drafts.')) {
    return NextResponse.json({ skipped: true })
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-03-08'
  const sanity = createClient({ projectId, dataset, apiVersion, useCdn: false })

  const article: Article = await sanity.fetch(
    `*[_type == "post" && _id == $id][0]{
      title,
      "slug": slug.current,
      excerpt,
      category,
      "imageRef": mainImage.asset._ref,
      publishedAt,
      _createdAt,
      body,
      tags
    }`,
    { id: docId },
  )

  if (!article?.slug) {
    return NextResponse.json({ error: 'Article not found or missing slug' }, { status: 404 })
  }

  // Only fire on first publish — skip edits to existing articles
  const createdAt = new Date(article._createdAt ?? 0).getTime()
  const ageMinutes = (Date.now() - createdAt) / 1000 / 60
  if (ageMinutes > 60) {
    return NextResponse.json({ skipped: true, reason: 'Article older than 1 hour — likely an edit' })
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

  // Fire all four in parallel — failures in social posting don't block the newsletter
  const [emailResult, xResult, redditResult, mediumResult] = await Promise.allSettled([
    // Newsletter
    (async () => {
      const resend = new Resend(process.env.RESEND_API_KEY)
      const audienceId = process.env.RESEND_AUDIENCE_ID!
      const fromEmail = process.env.RESEND_FROM_EMAIL!
      const { data: contactsData, error } = await resend.contacts.list({ audienceId })
      if (error) throw new Error('Failed to fetch contacts')

      const active = (contactsData?.data ?? []).filter((c) => !c.unsubscribed)
      if (active.length === 0) return { sent: 0 }

      const html = emailHtml({
        title: article.title ?? '',
        excerpt: article.excerpt,
        slug: article.slug!,
        category: article.category,
        imageRef: article.imageRef,
        siteUrl,
        projectId,
        dataset,
      })

      let sent = 0
      for (let i = 0; i < active.length; i += 100) {
        const batch = active.slice(i, i + 100)
        const { error: batchErr } = await resend.batch.send(
          batch.map((c) => ({
            from: fromEmail,
            to: c.email,
            subject: `New Article: ${article.title}`,
            html,
          })),
        )
        if (!batchErr) sent += batch.length
      }
      return { sent }
    })(),

    // X thread
    postXThread(article, siteUrl).then(() => ({ posted: true })),

    // Reddit
    postToReddit(article, siteUrl).then(() => ({ posted: true })),

    // Medium
    postToMedium(article, siteUrl).then(() => ({ posted: true })),
  ])

  const sent = emailResult.status === 'fulfilled' ? (emailResult.value as { sent: number }).sent : 0
  if (emailResult.status === 'rejected') console.error('Newsletter error:', emailResult.reason)
  if (xResult.status === 'rejected') console.error('X error:', xResult.reason)
  if (redditResult.status === 'rejected') console.error('Reddit error:', redditResult.reason)
  if (mediumResult.status === 'rejected') console.error('Medium error:', mediumResult.reason)

  console.log(`Publish pipeline for "${article.title}": newsletter=${sent}, x=${xResult.status}, reddit=${redditResult.status}, medium=${mediumResult.status}`)

  return NextResponse.json({
    title: article.title,
    newsletter: { sent },
    x: xResult.status,
    reddit: redditResult.status,
    medium: mediumResult.status,
  })
}
