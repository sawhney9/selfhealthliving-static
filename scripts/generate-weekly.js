#!/usr/bin/env node
// Run: npm run generate
// Generates 1 train post + 1 fuel post, downloads stock images, emails them for review.

import { getExistingTopics } from './lib/content-reader.js'
import { generateTrainPost, generateFuelPost } from './lib/claude-writer.js'
import { fetchStockImage } from './lib/pexels.js'
import { saveDraft } from './lib/draft-store.js'
import { sendDraftReview } from './lib/email.js'

const REQUIRED_VARS = ['ANTHROPIC_API_KEY', 'RESEND_API_KEY', 'PEXELS_API_KEY', 'REVIEW_EMAIL']

function checkEnv() {
  const missing = REQUIRED_VARS.filter(v => !process.env[v])
  if (missing.length) {
    console.error(`Missing environment variables: ${missing.join(', ')}`)
    console.error('Copy .env.example to .env and fill in the values.')
    process.exit(1)
  }
}

async function run() {
  checkEnv()

  console.log('Reading existing content...')
  const existing = await getExistingTopics()
  console.log(`  Train posts: ${existing.train.length}, Fuel posts: ${existing.fuel.length}`)

  // Generate train post
  console.log('\nGenerating health post...')
  const trainPost = await generateTrainPost(existing.train)
  console.log(`  "${trainPost.title}"`)

  console.log('  Fetching stock image...')
  const trainImage = await fetchStockImage(trainPost.pexels_query, trainPost.slug)
  console.log(`  Image: ${trainImage.publicPath} (by ${trainImage.credit.photographer})`)

  const trainToken = await saveDraft('train', trainPost, trainImage.publicPath)
  console.log('  Draft saved.')

  console.log('  Sending review email...')
  await sendDraftReview('train', trainPost, trainImage.publicPath, trainToken)

  // Small delay so emails don't arrive simultaneously
  await new Promise(r => setTimeout(r, 5000))

  // Generate fuel/recipe post
  console.log('\nGenerating recipe post...')
  const fuelPost = await generateFuelPost(existing.fuel)
  console.log(`  "${fuelPost.title}"`)

  console.log('  Fetching stock image...')
  const fuelImage = await fetchStockImage(fuelPost.pexels_query, fuelPost.slug)
  console.log(`  Image: ${fuelImage.publicPath} (by ${fuelImage.credit.photographer})`)

  const fuelToken = await saveDraft('fuel', fuelPost, fuelImage.publicPath)
  console.log('  Draft saved.')

  console.log('  Sending review email...')
  await sendDraftReview('fuel', fuelPost, fuelImage.publicPath, fuelToken)

  console.log('\nDone. Check selfhealthliving@gmail.com for 2 review emails.')
}

run().catch(err => {
  console.error('\nError:', err.message)
  process.exit(1)
})
