import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import { fileURLToPath } from 'url'

// fileURLToPath, not .pathname: the latter percent-encodes, so a repo checked out
// to a directory containing a space yields "SHL%20Website" and every read fails.
const CONTENT_ROOT = fileURLToPath(new URL('../../src/content/', import.meta.url))

// An unreadable content directory used to be swallowed into an empty list, which
// tells the model nothing has been published and quietly produces duplicate posts.
async function listPosts(pillar) {
  try {
    return await readdir(join(CONTENT_ROOT, pillar))
  } catch (err) {
    throw new Error(`Cannot read ${join(CONTENT_ROOT, pillar)}: ${err.message}`)
  }
}

export async function getExistingTopics() {
  const [trainFiles, fuelFiles] = await Promise.all([
    listPosts('train'),
    listPosts('fuel'),
  ])

  const trainTitles = await extractTitles('train', trainFiles)
  const fuelTitles = await extractTitles('fuel', fuelFiles)

  return { train: trainTitles, fuel: fuelTitles }
}

async function extractTitles(pillar, files) {
  const titles = []
  for (const file of files.filter(f => f.endsWith('.md'))) {
    const raw = await readFile(join(CONTENT_ROOT, pillar, file), 'utf-8')
    const match = raw.match(/^title:\s*"(.+?)"/m)
    if (match) titles.push(match[1])
  }
  return titles
}
