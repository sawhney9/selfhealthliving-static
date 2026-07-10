// Resolves every PubMed citation in a draft against the NCBI E-utilities API.
//
// The model cannot check its own citations: it emits a plausible 8-digit PMID and
// the URL resolves, so a wrong paper is indistinguishable from a right one by eye.
// A published post cited PMID 32266987 (a COVID corticosteroid paper) as evidence
// for a grip-strength/cognition claim. Hence this file.

const EFETCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'
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

const tag = (xml, name) =>
  [...xml.matchAll(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'g'))]
    .map(m => m[1].replace(/<[^>]+>/g, ' ').trim())

// Titles alone are not enough to judge relevance. The Lancet fibre meta-analysis
// is titled "Carbohydrate quality and human health" and never says "fiber", so a
// title-only match strips it as unrelated. Score against the abstract too.
async function lookup(pmids) {
  if (!pmids.length) return {}
  const url = `${EFETCH}?db=pubmed&retmode=xml&id=${pmids.join(',')}`
  const res = await fetch(url, { headers: { 'User-Agent': 'selfhealthliving-agent' } })
  if (!res.ok) throw new Error(`NCBI efetch returned ${res.status}`)
  const xml = await res.text()

  const records = {}
  for (const article of xml.split('</PubmedArticle>')) {
    const pmid = article.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1]
    if (!pmid) continue
    const title = tag(article, 'ArticleTitle')[0]
    if (!title) continue
    records[pmid] = {
      title,
      journal: tag(article, 'ISOAbbreviation')[0] || tag(article, 'Title')[0] || '',
      year: article.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/)?.[1] || '',
      // Abstract sections and author keywords carry the subject terms a title omits.
      haystack: [
        title,
        ...tag(article, 'AbstractText'),
        ...tag(article, 'Keyword'),
      ].join(' '),
    }
  }
  return records
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
    if (!rec) {
      c.status = 'not_found'
      c.detail = 'No PubMed record for this PMID'
      content = content.replaceAll(c.raw, c.linkText) // strip the fabricated link
      continue
    }

    c.title = rec.title.replace(/\.$/, '')
    c.journal = rec.journal
    c.year = rec.year

    const paper = terms(rec.haystack)
    const shared = new Set(
      [...terms(c.claim), ...titleTerms].filter(t => paper.has(t))
    )
    c.shared = [...shared]

    if (shared.size === 0) {
      c.status = 'mismatch'
      c.detail = 'Paper shares no subject terms with the claim or the article'
      content = content.replaceAll(c.raw, c.linkText)
    } else if (shared.size === 1) {
      c.status = 'weak'
      c.detail = `Only one shared term (${c.shared[0]})`
    } else {
      c.status = 'verified'
      c.detail = `${shared.size} shared terms: ${c.shared.slice(0, 4).join(', ')}`
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
