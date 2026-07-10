// Resolves every PubMed citation in a draft against the NCBI E-utilities API.
//
// The model cannot check its own citations: it emits a plausible 8-digit PMID and
// the URL resolves, so a wrong paper is indistinguishable from a right one by eye.
// A published post cited PMID 32266987 (a COVID corticosteroid paper) as evidence
// for a grip-strength/cognition claim. Hence this file.

const ESUMMARY = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi'
const PMID_LINK = /\[([^\]]*)\]\(https:\/\/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)\/?\)/g

const STOPWORDS = new Set([
  'about', 'after', 'against', 'among', 'analysis', 'associated', 'association',
  'associations', 'been', 'being', 'between', 'both', 'cohort', 'consortium',
  'does', 'during', 'effect', 'effects', 'estimates', 'findings', 'from',
  'have', 'into', 'more', 'most', 'over', 'patients', 'people', 'prospective',
  'randomised', 'randomized', 'review', 'studies', 'study', 'systematic',
  'that', 'their', 'them', 'these', 'this', 'those', 'through', 'trial',
  'used', 'using', 'value', 'were', 'what', 'when', 'which', 'with', 'your',
])

const terms = text =>
  new Set(
    (text.toLowerCase().match(/[a-z][a-z-]{3,}/g) || []).filter(w => !STOPWORDS.has(w))
  )

// The sentence a citation sits in is the claim it is meant to support.
function claimFor(markdown, linkEnd) {
  const before = markdown.slice(0, linkEnd)
  const start = Math.max(
    before.lastIndexOf('. '), before.lastIndexOf('\n'), before.lastIndexOf('**')
  )
  return before.slice(start + 1).replace(/[*_#[\]]/g, ' ')
}

export function extractCitations(markdown) {
  const found = []
  for (const m of markdown.matchAll(PMID_LINK)) {
    found.push({
      pmid: m[2],
      linkText: m[1],
      claim: claimFor(markdown, m.index),
      raw: m[0],
    })
  }
  return found
}

async function lookup(pmids) {
  if (!pmids.length) return {}
  const url = `${ESUMMARY}?db=pubmed&retmode=json&id=${pmids.join(',')}`
  const res = await fetch(url, { headers: { 'User-Agent': 'selfhealthliving-agent' } })
  if (!res.ok) throw new Error(`NCBI esummary returned ${res.status}`)
  const { result } = await res.json()
  return result || {}
}

/**
 * @returns {{citations: Array, ok: boolean, content: string}}
 *   Citations that do not resolve, or that resolve to an unrelated paper, are
 *   demoted to plain text: a bad link lends false authority to the sentence it
 *   sits in. The sentence survives so the editor can judge the claim itself,
 *   and every demotion is reported in the review email.
 */
export async function verifyCitations(markdown, postTitle = '') {
  const citations = extractCitations(markdown)
  if (!citations.length) return { citations: [], ok: true, content: markdown }

  const records = await lookup([...new Set(citations.map(c => c.pmid))])
  const titleTerms = terms(postTitle)
  let content = markdown

  for (const c of citations) {
    const rec = records[c.pmid]
    if (!rec || rec.error || !rec.title) {
      c.status = 'not_found'
      c.detail = 'No PubMed record for this PMID'
      content = content.replaceAll(c.raw, c.linkText) // strip the fabricated link
      continue
    }

    c.title = rec.title.replace(/\.$/, '')
    c.journal = rec.source
    c.year = (rec.pubdate || '').split(' ')[0]

    const paper = terms(c.title)
    const overlap = [...terms(c.claim)].filter(t => paper.has(t))
    const topical = [...titleTerms].filter(t => paper.has(t))
    const score = new Set([...overlap, ...topical]).size

    if (score === 0) {
      c.status = 'mismatch'
      c.detail = 'Cited paper shares no subject terms with the claim'
      content = content.replaceAll(c.raw, c.linkText)
    } else if (score === 1) {
      c.status = 'weak'
      c.detail = `Only one shared term (${[...new Set([...overlap, ...topical])][0]})`
    } else {
      c.status = 'verified'
      c.detail = `${score} shared subject terms`
    }
  }

  const ok = citations.every(c => c.status === 'verified' || c.status === 'weak')
  return { citations, ok, content }
}

export function summarize(citations) {
  const icon = { verified: 'ok  ', weak: 'weak', mismatch: 'BAD ', not_found: 'GONE' }
  return citations
    .map(c => `    [${icon[c.status]}] ${c.pmid}  ${c.title || c.detail}`)
    .join('\n')
}
