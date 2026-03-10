import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@sanity/client'
import { Resend } from 'resend'
import crypto from 'crypto'

const CATEGORY_LABELS: Record<string, string> = {
  markets: 'Markets',
  investing: 'Investing',
  personalFinance: 'Personal Finance',
  economy: 'Economy',
  crypto: 'Crypto',
  business: 'Business',
}

// Verify the Sanity webhook signature so random people can't trigger emails
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

function buildImageUrl(ref: string, projectId: string, dataset: string): string {
  // Sanity image ref format: image-<id>-<dimensions>-<format>
  const [, id, dimensions, format] = ref.split('-')
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}?w=600&h=340&fit=crop&auto=format`
}

function emailHtml({
  title,
  excerpt,
  slug,
  authorName,
  category,
  imageRef,
  siteUrl,
  projectId,
  dataset,
}: {
  title: string
  excerpt?: string
  slug: string
  authorName?: string
  category?: string
  imageRef?: string
  siteUrl: string
  projectId: string
  dataset: string
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

          <!-- Header -->
          <tr>
            <td style="background:#0a1628;padding:24px 32px;">
              <a href="${siteUrl}" style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:-0.3px;">
                Next Gen Finance
              </a>
              <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.45);letter-spacing:0.05em;">
                Financial literacy for the next generation
              </p>
            </td>
          </tr>

          <!-- Category label -->
          <tr>
            <td style="padding:24px 32px 0;">
              <span style="display:inline-block;background:#c9a84c;color:#0a1628;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;padding:4px 10px;border-radius:4px;">
                ${categoryLabel}
              </span>
              <p style="margin:12px 0 0;font-size:12px;color:#888;letter-spacing:0.03em;">New article just published</p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:12px 32px 0;">
              <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:700;color:#0a1628;line-height:1.25;">
                ${title}
              </h1>
            </td>
          </tr>

          ${
            excerpt
              ? `<!-- Excerpt -->
          <tr>
            <td style="padding:14px 32px 0;">
              <p style="margin:0;font-size:15px;line-height:1.65;color:#4a5568;">
                ${excerpt}
              </p>
            </td>
          </tr>`
              : ''
          }

          ${
            imageUrl
              ? `<!-- Image -->
          <tr>
            <td style="padding:24px 32px 0;">
              <a href="${articleUrl}">
                <img src="${imageUrl}" alt="${title}" width="536" style="width:100%;max-width:536px;border-radius:8px;display:block;" />
              </a>
            </td>
          </tr>`
              : ''
          }

          ${
            authorName
              ? `<!-- Author -->
          <tr>
            <td style="padding:16px 32px 0;">
              <p style="margin:0;font-size:13px;color:#888;">By ${authorName}</p>
            </td>
          </tr>`
              : ''
          }

          <!-- CTA -->
          <tr>
            <td style="padding:28px 32px 32px;">
              <a href="${articleUrl}" style="display:inline-block;background:#0a1628;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:8px;letter-spacing:0.01em;">
                Read the full article →
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <hr style="border:none;border-top:1px solid #eee;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
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

export async function POST(req: NextRequest) {
  // 1. Read raw body for signature verification
  const rawBody = await req.text()
  const signatureHeader = req.headers.get('sanity-webhook-signature') ?? ''
  const webhookSecret = process.env.SANITY_WEBHOOK_SECRET ?? ''

  // 2. Verify signature — reject if invalid
  if (webhookSecret && !verifySignature(rawBody, signatureHeader, webhookSecret)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  // 3. Parse payload
  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // 4. Only handle published posts (no drafts. prefix in _id)
  const docId = payload._id as string
  const docType = payload._type as string
  if (docType !== 'post' || docId?.startsWith('drafts.')) {
    return NextResponse.json({ skipped: true })
  }

  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-03-08'

  // 5. Fetch full article from Sanity (fresh, no cache)
  const sanity = createClient({ projectId, dataset, apiVersion, useCdn: false })

  const article = await sanity.fetch(
    `*[_type == "post" && _id == $id][0]{
      title,
      "slug": slug.current,
      excerpt,
      category,
      "authorName": author->name,
      "imageRef": mainImage.asset._ref,
      publishedAt,
      _createdAt
    }`,
    { id: docId },
  )

  if (!article?.slug) {
    return NextResponse.json({ error: 'Article not found or missing slug' }, { status: 404 })
  }

  // 6. Guard: only send on first publish — skip if article is older than 1 hour
  // This prevents re-sending emails when an existing article is edited and re-published
  const createdAt = new Date(article._createdAt ?? 0).getTime()
  const ageMinutes = (Date.now() - createdAt) / 1000 / 60
  if (ageMinutes > 60) {
    return NextResponse.json({ skipped: true, reason: 'Article older than 1 hour — likely an edit, not a first publish' })
  }

  // 7. Get all active subscribers from Resend
  const resend = new Resend(process.env.RESEND_API_KEY)
  const audienceId = process.env.RESEND_AUDIENCE_ID!
  const fromEmail = process.env.RESEND_FROM_EMAIL!

  const { data: contactsData, error: contactsError } = await resend.contacts.list({ audienceId })
  if (contactsError) {
    console.error('Failed to fetch Resend contacts:', contactsError)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }

  const activeContacts = (contactsData?.data ?? []).filter((c) => !c.unsubscribed)
  if (activeContacts.length === 0) {
    return NextResponse.json({ sent: 0, message: 'No active subscribers' })
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const html = emailHtml({
    title: article.title,
    excerpt: article.excerpt,
    slug: article.slug,
    authorName: article.authorName,
    category: article.category,
    imageRef: article.imageRef,
    siteUrl,
    projectId,
    dataset,
  })

  const subject = `New Article: ${article.title}`

  // 8. Send in batches of 100 (Resend limit per batch call)
  let totalSent = 0
  const batchSize = 100

  for (let i = 0; i < activeContacts.length; i += batchSize) {
    const batch = activeContacts.slice(i, i + batchSize)
    const { error } = await resend.batch.send(
      batch.map((contact) => ({
        from: fromEmail,
        to: contact.email,
        subject,
        html,
      })),
    )
    if (error) {
      console.error('Batch send error:', error)
    } else {
      totalSent += batch.length
    }
  }

  console.log(`Newsletter sent for "${article.title}" to ${totalSent} subscribers`)
  return NextResponse.json({ sent: totalSent, title: article.title })
}
