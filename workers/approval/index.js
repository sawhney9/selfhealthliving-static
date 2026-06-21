// Cloudflare Worker — HTTP-based approval flow
// GET  /approve/{token} → publishes to GitHub
// GET  /skip/{token}    → discards draft
// GET  /edit/{token}    → serves change-request form
// POST /edit/{token}    → calls Claude, sends revision email

const WORKER_URL = 'https://shl-approval.rimas2043.workers.dev'

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    const parts = url.pathname.split('/').filter(Boolean)
    const action = parts[0]
    const token = parts[1]

    if (!action || !token) return page('<h1>SHL Content Review</h1><p>Nothing here.</p>')

    const draft = await env.DRAFTS.get(token, 'json')
    if (!draft) return page('<h1>Not Found</h1><p>This link has already been used or expired.</p>', 404)

    if (action === 'approve') return handleApprove(draft, token, env)
    if (action === 'skip') return handleSkip(draft, token, env)
    if (action === 'edit') {
      if (request.method === 'POST') return handleEditPost(request, draft, token, env)
      return serveEditForm(draft, token)
    }

    return page('Unknown action', 400)
  },
}

async function handleApprove(draft, token, env) {
  const { pillar, post, imagePath } = draft
  const markdown = buildMarkdown(pillar, post, imagePath)
  const path = `src/content/${pillar}/${post.slug}.md`

  const res = await fetch(
    `https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'SHL-Content-Agent/1.0',
      },
      body: JSON.stringify({
        message: `content: publish "${post.title}"`,
        content: btoa(unescape(encodeURIComponent(markdown))),
      }),
    }
  )

  if (!res.ok) {
    const err = await res.text()
    console.error(`GitHub commit failed: ${err}`)
    return page(`<h1>Publish Failed</h1><p>${err}</p>`, 500)
  }

  await env.DRAFTS.delete(token)
  const label = pillar === 'train' ? 'Health post' : 'Recipe'

  return page(`
    <h1 style="color:#16a34a">✅ Published!</h1>
    <p><strong>${post.title}</strong></p>
    <p>${label} committed to GitHub. Cloudflare Pages will deploy in ~1 minute.</p>
    <p><a href="https://selfhealthliving.com/${pillar}/${post.slug}">View live post →</a></p>
  `)
}

async function handleSkip(draft, token, env) {
  await env.DRAFTS.delete(token)
  return page(`<h1>Skipped</h1><p>"${draft.post.title}" has been discarded.</p>`)
}

function serveEditForm(draft, token) {
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Request Changes</title>
<style>
  body{font-family:sans-serif;max-width:640px;margin:40px auto;padding:0 20px}
  h1{color:#111}p.sub{color:#666;font-size:14px;margin-bottom:20px}
  textarea{width:100%;height:160px;padding:12px;font-size:15px;border:1px solid #ccc;border-radius:6px;box-sizing:border-box}
  button{background:#0080B0;color:white;border:none;padding:12px 28px;font-size:16px;border-radius:6px;cursor:pointer;margin-top:12px}
</style></head><body>
  <h1>Request Changes</h1>
  <p class="sub">Post: <strong>${draft.post.title}</strong></p>
  <form method="POST">
    <textarea name="notes" placeholder="e.g. Make the intro more personal, add more detail on Zone 2 training, shorten the conclusion" required></textarea>
    <br><button type="submit">Send for Revision →</button>
  </form>
</body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}

async function handleEditPost(request, draft, token, env) {
  const formData = await request.formData()
  const notes = formData.get('notes')?.trim()
  if (!notes) return page('No notes provided.', 400)

  const { pillar, post, imagePath } = draft
  const revisionNumber = (draft.revisionNumber || 0) + 1

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-8',
      max_tokens: 4000,
      system: `You write health content for SelfHealth Living. Direct, evidence-based, personal voice. No AI-speak. No filler.`,
      messages: [
        {
          role: 'user',
          content: `Here is a health article draft:\n\nTitle: ${post.title}\n\n${post.content}\n\nEditor notes: "${notes}"\n\nReturn ONLY a JSON object with updated "title", "slug", and "content" fields.`,
        },
      ],
    }),
  })

  if (!response.ok) {
    return page(`<h1>Revision Failed</h1><p>Claude API error: ${response.status}</p>`, 500)
  }

  const data = await response.json()
  let revised
  try {
    revised = JSON.parse(data.content[0].text)
  } catch {
    return page('<h1>Revision Failed</h1><p>Could not parse Claude response.</p>', 500)
  }

  const updatedDraft = { ...draft, post: { ...post, ...revised }, revisionNumber }
  await env.DRAFTS.put(token, JSON.stringify(updatedDraft))

  await sendRevisionEmail(pillar, updatedDraft.post, imagePath, token, revisionNumber, env)

  return page(`<h1 style="color:#16a34a">✅ Revision Sent</h1><p>Check <strong>${env.REVIEW_EMAIL}</strong> for the updated draft.</p>`)
}

async function sendRevisionEmail(pillar, post, imagePath, token, revisionNumber, env) {
  const label = pillar === 'train' ? 'Health Post' : 'Recipe'

  const body = `<html><body style="font-family:sans-serif;max-width:640px;margin:0 auto;padding:24px;">
<h2 style="color:#0080B0">Revision ${revisionNumber}: ${post.title}</h2>
${actionButtons(token)}
${mdToHtml(post.content)}
<hr style="margin-top:32px;border-color:#e5e7eb">
<p style="color:#999;font-size:11px">Token: ${token}</p>
</body></html>`

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'SHL Content <content@selfhealthliving.com>',
      to: env.REVIEW_EMAIL,
      subject: `[SHL v${revisionNumber}] ${label}: ${post.title}`,
      html: body,
    }),
  })
}

function actionButtons(token) {
  return `<div style="display:flex;gap:10px;margin-bottom:28px;flex-wrap:wrap;">
  <a href="${WORKER_URL}/approve/${token}" style="background:#16a34a;color:white;padding:11px 22px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">✅ Approve & Publish</a>
  <a href="${WORKER_URL}/edit/${token}" style="background:#0080B0;color:white;padding:11px 22px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">✏️ Request Changes</a>
  <a href="${WORKER_URL}/skip/${token}" style="background:#6b7280;color:white;padding:11px 22px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">Skip</a>
</div>`
}

function mdToHtml(md) {
  return md
    .replace(/^## (.+)$/gm, '<h2 style="font-size:18px;margin-top:24px">$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="font-size:16px;margin-top:20px">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#00A36C">$1</a>')
    .replace(/\n\n/g, '</p><p style="line-height:1.7;margin-bottom:14px">')
    .replace(/^/, '<p style="line-height:1.7;margin-bottom:14px">')
    .replace(/$/, '</p>')
}

function page(body, status = 200) {
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:sans-serif;max-width:640px;margin:60px auto;padding:0 20px}a{color:#0080B0}</style></head><body>${body}</body></html>`,
    { status, headers: { 'Content-Type': 'text/html' } }
  )
}

function buildMarkdown(pillar, post, imagePath) {
  const date = new Date().toISOString().split('T')[0]

  if (pillar === 'fuel' && post.recipe) {
    const r = post.recipe
    const ingredients = r.ingredients
      .map(i => `    - name: "${i.name}"\n      amount: "${i.amount}"\n      unit: "${i.unit}"\n      notes: "${i.notes}"`)
      .join('\n')
    const instructions = r.instructions.map(s => `    - "${s}"`).join('\n')

    return `---
title: "${post.title}"
date: "${date}"
featured_image: "${imagePath}"
pillar: "fuel"
slug: "${post.slug}"
recipe:
  title: "${r.title}"
  prep_time: ${r.prep_time}
  cook_time: ${r.cook_time}
  total_time: ${r.total_time}
  servings: "${r.servings}"
  servings_unit: "${r.servings_unit}"
  ingredients:
${ingredients}
  instructions:
${instructions}
---

${post.content}
`
  }

  return `---
title: "${post.title}"
date: "${date}"
featured_image: "${imagePath}"
pillar: "${pillar}"
slug: "${post.slug}"
---

${post.content}
`
}
