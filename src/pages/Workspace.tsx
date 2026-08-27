import { motion } from "framer-motion";
import { Activity, Archive, Bot, BookOpen, CheckCircle2, ExternalLink, FileText, FileUp, Loader2, LogOut, MessageCircle, Paperclip, Plus, RefreshCcw, Send, Settings2, Sparkles, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { archivePaper, chatWithDocument, publishPaper, refreshPapers, synthesizeUnderstanding } from "@/lib/firebase-functions";
import { createDocument, createSymptomReport, saveUserProfile, subscribeToAllPapers, subscribeToChat, subscribeToDocuments, subscribeToSymptomReports, subscribeToUserProfile, type DocumentChatMessage, type Medication, type PublicPaper, type ResearchDocument, type SymptomReport, type UserProfile } from "@/lib/firebase-data";

function formatDate(value?: { seconds: number }) {
  if (!value) return "Processing now";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value.seconds * 1000));
}

export default function Workspace() {
  const { user, signOut } = useAuth();
  const isAdmin = user?.email?.toLowerCase() === "admin@example.com";
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<ResearchDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DocumentChatMessage[]>([]);
  const [reports, setReports] = useState<SymptomReport[]>([]);
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [researchConsent, setResearchConsent] = useState(false);
  const [activeView, setActiveView] = useState<"documents" | "experiences" | "profile" | "papers">("documents");
  const [profile, setProfile] = useState<UserProfile>({ userId: "", ailments: [], diagnoses: [], medications: [] });
  const [profileDraft, setProfileDraft] = useState<UserProfile>({ userId: "", ailments: [], diagnoses: [], medications: [] });
  const [profileSaved, setProfileSaved] = useState(false);
  const [ailmentInput, setAilmentInput] = useState("");
  const [diagnosisInput, setDiagnosisInput] = useState("");
  const [medicationDraft, setMedicationDraft] = useState({ name: "", purpose: "", dosage: "", notes: "" });
  const [allPapers, setAllPapers] = useState<PublicPaper[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [paperActionId, setPaperActionId] = useState<string | null>(null);
  const [reportForm, setReportForm] = useState({ date: new Date().toISOString().slice(0, 10), symptoms: "", impact: "", notes: "" });
  const ailmentSuggestions = ["Developmental delay", "Speech or language differences", "Seizures", "Sleep difficulties", "Movement differences", "Feeding difficulties"];
  const diagnosisSuggestions = ["ZFHX4-related disorder", "Kleefstra syndrome 2", "Epilepsy", "Autism spectrum disorder", "Developmental delay"];
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

  useEffect(() => {
    if (!user) return;
    return subscribeToUserProfile(user.uid, (nextProfile) => {
      const next = nextProfile ?? { userId: user.uid, ailments: [], diagnoses: [], medications: [] };
      setProfile(next);
      setProfileDraft(next);
    });
  }, [user]);

  useEffect(() => {
    if (!user || !isAdmin) return;
    return subscribeToAllPapers(setAllPapers);
  }, [user, isAdmin]);

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

  function addProfileItem(kind: "ailments" | "diagnoses", value: string) {
    const item = value.trim();
    if (!item || profileDraft[kind].some((existing) => existing.toLowerCase() === item.toLowerCase())) return;
    setProfileDraft((current) => ({ ...current, [kind]: [...current[kind], item] }));
    kind === "ailments" ? setAilmentInput("") : setDiagnosisInput("");
  }

  function addMedication() {
    if (!medicationDraft.name.trim() || !medicationDraft.dosage.trim()) return;
    const medication: Medication = { id: crypto.randomUUID(), ...medicationDraft, name: medicationDraft.name.trim(), purpose: medicationDraft.purpose.trim(), dosage: medicationDraft.dosage.trim(), notes: medicationDraft.notes.trim() || undefined };
    setProfileDraft((current) => ({ ...current, medications: [...current.medications, medication] }));
    setMedicationDraft({ name: "", purpose: "", dosage: "", notes: "" });
  }

  async function handleSaveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;
    await saveUserProfile(user.uid, { ailments: profileDraft.ailments, diagnoses: profileDraft.diagnoses, medications: profileDraft.medications });
    setProfileSaved(true);
    toast.success("Your profile details were saved privately.");
    window.setTimeout(() => setProfileSaved(false), 2500);
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

  async function handleRefreshPapers() {
    setIsRefreshing(true);
    try {
      const result = await refreshPapers();
      toast.success(result.message);
    } catch (error) {
      console.error(error);
      toast.error("Failed to refresh papers.");
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handlePublishPaper(paperId: string) {
    setPaperActionId(paperId);
    try {
      await publishPaper(paperId);
      toast.success("Paper published. Synthesis updated.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to publish paper.");
    } finally {
      setPaperActionId(null);
    }
  }

  async function handleArchivePaper(paperId: string) {
    setPaperActionId(paperId);
    try {
      await archivePaper(paperId);
      toast.success("Paper archived.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to archive paper.");
    } finally {
      setPaperActionId(null);
    }
  }

  async function handleSynthesize() {
    setIsRefreshing(true);
    try {
      await synthesizeUnderstanding();
      toast.success("Synthesis updated.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to synthesize.");
    } finally {
      setIsRefreshing(false);
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
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="cursor-pointer gap-2 text-[#5e766f]"><LogOut className="size-4 sm:hidden" /><span className="hidden sm:inline">Sign out</span></Button>
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
          <Button variant="ghost" onClick={() => setActiveView("profile")} className={activeView === "profile" ? "h-11 w-full cursor-pointer justify-start gap-3 bg-[#e7f4ef] text-[#286c59]" : "h-11 w-full cursor-pointer justify-start gap-3 text-[#698079]"}><Settings2 className="size-4" /> My health profile</Button>
          {isAdmin ? <Button variant="ghost" onClick={() => setActiveView("papers")} className={activeView === "papers" ? "h-11 w-full cursor-pointer justify-start gap-3 bg-[#e7f4ef] text-[#286c59]" : "h-11 w-full cursor-pointer justify-start gap-3 text-[#698079]"}><FileText className="size-4" /> Research papers {allPapers.filter((p) => p.status === "pending").length > 0 && <Badge className="ml-auto bg-[#398b74] text-white">{allPapers.filter((p) => p.status === "pending").length}</Badge>}</Button> : null}
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
              </div>            </div>
          ) : activeView === "experiences" ? (
            <div className="max-w-4xl space-y-6">
              <div><p className="text-sm text-[#6d837c]">Private notes for your care conversations</p><h2 className="mt-1 text-3xl font-semibold tracking-[-0.05em]">My experiences</h2><p className="mt-3 text-sm leading-6 text-[#71837f]">Record symptoms, changes, and day-to-day experiences in your own words. This is not a diagnostic tool.</p></div>
              <form onSubmit={handleReportSubmit} className="space-y-4 rounded-2xl border border-[#dbe6e2] bg-white p-5 sm:p-6"><div className="grid gap-4 sm:grid-cols-[180px_1fr]"><label className="text-sm font-medium text-[#4d6860]">Date<input type="date" value={reportForm.date} onChange={(event) => setReportForm({ ...reportForm, date: event.target.value })} className="mt-2 h-10 w-full rounded-md border border-[#d5e2de] bg-white px-3 text-sm" required /></label><label className="text-sm font-medium text-[#4d6860]">What did you notice?<Textarea value={reportForm.symptoms} onChange={(event) => setReportForm({ ...reportForm, symptoms: event.target.value })} placeholder="Describe symptoms or experiences in your own words" className="mt-2 min-h-24 border-[#d5e2de]" required /><p className="mt-2 text-xs font-normal text-[#80928c]">Your profile includes: {profile.ailments.length ? profile.ailments.join(", ") : "no ailments added yet"}</p></label></div><label className="block text-sm font-medium text-[#4d6860]">How did it affect your day?<Textarea value={reportForm.impact} onChange={(event) => setReportForm({ ...reportForm, impact: event.target.value })} placeholder="Optional" className="mt-2 border-[#d5e2de]" /></label><label className="block text-sm font-medium text-[#4d6860]">Additional context<Textarea value={reportForm.notes} onChange={(event) => setReportForm({ ...reportForm, notes: event.target.value })} placeholder="Appointments, questions, or other context" className="mt-2 border-[#d5e2de]" /></label><Button type="submit" className="cursor-pointer gap-2 bg-[#398b74] text-white hover:bg-[#2d755f]"><Plus className="size-4" /> Save experience</Button></form>
              <div className="space-y-3">{reports.length === 0 && <div className="rounded-2xl border border-dashed border-[#cbdad5] bg-white px-5 py-10 text-center text-sm text-[#82938e]">Your saved experiences will appear here.</div>}{reports.map((report) => <article key={report.id} className="rounded-2xl border border-[#dbe6e2] bg-white p-5"><div className="flex items-center justify-between gap-3"><span className="text-xs font-semibold uppercase tracking-[0.1em] text-[#6f8981]">{report.date}</span><CheckCircle2 className="size-4 text-[#398b74]" /></div><p className="mt-3 text-sm leading-6 text-[#38574e]">{report.symptoms}</p>{report.impact && <p className="mt-3 text-sm leading-6 text-[#71837f]"><span className="font-medium text-[#526d64]">Impact:</span> {report.impact}</p>}{report.notes && <p className="mt-2 text-sm leading-6 text-[#71837f]"><span className="font-medium text-[#526d64]">Context:</span> {report.notes}</p>}</article>)}</div>
            </div>
          ) : activeView === "profile" ? (
            <div className="max-w-4xl space-y-6">
              <div><p className="text-sm text-[#6d837c]">Personal context for your private log</p><h2 className="mt-1 text-3xl font-semibold tracking-[-0.05em]">My health profile</h2><p className="mt-3 text-sm leading-6 text-[#71837f]">Keep track of ailments, diagnoses, and medications in one place. This information is private to your account and is not medical advice.</p></div>
              <form onSubmit={handleSaveProfile} className="space-y-6 rounded-2xl border border-[#dbe6e2] bg-white p-5 sm:p-6">
                <div><h3 className="font-semibold">Ailments and experiences</h3><p className="mt-1 text-sm text-[#71837f]">Add anything you experience or want to discuss with your care team.</p><div className="relative mt-3"><Input value={ailmentInput} onChange={(event) => setAilmentInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addProfileItem("ailments", ailmentInput); } }} placeholder="Start typing an ailment or symptom" className="border-[#d5e2de]" list="ailment-suggestions" /><datalist id="ailment-suggestions">{ailmentSuggestions.map((item) => <option key={item} value={item} />)}</datalist></div><div className="mt-3 flex flex-wrap gap-2">{profileDraft.ailments.map((item) => <span key={item} className="inline-flex items-center gap-1 rounded-full bg-[#e7f4ef] px-3 py-1.5 text-xs font-medium text-[#286c59]">{item}<button type="button" onClick={() => setProfileDraft((current) => ({ ...current, ailments: current.ailments.filter((value) => value !== item) }))} aria-label={`Remove ${item}`}><Trash2 className="size-3" /></button></span>)}</div></div>
                <div><h3 className="font-semibold">Diagnoses</h3><div className="relative mt-3"><Input value={diagnosisInput} onChange={(event) => setDiagnosisInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addProfileItem("diagnoses", diagnosisInput); } }} placeholder="Search or add a diagnosis" className="border-[#d5e2de]" list="diagnosis-suggestions" /><datalist id="diagnosis-suggestions">{diagnosisSuggestions.map((item) => <option key={item} value={item} />)}</datalist></div><div className="mt-3 flex flex-wrap gap-2">{profileDraft.diagnoses.map((item) => <span key={item} className="inline-flex items-center gap-1 rounded-full bg-[#f5f8f7] px-3 py-1.5 text-xs font-medium text-[#526965]">{item}<button type="button" onClick={() => setProfileDraft((current) => ({ ...current, diagnoses: current.diagnoses.filter((value) => value !== item) }))} aria-label={`Remove ${item}`}><Trash2 className="size-3" /></button></span>)}</div></div>
                <div><h3 className="font-semibold">Medications</h3><p className="mt-1 text-sm text-[#71837f]">Add the medication, what it is for, the dosage, and any notes you want to remember.</p><div className="mt-3 grid gap-3 sm:grid-cols-2"><Input value={medicationDraft.name} onChange={(event) => setMedicationDraft({ ...medicationDraft, name: event.target.value })} placeholder="Medication name" className="border-[#d5e2de]" /><Input value={medicationDraft.purpose} onChange={(event) => setMedicationDraft({ ...medicationDraft, purpose: event.target.value })} placeholder="What is it for?" className="border-[#d5e2de]" /><Input value={medicationDraft.dosage} onChange={(event) => setMedicationDraft({ ...medicationDraft, dosage: event.target.value })} placeholder="Dosage, e.g. 10 mg twice daily" className="border-[#d5e2de]" /><Input value={medicationDraft.notes} onChange={(event) => setMedicationDraft({ ...medicationDraft, notes: event.target.value })} placeholder="Optional notes" className="border-[#d5e2de]" /></div><Button type="button" onClick={addMedication} className="mt-3 cursor-pointer gap-2 bg-[#edf5f2] text-[#286c59] hover:bg-[#dceee8]"><Plus className="size-4" /> Add medication</Button><div className="mt-4 space-y-2">{profileDraft.medications.map((medication) => <div key={medication.id} className="flex items-start justify-between gap-3 rounded-xl bg-[#f5f8f7] p-4"><div><p className="font-medium text-[#29483f]">{medication.name} <span className="font-normal text-[#71837f]">· {medication.dosage}</span></p>{medication.purpose && <p className="mt-1 text-sm text-[#526965]">For: {medication.purpose}</p>}{medication.notes && <p className="mt-1 text-xs text-[#80928c]">{medication.notes}</p>}</div><button type="button" onClick={() => setProfileDraft((current) => ({ ...current, medications: current.medications.filter((item) => item.id !== medication.id) }))} className="cursor-pointer text-[#8a6d5a]" aria-label={`Remove ${medication.name}`}><Trash2 className="size-4" /></button></div>)}</div></div>
                <div className="flex items-center gap-3"><Button type="submit" className="cursor-pointer gap-2 bg-[#398b74] text-white hover:bg-[#2d755f]">{profileSaved ? <CheckCircle2 className="size-4" /> : null}{profileSaved ? "Saved" : "Save profile"}</Button><span className="text-xs text-[#80928c]">Only you can access these details.</span></div>
              </form>
            </div>
          ) : isAdmin ? (
            /* ─── Research papers management ───────────────────────────── */
            <div className="max-w-4xl space-y-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm text-[#6d837c]">Manage published research</p>
                  <h2 className="mt-1 text-3xl font-semibold tracking-[-0.05em]">Research papers</h2>
                  <p className="mt-3 text-sm leading-6 text-[#71837f]">
                    Papers are discovered weekly from PubMed and saved for your review. Publish the ones you want on the public site.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleRefreshPapers} disabled={isRefreshing} variant="outline" className="cursor-pointer gap-2 border-[#d5e2de]">
                    {isRefreshing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />} Refresh from PubMed
                  </Button>
                  <Button onClick={handleSynthesize} disabled={isRefreshing} variant="outline" className="cursor-pointer gap-2 border-[#d5e2de]">
                    {isRefreshing ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />} Re-synthesize
                  </Button>
                </div>
              </div>

              {allPapers.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#cbdad5] bg-white px-6 py-16 text-center">
                  <BookOpen className="mx-auto size-6 text-[#9aada7]" />
                  <h3 className="mt-4 text-base font-semibold text-[#29443e]">No papers yet</h3>
                  <p className="mt-1 text-sm text-[#71837f]">Click "Refresh from PubMed" to search for ZFHX4 papers.</p>
                </div>
              )}

              {/* Pending papers */}
              {allPapers.filter((p) => p.status === "pending").length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#b07a3a]">Pending review ({allPapers.filter((p) => p.status === "pending").length})</h3>
                  <div className="space-y-3">
                    {allPapers.filter((p) => p.status === "pending").map((paper) => (
                      <article key={paper.id} className="rounded-2xl border border-[#e8d5a3] bg-[#fefcf6] p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <Badge className="border-0 bg-[#e7f4ef] px-2 py-0.5 text-[11px] font-semibold text-[#317762]">{paper.type}</Badge>
                              <span className="text-[11px] text-[#96ada6]">{paper.year}</span>
                              {paper.openAccess && <span className="text-[11px] text-[#78918a]">Open access</span>}
                            </div>
                            <h4 className="text-base font-semibold text-[#18322f]">{paper.title}</h4>
                            <p className="mt-1 text-sm text-[#71837f]">{paper.authors} · {paper.journal}</p>
                            <p className="mt-2 text-sm leading-6 text-[#526965]">{paper.summary}</p>
                            {paper.keyFindings.length > 0 && (
                              <div className="mt-3 rounded-xl bg-white p-3">
                                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#648079]">Key findings</p>
                                <ul className="space-y-1">
                                  {paper.keyFindings.map((f) => (
                                    <li key={f} className="flex items-start gap-2 text-xs leading-5 text-[#3b5c54]">
                                      <span className="mt-0.5 text-[#398b74]">•</span> {f}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {paper.tags.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {paper.tags.map((tag) => (
                                  <span key={tag} className="rounded bg-[#f4f7f6] px-1.5 py-0.5 text-[10px] font-medium text-[#72847f]">{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex shrink-0 gap-2 sm:flex-col">
                            <Button onClick={() => handlePublishPaper(paper.id)} disabled={paperActionId === paper.id} className="h-9 cursor-pointer gap-1.5 bg-[#398b74] text-xs text-white hover:bg-[#2d755f]">
                              {paperActionId === paper.id ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3" />} Publish
                            </Button>
                            <Button onClick={() => handleArchivePaper(paper.id)} disabled={paperActionId === paper.id} variant="outline" className="h-9 cursor-pointer gap-1.5 border-[#d5e2de] text-xs text-[#8a6d5a]">
                              {paperActionId === paper.id ? <Loader2 className="size-3 animate-spin" /> : <Archive className="size-3" />} Archive
                            </Button>
                            <a href={paper.link} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-md border border-[#d5e2de] px-3 text-xs font-medium text-[#526965] hover:bg-[#f5f8f7]">
                              <ExternalLink className="size-3" /> View
                            </a>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {/* Published papers */}
              {allPapers.filter((p) => p.status === "published").length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#397768]">Published ({allPapers.filter((p) => p.status === "published").length})</h3>
                  <div className="space-y-2">
                    {allPapers.filter((p) => p.status === "published").map((paper) => (
                      <div key={paper.id} className="flex items-center justify-between rounded-xl border border-[#d4e5df] bg-white px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-[#29483f]">{paper.title}</p>
                          <p className="mt-0.5 text-xs text-[#80928c]">{paper.authors} · {paper.journal} · {paper.year}</p>
                        </div>
                        <div className="ml-3 flex shrink-0 gap-2">
                          <Button onClick={() => handleArchivePaper(paper.id)} disabled={paperActionId === paper.id} variant="ghost" size="sm" className="cursor-pointer text-xs text-[#8a6d5a]">
                            <Archive className="size-3" /> Unpublish
                          </Button>
                          <a href={paper.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-[#526965] hover:underline">
                            <ExternalLink className="size-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Archived papers */}
              {allPapers.filter((p) => p.status === "archived").length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.12em] text-[#999]">Archived ({allPapers.filter((p) => p.status === "archived").length})</h3>
                  <div className="space-y-2">
                    {allPapers.filter((p) => p.status === "archived").map((paper) => (
                      <div key={paper.id} className="flex items-center justify-between rounded-xl border border-[#e8e8e8] bg-[#fafafa] px-4 py-3 opacity-60">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm text-[#666]">{paper.title}</p>
                        </div>
                        <Button onClick={() => handlePublishPaper(paper.id)} disabled={paperActionId === paper.id} variant="ghost" size="sm" className="cursor-pointer text-xs text-[#397768]">
                          <CheckCircle2 className="size-3" /> Restore
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
