/* ─── PubMed E-utilities helper ──────────────────────────────────────────────── */
/* Free API, no auth required. Rate limit: 3 req/sec without API key.           */

const ESEARCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
const EFETCH = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi";

interface ESearchResult {
  esearchresult: {
    idlist: string[];
    count: string;
  };
}

interface PubmedArticle {
  PubmedArticle: {
    MedlineCitation: {
      PMID: { _: string };
      Article: {
        ArticleTitle: string | { _: string };
        Abstract?: {
          AbstractText: Array<{ _: string } | string>;
        };
        Journal: {
          Title: string;
          JournalIssue?: {
            PubDate?: {
              Year?: string;
            };
          };
        };
        AuthorList?: {
          Author: Array<{
            LastName?: string;
            Initials?: string;
            ForeName?: string;
          }>;
        };
      };
    };
    PubmedData?: {
      ArticleIdList?: Array<{
        _: string;
        $: { IdType: string };
      }>;
    };
  };
}

export interface PubMedSearchResult {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  abstract: string;
  pmcLink: string;
  pubmedLink: string;
}

/**
 * Search PubMed for ZFHX4-related papers and return structured results.
 */
export async function searchPubMed(
  query = "ZFHX4 loss of function",
  maxResults = 20,
): Promise<PubMedSearchResult[]> {
  // Step 1: Search for PMIDs
  const searchParams = new URLSearchParams({
    db: "pubmed",
    term: query,
    retmax: String(maxResults),
    retmode: "json",
    sort: "date",
  });

  const searchRes = await fetch(`${ESEARCH}?${searchParams}`);
  if (!searchRes.ok) {
    throw new Error(`PubMed search failed: ${searchRes.status}`);
  }

  const searchData = (await searchRes.json()) as ESearchResult;
  const ids = searchData.esearchresult?.idlist;
  if (!ids || ids.length === 0) return [];

  // Step 2: Fetch details for those PMIDs
  const fetchParams = new URLSearchParams({
    db: "pubmed",
    id: ids.join(","),
    rettype: "xml",
    retmode: "xml",
  });

  const fetchRes = await fetch(`${EFETCH}?${fetchParams}`);
  if (!fetchRes.ok) {
    throw new Error(`PubMed fetch failed: ${fetchRes.status}`);
  }

  const xml = await fetchRes.text();
  return parsePubMedXML(xml);
}

/**
 * Fetch abstract for a single PMID.
 */
export async function fetchPubMedAbstract(pmid: string): Promise<PubMedSearchResult | null> {
  const results = await searchPubMed(`PMID:${pmid}`, 1);
  return results[0] ?? null;
}

/* ─── XML parsing (lightweight, no deps) ────────────────────────────────────── */

function parsePubMedXML(xml: string): PubMedSearchResult[] {
  const results: PubMedSearchResult[] = [];
  const articles = xml.split("<PubmedArticle>").slice(1);

  for (const article of articles) {
    try {
      const pmid = extractTag(article, "PMID");
      if (!pmid) continue;

      const title = cleanText(
        extractTag(article, "ArticleTitle") ?? "",
      );
      const journal = extractTag(article, "Title") ?? "";
      const year =
        extractTag(article, "Year") ?? extractTag(article, "MedlineDate")?.slice(0, 4) ?? "";

      // Authors
      const authorBlocks = article.split("<Author").slice(1);
      const authorNames = authorBlocks
        .map((block) => {
          const last = extractTag(block, "LastName") ?? "";
          const initials = extractTag(block, "Initials") ?? "";
          return last ? `${last} ${initials}`.trim() : "";
        })
        .filter(Boolean);
      const authors =
        authorNames.length > 3
          ? `${authorNames[0]}, ${authorNames[1]}, ${authorNames[2]} et al.`
          : authorNames.join(", ");

      // Abstract
      const abstractSection = article.split("<Abstract>")[1]?.split("</Abstract>")[0] ?? "";
      const abstractParts = abstractSection
        .split(/<(?:AbstractText|ArticleAbstract)/)
        .slice(1)
        .map((part) => {
          const text = part.replace(/<[^>]+>/g, "").trim();
          return text;
        })
        .filter(Boolean);
      const abstract = abstractParts.join(" ") || cleanText(extractTag(article, "AbstractText") ?? "");

      // PMC link
      const pmcId = article.match(/IdType="pmc"[^>]*>([^<]+)</)?.[1];
      const pmcLink = pmcId ? `https://pmc.ncbi.nlm.nih.gov/articles/${pmcId}/` : "";
      const pubmedLink = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;

      results.push({
        pmid,
        title,
        authors,
        journal,
        year,
        abstract,
        pmcLink,
        pubmedLink,
      });
    } catch {
      // Skip malformed articles
    }
  }

  return results;
}

function extractTag(xml: string, tag: string): string | null {
  // Try to find <Tag ...>value</Tag> or <Tag>value</Tag>
  const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]*(?:<[^/][^<]*)*)</${tag}>`, "s"));
  if (match) return cleanText(match[1]);
  // Self-closing or empty
  const selfMatch = xml.match(new RegExp(`<${tag}[^/]*/>`));
  if (selfMatch) return "";
  return null;
}

function cleanText(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#\d+;/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
