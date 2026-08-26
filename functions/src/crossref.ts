/* ─── Crossref search helper ─────────────────────────────────────────────────── */
/* Crossref indexes metadata for millions of journal articles, including major   */
/* medical journals (NEJM, Lancet, JAMA, AJHG, EJHG, AJMG, etc.). No API key.   */

const CROSSREF = "https://api.crossref.org/works";

export interface CrossrefResult {
  title: string;
  authors: string;
  journal: string;
  year: string;
  doi: string;
  url: string;
  abstract: string;
}

interface CrossrefWork {
  title?: string[];
  "container-title"?: string[];
  author?: Array<{ family?: string; given?: string }>;
  issued?: { "date-parts"?: Array<Array<number | null>> };
  DOI?: string;
  URL?: string;
  abstract?: string;
  publisher?: string;
}

/**
 * Search Crossref for ZFHX4-related papers in medical journals.
 * Returns up to `maxResults` results sorted by most recently published.
 */
export async function searchCrossref(
  query = "ZFHX4",
  maxResults = 20,
): Promise<CrossrefResult[]> {
  const params = new URLSearchParams({
    "query.bibliographic": query,
    rows: String(maxResults),
    select: "title,container-title,author,issued,DOI,URL,abstract,publisher",
    sort: "published",
    order: "desc",
    mailto: "research@zfhx4hub.example",
  });

  const res = await fetch(`${CROSSREF}?${params}`, {
    headers: {
      "User-Agent": "ZFHX4ResearchHub/1.0 (mailto:research@zfhx4hub.example)",
    },
  });

  if (!res.ok) {
    throw new Error(`Crossref search failed: ${res.status}`);
  }

  const data = (await res.json()) as {
    message?: { items?: CrossrefWork[] };
  };

  const items = data.message?.items ?? [];

  return items
    .map((item): CrossrefResult | null => {
      const title = Array.isArray(item.title) && item.title.length > 0
        ? stripTags(item.title[0])
        : "";
      if (!title) return null;

      const journalArr = item["container-title"];
      const journal = Array.isArray(journalArr) && journalArr.length > 0
        ? stripTags(journalArr[0])
        : "";

      const yearParts = item.issued?.["date-parts"]?.[0] ?? [];
      const year = yearParts[0] ? String(yearParts[0]) : "";

      const authorList = Array.isArray(item.author) ? item.author : [];
      const authorNames = authorList
        .map((a) => {
          const family = a.family ?? "";
          const given = a.given ?? "";
          const initials = given
            .split(/\s+/)
            .map((part) => part[0] ?? "")
            .join("");
          return family ? `${family} ${initials}`.trim() : "";
        })
        .filter(Boolean);
      const authors =
        authorNames.length > 3
          ? `${authorNames[0]}, ${authorNames[1]}, ${authorNames[2]} et al.`
          : authorNames.join(", ") || "Unknown";

      const doi = item.DOI ?? "";
      const url = item.URL ?? (doi ? `https://doi.org/${doi}` : "");
      const abstract = stripTags(item.abstract ?? "").replace(/<[^>]+>/g, " ").trim();

      return {
        title,
        authors,
        journal,
        year,
        doi,
        url,
        abstract,
      };
    })
    .filter((r): r is CrossrefResult => r !== null);
}

function stripTags(text: string): string {
  return text
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}
