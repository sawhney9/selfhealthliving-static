import Anthropic from '@anthropic-ai/sdk'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'

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

const FUEL_GUIDANCE = `RECIPES

Flavor is not a garnish on top of the nutrition, it is the reason the recipe gets cooked twice. A healthy dish nobody wants to eat again has failed, whatever its macros say. Write the recipe you would actually make on a Tuesday.

The nutritional north star is the Mediterranean pattern: olive oil as the default fat, vegetables rounding out the plate, fish and lean poultry as the everyday protein, whole grains over refined, herbs and acid instead of heavy sauces. This is the "why" behind the protein rules below. It is a pattern, not a cuisine, so a miso-glazed cod, a chimichurri salmon, and a lemon-herb roast chicken all fit it as naturally as a Greek plate does. When a traditional recipe leans on butter or cream, note where olive oil works instead, without pretending the dish becomes something it is not.

Cook from a real culinary tradition rather than the generic wellness bowl. Salmon and cod are reader favorites, so reach for fish often, along with chicken, shrimp, and other seafood, and rotate the technique and cuisine so it never feels like one note: a Japanese miso cod, a Mexican citrus-marinated fish, a Persian saffron chicken, a Korean gochujang salmon, a Southern Italian branzino, a Levantine spiced shrimp. Name the dish honestly.

Build flavor with technique, not fat and sugar:
sear or roast the protein properly, don't just steam it and call it healthy;
brown the aromatics properly instead of sweating them pale;
lean on fermented or bright depth (miso, gochujang, harissa, fish sauce, tamarind, preserved lemon, anchovy, caper);
finish with acid and a raw herb, which is what makes a dish taste finished;
toast, char, and sear where a lesser recipe would boil.

Protein is a flavor problem as much as a nutrition one. Salmon and cod take beautifully to a marinade, a crust, or a hard sear; chicken thighs hold up to bold spice better than breast; shrimp cooks in minutes and carries garlic and citrus well. Say what a technique does to the texture, not just to the protein count.

Default to fish, poultry, or well-chosen meat as the everyday protein and prove a healthy dish can still taste like something worth cooking twice: salmon, cod and other fish, shrimp, chicken, and occasionally a well-trimmed cut of beef, pork, or lamb when the dish is genuinely built around it (a good steak, a braise). Most recipes should center real seafood or meat cooked well, not drowned in sauce or breaded and fried. A vegetarian recipe (dal, chana, paneer, tofu, lentils, a loaded salad) is welcome once in a while, roughly one recipe in four or five, as a genuine change of pace rather than the default.

Assume a normal kitchen: pan, pot, sheet tray, knife, blender. If the recipe genuinely needs anything beyond that, name it in "equipment" and say plainly whether it is required or a shortcut. A Ninja Creami, a high-speed blender, an air fryer, a spice grinder, and a fine strainer are all fair game when the dish is better for it. Never invent an equipment need to sound sophisticated, and never quietly assume gear the reader may not own.

CARB STRATEGY
Vary carb load deliberately across recipes instead of defaulting to one lane every time. Alternate between two lanes and be honest about which one a given recipe is:
Low-carb: built around protein, vegetables, and healthy fat, carbs coming mostly from vegetables, roughly under 20g net carbs per serving. Cauliflower, zucchini noodles, lettuce wraps, and extra vegetables stand in for the starch.
Smart-carb: built around a whole grain, legume, or intact root vegetable as the point of the dish, not something to apologize for. Brown rice over white, whole wheat or bajra roti over maida, sweet potato over fries, dal and rajma counted as the carb source they are.
Never dress up a refined-carb dish (white rice, maida, regular pasta) as the healthy choice. State the lane plainly in the hook or excerpt, e.g. "low-carb" or "built around a real carb, not a fear of one."

SPEED FOR BUSY COOKS
Think about who is actually cooking this on a Tuesday: often a parent or a busy person with 20-30 minutes, not a free afternoon. At least every other recipe should be genuinely fast: 25 minutes total time or less, one pan or one sheet tray, minimal knife work, ingredients a normal grocery run already has. Say so plainly in the hook when it is fast, e.g. "done in 20 minutes" or "one pan, start to finish." When a recipe runs longer, own it and say what the extra time buys, or give a make-ahead or meal-prep angle (double the batch, freezes well, reheats in one step) so a busy household can still get it on the table.

Structure a recipe post as: the nutritional hook in one punchy sentence, then what four to six key ingredients are doing (each with a real PubMed citation), approximate nutrition per serving, and finally storage, reheating, and the variations worth making.

Not diet culture. Not calorie-obsessed. Never apologize for butter or salt where the dish needs them.`

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
        // Empty when a pan, pot, sheet tray, knife and blender will do.
        equipment: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              required: { type: 'boolean' },
              note: { type: 'string' },
            },
            required: ['name', 'required', 'note'],
            additionalProperties: false,
          },
        },
      },
      required: [
        'title', 'prep_time', 'cook_time', 'total_time',
        'servings', 'servings_unit', 'ingredients', 'instructions', 'equipment',
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

Already published, so pick a different dish and a different cuisine: ${existingTitles.join(', ')}

High-protein, high-fiber, anti-inflammatory, longevity-supporting. Real food. Practical for meal prep, or worth the effort when it isn't.

Before writing, decide two things for this specific recipe and commit to them: which carb lane it is (low-carb or smart-carb, per CARB STRATEGY above), and whether it is a fast weeknight recipe (25 minutes or less, per SPEED FOR BUSY COOKS) or a longer one worth the time. Let that decision shape the hook.

"title" should be the recipe name plus a short hook.
"pexels_query" is a two or three word stock image search.
"equipment" lists only gear beyond a pan, pot, sheet tray, knife and blender. Leave it empty if none is needed. Set "required" to false for anything a reader could work around, and use "note" to say what the workaround is.
"content" is the full markdown body with no frontmatter, using ## headings.`,
    FUEL_SCHEMA
  )
}

