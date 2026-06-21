import { Resend } from 'resend'
import { marked } from 'marked'

const resend = new Resend(process.env.RESEND_API_KEY)

const WORKER_URL = 'https://shl-approval.rimas2043.workers.dev'

function actionButtons(token) {
  return `<div style="display:flex;gap:10px;margin-bottom:28px;flex-wrap:wrap;">
  <a href="${WORKER_URL}/approve/${token}" style="background:#16a34a;color:white;padding:11px 22px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">✅ Approve &amp; Publish</a>
  <a href="${WORKER_URL}/edit/${token}" style="background:#0080B0;color:white;padding:11px 22px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">✏️ Request Changes</a>
  <a href="${WORKER_URL}/skip/${token}" style="background:#6b7280;color:white;padding:11px 22px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block;">Skip</a>
</div>`
}

export async function sendDraftReview(pillar, post, imagePath, token) {
  const label = pillar === 'train' ? 'Health Post' : 'Recipe'
  const contentHtml = marked.parse(post.content)

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:680px;margin:0 auto;padding:24px;color:#1a1a1a}
  .header{background:#F7FAF8;border:1px solid #e0e8e4;border-radius:12px;padding:20px 24px;margin-bottom:24px}
  .badge{display:inline-block;background:#00A36C;color:white;font-size:11px;font-weight:600;letter-spacing:.5px;padding:3px 10px;border-radius:20px;text-transform:uppercase;margin-bottom:8px}
  .title{font-size:22px;font-weight:700;margin:0 0 8px}
  .meta{font-size:13px;color:#666}
  .content h2{font-size:18px;font-weight:700;margin-top:28px;margin-bottom:10px}
  .content p{line-height:1.7;margin-bottom:14px}
  .content ul,.content ol{line-height:1.7;margin-bottom:14px;padding-left:20px}
  .content a{color:#00A36C}
  .content table{border-collapse:collapse;width:100%;font-size:13px;margin-bottom:16px}
  .content th,.content td{border:1px solid #e5e7eb;padding:8px 12px;text-align:left}
  .content th{background:#f9fafb;font-weight:600}
  .footer{margin-top:40px;font-size:11px;color:#999;border-top:1px solid #e5e7eb;padding-top:16px}
</style>
</head><body>

<div class="header">
  <div class="badge">${label}</div>
  <div class="title">${post.title}</div>
  <div class="meta">/${pillar}/${post.slug}</div>
</div>

${actionButtons(token)}

<div class="content">${contentHtml}</div>

<div class="footer">SelfHealth Living · Weekly Content Review · Token: ${token}</div>
</body></html>`

  await resend.emails.send({
    from: 'SHL Content <content@selfhealthliving.com>',
    to: process.env.REVIEW_EMAIL,
    subject: `[SHL Review] ${label}: ${post.title}`,
    html,
  })

  console.log(`  Email sent → ${process.env.REVIEW_EMAIL}`)
}
