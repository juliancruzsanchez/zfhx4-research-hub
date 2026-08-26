import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";

import { searchPubMed, type PubMedSearchResult } from "./pubmed.js";
import { searchCrossref, type CrossrefResult } from "./crossref.js";
import type { PaperData } from "./types.js";

const PAPERS = "papers" as const;
const SITE_CONTENT = "siteContent" as const;
const MAIN_DOC = "main" as const;

export const EXTRACT_PROMPT = `You are given a list of research paper records (title, authors, journal, year, abstract, source). For EACH paper, extract the following in JSON. Return ONLY a JSON array — no markdown, no explanation.

For each paper return:
{
  "id": "the exact id field from the input (PMID or DOI)",
  "title": "full paper title",
  "authors": "formatted author string (e.g. Baca et al.)",
  "journal": "journal name",
  "year": "publication year",
  "type": one of "Core study" | "Clinical context" | "Related biology" | "Review",
  "summary": "2-3 sentence plain-language summary",
  "keyFindings": ["finding 1", "finding 2", ...],
  "tags": ["genetics", "neurodevelopment", ...],
  "symptomsIdentified": ["developmental delay", "intellectual disability", ...],
  "participants": "description of study population (e.g. '57 individuals') or 'Not specified'",
  "openAccess": true/false
}

Classification guide:
- "Core study": Original research on ZFHX4 loss of function (cohort studies, case series, functional experiments)
- "Clinical context": Case reports or clinical descriptions of ZFHX4 variants
- "Related biology": Research on ZFHX4 in model organisms or related pathways
- "Review": Review articles summarizing existing ZFHX4 research

Papers:`;

interface Candidate {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  abstract: string;
  source: "PubMed" | "PMC" | "Crossref";
  link: string;
  pdfLink: string;
  pmid?: string;
  doi?: string;
  openAccessHint: boolean;
}

/**
 * Search PubMed AND medical journals via Crossref, merge and dedupe results.
 */
