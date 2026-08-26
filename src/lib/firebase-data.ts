import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { firestore, firebaseStorage } from "@/lib/firebase";

/* ─── Public research data ──────────────────────────────────────────────────── */

export type PaperStatus = "pending" | "published" | "archived";

export interface PublicPaper {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  type: string;
  summary: string;
  keyFindings: string[];
  tags: string[];
  symptomsIdentified: string[];
  participants: string;
  link: string;
  pdfLink: string;
  source: string;
  openAccess: boolean;
  status: PaperStatus;
  pmid?: string;
  doi?: string;
  discoveredAt?: { seconds: number; nanoseconds: number };
  approvedAt?: { seconds: number; nanoseconds: number };
  rejectedAt?: { seconds: number; nanoseconds: number };
}

export interface SiteContent {
  currentUnderstanding: string;
  highlights: Array<{ title: string; body: string; icon: string }>;
  stats: Array<{ stat: string; label: string; detail: string }>;
  lastSynthesizedAt?: { seconds: number; nanoseconds: number } | null;
  lastRefreshAt?: { seconds: number; nanoseconds: number } | null;
  publishedPaperCount: number;
}

/** Subscribe to all published papers for the homepage.
 *  Uses a simple collection scan + client-side filter/sort to avoid
 *  requiring a Firestore composite index. */
export function subscribeToPublishedPapers(
  onChange: (papers: PublicPaper[]) => void,
): Unsubscribe {
  const q = collection(firestore, "papers");
  return onSnapshot(
    q,
    (snap) => {
      const papers = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<PublicPaper, "id">) }))
        .filter((p) => p.status === "published")
        .sort((a, b) => (b.year ?? "").localeCompare(a.year ?? ""));
      onChange(papers);
    },
    (err) => {
      console.error("subscribeToPublishedPapers error:", err);
      onChange([]);
    },
  );
}

/** Subscribe to all papers (for admin review). */
export function subscribeToAllPapers(
  onChange: (papers: PublicPaper[]) => void,
): Unsubscribe {
  const q = collection(firestore, "papers");
  return onSnapshot(
    q,
    (snap) => {
      const papers = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as Omit<PublicPaper, "id">) }))
        .sort((a, b) => (b.discoveredAt?.seconds ?? 0) - (a.discoveredAt?.seconds ?? 0));
      onChange(papers);
    },
    (err) => {
      console.error("subscribeToAllPapers error:", err);
      onChange([]);
    },
  );
}

/** Subscribe to site content (synthesis, highlights, stats). */
export function subscribeToSiteContent(
  onChange: (content: SiteContent | null) => void,
): Unsubscribe {
  return onSnapshot(
    doc(firestore, "siteContent", "main"),
    (snap) => {
      onChange(snap.exists() ? (snap.data() as SiteContent) : null);
    },
    (err) => {
      console.error("subscribeToSiteContent error:", err);
      onChange(null);
    },
  );
}

export type DocumentStatus = "uploading" | "processing" | "ready" | "error";

export interface ResearchDocument {
  id: string;
  userId: string;
  fileName: string;
  storagePath: string;
  downloadUrl?: string;
  status: DocumentStatus;
  createdAt?: { seconds: number };
  pageCount?: number;
  extractedTextPath?: string;
  findings?: DocumentFinding[];
  summary?: string;
  errorMessage?: string;
  researchConsent?: boolean;
  researchConsentAt?: { seconds: number };
}

export interface DocumentFinding {
  label: string;
  finding: string;
  evidence: string;
  confidence: "high" | "medium" | "low";
}

export interface DocumentChatMessage {
  id: string;
  documentId: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: { seconds: number };
}

export interface SymptomReport {
  id: string;
  userId: string;
  date: string;
  symptoms: string;
  impact?: string;
  notes?: string;
  createdAt?: { seconds: number };
}

export async function createDocument(userId: string, file: File, researchConsent: boolean) {
  const documentRef = await addDoc(collection(firestore, "documents"), {
    userId,
    fileName: file.name,
    storagePath: "",
    status: "uploading" satisfies DocumentStatus,
    researchConsent,
    ...(researchConsent ? { researchConsentAt: serverTimestamp() } : {}),
    createdAt: serverTimestamp(),
  });
  const storagePath = `users/${userId}/documents/${documentRef.id}.pdf`;
  const storageRef = ref(firebaseStorage, storagePath);
  await uploadBytes(storageRef, file, { contentType: "application/pdf" });
  const downloadUrl = await getDownloadURL(storageRef);
  await updateDoc(documentRef, {
    storagePath,
    downloadUrl,
    status: "processing" satisfies DocumentStatus,
  });
  return documentRef.id;
}

export function subscribeToDocuments(
  userId: string,
  onChange: (documents: ResearchDocument[]) => void,
): Unsubscribe {
  const documentsQuery = collection(firestore, "documents");
  return onSnapshot(
    documentsQuery,
    (snapshot) => {
      const docs = snapshot.docs
        .map((item) => ({ id: item.id, ...(item.data() as Omit<ResearchDocument, "id">) }))
        .filter((d) => d.userId === userId)
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      onChange(docs);
    },
    (err) => {
      console.error("subscribeToDocuments error:", err);
      onChange([]);
    },
  );
}

export function subscribeToChat(
  userId: string,
  documentId: string,
  onChange: (messages: DocumentChatMessage[]) => void,
): Unsubscribe {
  const messagesQuery = collection(firestore, "documents", documentId, "messages");
  return onSnapshot(
    messagesQuery,
    (snapshot) => {
      const msgs = snapshot.docs
        .map((item) => ({ id: item.id, ...(item.data() as Omit<DocumentChatMessage, "id">) }))
        .filter((m) => m.userId === userId)
        .sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0));
      onChange(msgs);
    },
    (err) => {
      console.error("subscribeToChat error:", err);
      onChange([]);
    },
  );
}

export async function createSymptomReport(
  userId: string,
  report: Omit<SymptomReport, "id" | "userId" | "createdAt">,
) {
  await addDoc(collection(firestore, "symptomReports"), {
    ...report,
    userId,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToSymptomReports(
  userId: string,
  onChange: (reports: SymptomReport[]) => void,
): Unsubscribe {
  const reportsQuery = collection(firestore, "symptomReports");
  return onSnapshot(
    reportsQuery,
    (snapshot) => {
      const reports = snapshot.docs
        .map((item) => ({ id: item.id, ...(item.data() as Omit<SymptomReport, "id">) }))
        .filter((r) => r.userId === userId)
        .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
      onChange(reports);
    },
    (err) => {
      console.error("subscribeToSymptomReports error:", err);
      onChange([]);
    },
  );
}
