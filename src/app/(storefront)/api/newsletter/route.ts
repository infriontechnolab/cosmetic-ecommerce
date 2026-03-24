import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { newsletterSubscribers } from '@/db/schema'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''

  if (!email || !email.includes('@')) {
    return NextResponse.json({ ok: false, error: 'Invalid email' }, { status: 400 })
  }

  await db
    .insert(newsletterSubscribers)
    .values({ email, source: (body.source as string) || 'homepage' })
    .onDuplicateKeyUpdate({ set: { isActive: true } })

  return NextResponse.json({ ok: true })
}
