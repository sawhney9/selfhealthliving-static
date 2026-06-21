import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const VOICE_SYSTEM_PROMPT = `You write health content for SelfHealth Living (selfhealthliving.com) — a health app for people who take longevity, strength, and biomarkers seriously.

VOICE:
- Direct, no preamble. Open with the most interesting or surprising fact.
- Cite real studies with actual working links to PubMed, JAMA, BMJ, or major journals. No made-up URLs.
- Use em dashes (—) not hyphens for asides.
- Short punchy sentences mixed with longer explanatory ones.
- First-person occasional opinions: "The research is clear", "Most people have never heard of this."
- Never hedge with "may" or "might" when the evidence is strong.
- No AI-speak: no "delve", "tapestry", "it's worth noting", "crucial", "dive deep."
- Grounded honest ending. Acknowledge the hard part, then give the real takeaway.
- Link to related SHL posts with relative URLs like /train/slug or /fuel/slug when relevant.

STRUCTURE FOR HEALTH POSTS (train):
- H2 sections: "What [X] Actually Means", "Why It Matters", "The Research", "How to [Improve/Do/Use] It", "The Honest Reality"
- Include benchmark tables where useful (age vs metric)
- Practical protocol or action step in every post

STRUCTURE FOR RECIPE POSTS (fuel):
- Open with the nutritional hook (protein, fiber, key bioactive — one punchy sentence)
- H2: "What Each Ingredient Is Doing" — explain the science behind 4-6 key ingredients, each with a PubMed link
- H2: "Nutrition Per Serving (approx.)" — bullet list: Protein, Fiber, Fat, Carbs
- H2: "Meal Prep Notes" — storage, reheating, variations

Respond ONLY with valid JSON — no markdown fences, no explanation.`

export async function generateTrainPost(existingTitles) {
  const prompt = `Generate ONE health/longevity article for SelfHealth Living.

TOPICS TO AVOID (already published): ${existingTitles.join(', ')}

FOCUS AREAS (pick one angle):
- Longevity science (senescence, telomeres, mTOR, NAD+, hormesis)
- Strength training physiology (muscle protein synthesis, progressive overload, hypertrophy)
- Recent AI/wearable health tech discoveries
- Supplement research from accredited sources (NIH, Examine.com-level evidence)
- Sleep/HRV/recovery science
- Metabolic health (insulin sensitivity, blood sugar, Zone 2)

Return JSON with this exact shape:
{
  "title": "Post title",
  "slug": "url-slug-kebab-case",
  "pexels_query": "2-3 word image search query (e.g. 'strength training gym')",
  "excerpt": "One sentence summary for meta description",
  "content": "Full markdown body (no frontmatter). Min 800 words. Use ## headers."
}`

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 4000,
    system: VOICE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  return parseJSON(response.content[0].text)
}

export async function generateFuelPost(existingTitles) {
  const prompt = `Generate ONE recipe post for SelfHealth Living.

RECIPES TO AVOID (already published): ${existingTitles.join(', ')}

FOCUS: High-protein, high-fiber, anti-inflammatory, longevity-supporting meals. Real food, not supplements.
STYLE: Practical meal-prep friendly. Not diet culture. Not calorie-obsessed. Science-grounded.
EXAMPLES OF GOOD ANGLES: a legume-based dish, a salmon bowl, a high-fiber breakfast, a gut-health smoothie bowl

Return JSON with this exact shape:
{
  "title": "Recipe name: subtitle hook",
  "slug": "url-slug-kebab-case",
  "pexels_query": "2-3 word image search (e.g. 'salmon bowl healthy')",
  "excerpt": "One sentence summary",
  "recipe": {
    "title": "Recipe Name",
    "prep_time": 10,
    "cook_time": 25,
    "total_time": 35,
    "servings": "4",
    "servings_unit": "servings",
    "ingredients": [
      { "name": "Ingredient", "amount": "1", "unit": "cup", "notes": "preparation note" }
    ],
    "instructions": ["Step one.", "Step two."]
  },
  "content": "Full markdown body (no frontmatter). Open with nutritional hook. Use ## headers for What Each Ingredient Is Doing, Nutrition Per Serving, Meal Prep Notes."
}`

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 4000,
    system: VOICE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  return parseJSON(response.content[0].text)
}

export async function revisePost(originalContent, editNotes) {
  const prompt = `Here is a health article draft:

---
${originalContent}
---

The editor has requested these changes:
"${editNotes}"

Apply the changes and return the SAME JSON format as the original, with the updated "content" field (and updated "title"/"slug" if the edit warrants it). Return ONLY valid JSON.`

  const response = await client.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 4000,
    system: VOICE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  })

  return parseJSON(response.content[0].text)
}

function parseJSON(text) {
  // Strip markdown fences if Claude wrapped it anyway
  const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
  // Replace literal control characters inside strings (e.g. unescaped newlines)
  const safe = cleaned.replace(
    /"((?:[^"\\]|\\.)*)"/gs,
    (_, inner) => `"${inner.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')}"`
  )
  return JSON.parse(safe)
}
