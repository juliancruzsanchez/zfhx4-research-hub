import { Timestamp } from "firebase-admin/firestore";

/* ─── Paper ─────────────────────────────────────────────────────────────────── */

export type PaperStatus = "pending" | "published" | "archived";

export type PaperType = "Core study" | "Clinical context" | "Related biology" | "Review";

export type PaperSource = "PubMed" | "PMC" | "medRxiv" | "Crossref" | "Other";

export interface PaperData {
  title: string;
  authors: string;
  journal: string;
  year: string;
  type: PaperType;
  summary: string;
  keyFindings: string[];
  tags: string[];
  symptomsIdentified: string[];
  participants: string;
  link: string;
  pdfLink: string;
  source: PaperSource;
  openAccess: boolean;
  status: PaperStatus;
  pmid?: string;
  doi?: string;
  discoveredAt: Timestamp;
  approvedAt?: Timestamp;
  rejectedAt?: Timestamp;
}

export interface PaperDoc extends PaperData {
  id: string;
}

/* ─── Site content ──────────────────────────────────────────────────────────── */

export interface Highlight {
  title: string;
  body: string;
  icon: string;
}

export interface Stat {
  stat: string;
  label: string;
  detail: string;
}

export interface SiteContentData {
  currentUnderstanding: string;
  highlights: Highlight[];
  stats: Stat[];
  lastSynthesizedAt: Timestamp | null;
  lastRefreshAt: Timestamp | null;
  publishedPaperCount: number;
}
