import { httpsCallable } from "firebase/functions";

import { firebaseFunctions } from "@/lib/firebase";
import type { DocumentFinding } from "@/lib/firebase-data";

interface AnalysisResponse {
  summary: string;
  findings: DocumentFinding[];
}

interface ChatResponse {
  answer: string;
}

interface ResearchChatResponse {
  answer: string;
}

export async function analyzeDocument(documentId: string) {
  const callable = httpsCallable<{ documentId: string }, AnalysisResponse>(
    firebaseFunctions,
    "analyzeDocument",
  );
  const result = await callable({ documentId });
  return result.data;
}

export async function chatWithDocument(documentId: string, question: string) {
  const callable = httpsCallable<
    { documentId: string; question: string },
    ChatResponse
  >(firebaseFunctions, "chatWithDocument");
  const result = await callable({ documentId, question });
  return result.data;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chatAboutResearch(
  message: string,
  history: ChatMessage[] = [],
) {
  const callable = httpsCallable<
    { message: string; history: ChatMessage[] },
    ResearchChatResponse
  >(firebaseFunctions, "chatAboutResearch");
  const result = await callable({ message, history });
  return result.data;
}

export async function synthesizeFindings(): Promise<string> {
  const callable = httpsCallable<
    Record<string, never>,
    { content: string }
  >(firebaseFunctions, "synthesizeFindings");
  const result = await callable({});
  return result.data.content;
}
