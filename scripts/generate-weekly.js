#!/usr/bin/env node
// Run: npm run generate
// Generates 1 train post + 1 fuel post, downloads stock images, emails them for review.

import { getExistingTopics } from './lib/content-reader.js'
import { generateTrainPost, generateFuelPost, generateRootsPost, checkRootsSafety } from './lib/claude-writer.js'
import { verifyCitations, summarize } from './lib/verify-citations.js'
import { fetchStockImage } from './lib/pexels.js'
import { saveDraft } from './lib/draft-store.js'
import { sendDraftReview } from './lib/email.js'

const REQUIRED_VARS = [
  'ANTHROPIC_API_KEY', 'RESEND_API_KEY', 'PEXELS_API_KEY', 'REVIEW_EMAIL',
  // Needed so each post's image is committed to GitHub before approval —
  // otherwise the featured image 404s once CI deploys from GitHub.
  'GITHUB_TOKEN', 'GITHUB_OWNER', 'GITHUB_REPO',
]

function checkEnv() {
  const missing = REQUIRED_VARS.filter(v => !process.env[v])
  if (missing.length) {
    console.error(`Missing environment variables: ${missing.join(', ')}`)
    console.error('Copy .env.example to .env and fill in the values.')
    process.exit(1)
  }
}

// Runs before the review email so the editor never sees a citation we haven't
// resolved. Rewrites post.content in place: bad links become plain text.
async function checkCitations(post) {
  const { citations, ok, content } = await verifyCitations(post.content, post.title)
  post.content = content

  if (!citations.length) {
    console.log('  Citations: none')
    return citations
  }
  console.log(`  Citations: ${citations.length} checked`)
  console.log(summarize(citations))
  if (!ok) {
    const bad = citations.filter(c => c.status === 'mismatch' || c.status === 'not_found')
    console.log(`  ${bad.length} unusable citation(s) stripped — flagged in the review email`)
  }
  return citations
}

// Roots is an extra post every other week (even ISO weeks).
// ROOTS_MODE: "auto" (default) | "only" (Roots alone, for testing) | "force" (all three).
function isoWeek(d = new Date()) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7))
  return Math.ceil(((t - Date.UTC(t.getUTCFullYear(), 0, 1)) / 86400000 + 1) / 7)
}

async function generateRoots(existingTrainTitles) {
  console.log('\nGenerating Roots post...')
  const post = await generateRootsPost(existingTrainTitles)
  console.log(`  "${post.title}"`)

  const citations = await checkCitations(post)

  console.log('  Running safety review...')
  const safety = await checkRootsSafety(post)
  console.log(`  Safety: ${safety.flags.length} flag(s)${safety.ran ? '' : ' (AI review failed; pattern checks only)'}`)

  console.log('  Fetching stock image...')
  const image = await fetchStockImage(post.pexels_query, post.slug)
  console.log(`  Image: ${image.publicPath} (by ${image.credit.photographer})`)

  // Published under /train/ so the existing approval Worker handles it unchanged.
  const token = await saveDraft('train', post, image.publicPath)
  console.log('  Draft saved.')

  console.log('  Sending review email...')
  await sendDraftReview('train', post, image.publicPath, token, citations, { label: 'Roots', safety })
}

async function run() {
  checkEnv()

  const mode = (process.env.ROOTS_MODE || 'auto').toLowerCase()
  const rootsDue = mode === 'only' || mode === 'force' || isoWeek() % 2 === 0
  console.log(`Roots mode: ${mode} (ISO week ${isoWeek()}) → ${rootsDue ? 'Roots post this run' : 'no Roots post this run'}`)

  console.log('Reading existing content...')
  const existing = await getExistingTopics()
  console.log(`  Train posts: ${existing.train.length}, Fuel posts: ${existing.fuel.length}`)

  if (mode === 'only') {
    await generateRoots(existing.train)
    console.log('\nDone. Check selfhealthliving@gmail.com for 1 review email.')
    return
  }

  // Generate train post
  console.log('\nGenerating health post...')
  const trainPost = await generateTrainPost(existing.train)
  console.log(`  "${trainPost.title}"`)

  const trainCitations = await checkCitations(trainPost)

  console.log('  Fetching stock image...')
  const trainImage = await fetchStockImage(trainPost.pexels_query, trainPost.slug)
  console.log(`  Image: ${trainImage.publicPath} (by ${trainImage.credit.photographer})`)

  const trainToken = await saveDraft('train', trainPost, trainImage.publicPath)
  console.log('  Draft saved.')

  console.log('  Sending review email...')
  await sendDraftReview('train', trainPost, trainImage.publicPath, trainToken, trainCitations)

  // Small delay so emails don't arrive simultaneously
  await new Promise(r => setTimeout(r, 5000))

  // Generate fuel/recipe post
  console.log('\nGenerating recipe post...')
  const fuelPost = await generateFuelPost(existing.fuel)
  console.log(`  "${fuelPost.title}"`)

  const fuelCitations = await checkCitations(fuelPost)

  console.log('  Fetching stock image...')
  const fuelImage = await fetchStockImage(fuelPost.pexels_query, fuelPost.slug)
  console.log(`  Image: ${fuelImage.publicPath} (by ${fuelImage.credit.photographer})`)

  const fuelToken = await saveDraft('fuel', fuelPost, fuelImage.publicPath)
  console.log('  Draft saved.')

  console.log('  Sending review email...')
  await sendDraftReview('fuel', fuelPost, fuelImage.publicPath, fuelToken, fuelCitations)

  if (rootsDue) {
    await new Promise(r => setTimeout(r, 5000))
    await generateRoots(existing.train)
  }

  console.log(`\nDone. Check selfhealthliving@gmail.com for ${rootsDue ? 3 : 2} review emails.`)
}

run().catch(err => {
  console.error('\nError:', err.message)
  process.exit(1)
})
