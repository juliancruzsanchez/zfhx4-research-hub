import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import {
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";

import { firestore, firebaseStorage } from "@/lib/firebase";

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
  const documentsQuery = query(
    collection(firestore, "documents"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  return onSnapshot(documentsQuery, (snapshot) => {
    onChange(
      snapshot.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<ResearchDocument, "id">),
      })),
    );
  });
}

export function subscribeToChat(
  userId: string,
  documentId: string,
  onChange: (messages: DocumentChatMessage[]) => void,
): Unsubscribe {
  const messagesQuery = query(
    collection(firestore, "documents", documentId, "messages"),
    where("userId", "==", userId),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(messagesQuery, (snapshot) => {
    onChange(
      snapshot.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<DocumentChatMessage, "id">),
      })),
    );
  });
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
  const reportsQuery = query(
    collection(firestore, "symptomReports"),
    where("userId", "==", userId),
    orderBy("date", "desc"),
  );
  return onSnapshot(reportsQuery, (snapshot) => {
    onChange(
      snapshot.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<SymptomReport, "id">),
      })),
    );
  });
}
