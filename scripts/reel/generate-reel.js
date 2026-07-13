// Generate an Instagram/TikTok reel for an approved fuel (recipe) post.
//
//   node --env-file=.env scripts/reel/generate-reel.js <slug> [--out DIR] [--email]
//
// Reads src/content/fuel/<slug>.md, asks Claude to write the hook + per-ingredient
// callouts (grounded in the recipe's own benefits), maps each ingredient to a vetted
// photo from ./ingredients, and renders a vertical, silent MP4 (you add trending audio
// in-app). Nothing here publishes to social — it only builds the file and, with
// --email, notifies you it is ready.
import Anthropic from '@anthropic-ai/sdk'
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, mkdtempSync, mkdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { tmpdir, homedir } from 'node:os'

const __dirname = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(__dirname, '../..')
const MODEL = 'claude-opus-4-8'

// ffmpeg: explicit env wins, else a static binary in ~/.local/bin, else PATH.
const FFMPEG = (() => {
  if (process.env.REEL_FFMPEG) return process.env.REEL_FFMPEG
  const local = join(homedir(), '.local/bin/ffmpeg')
  return existsSync(local) ? local : 'ffmpeg'
})()

// ---- args ------------------------------------------------------------------
const args = process.argv.slice(2)
const slug = args.find(a => !a.startsWith('--'))
if (!slug) {
  console.error('usage: generate-reel.js <slug> [--out DIR] [--email]')
  process.exit(1)
}
const outDir = (() => {
  const i = args.indexOf('--out')
  return i >= 0 ? resolve(args[i + 1]) : join(homedir(), 'Downloads')
})()
const doEmail = args.includes('--email')

// ---- read recipe -----------------------------------------------------------
const mdPath = join(REPO, 'src/content/fuel', `${slug}.md`)
if (!existsSync(mdPath)) throw new Error(`Recipe not found: ${mdPath}`)
const md = readFileSync(mdPath, 'utf8')

const fm = md.split(/^---$/m)[1] || ''
const grab = re => (md.match(re)?.[1] || '').trim()
const title = grab(/^title:\s*"?(.+?)"?\s*$/m)
const featured = grab(/^featured_image:\s*"?(.+?)"?\s*$/m)
// ingredient names, in recipe order
const ingredientNames = [...fm.matchAll(/^\s*-\s*name:\s*"?(.+?)"?\s*$/gm)].map(m => m[1].trim())
if (!featured) throw new Error(`No featured_image in ${slug}.md`)

// hero: full-res upload lives under public/
const hero = join(REPO, 'public', featured.replace(/^\//, ''))
if (!existsSync(hero)) throw new Error(`Hero image missing on disk: ${hero}`)

// ---- map ingredients -> library photos ------------------------------------
const manifest = JSON.parse(readFileSync(join(__dirname, 'ingredients/manifest.json'), 'utf8'))
const skip = manifest.skip.map(s => s.toLowerCase())

const cards = []          // { name, image }
const unmatched = []
for (const name of ingredientNames) {
  const lc = name.toLowerCase()
  // whole-word match so "sliced" doesn't trip the "ice" skip word
  if (skip.some(s => new RegExp(`\\b${s}\\b`).test(lc))) continue
  const hit = Object.entries(manifest.images).find(([, aliases]) =>
    aliases.some(a => lc.includes(a.toLowerCase())))
  if (hit) cards.push({ name, image: `${hit[0]}.jpg` })
  else unmatched.push(name)
}
if (cards.length < 3) throw new Error(`Only ${cards.length} ingredients mapped for ${slug}; unmatched: ${unmatched.join(', ')}`)

// ---- ask Claude for the copy ----------------------------------------------
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SCHEMA = {
  type: 'object',
  properties: {
    hook: {
      type: 'object',
      properties: { title: { type: 'string' }, benefit: { type: 'string' } },
      required: ['title', 'benefit'], additionalProperties: false,
    },
    cards: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          tag: { type: 'string' },      // 1-3 word nutrient, e.g. "ANTHOCYANINS"
          title: { type: 'string' },    // clean ingredient name, e.g. "Carrots"
          benefit: { type: 'string' },  // one punchy sentence
        },
        required: ['tag', 'title', 'benefit'], additionalProperties: false,
      },
    },
    outro: {
      type: 'object',
      properties: {
        kicker: { type: 'string' }, title: { type: 'string' }, benefit: { type: 'string' },
      },
      required: ['kicker', 'title', 'benefit'], additionalProperties: false,
    },
  },
  required: ['hook', 'cards', 'outro'], additionalProperties: false,
}

