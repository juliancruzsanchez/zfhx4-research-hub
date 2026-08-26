import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ChevronRight,
  Dna,
  ExternalLink,
  FileText,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { chatAboutResearch, type ChatMessage as ApiChatMessage } from "@/lib/firebase-functions";
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
  const chatEndRef = useRef<HTMLDivElement>(null);

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

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
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

      const { answer } = await chatAboutResearch(question, apiHistory);

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
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

  /* Derived data */
  const highlights = siteContent?.highlights ?? [];
  const stats = siteContent?.stats ?? [];
  const synthesis = siteContent?.currentUnderstanding ?? null;

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen bg-[#f6f8f7] text-[#18322f]"
    >
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <header className="border-b border-[#dce7e3] bg-[#fbfcfb]">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <a href="/" className="flex items-center gap-3" aria-label="ZFHX4 Research Hub home">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#18322f] text-[#d9f0e9]">
              <Dna className="size-[19px]" strokeWidth={1.8} />
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#18322f]">
              ZFHX4 Research Hub
            </span>
          </a>
          <div className="flex items-center gap-2 text-xs font-medium text-[#6a7d79] sm:gap-5">
            <span className="hidden sm:inline">A customer research resource</span>
            <a
              href="/auth"
              className="inline-flex rounded-lg bg-[#18322f] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#2a4b45]"
            >
              Open workspace
            </a>
            <span className="flex items-center gap-1.5 rounded-full border border-[#dce7e3] bg-white px-3 py-1.5 text-[#37665d]">
              <span className="size-1.5 rounded-full bg-[#3b9a7f]" />
              Version 1
            </span>
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
              <span className="text-[#398b74]">neurodevelopmental disorder</span>
            </motion.h1>

            {synthesis ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.45 }}
                className="mt-6 max-w-xl space-y-3"
              >
                {synthesis
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
                Research about loss of function in ZFHX4, organized to help customers
                and their care teams understand the evidence.
              </motion.p>
            )}
          </div>

          {/* Stats strip — from Firestore */}
          {stats.length > 0 && (
            <div className="mt-10 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#d4e5df] bg-[#d4e5df] sm:mt-14 sm:grid-cols-4">
              {stats.map((item) => (
                <div key={item.label} className="bg-[#f8fbfa] px-4 py-4 sm:px-5 sm:py-5">
                  <p className="text-xl font-semibold tracking-[-0.03em] text-[#18322f] sm:text-2xl">
                    {item.stat}
                  </p>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#718681]">
                    {item.label}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#96ada6]">{item.detail}</p>
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
                <h3 className="text-base font-semibold text-[#18322f]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#58706b]">{item.body}</p>
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
                A research assistant grounded in the published evidence. Ask about findings,
                genetics, symptoms, or specific studies.
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
                      <span className="animate-pulse [animation-delay:150ms]">●</span>
                      <span className="animate-pulse [animation-delay:300ms]">●</span>
                    </span>
                  </motion.div>
                )}

                <div ref={chatEndRef} />
              </div>

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

              {/* Suggested questions */}
              <div className="flex flex-wrap gap-2 border-t border-[#edf1ef] px-4 py-3 sm:px-5">
                {(chatMessages.length === 0
                  ? [
                      "What developmental features are associated with ZFHX4 loss of function?",
                      "How was the ZFHX4 connection discovered?",
                      "What do zebrafish studies tell us?",
                      "Is this condition inherited?",
                    ]
                  : [
                      "What are the main symptoms?",
                      "How is this diagnosed?",
                      "Are there treatment options?",
                      "What research is ongoing?",
                    ]
                ).map((q) => (
                  <button
                    key={q}
                    type="button"
                    disabled={isTyping}
                    onClick={() => handleSend(q)}
                    className="cursor-pointer rounded-full border border-[#d5e2de] bg-white px-3 py-1.5 text-xs font-medium text-[#526965] transition-colors hover:border-[#9ec8bb] hover:bg-[#f2f8f5] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Studies — from Firestore papers ─────────────────────────────── */}
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
            {papers.length} published {papers.length === 1 ? "paper" : "papers"} in
            chronological order. Open access where available.
          </p>
        </div>

        {papers.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#cddbd6] bg-white px-6 py-16 text-center">
            <BookOpen className="mx-auto size-6 text-[#9aada7]" />
            <h3 className="mt-4 text-base font-semibold text-[#29443e]">No papers published yet</h3>
            <p className="mt-1 text-sm text-[#71837f]">
              Research papers will appear here once published by the editorial team.
            </p>
          </div>
        )}

        <div className="space-y-4">
          {papers.map((paper, index) => (
            <motion.article
              key={paper.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
              className="group rounded-2xl border border-[#dbe6e2] bg-white p-5 transition-colors hover:border-[#a8cabe] sm:p-7"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge className="border-0 bg-[#e7f4ef] px-2.5 py-1 text-[11px] font-semibold text-[#317762] hover:bg-[#e7f4ef]">
                      {paper.type}
                    </Badge>
                    <span className="text-[11px] font-medium text-[#96ada6]">{paper.year}</span>
                    {paper.openAccess && (
                      <span className="text-[11px] font-medium text-[#78918a]">Open access</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold leading-7 tracking-[-0.025em] text-[#18322f] sm:text-xl sm:leading-8">
                    {paper.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#71837f]">
                    {paper.authors}{" "}
                    <span className="mx-1.5 text-[#b0bfba]">·</span> {paper.journal}
                  </p>
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-[#526965]">
                    {paper.summary}
                  </p>

                  {paper.keyFindings.length > 0 && (
                    <div className="mt-4 rounded-xl bg-[#f5f8f7] p-4">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#648079]">
                        Key findings
                      </p>
                      <ul className="space-y-1.5">
                        {paper.keyFindings.map((finding) => (
                          <li
                            key={finding}
                            className="flex items-start gap-2 text-sm leading-5 text-[#3b5c54]"
                          >
                            <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-[#398b74]" />
                            {finding}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {paper.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {paper.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-[#f4f7f6] px-2 py-0.5 text-[11px] font-medium text-[#72847f]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-3 border-t border-[#edf1ef] pt-5 lg:w-[142px] lg:flex-col lg:items-stretch lg:border-0 lg:pt-1">
                  <Button
                    asChild
                    className="h-10 flex-1 cursor-pointer gap-2 bg-[#398b74] px-4 text-sm font-medium text-white hover:bg-[#2d755f] lg:w-full lg:flex-none"
                  >
                    <a href={paper.link} target="_blank" rel="noopener noreferrer">
                      Read paper
                      <ExternalLink className="size-4" />
                    </a>
                  </Button>
                  {paper.pdfLink && (
                    <Button
                      asChild
                      variant="outline"
                      className="h-10 flex-1 cursor-pointer gap-2 border-[#d5e2de] px-4 text-sm font-medium text-[#526965] hover:bg-[#f5f8f7] lg:w-full lg:flex-none"
                    >
                      <a href={paper.pdfLink} target="_blank" rel="noopener noreferrer">
                        PDF
                        <ExternalLink className="size-3.5" />
                      </a>
                    </Button>
                  )}
                  <span className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#8a9b96] lg:justify-start">
                    <FileText className="size-3.5" />
                    {paper.source}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#dce7e3] bg-[#fbfcfb]">
        <div className="mx-auto max-w-[1240px] px-5 py-6 sm:px-8 lg:px-10">
          <p className="text-xs leading-5 text-[#83938f]">
            This library is an information resource, not medical advice. Research findings can
            change as new evidence becomes available. Always discuss papers and individual care
            with your clinical team.
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs leading-5 text-[#83938f]">
            Prepared for customers{" "}
            <span className="text-[#b1c0bb]">·</span>{" "}
            <a href="/legal/medical" className="underline-offset-2 hover:underline">
              Medical information notice
            </a>{" "}
            <span className="text-[#b1c0bb]">·</span>{" "}
            <a href="/legal/privacy" className="underline-offset-2 hover:underline">
              Privacy
            </a>{" "}
            <span className="text-[#b1c0bb]">·</span>{" "}
            <a href="/legal/terms" className="underline-offset-2 hover:underline">
              Terms
            </a>
          </p>
        </div>
      </footer>
    </motion.main>
  );
}
