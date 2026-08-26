import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { onCall, HttpsError, type CallableRequest } from "firebase-functions/v2/https";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import { logger } from "firebase-functions";
import { defineSecret } from "firebase-functions/params";
import pdf from "pdf-parse";

initializeApp();
const db = getFirestore();
const groqModel = "llama-3.3-70b-versatile";
const groqApiKey = defineSecret("GROQ_API_KEY");

type Finding = {
  label: string;
  finding: string;
  evidence: string;
  confidence: "high" | "medium" | "low";
};

type Analysis = { summary: string; findings: Finding[] };

function requireUser(request: CallableRequest<unknown>) {
  const uid = request.auth?.uid;
  if (!uid) throw new HttpsError("unauthenticated", "Sign in to use document AI.");
  return uid;
}

async function groqJson(system: string, user: string) {
  const apiKey = groqApiKey.value();
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured.");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: groqModel,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!response.ok) throw new Error(`Groq request failed with ${response.status}.`);
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = payload.choices?.[0]?.message?.content;
  if (!content) throw new Error("Groq returned an empty response.");
  return JSON.parse(content) as Analysis;
}

async function groqText(system: string, user: string) {
  const apiKey = groqApiKey.value();
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured.");
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: groqModel,
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!response.ok) throw new Error(`Groq request failed with ${response.status}.`);
  const payload = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return payload.choices?.[0]?.message?.content ?? "I could not generate an answer from this document.";
}

async function getDocumentForUser(documentId: string, uid: string) {
  const document = await db.collection("documents").doc(documentId).get();
  if (!document.exists || document.data()?.userId !== uid) {
    throw new HttpsError("not-found", "Document not found.");
  }
  return { ref: document.ref, data: document.data() as { storagePath?: string; extractedText?: string; summary?: string; findings?: Finding[]; researchConsent?: boolean } };
}

async function extractAndAnalyze(documentId: string, uid: string, storagePath: string) {
  const documentRef = db.collection("documents").doc(documentId);
  try {
    await documentRef.update({ status: "processing", errorMessage: FieldValue.delete() });
    const bucket = getStorage().bucket();
    const [buffer] = await bucket.file(storagePath).download();
    const parsed = await pdf(buffer);
    const text = parsed.text.slice(0, 120000);
    const analysis = await groqJson(
      "You analyze medical record exports for a patient-facing research organizer. Do not diagnose, recommend treatment, or invent facts. Use only the supplied text. Return JSON with a concise plain-language summary and findings array. Each finding needs label, finding, evidence, and confidence (high, medium, or low). Clearly mark uncertainty.",
      `This is a ZFHX4 Research Hub document uploaded by a customer. Extract useful, non-diagnostic findings from this medical record. Focus on diagnoses or noted concerns, developmental or functional observations, genetic test language, dates, and follow-up questions a patient may want to discuss with a clinician.\n\nDOCUMENT TEXT:\n${text}`,
    );
    await documentRef.update({ status: "ready", extractedText: text, summary: analysis.summary, findings: analysis.findings, pageCount: parsed.numpages ?? null, analyzedAt: FieldValue.serverTimestamp() });
    logger.info("Document analyzed", { documentId, uid });
  } catch (error) {
    logger.error("Document analysis failed", { documentId, error });
    await documentRef.update({ status: "error", errorMessage: "Automatic analysis failed. Please try again later." });
  }
}

export const analyzeDocument = onCall({ region: "us-central1", timeoutSeconds: 300, memory: "1GiB", secrets: [groqApiKey] }, async (request) => {
  const uid = requireUser(request);
  const documentId = String((request.data as { documentId?: unknown })?.documentId ?? "");
  if (!documentId) throw new HttpsError("invalid-argument", "documentId is required.");
  const { data } = await getDocumentForUser(documentId, uid);
  if (!data.storagePath) throw new HttpsError("failed-precondition", "The document upload is not ready.");
  await extractAndAnalyze(documentId, uid, data.storagePath);
  return { ok: true };
});

export const chatWithDocument = onCall({ region: "us-central1", timeoutSeconds: 120, secrets: [groqApiKey] }, async (request) => {
  const uid = requireUser(request);
  const body = request.data as { documentId?: unknown; question?: unknown };
  const documentId = String(body?.documentId ?? "");
  const question = String(body?.question ?? "").trim();
  if (!documentId || !question) throw new HttpsError("invalid-argument", "documentId and question are required.");
  const { data } = await getDocumentForUser(documentId, uid);
  if (!data.extractedText) throw new HttpsError("failed-precondition", "This document is still being processed.");
  const messagesRef = db.collection("documents").doc(documentId).collection("messages");
  await messagesRef.add({ userId: uid, role: "user", content: question, createdAt: FieldValue.serverTimestamp() });
  try {
    const answer = await groqText(
      "You are a careful document question-answering assistant for a ZFHX4 Research Hub customer. Answer only from the supplied document. Say when the document does not contain the answer. Use plain language, distinguish reported facts from interpretation, and never diagnose or give treatment instructions.",
      `DOCUMENT:\n${data.extractedText.slice(0, 120000)}\n\nQUESTION:\n${question}`,
    );
    await messagesRef.add({ userId: uid, role: "assistant", content: answer, createdAt: FieldValue.serverTimestamp() });
    return { answer };
  } catch (error) {
    logger.error("Document chat failed", { documentId, error });
    throw new HttpsError("internal", "The document assistant could not answer this question.");
  }
});

export const extractUploadedPdf = onObjectFinalized({ region: "us-central1", timeoutSeconds: 300, memory: "1GiB", secrets: [groqApiKey] }, async (event) => {
  const object = event.data;
  const storagePath = object.name;
  const match = storagePath.match(/^users\/([^/]+)\/documents\/([^/]+)\.pdf$/);
  if (!match) return;
  const [, uid, documentId] = match;
  if (!uid || !documentId) return;
  const document = await db.collection("documents").doc(documentId).get();
  if (!document.exists || document.data()?.userId !== uid) return;
  await extractAndAnalyze(documentId, uid, storagePath);
});