const ROOTS_FACTS = JSON.parse(
  readFileSync(fileURLToPath(new URL('./roots-facts.json', import.meta.url)), 'utf-8')
)

function rootsFactsBlock() {
  const levels = Object.entries(ROOTS_FACTS.evidence_levels)
    .map(([k, v]) => `  ${k}: ${v}`)
    .join('\n')
  const groups = ROOTS_FACTS.groups
    .map(g => {
      const facts = g.facts
        .map(f => `  - [${f.level}] ${f.fact}${f.pmid ? ` (PMID ${f.pmid})` : ' (no PMID: state without a link)'}`)
        .join('\n')
      return `GROUP: ${g.group}\nANGLES:\n${g.angles.map(a => `  - ${a}`).join('\n')}\nFACTS:\n${facts}`
    })
    .join('\n\n')
  return `EVIDENCE LEVELS (how strongly each fact may be stated):\n${levels}\n\n${groups}`
}

export const ROOTS_DISCLAIMER =
  '> **For education only, not medical advice.** Risk patterns describe population averages, not you. ' +
  'Talk to your doctor before changing your diet, exercise, supplements or medications, or before ordering tests.'

const ROOTS_GUIDANCE = `ROOTS: WHY SOME PEOPLE CARRY CERTAIN RISKS

This series explains why certain populations, on average, carry higher risk for specific health markers, using history, development and biology, and then what a reader can reasonably do about it.

VETTED FACTS
Population-specific facts (prevalence, risk levels, guideline statements, history) must come ONLY from the VETTED FACTS below.
For those facts, cite only the PMID listed next to the fact. If a fact has no PMID, state it without a link. Never attach a different PMID to a vetted fact.
State each fact exactly as strongly as its evidence level allows: "guideline" plainly, "observational" as an association or average, "hypothesis" as a leading theory that is not proven in humans.
Do not add population-specific numbers that are not in the vetted facts.

FRAMING
Risk is a population average, never destiny. Say "on average" and "at the same BMI". Never say or imply that a reader of this ancestry has a condition.
Do not rank or compare groups as better or worse. Do not use ancestry as a stand-in for behavior.
Say plainly that lifestyle shifts risk, and that ancestry is one input among genetics, diet, activity, sleep and environment.

WHAT TO DO (three tiers, all three required)
1. Things that help on average, stated directly: resistance training and building muscle, walking after meals, more fiber and fewer refined carbs, sleep, tracking waist size rather than weight alone. General lifestyle evidence here follows the normal citation rules.
2. A section titled around what to ask your doctor: tests or screenings worth raising (for example apoB, a one-time Lp(a), A1c or fasting glucose, whether earlier diabetes screening or a coronary calcium scan makes sense). Phrase every item as a question to bring to a doctor, not an instruction.
3. Never include: supplement or medication names with doses, any medication recommendation (at most: "your doctor may discuss treatment options"), personal numeric targets ("get your apoB under X"), or anything that reads as a diagnosis.

Do not write your own disclaimer; one is added automatically after the article.`

