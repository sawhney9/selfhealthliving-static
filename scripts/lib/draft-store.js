import { writeFileSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomUUID } from 'crypto'
import { execFileSync } from 'child_process'

const KV_NAMESPACE_ID = '6abb15143f024094be7df67ff7a60ede'

function kvPut(key, value) {
  const tmp = join(tmpdir(), `shl-draft-${key}.json`)
  writeFileSync(tmp, JSON.stringify(value))
  try {
    execFileSync('wrangler', ['kv', 'key', 'put', '--remote', '--namespace-id', KV_NAMESPACE_ID, key, '--path', tmp], {
      cwd: process.cwd(),
      stdio: 'pipe',
    })
  } finally {
    try { unlinkSync(tmp) } catch {}
  }
}

export async function saveDraft(pillar, post, imagePath) {
  const token = randomUUID()
  const draft = { token, pillar, post, imagePath, createdAt: new Date().toISOString() }
  kvPut(token, draft)
  return token
}

export function buildMarkdown(pillar, post, imagePath) {
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
