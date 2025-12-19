import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

function buildTransporter() {
  // If host/port are provided, use them
  if (env.SMTP_HOST && env.SMTP_PORT) {
    return nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE || env.SMTP_PORT === 465, // true for 465, false for others
      auth: env.SMTP_USER && env.SMTP_PASS ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined
    })
  }
  // Gmail convenience if only user/pass given
  if (env.SMTP_USER && env.SMTP_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
    })
  }
  // No transporter if not configured
  return null
}

export async function sendContactMail({ name, email, message }) {
  try {
    const transporter = buildTransporter()
    if (!transporter) return false

    const from = `${env.MAIL_FROM_NAME} <${env.MAIL_FROM_EMAIL}>`
    const to = env.MAIL_TO || env.SMTP_USER
    const subject = `New contact message from ${name}`
    const html = `
      <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.6;">
        <h2 style="margin: 0 0 12px;">New Contact Message</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <div style="white-space: pre-wrap; border: 1px solid #eee; border-radius: 8px; padding: 12px; background: #fafafa;">${escapeHtml(message)}</div>
        <hr style="margin:16px 0;border:none;border-top:1px solid #eee"/>
        <p style="font-size: 12px; color: #555;">Sent from Fire Productions website</p>
      </div>
    `

    await transporter.sendMail({ from, to, subject, html })
    return true
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Failed to send contact email:', e)
    return false
  }
}

function escapeHtml(str) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
