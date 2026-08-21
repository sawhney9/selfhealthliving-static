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

const FUEL_GUIDANCE = `RECIPES

Flavor is not a garnish on top of the nutrition, it is the reason the recipe gets cooked twice. A healthy dish nobody wants to eat again has failed, whatever its macros say. Write the recipe you would actually make on a Tuesday.

The nutritional north star is the Mediterranean pattern: olive oil as the default fat, legumes and vegetables doing the heavy lifting, plenty of fish, whole grains over refined, herbs and acid instead of heavy sauces, and very little red meat. This is the "why" behind the protein rules below. It is a pattern, not a cuisine, so a South Asian dal, a Levantine mezze, and a Japanese fish bowl all fit it as naturally as a Greek plate does. When a traditional recipe leans on ghee or butter, note where olive oil works instead, without pretending the dish becomes something it is not.

Cook from a real culinary tradition rather than the generic wellness bowl. Lean South Asian more often than any other cuisine, because it does high-protein vegetarian better than almost anything and this audience loves it: chilla, dal, chana masala, rajma, paneer dishes, dosa, sabzi, chaat, raita-based bowls. Still rotate the rest so it never feels like one note: Japanese, Korean, Thai, Vietnamese, Sichuan, Mexican, Levantine, Persian, Ethiopian, Southern Italian. Name the dish honestly. If it is a chilla, call it a chilla.

Build flavor with technique, not fat and sugar:
bloom whole spices in hot fat (tadka) before they hit the pan;
brown the aromatics properly instead of sweating them pale;
lean on fermented depth (miso, gochujang, doubanjiang, fish sauce, tamarind, preserved lemon, anchovy);
finish with acid and a raw herb, which is what makes a dish taste finished;
toast, char, and sear where a lesser recipe would boil.

Protein is a flavor problem as much as a nutrition one. Cottage cheese, Greek yogurt, paneer, tofu, tempeh, lentils, and dal all carry spice well. Blended cottage cheese is a legitimate creamy base and belongs in more places than people expect. Say what a swap does to the texture, not just to the protein count.

Default to vegetarian protein and prove it can hit real numbers: dal, chana, rajma, paneer, tofu, tempeh, lentils, cottage cheese, Greek yogurt, eggs. Most recipes should be meatless. Reach for fish or poultry maybe one recipe in three, when the dish genuinely wants it (a miso cod, a chicken chaat), and favor fish. Red meat rarely, a few times a year at most, and only when it is the entire point of the dish. Never add meat just to raise a protein number that a plant, a legume, or a dairy protein could hit on its own.

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
