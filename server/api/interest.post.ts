// "I need this form" signups, delivered straight to the owner's inbox over SMTP
// (the Migadu mailbox that already exists for dix.tax). No third-party service,
// no database: the inbox is the list.
import nodemailer from 'nodemailer'

const PRODUCTS = ['modelo210', 'anlageV', 'chZurich', 'chOther', 'other']

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)

  // Honeypot: real visitors never see or fill this field.
  if (body?.website) return { ok: true }

  const email = String(body?.email ?? '').trim().toLowerCase()
  const product = String(body?.product ?? '')
  const locale = String(body?.locale ?? '').slice(0, 5)
  const note = String(body?.note ?? '').trim().slice(0, 1000)

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_email' })
  }
  if (!PRODUCTS.includes(product)) {
    throw createError({ statusCode: 400, statusMessage: 'invalid_product' })
  }

  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!user || !pass) {
    // Never pretend a signup was delivered when it was not.
    console.error('[interest] SMTP_USER or SMTP_PASS is missing, signup not delivered')
    throw createError({ statusCode: 503, statusMessage: 'not_configured' })
  }

  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.migadu.com',
    port: Number(process.env.SMTP_PORT || 465),
    secure: true,
    auth: { user, pass },
  })

  try {
    await transport.sendMail({
      from: `Dix.Tax website <${user}>`,
      to: process.env.INTEREST_TO || 'hello@dix.tax',
      replyTo: email,
      subject: `Dix.Tax signup: ${product} (${locale})`,
      text: `Form: ${product}\nLanguage: ${locale}\nEmail: ${email}\n\nWhat they wrote:\n${note || '(nothing)'}\n`,
    })
  } catch (error) {
    console.error('[interest] sending failed', error)
    throw createError({ statusCode: 502, statusMessage: 'send_failed' })
  }

  return { ok: true }
})
