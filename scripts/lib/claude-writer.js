import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const MODEL = 'claude-opus-4-8'

export const VOICE_SYSTEM_PROMPT = `You write for SelfHealth Living (selfhealthliving.com), a health publication for readers who take longevity, strength, and biomarkers seriously. They are intelligent and they have already read the obvious advice. They can tell when they are being padded.

VOICE
Open with the most surprising true thing you have. No throat-clearing.
Write like a knowledgeable friend explaining something across a kitchen table: warm, direct, specific, occasionally funny. Never salesy, never chummy.
Vary sentence length. A short sentence lands harder after a long one.
Prefer concrete nouns and real numbers to abstractions. "A grip below 26 kg" beats "suboptimal grip strength."
Explain the mechanism, not just the finding. People remember why.
Second person is welcome. A first-person opinion is welcome once the evidence has earned it.

DO NOT
No AI-speak: delve, tapestry, crucial, dive deep, unlock, harness, game-changer, "it's worth noting", "the key takeaway", "in the ever-evolving landscape".
No em dashes. Use a comma, a parenthesis, or a full stop.
Do not restate a heading in the first sentence beneath it.
Do not tell the reader what they are about to learn, or summarize what you just said.
No exclamation points. No rhetorical question as a section opener.

EVIDENCE — the part that matters most
Every empirical claim needs a real citation.
Cite only PubMed, in exactly this form: [Lancet, 2015](https://pubmed.ncbi.nlm.nih.gov/25982160/)
Use only studies you recall specifically and confidently: the journal, the year, the finding, and the PMID together. Landmark studies are safer than obscure ones.
If you cannot recall a genuine PMID for a claim, do not invent one. Drop the claim, or state it plainly as mechanism or expert consensus rather than dressing it as a specific trial.
An invented PMID is far worse than no citation. Every PMID you emit is checked against the NCBI database after you finish. Wrong ones are stripped and reported to the editor, so a fabricated citation is always caught and always costs trust.
Hedge exactly as much as the evidence hedges. Observational cohorts show association, not cause. Say "associated with" when that is what was measured, and say so confidently.

STRUCTURE
Choose ## headings that describe what is actually in that section, for this specific topic. Do not reuse a template.
These headings are worn out and must never appear: "What X Actually Means", "Why It Matters", "The Research", "How to Improve It", "The Honest Reality", "The Honest Part".
Somewhere in the piece, in whatever order suits the material, the reader must learn: what the thing is, what the evidence shows, what to do about it on Monday morning, and where the evidence runs out.
Include a benchmark table when values vary by age or sex.
Link to related SHL posts with relative URLs like /train/slug or /fuel/slug where genuinely relevant.
End on something true and useful, not a recap.`

const FUEL_GUIDANCE = `For recipe posts: open with the nutritional hook in one punchy sentence. Explain the science behind four to six key ingredients, each with a real PubMed citation. Give approximate nutrition per serving. Cover storage, reheating, and variations. Not diet culture, not calorie-obsessed.`

// Shared by both post types. Structured outputs guarantee schema-valid JSON, so
// there is no fenced-markdown stripping or control-character repair to do.
const baseProperties = {
  title: { type: 'string' },
  slug: { type: 'string' },
  pexels_query: { type: 'string' },
  excerpt: { type: 'string' },
  content: { type: 'string' },
}
const baseRequired = ['title', 'slug', 'pexels_query', 'excerpt', 'content']

const TRAIN_SCHEMA = {
  type: 'object',
  properties: baseProperties,
  required: baseRequired,
  additionalProperties: false,
}

const FUEL_SCHEMA = {
  type: 'object',
  properties: {
    ...baseProperties,
    recipe: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        prep_time: { type: 'integer' },
        cook_time: { type: 'integer' },
        total_time: { type: 'integer' },
        servings: { type: 'string' },
        servings_unit: { type: 'string' },
        ingredients: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              amount: { type: 'string' },
              unit: { type: 'string' },
              notes: { type: 'string' },
            },
            required: ['name', 'amount', 'unit', 'notes'],
            additionalProperties: false,
          },
        },
        instructions: { type: 'array', items: { type: 'string' } },
      },
      required: [
        'title', 'prep_time', 'cook_time', 'total_time',
        'servings', 'servings_unit', 'ingredients', 'instructions',
      ],
      additionalProperties: false,
    },
  },
  required: [...baseRequired, 'recipe'],
  additionalProperties: false,
}

async function write(prompt, schema) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system: VOICE_SYSTEM_PROMPT,
    thinking: { type: 'adaptive' },
    output_config: {
      effort: 'high',
      format: { type: 'json_schema', schema },
    },
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content.find(b => b.type === 'text')?.text
  if (!text) throw new Error(`No text block in response (stop_reason: ${response.stop_reason})`)
  return JSON.parse(text)
}

export async function generateTrainPost(existingTitles) {
  return write(
    `Write one health and longevity article for SelfHealth Living. At least 800 words.

Already published, so pick a different subject: ${existingTitles.join(', ')}

Choose one angle: longevity science (senescence, telomeres, mTOR, NAD+, hormesis), strength training physiology, recent wearable or AI health findings, well-evidenced supplement research, sleep, HRV and recovery, or metabolic health.

"pexels_query" is a two or three word stock image search, e.g. "strength training gym".
"excerpt" is one sentence for the meta description.
"content" is the full markdown body with no frontmatter, using ## headings.`,
    TRAIN_SCHEMA
  )
}

export async function generateFuelPost(existingTitles) {
  return write(
    `Write one recipe post for SelfHealth Living. At least 800 words.

${FUEL_GUIDANCE}

Already published, so pick a different dish: ${existingTitles.join(', ')}

High-protein, high-fiber, anti-inflammatory, longevity-supporting. Real food. Practical for meal prep.

"title" should be the recipe name plus a short hook.
"pexels_query" is a two or three word stock image search.
"content" is the full markdown body with no frontmatter, using ## headings.`,
    FUEL_SCHEMA
  )
}

// Used by the approval Worker's "Request Changes" flow once it is migrated to
// share this prompt. Today the Worker inlines a one-line system prompt of its
// own, so revisions are not held to the voice or citation rules above.
export async function revisePost(post, editNotes, pillar = 'train') {
  return write(
    `Here is a draft:

Title: ${post.title}

${post.content}

The editor asked for these changes:
"${editNotes}"

Apply them and return the same fields, updating title and slug only if the edit warrants it.`,
    pillar === 'fuel' ? FUEL_SCHEMA : TRAIN_SCHEMA
  )
}
