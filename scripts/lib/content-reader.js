import { readdir, readFile } from 'fs/promises'
import { join } from 'path'

const CONTENT_ROOT = new URL('../../src/content/', import.meta.url).pathname

export async function getExistingTopics() {
  const [trainFiles, fuelFiles] = await Promise.all([
    readdir(join(CONTENT_ROOT, 'train')).catch(() => []),
    readdir(join(CONTENT_ROOT, 'fuel')).catch(() => []),
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
