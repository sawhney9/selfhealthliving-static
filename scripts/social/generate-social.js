// Turns a newly published post into a ready-to-post reel plus captions, and
// emails them so you can add a trending sound in-app and post by hand.
//
//   node scripts/social/generate-social.js <slug> [<slug> ...] [--out DIR] [--no-email]
//
// Health posts (train, including Roots) become 5 black text slides and a reel
// built from them. Recipes (fuel) reuse the existing ingredient reel in
// scripts/reel/. Every post gets an Instagram caption, a YouTube Shorts title
// and description, and a TikTok caption.
import Anthropic from '@anthropic-ai/sdk'
import { Resend } from 'resend'
import { execFileSync } from 'child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync, mkdtempSync, copyFileSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { tmpdir } from 'os'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(__dirname, '../..')
const MODEL = 'claude-opus-4-8'
const SITE = 'https://selfhealthliving.com'
const ACCENT = '#00A36C'
const FFMPEG = process.env.REEL_FFMPEG || 'ffmpeg'
const ROOTS_MARKER = 'For education only, not medical advice'

const HEALTH_DISCLAIMER = 'Education only, not medical advice. Talk to your doctor before making changes.'
const ROOTS_DISCLAIMER = 'Education only, not medical advice. Population averages, not you.'

const args = process.argv.slice(2)
const slugs = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--out')
const outRoot = (() => {
  const i = args.indexOf('--out')
  return resolve(i >= 0 ? args[i + 1] : join(REPO, 'social-out'))
})()
const sendEmail = !args.includes('--no-email')

if (!slugs.length) {
  console.error('usage: generate-social.js <slug> [<slug> ...] [--out DIR] [--no-email]')
  process.exit(1)
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ---- read post ---------------------------------------------------------------
function readPost(slug) {
  for (const pillar of ['train', 'fuel']) {
    const path = join(REPO, 'src/content', pillar, `${slug}.md`)
    if (!existsSync(path)) continue
    const md = readFileSync(path, 'utf8')
    const parts = md.split(/^---$/m)
    const fm = parts[1] || ''
    const body = parts.slice(2).join('---').trim()
    const title = (fm.match(/^title:\s*"?(.+?)"?\s*$/m)?.[1] || slug).replace(/\\"/g, '"')
    return { slug, pillar, title, body, md, url: `${SITE}/${pillar}/${slug}/`, roots: md.includes(ROOTS_MARKER) }
  }
  throw new Error(`Post not found in src/content/train or src/content/fuel: ${slug}`)
}

// ---- Claude ------------------------------------------------------------------
const CAPTION_PROPS = {
  instagram_caption: { type: 'string' },
  hashtags: { type: 'array', items: { type: 'string' } },
  youtube_title: { type: 'string' },
  youtube_description: { type: 'string' },
  tiktok_caption: { type: 'string' },
}
const CAPTION_KEYS = Object.keys(CAPTION_PROPS)

const SLIDES_SCHEMA = {
  type: 'object',
  properties: {
    slides: {
      type: 'array',
      items: {
        type: 'object',
        properties: { big: { type: 'string' }, small: { type: 'string' } },
        required: ['big', 'small'],
        additionalProperties: false,
      },
    },
    ...CAPTION_PROPS,
  },
  required: ['slides', ...CAPTION_KEYS],
  additionalProperties: false,
}

const CAPTIONS_SCHEMA = {
  type: 'object',
  properties: CAPTION_PROPS,
  required: CAPTION_KEYS,
  additionalProperties: false,
}

const RULES = `ACCURACY
- Use ONLY facts, numbers and claims that appear in the article. Do not add any new fact, statistic, study or name.
- Keep the article's hedging: if it says "a leading theory", "associated with" or "on average", you say it too.
- Never give a supplement or medication dose, a medication recommendation, a personal numeric target, or anything that reads as a diagnosis.
- Do not write a medical disclaimer; one is added automatically.

CAPTIONS
- instagram_caption: first line is a hook that works on its own before "more". Then 2 to 4 short paragraphs. End with: "Full breakdown + sources: link in bio." No hashtags inside it.
- hashtags: 3 to 5 relevant hashtags, each starting with #. No generic spam like #health #fyp.
- youtube_title: under 70 characters, curiosity-driven but accurate, ending with " #shorts".
- youtube_description: 2 to 3 sentences, then a line "Read more: ${SITE}".
- tiktok_caption: one or two punchy sentences plus 3 hashtags, under 220 characters.
- Plain text only. No emojis except at most one in the Instagram hook line.`

async function ask(prompt, schema) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: 'You turn SelfHealth Living articles (a health publication for intelligent readers over 40) into short social posts. Accurate, specific, never clickbait that the article does not back up.',
    output_config: { format: { type: 'json_schema', schema } },
    messages: [{ role: 'user', content: prompt }],
  })
  const text = response.content.find(b => b.type === 'text')?.text
  if (!text) throw new Error(`No text in response (stop_reason: ${response.stop_reason})`)
  return JSON.parse(text)
}

