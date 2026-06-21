import { createWriteStream, readFileSync } from 'fs'
import { pipeline } from 'stream/promises'
import { join } from 'path'

const IMAGES_DIR = join(process.cwd(), 'public/images/uploads')

export async function fetchStockImage(query, slug) {
  const res = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
    { headers: { Authorization: process.env.PEXELS_API_KEY } }
  )

  if (!res.ok) throw new Error(`Pexels API error: ${res.status}`)

  const data = await res.json()
  if (!data.photos?.length) throw new Error(`No Pexels images found for "${query}"`)

  const photo = data.photos[0]
  const filename = `${slug}.jpg`
  const localPath = join(IMAGES_DIR, filename)
  const publicPath = `/images/uploads/${filename}`

  const imageRes = await fetch(photo.src.large2x)
  if (!imageRes.ok) throw new Error(`Image download failed: ${imageRes.status}`)

  await pipeline(imageRes.body, createWriteStream(localPath))

  // Commit the image to GitHub so it's available when the post is approved
  await commitImageToGitHub(localPath, `public/images/uploads/${filename}`)

  return {
    localPath,
    publicPath,
    credit: {
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      pexelsUrl: photo.url,
    },
  }
}

async function commitImageToGitHub(localPath, repoPath) {
  const { GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO } = process.env
  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) return

  const content = readFileSync(localPath).toString('base64')
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${repoPath}`

  // Check if file already exists (need its SHA to update)
  let sha
  const check = await fetch(url, {
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, 'User-Agent': 'SHL-Content-Agent/1.0' },
  })
  if (check.ok) {
    const existing = await check.json()
    sha = existing.sha
  }

  const body = {
    message: `assets: add image ${repoPath.split('/').pop()}`,
    content,
  }
  if (sha) body.sha = sha

  const put = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'SHL-Content-Agent/1.0',
    },
    body: JSON.stringify(body),
  })

  if (!put.ok) {
    const err = await put.text()
    console.warn(`  Image commit warning: ${err}`)
  }
}