const ROOTS_SAFETY_SCHEMA = {
  type: 'object',
  properties: {
    flags: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['overstated_evidence', 'unvetted_population_fact', 'dose_or_medication', 'diagnosis_or_target', 'stereotype_or_fatalism'] },
          quote: { type: 'string' },
          note: { type: 'string' },
        },
        required: ['type', 'quote', 'note'],
        additionalProperties: false,
      },
    },
  },
  required: ['flags'],
  additionalProperties: false,
}

export async function generateRootsPost(existingTitles) {
  const post = await write(
    `Write one Roots article for SelfHealth Living. At least 900 words.

${ROOTS_GUIDANCE}

VETTED FACTS
${rootsFactsBlock()}

Already published, so choose an angle from the list above that these titles do not already cover: ${existingTitles.join(', ')}

"pexels_query" is a two or three word stock image search. Avoid images of identifiable people's faces; prefer food, landscapes, or abstract health imagery.
"excerpt" is one sentence for the meta description.
"content" is the full markdown body with no frontmatter, using ## headings.`,
    TRAIN_SCHEMA
  )
  post.content = `${post.content.trimEnd()}\n\n${ROOTS_DISCLAIMER}\n`
  return post
}

// Deterministic first pass: anything that looks like a dose or a named drug.
// mg/dL and nmol/L are lab units, not doses, so they're excluded.
const DOSE_RE = /\b\d+(?:[.,]\d+)?\s?(?:mg|mcg|µg|IU|grams?)\b(?!\s*\/\s*d?l)/gi
const MED_RE = /\b(statins?|atorvastatin|rosuvastatin|metformin|ezetimibe|semaglutide|ozempic|wegovy|tirzepatide|mounjaro|zepbound|glp-1|sglt2|pcsk9|inclisiran|niacin|berberine|aspirin)\b/gi

export async function checkRootsSafety(post) {
  const flags = []
  const text = post.content.replace(ROOTS_DISCLAIMER, '')
  for (const re of [DOSE_RE, MED_RE]) {
    for (const m of new Set(text.match(re) || [])) {
      const i = text.search(new RegExp(m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
      flags.push({
        type: 'dose_or_medication',
        quote: text.slice(Math.max(0, i - 60), i + m.length + 60).replace(/\s+/g, ' ').trim(),
        note: `Mentions "${m}" (pattern match). Check it is not a recommendation.`,
      })
    }
  }

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: 'You are a strict medical-content safety reviewer. You flag problems; you never rewrite.',
      output_config: { format: { type: 'json_schema', schema: ROOTS_SAFETY_SCHEMA } },
      messages: [{
        role: 'user',
        content: `Review this Roots article against its rules and vetted facts. Flag every:
- overstated_evidence: a vetted fact stated more strongly than its evidence level (e.g. a hypothesis stated as fact, an association stated as cause)
- unvetted_population_fact: a population-specific number, prevalence, or historical claim that is not in the vetted facts
- dose_or_medication: any supplement or drug recommendation, or any dose
- diagnosis_or_target: language implying the reader has a condition, or a personal numeric target
- stereotype_or_fatalism: ranking groups, ancestry treated as destiny, or ancestry used as a stand-in for behavior
Return an empty list if there are none. Quote the exact sentence.

${rootsFactsBlock()}

ARTICLE:
${post.title}

${text}`,
      }],
    })
    const out = response.content.find(b => b.type === 'text')?.text
    flags.push(...JSON.parse(out).flags)
    return { ran: true, flags }
  } catch (err) {
    console.log(`  Safety review failed: ${err.message}`)
    return { ran: false, flags }
  }
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
