import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Dna,
  ExternalLink,
  FileText,
  LogIn,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  chatAboutResearch,
  type ChatMessage as ApiChatMessage,
} from "@/lib/firebase-functions";
import {
  useReadingLevel,
  readingLevelLabels,
  type ReadingLevel,
} from "@/lib/reading-level";
import {
  subscribeToPublishedPapers,
  subscribeToSiteContent,
  type PublicPaper,
  type SiteContent,
} from "@/lib/firebase-data";

/* ─── Icon map for highlights ───────────────────────────────────────────────── */

const iconMap: Record<string, React.ReactNode> = {
  users: <Users className="size-5" />,
  dna: <Dna className="size-5" />,
  search: <Search className="size-5" />,
  file: <FileText className="size-5" />,
};

/* ─── Chat message type ────────────────────────────────────────────────────── */

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export default function Landing() {
  const [papers, setPapers] = useState<PublicPaper[]>([]);
  const [siteContent, setSiteContent] = useState<SiteContent | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [studySearch, setStudySearch] = useState("");
  const { readingLevel, setReadingLevel } = useReadingLevel();
  const apiReadingLevel: ReadingLevel = readingLevel;
  const chatEndRef = useRef<HTMLDivElement>(null);
  const messageIdRef = useRef(0);

  // Subscribe to Firestore data
  useEffect(() => {
    const unsubPapers = subscribeToPublishedPapers(setPapers);
    const unsubContent = subscribeToSiteContent(setSiteContent);
    return () => {
      unsubPapers();
      unsubContent();
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  async function handleSend(text?: string) {
    const question = (text ?? chatInput).trim();
    if (!question || isTyping) return;

    // Stable IDs for the chat list. We use a ref counter instead of
    // Date.now() so the IDs are deterministic across renders and the
    // eslint react-hooks/purity rule (which forbids calling impure
    // functions like Date.now during a render pass) does not flag the
    // event handler.
    const userId = `u-${++messageIdRef.current}`;
    const userMsg: ChatMessage = {
      id: userId,
      role: "user",
      content: question,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    try {
      const apiHistory: ApiChatMessage[] = chatMessages
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const { answer } = await chatAboutResearch(
        question,
        apiHistory,
        apiReadingLevel,
      );

      const assistantMsg: ChatMessage = {
        id: `a-${++messageIdRef.current}`,
        role: "assistant",
        content: answer,
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Could not get a response. Please try again.");
      setChatMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setIsTyping(false);
    }
  }

  /* Derived data — read mode-specific content from Firestore with fallbacks */
  const modeKey = readingLevel;
  const highlights =
    modeKey === "layman"
      ? (siteContent?.highlights_layman ?? siteContent?.highlights ?? [])
      : modeKey === "clinical"
        ? (siteContent?.highlights_clinical ?? siteContent?.highlights ?? [])
        : (siteContent?.highlights_scientist ?? siteContent?.highlights ?? []);
  const stats =
    modeKey === "layman"
      ? (siteContent?.stats_layman ?? siteContent?.stats ?? [])
      : modeKey === "clinical"
        ? (siteContent?.stats_clinical ?? siteContent?.stats ?? [])
        : (siteContent?.stats_scientist ?? siteContent?.stats ?? []);
  const synthesis =
    modeKey === "layman"
      ? (siteContent?.currentUnderstanding_layman ??
        siteContent?.currentUnderstanding ??
        null)
      : modeKey === "clinical"
        ? (siteContent?.currentUnderstanding_clinical ??
          siteContent?.currentUnderstanding ??
          null)
        : (siteContent?.currentUnderstanding_scientist ??
          siteContent?.currentUnderstanding ??
          null);
  const readingCopy = synthesis;
  const studyCategories = [
    "All studies",
    ...Array.from(new Set(papers.map((paper) => paper.type))).sort(),
  ];
  const normalizedStudySearch = studySearch.trim().toLowerCase();
  const filteredPapers = papers.filter((paper) => {
    const searchable = [
      paper.title,
      paper.authors,
      paper.journal,
      paper.type,
      paper.summary,
      ...paper.tags,
      ...paper.symptomsIdentified,
    ]
      .join(" ")
      .toLowerCase();
    return !normalizedStudySearch || searchable.includes(normalizedStudySearch);
  });
  const papersByCategory = studyCategories
    .filter((cat) => cat !== "All studies")
    .map((cat) => ({
      category: cat,
      papers: filteredPapers.filter((p) => p.type === cat),
    }));

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen bg-[#f6f8f7] text-[#18322f]"
    >
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <header className="border-b border-[#dce7e3] bg-[#fbfcfb]">
        {/* Desktop: single row with title | selector | subtitle+login */}
        <div className="mx-auto hidden max-w-[1240px] items-center px-8 py-4 lg:px-10 sm:flex">
          <a
            href="/"
            className="flex items-center gap-3"
            aria-label="ZFHX4 Research Hub home"
          >
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#18322f] text-[#d9f0e9]">
              <Dna className="size-[19px]" strokeWidth={1.8} />
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#18322f]">
              ZFHX4 Research Hub
            </span>
          </a>

          <div className="mx-6 flex flex-1 justify-center">
            <div
              className="grid grid-cols-3 items-stretch gap-1 rounded-lg border border-[#d5e2de] bg-white p-1"
              aria-label="Choose how to explore the research"
            >
              {(["layman", "clinical", "scientist"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setReadingLevel(level)}
                  className={
                    readingLevel === level
                      ? "rounded-md bg-[#18322f] px-2.5 py-2 text-[11px] font-semibold text-white"
                      : "rounded-md px-2.5 py-2 text-[11px] font-medium text-[#71837f] hover:bg-[#f2f8f5]"
                  }
                  aria-pressed={readingLevel === level}
                >
                  {level === "layman"
                    ? "Easy to follow"
                    : level === "clinical"
                      ? "For care teams"
                      : "Research deep dive"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-[#6a7d79]">
              A customer research resource
            </span>
            <a
              href="/auth"
              className="inline-flex items-center gap-2 rounded-lg bg-[#18322f] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2a4b45]"
            >
              <LogIn className="size-4" />
              <span>Log in</span>
            </a>
          </div>
        </div>

        {/* Mobile: title + login stacked above, selector below */}
        <div className="sm:hidden">
          <div className="mx-auto flex items-center justify-between px-5 py-4">
            <a
              href="/"
              className="flex items-center gap-3"
              aria-label="ZFHX4 Research Hub home"
            >
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#18322f] text-[#d9f0e9]">
                <Dna className="size-[19px]" strokeWidth={1.8} />
              </span>
              <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#18322f]">
                ZFHX4 Research Hub
              </span>
            </a>
            <a
              href="/auth"
              className="inline-flex items-center gap-2 rounded-lg bg-[#18322f] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2a4b45]"
            >
              <LogIn className="size-4" />
            </a>
          </div>
          <div className="mx-auto max-w-[1240px] px-5 py-2">
            <div
              className="grid grid-cols-3 items-stretch gap-1 rounded-lg border border-[#d5e2de] bg-white p-1"
              aria-label="Choose how to explore the research"
            >
              {(["layman", "clinical", "scientist"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setReadingLevel(level)}
                  className={
                    readingLevel === level
                      ? "rounded-md bg-[#18322f] px-2.5 py-2 text-[11px] font-semibold text-white"
                      : "rounded-md px-2.5 py-2 text-[11px] font-medium text-[#71837f] hover:bg-[#f2f8f5]"
                  }
                  aria-pressed={readingLevel === level}
                >
                  {level === "layman"
                    ? "Easy to follow"
                    : level === "clinical"
                      ? "For care teams"
                      : "Research deep dive"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ─── Hero: synthesis from Firestore ──────────────────────────────── */}
      <section className="border-b border-[#dce7e3] bg-[#edf5f2]">
        <div className="mx-auto max-w-[1240px] px-5 pb-10 pt-12 sm:px-8 sm:pb-14 sm:pt-16 lg:px-10 lg:pt-[76px]">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.45 }}
              className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#397768]"
            >
              <span className="flex size-6 items-center justify-center rounded-md bg-white text-[#397768] ring-1 ring-[#d4e7e0]">
                <Sparkles className="size-3.5" />
              </span>
              Peer-reviewed findings, clearly organized
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.45 }}
              className="max-w-2xl text-[clamp(2.35rem,5vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-[#18322f]"
            >
              ZFHX4 loss of function causes a{" "}
              <span className="text-[#398b74]">
                neurodevelopmental disorder
              </span>
            </motion.h1>

            {readingCopy ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.45 }}
                className="mt-6 max-w-xl space-y-3"
              >
                {readingCopy
                  .split("\n\n")
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-base leading-7 text-[#58706b] sm:text-[17px]"
                    >
                      {paragraph}
                    </p>
                  ))}
              </motion.div>
            ) : (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.45 }}
                className="mt-6 max-w-xl text-base leading-7 text-[#58706b] sm:text-[17px]"
              >
                Research about loss of function in ZFHX4, organized to help
                customers and their care teams understand the evidence.
              </motion.p>
            )}
          </div>

          {/* Stats strip — from Firestore */}
          {stats.length > 0 && (
            <div className="mt-10 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#d4e5df] bg-[#d4e5df] sm:mt-14 sm:grid-cols-4">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="bg-[#f8fbfa] px-4 py-4 sm:px-5 sm:py-5"
                >
                  <p className="text-xl font-semibold tracking-[-0.03em] text-[#18322f] sm:text-2xl">
                    {item.stat}
                  </p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#718681]">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#96ada6]">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── Key findings — from Firestore highlights ────────────────────── */}
      {highlights.length > 0 && (
        <section className="mx-auto max-w-[1240px] px-5 py-9 sm:px-8 sm:py-12 lg:px-10">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-[#6c827c]">
              <span className="size-2 rounded-full bg-[#3b9a7f]" />
              What the research shows
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#18322f] sm:text-3xl">
              Key findings across the evidence
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {highlights.map((item) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.35 }}
                className="rounded-2xl border border-[#dbe6e2] bg-white p-6"
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[#edf5f2] text-[#398b74]">
                  {iconMap[item.icon] ?? <FileText className="size-5" />}
                </div>
                <h3 className="text-base font-semibold text-[#18322f]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#58706b]">
                  {item.body}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Chat agent ──────────────────────────────────────────────────── */}
      <section className="border-y border-[#dce7e3] bg-[#edf5f2]">
        <div className="mx-auto max-w-[1240px] px-5 py-9 sm:px-8 sm:py-12 lg:px-10">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-[#18322f] text-[#d9f0e9]">
                <MessageCircle className="size-5" />
              </div>
              <h2 className="text-2xl font-semibold tracking-[-0.04em] text-[#18322f] sm:text-3xl">
                Ask about the research
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#6d837c]">
                All analysis is generated for the{" "}
                {readingLevelLabels[readingLevel].toLowerCase()} reading level.
                Ask about findings, genetics, symptoms, or specific studies.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-[#d4e5df] bg-white shadow-sm">
              {/* Messages */}
              <div className="flex min-h-[180px] max-h-[380px] flex-col gap-3 overflow-y-auto p-5 sm:min-h-[220px] sm:max-h-[420px] sm:p-6">
                <AnimatePresence initial={false}>
                  {chatMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={
                        msg.role === "user"
                          ? "ml-8 max-w-[85%] self-end rounded-2xl rounded-br-md bg-[#18322f] px-4 py-3 text-sm leading-6 text-white"
                          : "mr-8 max-w-[85%] self-start rounded-2xl rounded-bl-md border border-[#e4ece8] bg-[#fbfcfb] px-4 py-3 text-sm leading-6 text-[#334d47]"
                      }
                    >
                      {msg.role === "assistant" && (
                        <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#78918a]">
                          <Sparkles className="size-3" /> Research assistant
                        </p>
                      )}
                      {msg.content}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mr-8 self-start rounded-2xl rounded-bl-md border border-[#e4ece8] bg-[#fbfcfb] px-4 py-3 text-sm text-[#78918a]"
                  >
                    <span className="inline-flex gap-1">
                      <span className="animate-pulse">●</span>
                      <span className="animate-pulse [animation-delay:150ms]">
                        ●
                      </span>
                      <span className="animate-pulse [animation-delay:300ms]">
                        ●
                      </span>
                    </span>
                  </motion.div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Suggested questions — only before first message, above input */}
              {chatMessages.length === 0 && !isTyping && (
                <div className="border-t border-[#edf1ef] px-4 py-3 sm:px-5">
                  <p className="mb-2 text-center text-xs font-medium text-[#7b8f89]">
                    Try asking:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      "What developmental features are associated with ZFHX4 loss of function?",
                      "How was the ZFHX4 connection discovered?",
                      "What do zebrafish studies tell us?",
                      "Is this condition inherited?",
                    ].map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => handleSend(q)}
                        className="cursor-pointer rounded-full border border-[#d5e2de] bg-white px-3 py-1.5 text-xs font-medium text-[#526965] transition-colors hover:border-[#9ec8bb] hover:bg-[#f2f8f5]"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2 border-t border-[#edf1ef] px-4 py-3 sm:px-5"
              >
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about ZFHX4 findings, symptoms, genetics..."
                  className="h-11 flex-1 border-[#d5e2de] bg-[#f8fbfa] text-sm"
                  disabled={isTyping}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="size-11 shrink-0 cursor-pointer bg-[#18322f] text-white hover:bg-[#2a4b45]"
                  disabled={isTyping || !chatInput.trim()}
                  aria-label="Send message"
                >
                  <Send className="size-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Studies — horizontal scrollers by category ────────────────── */}
      <section className="mx-auto max-w-[1240px] px-5 py-9 sm:px-8 sm:py-12 lg:px-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-[#6c827c]">
            <BookOpen className="size-3.5" />
            Full studies
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#18322f] sm:text-3xl">
            Read the evidence
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#71837f]">
            {papers.length} published {papers.length === 1 ? "paper" : "papers"}
            . Search by topic, symptom, author, or journal.
          </p>
        </div>

        {papers.length > 0 && (
          <div className="mb-8">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#8aa29a]" />
              <Input
                value={studySearch}
                onChange={(event) => setStudySearch(event.target.value)}
                placeholder="Search studies, symptoms, genes, journals..."
                className="h-10 w-full border-[#d5e2de] pl-9"
              />
            </div>
          </div>
        )}

        {papers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#cddbd6] bg-white px-6 py-16 text-center">
            <BookOpen className="mx-auto size-6 text-[#9aada7]" />
            <h3 className="mt-4 text-base font-semibold text-[#29443e]">
              No papers published yet
            </h3>
            <p className="mt-1 text-sm text-[#71837f]">
              Research papers will appear here once published by the editorial
              team.
            </p>
          </div>
        )}

        {filteredPapers.length === 0 && papers.length > 0 && (
          <div className="rounded-2xl border border-dashed border-[#cddbd6] bg-white px-6 py-12 text-center text-sm text-[#71837f]">
            No studies match your search.
          </div>
        )}

        {papersByCategory.map(
          ({ category, papers: catPapers }) =>
            catPapers.length > 0 && (
              <div key={category} className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-[#18322f]">
                    {category}
                  </h3>
                  <span className="text-xs text-[#71837f]">
                    {catPapers.length}{" "}
                    {catPapers.length === 1 ? "study" : "studies"}
                  </span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                  {catPapers.map((paper) => (
                    <motion.article
                      key={paper.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-30px" }}
                      transition={{ duration: 0.3 }}
                      className="group w-[340px] min-w-[340px] shrink-0 rounded-2xl border border-[#dbe6e2] bg-white p-5 transition-colors hover:border-[#a8cabe] sm:w-[380px] sm:min-w-[380px]"
                    >
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-medium text-[#96ada6]">
                          {paper.year}
                        </span>
                        {paper.openAccess && (
                          <span className="text-[11px] font-medium text-[#78918a]">
                            Open access
                          </span>
                        )}
                      </div>
                      <h4 className="mb-2 text-sm font-semibold leading-6 tracking-[-0.015em] text-[#18322f]">
                        {paper.title}
                      </h4>
                      <p className="mb-3 text-xs text-[#71837f]">
                        {paper.authors}{" "}
                        <span className="text-[#b0bfba]">·</span>{" "}
                        {paper.journal}
                      </p>
                      <p className="mb-3 text-xs leading-5 text-[#526965] line-clamp-3">
                        {paper.summary}
                      </p>
                      {paper.keyFindings.length > 0 && (
                        <div className="mb-3 rounded-xl bg-[#f5f8f7] p-3">
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#648079]">
                            Key findings
                          </p>
                          <ul className="space-y-1">
                            {paper.keyFindings.slice(0, 2).map((finding) => (
                              <li
                                key={finding}
                                className="flex items-start gap-1.5 text-[11px] leading-4 text-[#3b5c54]"
                              >
                                <ChevronRight className="mt-0.5 size-2.5 shrink-0 text-[#398b74]" />
                                <span className="line-clamp-2">{finding}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {paper.tags.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-1">
                          {paper.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded bg-[#f4f7f6] px-1.5 py-0.5 text-[10px] font-medium text-[#72847f]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          asChild
                          size="sm"
                          className="h-8 flex-1 cursor-pointer gap-1.5 bg-[#398b74] px-3 text-[11px] text-white hover:bg-[#2d755f]"
                        >
                          <a
                            href={paper.link}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Read <ExternalLink className="size-3" />
                          </a>
                        </Button>
                        {paper.pdfLink && (
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="h-8 flex-1 cursor-pointer gap-1.5 border-[#d5e2de] px-3 text-[11px] text-[#526965] hover:bg-[#f5f8f7]"
                          >
                            <a
                              href={paper.pdfLink}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              PDF <ExternalLink className="size-3" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </motion.article>
                  ))}
                </div>
              </div>
            ),
        )}
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#dce7e3] bg-[#fbfcfb]">
        <div className="mx-auto max-w-[1240px] px-5 py-6 sm:px-8 lg:px-10">
          <p className="text-xs leading-5 text-[#83938f]">
            This library is an information resource, not medical advice.
            Research findings can change as new evidence becomes available.
            Always discuss papers and individual care with your clinical team.
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs leading-5 text-[#83938f]">
            Prepared for customers <span className="text-[#b1c0bb]">·</span>{" "}
            <a
              href="/legal/medical"
              className="underline-offset-2 hover:underline"
            >
              Medical information notice
            </a>{" "}
            <span className="text-[#b1c0bb]">·</span>{" "}
            <a
              href="/legal/privacy"
              className="underline-offset-2 hover:underline"
            >
              Privacy
            </a>{" "}
            <span className="text-[#b1c0bb]">·</span>{" "}
            <a
              href="/legal/terms"
              className="underline-offset-2 hover:underline"
            >
              Terms
            </a>
          </p>
        </div>
      </footer>
    </motion.main>
  );
}
