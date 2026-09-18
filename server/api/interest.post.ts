// Signups, delivered straight to the owner's inbox over SMTP (the Migadu mailbox that already
// exists for dix.tax). No third-party service, no database: the inbox is the list.
//
// Two kinds arrive here. "I need this form" says which form somebody is waiting for, and
// "remind me" asks to be written to once before a deadline. The second is a promise a person
// keeps by hand, which is exactly why the subject line says which kind it is.
import nodemailer from 'nodemailer'

const PRODUCTS = ['modelo210', 'anlageV', 'chZurich', 'chOther', 'other', 'switzerland', 'spain', 'germany']
const KINDS = ['signup', 'reminder'] as const
type Kind = (typeof KINDS)[number]

export default defineEventHandler(async (event) => {
  const body = await readBody<Record<string, unknown>>(event)

  // Honeypot: real visitors never see or fill this field.
  if (body?.website) return { ok: true }

  const email = String(body?.email ?? '').trim().toLowerCase()
  const product = String(body?.product ?? '')
  const locale = String(body?.locale ?? '').slice(0, 5)
  const note = String(body?.note ?? '').trim().slice(0, 1000)
  const kind = (KINDS as readonly string[]).includes(String(body?.kind)) ? (String(body?.kind) as Kind) : 'signup'
  // Shown in the mail so the person sending the reminder knows which date it is for. It is
  // only ever a date this site put on the page, so a loose shape check is enough.
  const deadline = /^\d{4}-\d{2}-\d{2}$/.test(String(body?.deadline ?? '')) ? String(body?.deadline) : ''

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
      from: `dix.tax website <${user}>`,
      to: process.env.INTEREST_TO || 'hello@dix.tax',
      replyTo: email,
      subject:
        kind === 'reminder'
          ? `dix.tax reminder: ${product} (${locale})${deadline ? ` before ${deadline}` : ''}`
          : `dix.tax signup: ${product} (${locale})`,
      text:
        kind === 'reminder'
          ? [
              'Somebody asked to be reminded before their deadline.',
              '',
              `Form: ${product}`,
              `Language: ${locale}`,
              `Email: ${email}`,
              `Deadline: ${deadline || '(not given)'}`,
              '',
              'Nothing sends this automatically. Write to them a few weeks before that date,',
              'once, and delete the address afterwards unless they ask to stay on the list.',
              '',
            ].join('\n')
          : `Form: ${product}\nLanguage: ${locale}\nEmail: ${email}\n\nWhat they wrote:\n${note || '(nothing)'}\n`,
    })
  } catch (error) {
    console.error('[interest] sending failed', error)
    throw createError({ statusCode: 502, statusMessage: 'send_failed' })
  }

  return { ok: true }
})