function healthPrompt(post) {
  return `Turn this article into a 5-slide reel plus captions.

SLIDES (exactly 5)
- Slide 1: the hook. The most surprising true thing in the article. "big" is the headline the viewer reads in under 2 seconds.
- Slides 2 to 4: the three most useful points, one per slide.
- Slide 5: the practical takeaway (what to do or what to ask a doctor about).
- "big": at most 7 words. Use a line break (\\n) to split it into two lines when longer than 3 words. A striking number on its own is fine ("23% vs 12%").
- "small": one or two plain sentences, at most 24 words, that back up the headline.
- No hashtags, no "link in bio" on the slides (added automatically).

${RULES}

ARTICLE
Title: ${post.title}

${post.body}`
}

function recipePrompt(post) {
  return `Write captions for a short recipe reel of this recipe. The reel already shows the dish and its ingredients.

${RULES}

RECIPE
Title: ${post.title}

${post.md}`
}

// Any number in the generated copy that doesn't appear in the article gets flagged.
function unmatchedNumbers(texts, source) {
  const norm = s => s.replace(/,/g, '')
  const src = norm(source)
  const found = new Set()
  for (const t of texts) {
    for (const m of norm(t).matchAll(/\d+(?:\.\d+)?/g)) {
      if (!new RegExp(`(^|[^\\d.])${m[0].replace('.', '\\.')}(?![\\d])`).test(src)) found.add(m[0])
    }
  }
  return [...found]
}

// ---- rendering -----------------------------------------------------------------
function readSeconds(s) {
  const words = `${s.big} ${s.small}`.split(/\s+/).length
  return Math.min(7.5, Math.max(3.5, 1.8 + words * 0.2))
}

function buildSlideReel(slides, slideDir, outFile) {
  const FADE = 0.4
  const durs = slides.map(readSeconds)
  durs[durs.length - 1] += 1.5 // hold the last slide
  const inputs = durs.flatMap((d, i) => [
    '-loop', '1', '-t', String(i < durs.length - 1 ? d + FADE : d), '-i', join(slideDir, `slide-${i + 1}.jpg`),
  ])
  const prep = durs
    .map((_, i) => `[${i}]scale=1080:1350,pad=1080:1920:0:285:color=0x0b0b0b,setsar=1,format=yuv420p,fps=30[v${i}]`)
    .join(';')
  let chain = ''
  let last = 'v0'
  let offset = 0
  for (let i = 1; i < durs.length; i++) {
    offset += durs[i - 1]
    const outLabel = i === durs.length - 1 ? 'outv' : `x${i}`
    chain += `;[${last}][v${i}]xfade=transition=slideleft:duration=${FADE}:offset=${offset.toFixed(2)}[${outLabel}]`
    last = outLabel
  }
  execFileSync(FFMPEG, [
    '-loglevel', 'error', '-y', ...inputs,
    '-filter_complex', prep + chain, '-map', '[outv]',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-movflags', '+faststart', outFile,
  ], { stdio: 'inherit' })
  return durs.reduce((a, b) => a + b, 0)
}

