// src/lib/email-service.ts
// Email delivery service.
// Priority:   1. Resend REST API  (RESEND_API_KEY)
//             2. SMTP via nodemailer (SMTP_HOST + SMTP_USER + SMTP_PASS)
//             3. Console log fallback (development)
//
// No new npm packages needed — Resend uses plain fetch().
// nodemailer is used dynamically if already installed.

export interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

export interface EmailResult {
  success: boolean
  id?: string
  error?: string
  provider?: 'resend' | 'smtp' | 'console'
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

function getFromAddress(): string {
  return (
    process.env.EMAIL_FROM ||
    process.env.SMTP_FROM ||
    `noreply@${process.env.EMAIL_DOMAIN || 'cloudcertification.com'}`
  )
}

// ─── Provider 1: Resend REST API ─────────────────────────────────────────────

async function sendViaResend(payload: EmailPayload): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY not set')

  const body = {
    from: payload.from || getFromAddress(),
    to: Array.isArray(payload.to) ? payload.to : [payload.to],
    subject: payload.subject,
    html: payload.html,
    ...(payload.text && { text: payload.text }),
    ...(payload.replyTo && { reply_to: payload.replyTo }),
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error ${res.status}: ${err}`)
  }

  const data = await res.json() as { id: string }
  return { success: true, id: data.id, provider: 'resend' }
}

// ─── Provider 2: SMTP via nodemailer ─────────────────────────────────────────

async function sendViaSMTP(payload: EmailPayload): Promise<EmailResult> {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || '587', 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) throw new Error('SMTP_HOST / SMTP_USER / SMTP_PASS not set')

  // Dynamic require — only works if nodemailer is installed
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any
  const nodemailer: any = await import(/* webpackIgnore: true */ 'nodemailer' as string).catch(() => null)
  if (!nodemailer) throw new Error('nodemailer not installed (run: npm install nodemailer)')

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: { rejectUnauthorized: process.env.NODE_ENV === 'production' },
  })

  const result = await transporter.sendMail({
    from: payload.from || getFromAddress(),
    to: Array.isArray(payload.to) ? payload.to.join(', ') : payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    replyTo: payload.replyTo,
  })

  return { success: true, id: result.messageId, provider: 'smtp' }
}

// ─── Provider 3: Console fallback ────────────────────────────────────────────

async function sendViaConsole(payload: EmailPayload): Promise<EmailResult> {
  const to = Array.isArray(payload.to) ? payload.to.join(', ') : payload.to
  console.log('\n━━━ [email-service] EMAIL (no provider configured) ━━━')
  console.log(`To:      ${to}`)
  console.log(`Subject: ${payload.subject}`)
  console.log(`Body:\n${payload.text || '(HTML only)'}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  return { success: true, id: `console-${Date.now()}`, provider: 'console' }
}

// ─── Main Send Function ───────────────────────────────────────────────────────

/**
 * Send a transactional email.
 * Tries providers in order: Resend → SMTP → console.
 */
export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  // Try Resend first
  if (process.env.RESEND_API_KEY) {
    try {
      return await sendViaResend(payload)
    } catch (err) {
      console.error('[email-service] Resend failed:', (err as Error).message)
    }
  }

  // Try SMTP second
  if (process.env.SMTP_HOST) {
    try {
      return await sendViaSMTP(payload)
    } catch (err) {
      console.error('[email-service] SMTP failed:', (err as Error).message)
    }
  }

  // Console fallback (always succeeds — dev / misconfigured)
  return await sendViaConsole(payload)
}

/**
 * Send to multiple recipients (one email per recipient — no BCC leakage)
 */
export async function sendEmailBatch(
  recipients: Array<{ to: string; name?: string }>,
  makePayload: (to: string, name?: string) => Omit<EmailPayload, 'to'>
): Promise<EmailResult[]> {
  return Promise.all(
    recipients.map(({ to, name }) =>
      sendEmail({ ...makePayload(to, name), to }).catch((err) => ({
        success: false as const,
        error: (err as Error).message,
        provider: 'console' as const,
      }))
    )
  )
}
