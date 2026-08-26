import { motion } from "framer-motion";
import { Activity, Bot, CheckCircle2, FileUp, Loader2, LogOut, MessageCircle, Paperclip, Plus, Send, Sparkles, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { chatWithDocument } from "@/lib/firebase-functions";
import { createDocument, createSymptomReport, subscribeToChat, subscribeToDocuments, subscribeToSymptomReports, type DocumentChatMessage, type ResearchDocument, type SymptomReport } from "@/lib/firebase-data";

function formatDate(value?: { seconds: number }) {
  if (!value) return "Processing now";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value.seconds * 1000));
}

export default function Workspace() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DocumentChatMessage[]>([]);
  const [reports, setReports] = useState<SymptomReport[]>([]);
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [researchConsent, setResearchConsent] = useState(false);
  const [activeView, setActiveView] = useState<"documents" | "experiences">("documents");
  const [reportForm, setReportForm] = useState({ date: new Date().toISOString().slice(0, 10), symptoms: "", impact: "", notes: "" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    return subscribeToDocuments(user.uid, (nextDocuments) => {
      setDocuments(nextDocuments);
      setSelectedDocumentId((current) => current ?? nextDocuments[0]?.id ?? null);
    });
  }, [user]);

  useEffect(() => {
    if (!user || !selectedDocumentId) {
      setMessages([]);
      return;
    }
    return subscribeToChat(user.uid, selectedDocumentId, setMessages);
  }, [user, selectedDocumentId]);

  useEffect(() => {
    if (!user) return;
    return subscribeToSymptomReports(user.uid, setReports);
  }, [user]);

  const selectedDocument = useMemo(() => documents.find((document) => document.id === selectedDocumentId) ?? null, [documents, selectedDocumentId]);

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !user) return;
    if (file.type !== "application/pdf") {
      toast.error("Please choose a PDF medical record export.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Please choose a PDF smaller than 25 MB.");
      return;
    }
    setIsUploading(true);
    try {
      const documentId = await createDocument(user.uid, file, researchConsent);
      setSelectedDocumentId(documentId);
      toast.success(researchConsent ? "PDF uploaded. Your research-sharing preference was saved." : "PDF uploaded. Findings will be extracted automatically.");
    } catch (error) {
      console.error(error);
      toast.error("The upload or automatic analysis could not be completed.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleAsk(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedDocument || !question.trim() || isAsking) return;
    const nextQuestion = question.trim();
    setQuestion("");
    setIsAsking(true);
    try {
      await chatWithDocument(selectedDocument.id, nextQuestion);
    } catch (error) {
      console.error(error);
      toast.error("The document assistant could not answer that question.");
    } finally {
      setIsAsking(false);
    }
  }

  async function handleReportSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user || !reportForm.symptoms.trim()) return;
    try {
      await createSymptomReport(user.uid, reportForm);
      setReportForm({ date: new Date().toISOString().slice(0, 10), symptoms: "", impact: "", notes: "" });
      toast.success("Experience saved to your private log.");
    } catch (error) {
      console.error(error);
      toast.error("We could not save that experience.");
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#18322f]">
      <header className="border-b border-[#dce7e3] bg-[#fbfcfb]">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <button type="button" className="flex cursor-pointer items-center gap-3" onClick={() => navigate("/")}>
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#18322f] text-[#d9f0e9]"><Activity className="size-[19px]" /></span>
            <span className="text-[15px] font-semibold">ZFHX4 Research Hub</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-[#70857e] sm:inline">{user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="cursor-pointer gap-2 text-[#5e766f]"><LogOut className="size-4" /> Sign out</Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1400px] gap-6 px-5 py-7 sm:px-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-10 lg:py-10">
        <aside className="space-y-2">
          <div className="mb-6 px-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#729087]">Private workspace</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Your research space</h1>
          </div>
          <Button variant="ghost" onClick={() => setActiveView("documents")} className={activeView === "documents" ? "h-11 w-full cursor-pointer justify-start gap-3 bg-[#e7f4ef] text-[#286c59]" : "h-11 w-full cursor-pointer justify-start gap-3 text-[#698079]"}><FileUp className="size-4" /> Medical records</Button>
          <Button variant="ghost" onClick={() => setActiveView("experiences")} className={activeView === "experiences" ? "h-11 w-full cursor-pointer justify-start gap-3 bg-[#e7f4ef] text-[#286c59]" : "h-11 w-full cursor-pointer justify-start gap-3 text-[#698079]"}><Activity className="size-4" /> My experiences</Button>
          <div className="mt-8 border-t border-[#dce7e3] px-1 pt-5 text-xs leading-5 text-[#82938e]">Uploaded records stay associated with your account. Do not upload anything you do not have permission to share.</div>
        </aside>

        <section className="min-w-0">
          {activeView === "documents" ? (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div><p className="text-sm text-[#6d837c]">Documents and AI-assisted reading</p><h2 className="mt-1 text-3xl font-semibold tracking-[-0.05em]">Medical record review</h2></div>
                <div className="flex flex-col items-stretch gap-3 sm:items-end">
                  <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleUpload} className="hidden" />
                  <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="h-10 cursor-pointer gap-2 bg-[#398b74] text-white hover:bg-[#2d755f]">{isUploading ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />} Upload PDF</Button>
                  <label className="flex max-w-[320px] cursor-pointer items-start gap-2 text-xs leading-5 text-[#728780]"><Checkbox checked={researchConsent} onCheckedChange={(checked) => setResearchConsent(checked === true)} className="mt-0.5" /><span>Allow this upload to be considered for future de-identified ZFHX4 research review. Optional; uploads remain private unless you choose this.</span></label>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[230px_minmax(0,1fr)]">
                <div className="space-y-2">
                  <p className="px-1 text-xs font-semibold uppercase tracking-[0.12em] text-[#81958f]">Your documents</p>
                  {documents.length === 0 && <div className="border border-dashed border-[#cbdad5] bg-white px-4 py-7 text-center text-sm leading-5 text-[#83948f]">Upload a PDF to begin.</div>}
                  {documents.map((document) => <button type="button" key={document.id} onClick={() => setSelectedDocumentId(document.id)} className={selectedDocumentId === document.id ? "w-full cursor-pointer rounded-xl border border-[#9ec8bb] bg-[#e7f4ef] p-3 text-left" : "w-full cursor-pointer rounded-xl border border-[#dbe6e2] bg-white p-3 text-left hover:border-[#b7d3c9]"}><p className="truncate text-sm font-medium text-[#29483f]">{document.fileName}</p><p className="mt-1 text-xs text-[#80928c]">{document.status === "processing" ? "Extracting findings" : document.status} · {formatDate(document.createdAt)}</p></button>)}
                </div>

                <div className="min-w-0 space-y-4">
                  {!selectedDocument && <div className="flex min-h-[460px] items-center justify-center border border-[#dbe6e2] bg-white p-8 text-center"><div><UploadCloud className="mx-auto size-8 text-[#96ada6]" /><h3 className="mt-4 text-lg font-semibold">Add a medical record export</h3><p className="mt-2 max-w-sm text-sm leading-6 text-[#71837f]">Upload a PDF to view it here, extract useful findings, and ask questions about the document.</p></div></div>}
                  {selectedDocument && <>
                    <div className="overflow-hidden rounded-2xl border border-[#dbe6e2] bg-white">
                      <div className="flex items-center justify-between border-b border-[#edf1ef] px-4 py-3"><div className="flex min-w-0 items-center gap-2"><Paperclip className="size-4 shrink-0 text-[#6d9488]" /><span className="truncate text-sm font-medium">{selectedDocument.fileName}</span></div><span className="text-xs text-[#80928c]">{selectedDocument.status}</span></div>
                      {selectedDocument.downloadUrl ? <iframe title={`Preview of ${selectedDocument.fileName}`} src={selectedDocument.downloadUrl} className="h-[420px] w-full bg-[#f4f7f6] sm:h-[560px]" /> : <div className="flex h-[360px] items-center justify-center text-sm text-[#80928c]"><Loader2 className="mr-2 size-4 animate-spin" /> Preparing document preview</div>}
                    </div>
                    <div className="rounded-2xl border border-[#dbe6e2] bg-white p-5 sm:p-6">
                      <div className="flex items-center gap-2"><Sparkles className="size-4 text-[#398b74]" /><h3 className="font-semibold">Extracted findings</h3></div>
                      {selectedDocument.summary ? <p className="mt-3 text-sm leading-6 text-[#526965]">{selectedDocument.summary}</p> : <p className="mt-3 text-sm leading-6 text-[#80928c]">Findings will appear here after the document is processed.</p>}
                      <div className="mt-5 grid gap-3 sm:grid-cols-2">{selectedDocument.findings?.map((finding) => <div key={`${finding.label}-${finding.finding}`} className="rounded-xl bg-[#f5f8f7] p-4"><div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#648079]">{finding.label}</p><span className="text-[10px] font-medium uppercase text-[#8ba09a]">{finding.confidence} confidence</span></div><p className="mt-2 text-sm font-medium leading-5 text-[#29483f]">{finding.finding}</p><p className="mt-2 text-xs leading-5 text-[#748781]">“{finding.evidence}”</p></div>)}</div>
                    </div>
                    <div className="rounded-2xl border border-[#dbe6e2] bg-white p-5 sm:p-6">
                      <div className="flex items-center gap-2"><MessageCircle className="size-4 text-[#398b74]" /><h3 className="font-semibold">Ask about this document</h3></div>
                      <p className="mt-1 text-sm text-[#7b8f89]">Answers are grounded in the document currently open above.</p>
                      <form onSubmit={handleAsk} className="mt-4 flex items-center gap-2"><Input value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="What does this record say about development or care?" className="h-11 border-[#d5e2de]" disabled={isAsking} /><Button type="submit" size="icon" className="size-11 shrink-0 cursor-pointer bg-[#18322f] text-white hover:bg-[#2a4b45]" disabled={isAsking || !question.trim()} aria-label="Ask document assistant">{isAsking ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}</Button></form>
                      <div className="mt-5 space-y-3">{messages.length === 0 && <div className="flex items-center gap-2 rounded-xl bg-[#f5f8f7] p-4 text-sm text-[#7b8f89]"><Bot className="size-4" /> Your document questions and answers will appear here.</div>}{messages.map((message) => <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} key={message.id} className={message.role === "user" ? "ml-8 rounded-xl bg-[#e7f4ef] p-4 text-sm leading-6 text-[#31594f]" : "mr-8 rounded-xl border border-[#e4ece8] bg-[#fbfcfb] p-4 text-sm leading-6 text-[#42635b]"}><p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#78918a]">{message.role === "user" ? "You" : "Document assistant"}</p>{message.content}</motion.div>)}</div>
                    </div>
                  </>}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl space-y-6">
              <div><p className="text-sm text-[#6d837c]">Private notes for your care conversations</p><h2 className="mt-1 text-3xl font-semibold tracking-[-0.05em]">My experiences</h2><p className="mt-3 text-sm leading-6 text-[#71837f]">Record symptoms, changes, and day-to-day experiences in your own words. This is not a diagnostic tool.</p></div>
              <form onSubmit={handleReportSubmit} className="space-y-4 rounded-2xl border border-[#dbe6e2] bg-white p-5 sm:p-6"><div className="grid gap-4 sm:grid-cols-[180px_1fr]"><label className="text-sm font-medium text-[#4d6860]">Date<input type="date" value={reportForm.date} onChange={(event) => setReportForm({ ...reportForm, date: event.target.value })} className="mt-2 h-10 w-full rounded-md border border-[#d5e2de] bg-white px-3 text-sm" required /></label><label className="text-sm font-medium text-[#4d6860]">What did you notice?<Textarea value={reportForm.symptoms} onChange={(event) => setReportForm({ ...reportForm, symptoms: event.target.value })} placeholder="Describe symptoms or experiences in your own words" className="mt-2 min-h-24 border-[#d5e2de]" required /></label></div><label className="block text-sm font-medium text-[#4d6860]">How did it affect your day?<Textarea value={reportForm.impact} onChange={(event) => setReportForm({ ...reportForm, impact: event.target.value })} placeholder="Optional" className="mt-2 border-[#d5e2de]" /></label><label className="block text-sm font-medium text-[#4d6860]">Additional context<Textarea value={reportForm.notes} onChange={(event) => setReportForm({ ...reportForm, notes: event.target.value })} placeholder="Appointments, questions, or other context" className="mt-2 border-[#d5e2de]" /></label><Button type="submit" className="cursor-pointer gap-2 bg-[#398b74] text-white hover:bg-[#2d755f]"><Plus className="size-4" /> Save experience</Button></form>
              <div className="space-y-3">{reports.length === 0 && <div className="rounded-2xl border border-dashed border-[#cbdad5] bg-white px-5 py-10 text-center text-sm text-[#82938e]">Your saved experiences will appear here.</div>}{reports.map((report) => <article key={report.id} className="rounded-2xl border border-[#dbe6e2] bg-white p-5"><div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f8981]">{report.date}</span><CheckCircle2 className="size-4 text-[#398b74]" /></div><p className="mt-3 text-sm leading-6 text-[#38574e]">{report.symptoms}</p>{report.impact && <p className="mt-3 text-sm leading-6 text-[#71837f]"><span className="font-medium text-[#526d64]">Impact:</span> {report.impact}</p>}{report.notes && <p className="mt-2 text-sm leading-6 text-[#71837f]"><span className="font-medium text-[#526d64]">Context:</span> {report.notes}</p>}</article>)}</div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