const prompt = `You are writing the on-screen text for a short vertical social video (Instagram Reel / TikTok) about this smoothie recipe.

RECIPE TITLE: ${title}

RECIPE TEXT (for the real, cited benefits — use these, do not invent):
${md.split(/^---$/m).slice(2).join('---').slice(0, 6000)}

The video shows a photo card for each of these ${cards.length} ingredients, in THIS order. Return one "cards" entry per ingredient, same order:
${cards.map((c, i) => `${i + 1}. ${c.name}`).join('\n')}

Write:
- hook: a scroll-stopping opener over the finished-smoothie photo. "title" is a short, punchy line (a surprising or slightly provocative true claim about this smoothie). "benefit" is one supporting sentence. No hashtags, no emoji.
- cards: for each ingredient, "tag" is the key nutrient in 1-3 UPPERCASE words (e.g. "ANTHOCYANINS", "SOLUBLE FIBER", "PROBIOTICS"); "title" is the clean ingredient name (e.g. "Baby Carrots" -> "Carrots", "Fine Flaxseed Powder" -> "Flaxseed"); "benefit" is ONE tight sentence on why it matters, grounded in the recipe's stated benefit.
- outro: "kicker" like "${cards.length} INGREDIENTS. ONE GLASS."; "title" a short close (e.g. "Under 5 minutes."); "benefit" a soft CTA pointing to the link in bio.

Voice: confident, specific, a little warm. No AI-speak (no "delve", "crucial", "unlock", "game-changer"). No em dashes. No exclamation points.`

console.log(`> ${slug}: ${cards.length} ingredient cards, asking Claude for copy...`)
const resp = await client.messages.create({
  model: MODEL,
  max_tokens: 4000,
  thinking: { type: 'adaptive' },
  output_config: { effort: 'high', format: { type: 'json_schema', schema: SCHEMA } },
  messages: [{ role: 'user', content: prompt }],
})
const copy = JSON.parse(resp.content.find(b => b.type === 'text').text)
if (copy.cards.length !== cards.length) {
  throw new Error(`Claude returned ${copy.cards.length} cards, expected ${cards.length}`)
}

// ---- assemble scene config -------------------------------------------------
const scenes = [
  { img: null, title: copy.hook.title, benefit: copy.hook.benefit },
  ...cards.map((c, i) => ({
    img: c.image, tag: copy.cards[i].tag,
    title: copy.cards[i].title, benefit: copy.cards[i].benefit,
  })),
  { img: null, cta: true, kicker: copy.outro.kicker, title: copy.outro.title, benefit: copy.outro.benefit },
]

mkdirSync(outDir, { recursive: true })
const work = mkdtempSync(join(tmpdir(), `reel-${slug}-`))
const cfgPath = join(work, 'config.json')
// accent: per-slug override if present, else auto-detect from the hero photo
const accents = JSON.parse(readFileSync(join(__dirname, 'accents.json'), 'utf8'))
const accent = accents[slug] || 'auto'
const config = { hero, accent, outdir: work, img_base: join(__dirname, 'ingredients'), scenes }
writeFileSync(cfgPath, JSON.stringify(config, null, 2))

// ---- render + build --------------------------------------------------------
console.log('> rendering scenes...')
execFileSync('python3', [join(__dirname, 'render_scenes.py'), cfgPath], { stdio: 'inherit' })

const outFile = join(outDir, `${slug}_reel.mp4`)
console.log('> building video...')
execFileSync('bash', [join(__dirname, 'build_video.sh'), work, String(scenes.length), outFile, FFMPEG],
  { stdio: 'inherit' })

console.log(`\n✅ Reel ready: ${outFile}`)
if (unmatched.length) {
  console.log(`⚠️  Ingredients with no library photo (skipped, no card): ${unmatched.join(', ')}`)
  console.log(`   Add a photo + manifest entry for these to include them next time.`)
}

// ---- optional email --------------------------------------------------------
if (doEmail) {
  const { RESEND_API_KEY, REVIEW_EMAIL } = process.env
  if (!RESEND_API_KEY || !REVIEW_EMAIL) {
    console.warn('--email set but RESEND_API_KEY / REVIEW_EMAIL missing; skipping email.')
  } else {
    const b64 = readFileSync(outFile).toString('base64')
    const warn = unmatched.length
      ? `<p style="color:#b45309">Heads up: no library photo for ${unmatched.join(', ')} — those got no card.</p>` : ''
    const html = `<div style="font-family:sans-serif;max-width:560px;margin:0 auto">
      <h2 style="color:#0080B0">🎬 Reel ready: ${title}</h2>
      <p>The reel is attached and saved on your Mac at:</p>
      <p><code>${outFile}</code></p>
      <p>It has no audio by design. Open it in Instagram/TikTok, add a trending sound, and post.</p>
      ${warn}
      <p style="color:#999;font-size:12px">${scenes.length} scenes · generated from the approved recipe</p>
    </div>`
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'SHL Content <content@selfhealthliving.com>',
        to: REVIEW_EMAIL,
        subject: `🎬 Reel ready: ${title}`,
        html,
        attachments: [{ filename: `${slug}_reel.mp4`, content: b64 }],
      }),
    })
    console.log(r.ok ? `📧 Emailed ${REVIEW_EMAIL}` : `email failed: ${r.status} ${await r.text()}`)
  }
}