export async function discoverCandidates(): Promise<Candidate[]> {
  const [pubmedResults, crossrefResults] = await Promise.allSettled([
    searchPubMed("ZFHX4 loss of function OR ZFHX4 neurodevelopmental", 25),
    searchCrossref("ZFHX4", 25),
  ]);

  const pubmed: PubMedSearchResult[] =
    pubmedResults.status === "fulfilled" ? pubmedResults.value : [];
  const crossref: CrossrefResult[] =
    crossrefResults.status === "fulfilled" ? crossrefResults.value : [];

  console.log(
    `Discovery: ${pubmed.length} PubMed results, ${crossref.length} Crossref results.`,
  );

  const candidates: Candidate[] = [];
  const seenKeys = new Set<string>();

  // PubMed first (has abstracts)
  for (const r of pubmed) {
    const key = `pmid:${r.pmid}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    candidates.push({
      id: r.pmid,
      title: r.title,
      authors: r.authors,
      journal: r.journal,
      year: r.year,
      abstract: r.abstract,
      source: r.pmcLink ? "PMC" : "PubMed",
      link: r.pubmedLink,
      pdfLink: r.pmcLink,
      pmid: r.pmid,
      openAccessHint: Boolean(r.pmcLink),
    });
  }

  // Crossref (medical journals) — skip items already matched by DOI or title
  for (const r of crossref) {
    if (!r.title) continue;
    const key = r.doi ? `doi:${r.doi}` : `title:${normalizeTitle(r.title)}`;
    if (seenKeys.has(key)) continue;

    const titleMatch = candidates.some(
      (c) => normalizeTitle(c.title) === normalizeTitle(r.title),
    );
    if (titleMatch) continue;

    seenKeys.add(key);
    candidates.push({
      id: r.doi || normalizeTitle(r.title),
      title: r.title,
      authors: r.authors,
      journal: r.journal,
      year: r.year,
      abstract: r.abstract,
      source: "Crossref",
      link: r.url,
      pdfLink: "",
      doi: r.doi,
      openAccessHint: false,
    });
  }

  return candidates;
}

/**
 * Extract structured paper data with Groq and save new papers as pending.
 * Returns the number of new papers saved.
 */
export async function extractAndSaveCandidates(
  candidates: Candidate[],
): Promise<{ saved: number; skipped: number }> {
  if (candidates.length === 0) return { saved: 0, skipped: 0 };

  const db = getFirestore();
  const contentRef = db.collection(SITE_CONTENT).doc(MAIN_DOC);

  // Which papers do we already have?
  const existingSnap = await db.collection(PAPERS).select("pmid", "doi", "title").get();
  const existingPmids = new Set<string>();
  const existingDois = new Set<string>();
  const existingTitles = new Set<string>();
  for (const d of existingSnap.docs) {
    const data = d.data() as PaperData;
    if (data.pmid) existingPmids.add(data.pmid);
    if (data.doi) existingDois.add(data.doi.toLowerCase());
    if (data.title) existingTitles.add(normalizeTitle(data.title));
  }

  const newCandidates = candidates.filter((c) => {
    if (c.pmid && existingPmids.has(c.pmid)) return false;
    if (c.doi && existingDois.has(c.doi.toLowerCase())) return false;
    if (existingTitles.has(normalizeTitle(c.title))) return false;
    return true;
  });

  if (newCandidates.length === 0) {
    // Still update lastRefreshAt so the weekly check passes
    await contentRef.set({ lastRefreshAt: Timestamp.now() }, { merge: true });
    return { saved: 0, skipped: candidates.length };
  }

  const inputText = newCandidates
    .map(
      (r) =>
        `ID: ${r.id}\nTitle: ${r.title}\nAuthors: ${r.authors}\nJournal: ${r.journal}\nYear: ${r.year}\nSource: ${r.source}\nAbstract: ${r.abstract || "No abstract available"}\nLink: ${r.link}`,
    )
    .join("\n\n---\n\n");

  const extraction = await callGroq(
    [
      { role: "system", content: "You are a biomedical research analyst. Return valid JSON only." },
      { role: "user", content: `${EXTRACT_PROMPT}\n\n${inputText}` },
    ],
    0.2,
    4096,
  );

  const cleaned = extraction.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  let extracted: Array<Record<string, unknown>>;
  try {
    extracted = JSON.parse(cleaned) as Array<Record<string, unknown>>;
  } catch {
    console.error("Failed to parse Groq extraction:", cleaned.slice(0, 500));
    throw new HttpsError("internal", "Failed to parse AI extraction. Please try again.");
  }

  const batch = db.batch();
  const now = Timestamp.now();

  for (const item of extracted) {
    const id = String(item.id ?? "").trim();
    const candidate = newCandidates.find(
      (c) => c.id === id || c.pmid === id || c.doi === id,
    );
    if (!candidate) continue;

    const paperData: PaperData = {
      title: String(item.title ?? candidate.title),
      authors: String(item.authors ?? candidate.authors),
      journal: String(item.journal ?? candidate.journal),
      year: String(item.year ?? candidate.year),
      type: (item.type as PaperData["type"]) ?? "Core study",
      summary: String(item.summary ?? ""),
      keyFindings: Array.isArray(item.keyFindings) ? item.keyFindings.map(String) : [],
      tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
      symptomsIdentified: Array.isArray(item.symptomsIdentified) ? item.symptomsIdentified.map(String) : [],
      participants: String(item.participants ?? "Not specified"),
      link: candidate.link,
      pdfLink: candidate.pdfLink,
      source: candidate.source,
      openAccess: Boolean(item.openAccess) || candidate.openAccessHint,
      status: "pending",
      pmid: candidate.pmid,
      doi: candidate.doi,
      discoveredAt: now,
    };

    const ref = db.collection(PAPERS).doc();
    batch.set(ref, paperData);
  }

  batch.set(contentRef, { lastRefreshAt: now }, { merge: true });
  await batch.commit();

  return { saved: extracted.length, skipped: candidates.length - extracted.length };
}

async function callGroq(
  messages: Array<{ role: string; content: string }>,
  temperature: number,
  maxTokens: number,
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new HttpsError("failed-precondition", "GROQ_API_KEY is not configured.");
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Groq error:", res.status, err);
    throw new HttpsError("internal", `AI service error: ${res.status}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  return data.choices[0]?.message?.content ?? "";
}

function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
