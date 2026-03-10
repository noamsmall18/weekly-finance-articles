import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }

  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (!audienceId) {
    return NextResponse.json({ error: 'Newsletter not configured' }, { status: 500 })
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.contacts.create({ email, audienceId })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[subscribe]', error)
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}