// ---- email ---------------------------------------------------------------------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function captionText(post, c) {
  return `INSTAGRAM REEL
${c.instagram_caption}

${c.hashtags.join(' ')}

YOUTUBE SHORTS
Title: ${c.youtube_title}
Description:
${c.youtube_description}

TIKTOK
${c.tiktok_caption}

ARTICLE
${post.url}
`
}

function block(label, text) {
  return `<div style="margin:0 0 18px;">
  <div style="font-size:12px;font-weight:700;letter-spacing:.08em;color:#6b7280;margin-bottom:6px;">${label}</div>
  <div style="white-space:pre-wrap;background:#f5f5f4;border:1px solid #e7e5e4;border-radius:8px;padding:12px 14px;font-size:14px;line-height:1.55;color:#1c1917;">${esc(text)}</div>
</div>`
}

async function email(post, c, files, flags, notes) {
  if (!process.env.RESEND_API_KEY || !process.env.REVIEW_EMAIL) {
    console.log('  RESEND_API_KEY / REVIEW_EMAIL missing; skipping email.')
    return
  }
  const warn = flags.length
    ? `<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px 14px;margin-bottom:20px;font-size:14px;color:#991b1b;">
<strong>Check these numbers before posting:</strong> ${flags.map(esc).join(', ')}. They appear in the slides or captions but not in the article.</div>`
    : ''
  const noteHtml = notes.map(n => `<p style="font-size:13px;color:#854d0e;background:#fefce8;border-radius:6px;padding:8px 12px;">${esc(n)}</p>`).join('')

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;color:#1c1917;">
<h2 style="margin:0 0 4px;font-size:20px;">Reel ready: ${esc(post.title)}</h2>
<p style="margin:0 0 18px;color:#6b7280;font-size:14px;"><a href="${post.url}" style="color:#0080B0;">${post.url}</a></p>
${warn}${noteHtml}
<ol style="font-size:14px;line-height:1.6;padding-left:20px;margin:0 0 22px;">
  <li>Open the attached <strong>${post.slug}_reel.mp4</strong> on your phone and save it.</li>
  <li>Instagram → new Reel → add a trending sound → paste the caption below → post.</li>
  <li>Same file works for YouTube Shorts and TikTok (titles and captions below).</li>
</ol>
${block('INSTAGRAM CAPTION', `${c.instagram_caption}\n\n${c.hashtags.join(' ')}`)}
${block('YOUTUBE SHORTS TITLE', c.youtube_title)}
${block('YOUTUBE SHORTS DESCRIPTION', c.youtube_description)}
${block('TIKTOK CAPTION', c.tiktok_caption)}
<p style="font-size:12px;color:#9ca3af;">${post.pillar === 'train' ? 'The 5 slides are attached too, if you ever want to post them as a swipe carousel.' : ''} Captions are also in captions.txt.</p>
</div>`

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { data, error } = await resend.emails.send({
    from: 'SHL Content <content@selfhealthliving.com>',
    to: process.env.REVIEW_EMAIL,
    subject: `[SHL Social] Reel ready: ${post.title}${flags.length ? ` (⚠️ check ${flags.length} number${flags.length > 1 ? 's' : ''})` : ''}`,
    html,
    attachments: files.map(f => ({ filename: f.split('/').pop(), content: readFileSync(f) })),
  })
  if (error) throw new Error(`Email failed: ${error.message || JSON.stringify(error)}`)
  console.log(`  ✓ Emailed ${process.env.REVIEW_EMAIL} (id ${data?.id})`)

  // Report delivery so a bounce or block shows up in the Actions log.
  for (let i = 0; i < 6 && data?.id; i++) {
    await new Promise(r => setTimeout(r, 10000))
    const { data: info } = await resend.emails.get(data.id)
    const status = info?.last_event
    if (status && status !== 'sent' && status !== 'queued') {
      console.log(`::notice::Email ${data.id}: ${status} (to domain ${String(info.to).split('@').pop()})`)
      return
    }
  }
  console.log(`::notice::Email ${data?.id}: still sending after 60s`)
}

// ---- main ----------------------------------------------------------------------
async function run(slug) {
  const post = readPost(slug)
  const out = join(outRoot, slug)
  mkdirSync(out, { recursive: true })
  console.log(`\n→ ${post.title} (${post.pillar}${post.roots ? ', Roots' : ''})`)

  const reel = join(out, `${slug}_reel.mp4`)
  const files = []
  const notes = []
  let flagTexts = []
  let c

  if (post.pillar === 'train') {
    const res = await ask(healthPrompt(post), SLIDES_SCHEMA)
    if (res.slides.length < 5) throw new Error(`Expected 5 slides, got ${res.slides.length}`)
    const slides = res.slides.slice(0, 5)
    c = res

    const disclaimer = post.roots ? ROOTS_DISCLAIMER : HEALTH_DISCLAIMER
    const cfg = {
      brand: 'SELFHEALTH LIVING', handle: 'selfhealthliving.com', accent: ACCENT,
      slides: slides.map((s, i) => ({
        kicker: `${i + 1} / 5`, big: s.big.replace(/\\n/g, '\n'), small: s.small,
        ...(i === 4 ? { cta: 'Full breakdown + sources → link in bio', disclaimer } : {}),
      })),
    }
    const cfgPath = join(mkdtempSync(join(tmpdir(), 'social-')), 'slides.json')
    writeFileSync(cfgPath, JSON.stringify(cfg, null, 2))
    execFileSync('python3', [join(__dirname, 'render_slides.py'), cfgPath, out], { stdio: 'inherit' })
    const secs = buildSlideReel(cfg.slides, out, reel)
    console.log(`  ✓ Reel ${secs.toFixed(1)}s → ${reel}`)

    c.instagram_caption = `${c.instagram_caption.trim()}\n\n${disclaimer}`
    c.youtube_description = `${c.youtube_description.trim()}\n\n${disclaimer}`
    files.push(reel, ...[1, 2, 3, 4, 5].map(i => join(out, `slide-${i}.jpg`)))
    flagTexts = slides.flatMap(s => [s.big, s.small])
  } else {
    c = await ask(recipePrompt(post), CAPTIONS_SCHEMA)
    try {
      execFileSync('node', [join(REPO, 'scripts/reel/generate-reel.js'), slug, '--out', out], { stdio: 'inherit' })
      files.push(reel)
    } catch (err) {
      notes.push('The recipe reel failed to build, so only captions are included. Check the Actions log.')
      console.log(`  ⚠ Recipe reel failed: ${err.message}`)
    }
  }

  const flags = unmatchedNumbers(
    [...flagTexts, c.instagram_caption, c.youtube_title, c.youtube_description, c.tiktok_caption],
    `${post.md} ${SITE} ${HEALTH_DISCLAIMER} ${ROOTS_DISCLAIMER} 1 2 3 4 5`
  )
  if (flags.length) console.log(`  ⚠ Numbers not in article: ${flags.join(', ')}`)

  const txt = join(out, 'captions.txt')
  writeFileSync(txt, captionText(post, c))
  files.push(txt)

  if (sendEmail) await email(post, c, files, flags, notes)
}

let failed = 0
for (const slug of slugs) {
  try {
    await run(slug)
  } catch (err) {
    failed++
    console.error(`  ✗ ${slug}: ${err.message}`)
    console.log(`::error::Social reel failed for ${slug}: ${String(err.message).slice(0, 300)}`)
  }
}
if (failed) process.exit(1)
