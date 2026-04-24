// src/lib/email-templates.ts
// Responsive HTML email templates for all transactional emails.
// All templates return { subject, html, text } — ready for sendEmail().

const BRAND_COLOR = '#6366f1' // Indigo-500
const BRAND_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Cloud Certification'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cloudcertification.com'
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@cloudcertification.com'

// ─── Base Layout ─────────────────────────────────────────────────────────────

function layout(content: string, preheader = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${BRAND_NAME}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#f3f4f6;">${preheader}&nbsp;</div>` : ''}
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f3f4f6;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background-color:${BRAND_COLOR};border-radius:8px 8px 0 0;padding:24px 40px;text-align:center;">
            <a href="${APP_URL}" style="text-decoration:none;">
              <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">${BRAND_NAME}</span>
            </a>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="background-color:#ffffff;padding:40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background-color:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Need help? Email us at <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_COLOR};">${SUPPORT_EMAIL}</a></p>
            <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function btn(text: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" role="presentation" style="margin:24px 0;">
    <tr>
      <td style="border-radius:6px;background-color:${BRAND_COLOR};">
        <a href="${url}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:6px;">${text}</a>
      </td>
    </tr>
  </table>`
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 16px;color:#111827;font-size:24px;font-weight:700;line-height:1.3;">${text}</h1>`
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">${text}</p>`
}

function divider(): string {
  return `<hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />`
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:10px 16px;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;font-weight:600;width:40%;">${label}</td>
    <td style="padding:10px 16px;background-color:#f9fafb;border-bottom:1px solid #e5e7eb;color:#111827;font-size:14px;">${value}</td>
  </tr>`
}

// ─── Template: Welcome ────────────────────────────────────────────────────────

export function welcomeTemplate(name: string) {
  const subject = `Welcome to ${BRAND_NAME}! 🎉`
  const preheader = `You're all set — your learning journey starts now`

  const html = layout(`
    ${h1(`Welcome aboard, ${name}!`)}
    ${p(`You've successfully joined <strong>${BRAND_NAME}</strong> — the fastest way to master cloud infrastructure and earn industry-recognized certifications.`)}
    ${p('Here\'s what you can do right now:')}
    <ul style="margin:0 0 20px;padding-left:20px;color:#374151;font-size:15px;line-height:2;">
      <li>Browse our course catalog</li>
      <li>Enroll in your first course for free</li>
      <li>Track your progress and earn certificates</li>
    </ul>
    ${btn('Explore Courses', `${APP_URL}/courses`)}
    ${divider()}
    ${p(`If you have any questions, our support team is at <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_COLOR};">${SUPPORT_EMAIL}</a>.`)}
  `, preheader)

  const text = `Welcome to ${BRAND_NAME}, ${name}!\n\nYour account is ready. Start learning at: ${APP_URL}/courses\n\nQuestions? Email ${SUPPORT_EMAIL}`

  return { subject, html, text }
}

// ─── Template: Enrollment Confirmation ───────────────────────────────────────

export interface EnrollmentEmailData {
  name: string
  courseTitle: string
  courseSlug: string
  instructorName?: string
  courseThumbnail?: string
}

export function enrollmentConfirmationTemplate(data: EnrollmentEmailData) {
  const { name, courseTitle, courseSlug, instructorName } = data
  const courseUrl = `${APP_URL}/courses/${courseSlug}/learn`
  const subject = `You're enrolled: ${courseTitle} ✅`
  const preheader = `Your enrollment is confirmed — start learning now`

  const html = layout(`
    ${h1(`You\'re enrolled, ${name}!`)}
    ${p('Your enrollment has been confirmed. You now have full access to:')}
    <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin:0 0 24px;">
      <tbody>
        ${infoRow('Course', `<strong>${courseTitle}</strong>`)}
        ${instructorName ? infoRow('Instructor', instructorName) : ''}
        ${infoRow('Access', 'Lifetime')}
        ${infoRow('Certificate', 'Upon completion')}
      </tbody>
    </table>
    ${btn('Start Learning Now', courseUrl)}
    ${divider()}
    ${p('Your progress is saved automatically, so you can pick up right where you left off on any device.')}
    ${p(`Happy learning! — The ${BRAND_NAME} Team`)}
  `, preheader)

  const text = `Hi ${name},\n\nYou're enrolled in "${courseTitle}".\n\nStart learning: ${courseUrl}\n\nThe ${BRAND_NAME} Team`

  return { subject, html, text }
}

// ─── Template: Payment Receipt ────────────────────────────────────────────────

export interface PaymentReceiptData {
  name: string
  courseTitle: string
  courseSlug: string
  amount: number
  currency: string
  paymentMethod: string
  purchaseId: string
}

export function paymentReceiptTemplate(data: PaymentReceiptData) {
  const { name, courseTitle, courseSlug, amount, currency, paymentMethod, purchaseId } = data
  const courseUrl = `${APP_URL}/courses/${courseSlug}/learn`
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100) // Amount in cents

  const subject = `Payment receipt — ${courseTitle}`
  const preheader = `Your payment of ${formattedAmount} was successful`

  const html = layout(`
    ${h1('Payment Confirmed')}
    ${p(`Hi ${name}, your payment was successful. Here's your receipt:`)}
    <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin:0 0 24px;">
      <tbody>
        ${infoRow('Course', `<strong>${courseTitle}</strong>`)}
        ${infoRow('Amount', `<strong>${formattedAmount}</strong>`)}
        ${infoRow('Payment Method', paymentMethod)}
        ${infoRow('Transaction ID', `<code style="font-size:12px;">${purchaseId}</code>`)}
        ${infoRow('Date', new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }))}
      </tbody>
    </table>
    ${btn('Access Your Course', courseUrl)}
    ${divider()}
    ${p('Keep this email for your records. If you have any billing questions, contact our support team.')}
  `, preheader)

  const text = `Payment confirmed!\n\nCourse: ${courseTitle}\nAmount: ${formattedAmount}\nTransaction: ${purchaseId}\n\nAccess: ${courseUrl}`

  return { subject, html, text }
}

// ─── Template: Course Completion ─────────────────────────────────────────────

export interface CourseCompletionData {
  name: string
  courseTitle: string
  courseSlug: string
}

export function courseCompletionTemplate(data: CourseCompletionData) {
  const { name, courseTitle, courseSlug } = data
  const certUrl = `${APP_URL}/courses/${courseSlug}/certificate`
  const subject = `🎓 Certificate earned — ${courseTitle}`
  const preheader = `Congratulations! You completed ${courseTitle}`

  const html = layout(`
    <div style="text-align:center;margin-bottom:24px;">
      <div style="font-size:64px;line-height:1;">🎓</div>
    </div>
    ${h1(`Congratulations, ${name}!`)}
    ${p(`You've successfully completed <strong>${courseTitle}</strong>. Your certificate of completion is ready.`)}
    ${btn('Download Certificate', certUrl)}
    ${divider()}
    ${p('Ready for your next challenge? Browse more courses to keep growing.')}
    ${btn('Browse More Courses', `${APP_URL}/courses`)}
  `, preheader)

  const text = `Congratulations ${name}!\n\nYou completed "${courseTitle}".\n\nDownload your certificate: ${certUrl}`

  return { subject, html, text }
}

// ─── Template: Password Reset ─────────────────────────────────────────────────

export function passwordResetTemplate(name: string, resetUrl: string) {
  const subject = `Reset your ${BRAND_NAME} password`
  const preheader = 'Your password reset link is inside'

  const html = layout(`
    ${h1('Password Reset Request')}
    ${p(`Hi ${name}, we received a request to reset your password. Click the button below to create a new password.`)}
    ${btn('Reset Password', resetUrl)}
    ${p('<span style="color:#6b7280;font-size:13px;">This link expires in 1 hour. If you didn\'t request a password reset, you can safely ignore this email — your password has not been changed.</span>')}
  `, preheader)

  const text = `Reset your password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`

  return { subject, html, text }
}

// ─── Template: Admin New Enrollment Notification ──────────────────────────────

export function adminNewEnrollmentTemplate(data: {
  studentName: string
  studentEmail: string
  courseTitle: string
  amount?: number
  currency?: string
}) {
  const { studentName, studentEmail, courseTitle, amount, currency } = data
  const formattedAmount =
    amount && currency
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: currency.toUpperCase() }).format(amount / 100)
      : 'Free'

  const subject = `New enrollment: ${courseTitle}`
  const preheader = `${studentName} just enrolled`

  const html = layout(`
    ${h1('New Enrollment')}
    <table cellpadding="0" cellspacing="0" role="presentation" style="width:100%;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin:0 0 24px;">
      <tbody>
        ${infoRow('Student', studentName)}
        ${infoRow('Email', studentEmail)}
        ${infoRow('Course', courseTitle)}
        ${infoRow('Amount', formattedAmount)}
        ${infoRow('Date', new Date().toLocaleString())}
      </tbody>
    </table>
    ${btn('View in Admin Panel', `${process.env.ADMIN_PANEL_URL || 'http://localhost:3001'}/admin/enrollments`)}
  `, preheader)

  const text = `New enrollment: ${studentName} (${studentEmail}) enrolled in "${courseTitle}" for ${formattedAmount}`

  return { subject, html, text }
}
