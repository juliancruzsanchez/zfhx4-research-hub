import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { defineSecret } from "firebase-functions/params";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";

import type { PaperData, SiteContentData } from "./types.js";
import { discoverCandidates, extractAndSaveCandidates } from "./discovery.js";

/* ─── Init ──────────────────────────────────────────────────────────────────── */

initializeApp();
const db = getFirestore();

const GROQ_API_KEY = defineSecret("GROQ_API_KEY");
const PAPERS = "papers" as const;
const SITE_CONTENT = "siteContent" as const;
const MAIN_DOC = "main" as const;

/* ─── Groq helper ───────────────────────────────────────────────────────────── */

async function callGroq(
  messages: Array<{ role: string; content: string }>,
  temperature = 0.5,
  maxTokens = 1024,
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

/* ─── Existing: chatAboutResearch ───────────────────────────────────────────── */

const CHAT_SYSTEM = `You are a research assistant for a ZFHX4 Research Hub. Answer questions about published research on ZFHX4 loss of function. Be accurate, concise, and ground your answers in the evidence below. If unsure, say so and point to the relevant study.

## Guidelines
- Answer in 2-4 sentences unless asked for more detail.
- Cite studies as (Author et al., Year).
- If asked about treatment, note there is no specific cure and management is supportive.
- Do not provide medical advice or diagnoses.`;

export const chatAboutResearch = onCall(
  { memory: "256MiB", timeoutSeconds: 30, secrets: [GROQ_API_KEY] },
  async (request) => {
    const { message, history } = request.data as {
      message: string;
      history?: Array<{ role: string; content: string }>;
    };

    if (!message || typeof message !== "string" || !message.trim()) {
      throw new HttpsError("invalid-argument", "Please provide a question.");
    }

    // Fetch published papers for context
    const papersSnap = await db
      .collection(PAPERS)
      .where("status", "==", "published")
      .limit(20)
      .get();

    const paperContext = papersSnap.docs
      .map((doc) => {
        const p = doc.data() as PaperData;
        return `• ${p.authors} (${p.year}) — "${p.title}"\n  ${p.journal}. Findings: ${p.keyFindings.join("; ")}`;
      })
      .join("\n");

    const contentSnap = await db.collection(SITE_CONTENT).doc(MAIN_DOC).get();
    const synthesis = contentSnap.data()?.currentUnderstanding ?? "";

    const systemMsg = `${CHAT_SYSTEM}\n\n## Current published research\n${paperContext}\n\n## Synthesized understanding\n${synthesis}`;

    const msgs: Array<{ role: string; content: string }> = [
      { role: "system", content: systemMsg },
      ...(Array.isArray(history) ? history.slice(-6) : []),
      { role: "user", content: message.trim() },
    ];

    try {
      const answer = await callGroq(msgs, 0.5);
      return { answer };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      console.error("chatAboutResearch error:", error);
      throw new HttpsError("internal", "Failed to generate a response.");
    }
  },
);

/* ─── refreshPapers: search PubMed + medical journals, extract with Groq ─────── */

export const refreshPapers = onCall(
  { memory: "512MiB", timeoutSeconds: 120, secrets: [GROQ_API_KEY] },
  async () => {
    // Check last refresh — skip if < 7 days old (unless called manually)
    const contentRef = db.collection(SITE_CONTENT).doc(MAIN_DOC);
    const contentSnap = await contentRef.get();
    const lastRefresh = contentSnap.data()?.lastRefreshAt as Timestamp | undefined;
    if (lastRefresh) {
      const daysSince = (Date.now() - lastRefresh.toMillis()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        return { skipped: true, message: `Last refresh was ${Math.round(daysSince)} days ago. Refreshes run weekly.` };
      }
    }

    // 1. Discover candidates from PubMed + Crossref (medical journals)
    const candidates = await discoverCandidates();
    if (candidates.length === 0) {
      return { skipped: true, message: "No new results found on PubMed or medical journals." };
    }

    // 2. Extract with Groq + save pending
    const { saved, skipped } = await extractAndSaveCandidates(candidates);

    if (saved === 0) {
      return { skipped: false, newPapers: 0, message: "All papers already in database." };
    }

    return {
      skipped: false,
      newPapers: saved,
      message: `Found ${saved} new paper(s) from PubMed and medical journals. They are pending your review.`,
    };
  },
);

/* ─── publishPaper ──────────────────────────────────────────────────────────── */

export const publishPaper = onCall(
  { memory: "256MiB", timeoutSeconds: 30, secrets: [GROQ_API_KEY] },
  async (request) => {
    const { paperId } = request.data as { paperId: string };
    if (!paperId) throw new HttpsError("invalid-argument", "paperId is required.");

    const ref = db.collection(PAPERS).doc(paperId);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpsError("not-found", "Paper not found.");

    await ref.update({
      status: "published",
      approvedAt: Timestamp.now(),
    });

    // Auto-synthesize after publishing
    await runSynthesis();

    return { success: true };
  },
);

/* ─── archivePaper ──────────────────────────────────────────────────────────── */

export const archivePaper = onCall(
  { memory: "256MiB", timeoutSeconds: 30, secrets: [GROQ_API_KEY] },
  async (request) => {
    const { paperId } = request.data as { paperId: string };
    if (!paperId) throw new HttpsError("invalid-argument", "paperId is required.");

    const ref = db.collection(PAPERS).doc(paperId);
    const snap = await ref.get();
    if (!snap.exists) throw new HttpsError("not-found", "Paper not found.");

    await ref.update({
      status: "archived",
      rejectedAt: Timestamp.now(),
    });

    // Re-synthesize after archiving
    await runSynthesis();

    return { success: true };
  },
);

/* ─── synthesizeUnderstanding ───────────────────────────────────────────────── */

const SYNTHESIS_SYSTEM = `You are a biomedical research analyst creating a comprehensive synthesis of all published research on ZFHX4 loss of function. You will receive summaries and key findings from multiple papers. Your job:

1. Synthesize the current scientific understanding of ZFHX4 loss of function into a clear, authoritative summary (3-5 paragraphs).
2. Generate 4 highlight cards that capture the most important findings.
3. Generate updated stats for the hero section.

Return ONLY valid JSON:
{
  "understanding": "3-5 paragraph synthesis in plain language...",
  "highlights": [
    { "title": "Finding title", "body": "1-2 sentence explanation", "icon": "users" | "dna" | "search" | "file" }
  ],
  "stats": [
    { "stat": "number or label", "label": "description", "detail": "additional context" }
  ]
}

Guidelines:
- Be precise about what is established evidence vs preliminary findings.
- Use plain language accessible to non-specialists.
- Reference specific studies by author and year when citing.
- Do not provide medical advice.
- The total number of participants across all studies should be reflected in stats.
- Icons: "users" for people/cohort findings, "dna" for genetics/mechanism, "search" for methods/discovery, "file" for publications/timeline.`;

async function runSynthesis(): Promise<void> {
  const papersSnap = await db
    .collection(PAPERS)
    .where("status", "==", "published")
    .get();

  if (papersSnap.empty) return;

  const papers = papersSnap.docs.map((d) => d.data() as PaperData);

  const paperSummaries = papers
    .map(
      (p, i) =>
        `### ${i + 1}. ${p.authors} (${p.year}) — "${p.title}"\n` +
        `Journal: ${p.journal}\n` +
        `Participants: ${p.participants}\n` +
        `Type: ${p.type}\n` +
        `Summary: ${p.summary}\n` +
        `Key findings: ${p.keyFindings.join("; ")}\n` +
        `Symptoms identified: ${p.symptomsIdentified.join("; ") || "Not specified"}`,
    )
    .join("\n\n");

  const extraction = await callGroq(
    [
      { role: "system", content: SYNTHESIS_SYSTEM },
      {
        role: "user",
        content: `Here are all published papers on ZFHX4 loss of function. Please synthesize the current understanding and generate highlights and stats.\n\n${paperSummaries}`,
      },
    ],
    0.3,
    2048,
  );

  const cleaned = extraction.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  let result: {
    understanding?: string;
    highlights?: Array<{ title: string; body: string; icon: string }>;
    stats?: Array<{ stat: string; label: string; detail: string }>;
  };
  try {
    result = JSON.parse(cleaned) as typeof result;
  } catch {
    console.error("Failed to parse synthesis:", cleaned.slice(0, 500));
    // Graceful fallback — don't crash
    return;
  }

  // Compute total participants from all papers
  const totalParticipants = papers.reduce((sum, p) => {
    const match = p.participants.match(/(\d+)/);
    return sum + (match ? parseInt(match[1], 10) : 0);
  }, 0);

  const yearRange = papers
    .map((p) => parseInt(p.year, 10))
    .filter((y) => !isNaN(y));
  const minYear = yearRange.length > 0 ? Math.min(...yearRange) : 2021;
  const maxYear = yearRange.length > 0 ? Math.max(...yearRange) : 2025;

  const contentRef = db.collection(SITE_CONTENT).doc(MAIN_DOC);
  await contentRef.set(
    {
      currentUnderstanding: result.understanding ?? "",
      highlights: result.highlights ?? [],
      stats: result.stats ?? [
        { stat: String(totalParticipants || "—"), label: "people studied", detail: "across all published cohorts" },
        { stat: String(papers.length), label: "research papers", detail: `${minYear} – ${maxYear}` },
        { stat: "Active", label: "research area", detail: "ongoing studies" },
      ],
      lastSynthesizedAt: Timestamp.now(),
      publishedPaperCount: papers.length,
    },
    { merge: true },
  );
}

export const synthesizeUnderstanding = onCall(
  { memory: "512MiB", timeoutSeconds: 120, secrets: [GROQ_API_KEY] },
  async () => {
    await runSynthesis();
    return { success: true };
  },
);

/* ─── Scheduled weekly refresh ──────────────────────────────────────────────── */

export const weeklyPaperRefresh = onSchedule(
  {
    schedule: "every monday 08:00",
    timeZone: "America/New_York",
    memory: "512MiB",
    timeoutSeconds: 180,
    secrets: [GROQ_API_KEY],
  },
  async () => {
    console.log("Starting weekly paper refresh...");
    const contentRef = db.collection(SITE_CONTENT).doc(MAIN_DOC);
    const contentSnap = await contentRef.get();
    const lastRefresh = contentSnap.data()?.lastRefreshAt as Timestamp | undefined;

    if (lastRefresh) {
      const daysSince = (Date.now() - lastRefresh.toMillis()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) {
        console.log(`Skipping: last refresh was ${Math.round(daysSince)} days ago.`);
        return;
      }
    }

    // Discover from PubMed + medical journals
    const candidates = await discoverCandidates();
    if (candidates.length === 0) {
      console.log("No new candidates found.");
      return;
    }

    const { saved } = await extractAndSaveCandidates(candidates);
    console.log(`Weekly refresh: ${saved} new paper(s) saved as pending.`);
  },
);
