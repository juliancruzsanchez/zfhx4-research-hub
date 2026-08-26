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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/* ─── Paper data ───────────────────────────────────────────────────────────── */

interface Paper {
  id: number;
  title: string;
  authors: string;
  journal: string;
  year: string;
  type: "Core study" | "Clinical context" | "Related biology";
  summary: string;
  keyFindings: string[];
  link: string;
  source: "PubMed" | "PMC" | "medRxiv";
  openAccess: boolean;
}

const papers: Paper[] = [
  {
    id: 1,
    title:
      "Loss of function of the zinc finger homeobox 4 gene, ZFHX4, underlies a neurodevelopmental disorder",
    authors: "Baca et al.",
    journal: "American Journal of Human Genetics",
    year: "2025",
    type: "Core study",
    summary:
      "A peer-reviewed study of 57 people with ZFHX4 protein-truncating variants or deletions. It describes shared developmental features and provides evidence that ZFHX4 loss of function is the underlying mechanism.",
    keyFindings: [
      "57 individuals with ZFHX4 loss-of-function variants studied",
      "Identified a recognizable neurodevelopmental disorder",
      "Shared features include developmental delay, intellectual disability, and characteristic facial features",
      "Loss of function is the confirmed disease mechanism",
    ],
    link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12256859/",
    source: "PMC",
    openAccess: true,
  },
  {
    id: 2,
    title:
      "Loss-of-function of the Zinc Finger Homeobox 4 (ZFHX4) gene underlies a neurodevelopmental disorder",
    authors: "Del Rocío et al.",
    journal: "medRxiv preprint",
    year: "2024",
    type: "Core study",
    summary:
      "The openly available preprint reporting 57 individuals, including 52 probands and 5 affected family members. The final peer-reviewed version is listed above; this record is kept for transparency and early access.",
    keyFindings: [
      "52 probands and 5 affected family members identified",
      "Confirms autosomal dominant inheritance pattern",
      "Phenotype includes developmental delay and dysmorphic features",
    ],
    link: "https://www.medrxiv.org/content/10.1101/2024.08.07.24311381v1",
    source: "medRxiv",
    openAccess: true,
  },
  {
    id: 3,
    title:
      "Role of ZFHX4 in orofacial clefting based on human genetic data and zebrafish models",
    authors: "Ishorst et al.",
    journal: "European Journal of Human Genetics",
    year: "2025",
    type: "Related biology",
    summary:
      "Combines human genetic data with zebrafish experiments to explore ZFHX4 in cleft lip and palate and cleft palate only. Helpful context for understanding the gene's role in craniofacial development.",
    keyFindings: [
      "ZFHX4 variants linked to cleft lip and palate",
      "Zebrafish models confirm role in craniofacial development",
      "Expands the phenotypic spectrum of ZFHX4-related conditions",
    ],
    link: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7617551/",
    source: "PMC",
    openAccess: true,
  },
  {
    id: 4,
    title:
      "A ZFHX4 mutation associated with a recognizable neuropsychological and facial phenotype",
    authors: "Fontana et al.",
    journal: "American Journal of Medical Genetics Part A",
    year: "2021",
    type: "Clinical context",
    summary:
      "Describes a person with a ZFHX4 variant and a recognizable pattern of neuropsychological and facial features, adding early clinical context to the later loss-of-function cohort work.",
    keyFindings: [
      "First individual case linking ZFHX4 to a recognizable phenotype",
      "Identified consistent neuropsychological features",
      "Provides early clinical evidence before the larger cohort study",
    ],
    link: "https://pubmed.ncbi.nlm.nih.gov/34461323/",
    source: "PubMed",
    openAccess: false,
  },
];

/* ─── Chat knowledge base ──────────────────────────────────────────────────── */

const knowledgeBase: { patterns: RegExp[]; answer: string }[] = [
  {
    patterns: [/what\s+(is|does)\s+ZFHX4/i, /tell\s+me\s+about\s+ZFHX4/i, /about\s+ZFHX4/i],
    answer:
      "ZFHX4 (Zinc Finger Homeobox 4) is a gene that provides instructions for making a protein that acts as a transcription factor — it helps control the activity of other genes. Research has identified it as critical for neurodevelopment and craniofacial development. Loss-of-function variants in this gene cause a recognizable neurodevelopmental disorder.",
  },
  {
    patterns: [/what\s+(was|is)\s+found/i, /main\s+(finding|result|conclusion)/i, /key\s+(finding|result|takeaway)/i, /summary/i, /what.*learn/i, /what.*discover/i],
    answer:
      "The core finding across the research is that loss of function of ZFHX4 causes a neurodevelopmental disorder. In the largest study (Baca et al., 2025), 57 people with ZFHX4 variants were studied and found to share developmental delay, intellectual disability, and characteristic facial features. Additional research linked ZFHX4 to craniofacial development, including cleft lip and palate, confirmed through zebrafish experiments.",
  },
  {
    patterns: [/how\s+many\s+(people|individuals|patients|subjects|participants)/i, /sample\s+size/i, /cohort/i, /how\s+large/i],
    answer:
      "The largest cohort study (Baca et al., 2025) included 57 individuals — 52 probands (the first person in a family identified with the condition) and 5 affected family members. This study confirmed the autosomal dominant inheritance pattern, meaning a single copy of the altered gene is sufficient to cause the disorder.",
  },
  {
    patterns: [/symptom|feature|sign|phenotype|presentation|characteristic/i, /what\s+does\s+it\s+(look|present)/i, /clinical/i],
    answer:
      "The ZFHX4-related neurodevelopmental disorder presents with a recognizable pattern of features including: developmental delay, intellectual disability (ranging from mild to moderate), characteristic facial features (described as a recognizable dysmorphic pattern), and possible craniofacial features such as cleft lip or palate. The phenotype is consistent enough across affected individuals to be considered a distinct clinical entity.",
  },
  {
    patterns: [/inherit|genetic|autosomal|dominant|recessive|passed/i, /how\s+(is\s+it|does\s+it)\s+(inherited|passed|spread)/i],
    answer:
      "ZFHX4-related conditions follow an autosomal dominant inheritance pattern. This means that a single copy of the altered gene (from one parent) is enough to cause the disorder. In the cohort study, 5 affected family members were identified, confirming that the condition can be inherited within families. However, many cases appear to arise as new (de novo) mutations, meaning the variant is not inherited from a parent.",
  },
  {
    patterns: [/craniofacial|cleft|facial|face/i, /orofacial/i],
    answer:
      "Research by Ishorst et al. (2025) specifically explored ZFHX4's role in craniofacial development. Using both human genetic data and zebrafish models, they found that ZFHX4 variants are associated with cleft lip and palate, as well as cleft palate only. The zebrafish experiments confirmed that ZFHX4 plays a direct role in craniofacial development, expanding the known phenotypic spectrum of ZFHX4-related conditions.",
  },
  {
    patterns: [/zebrafish|animal\s+model|model\s+organism/i],
    answer:
      "Ishorst et al. (2025) used zebrafish as a model organism to study ZFHX4's function. Zebrafish are commonly used in developmental biology because their embryos are transparent and develop quickly. The zebrafish experiments confirmed that disrupting the ZFHX4 gene leads to craniofacial abnormalities, supporting the human genetic evidence that ZFHX4 is critical for proper facial development.",
  },
  {
    patterns: [/treatment|therapy|cure|intervention|manage/i, /is\s+there\s+(a\s+)?cure/i, /can\s+it\s+be\s+treated/i],
    answer:
      "Currently, there is no specific cure for ZFHX4-related neurodevelopmental disorders. Treatment focuses on managing symptoms and supporting developmental needs — this may include speech therapy, occupational therapy, educational support, and monitoring for associated features like cleft lip or palate (which can be surgically corrected). Research is ongoing to better understand the condition and develop targeted interventions.",
  },
  {
    patterns: [/when|date|year|timeline|latest|newest|recent/i, /what\s+year/i],
    answer:
      "The research timeline spans from 2021 to 2025: Fontana et al. (2021) published the first case report linking ZFHX4 to a recognizable phenotype. Del Rocío et al. (2024) released the preprint describing the 57-person cohort. Baca et al. (2025) published the peer-reviewed version confirming ZFHX4 loss-of-function as the disease mechanism. Also in 2025, Ishorst et al. demonstrated ZFHX4's role in craniofacial development through zebrafish models.",
  },
  {
    patterns: [/open\s+access|free|pdf|read|available/i, /can\s+i\s+read/i, /where\s+can\s+i/i],
    answer:
      "Three of the four papers are open access and freely available: Baca et al. (2025) on PMC, the Del Rocío et al. (2024) preprint on medRxiv, and Ishorst et al. (2025) on PMC. The Fontana et al. (2021) paper on PubMed may require institutional access. You'll find direct links to all papers in the Studies section below.",
  },
  {
    patterns: [/loss\s+of\s+function|mechanism|pathogenic|variant|mutation/i, /what\s+(causes|is\s+the\s+cause)/i],
    answer:
      "The disorder is caused by loss-of-function variants in the ZFHX4 gene. These include protein-truncating variants (mutations that create a premature stop codon, producing a shortened, nonfunctional protein) and deletions of part or all of the gene. When ZFHX4 function is lost, the transcription factor can no longer properly regulate its target genes during development, leading to the neurodevelopmental and craniofacial features observed in affected individuals.",
  },
];

function findAnswer(question: string): string {
  for (const entry of knowledgeBase) {
    if (entry.patterns.some((p) => p.test(question))) {
      return entry.answer;
    }
  }
  return "That's a great question. While I don't have a specific answer for that in my current knowledge base, I'd recommend reviewing the original studies linked below for more details. You can also try asking about ZFHX4, the research findings, symptoms, inheritance patterns, or the studies themselves.";
}

/* ─── Chat message type ────────────────────────────────────────────────────── */

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export default function Landing() {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Welcome! I'm a research assistant for ZFHX4. Ask me about the findings, symptoms, genetics, or any of the studies — and I'll point you to the evidence.",
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, scrollToBottom]);

  function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const question = chatInput.trim();
    if (!question) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: question,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      const answer = findAnswer(question);
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: answer,
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 600 + Math.random() * 800);
  }

  /* Unique findings across all papers */
  const topFindings = useMemo(
    () => [
      {
        stat: "57",
        label: "people studied",
        detail: "across the core cohort",
      },
      {
        stat: "4",
        label: "research papers",
        detail: "2021 – 2025",
      },
      {
        stat: "1",
        label: "confirmed mechanism",
        detail: "ZFHX4 loss of function",
      },
      {
        stat: "Open",
        label: "access available",
        detail: "3 of 4 papers",
      },
    ],
    [],
  );

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

      {/* ─── Hero: lead with findings ────────────────────────────────────── */}
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

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
              className="mt-6 max-w-xl text-base leading-7 text-[#58706b] sm:text-[17px]"
            >
              A study of 57 individuals confirmed that protein-truncating variants and deletions
              in ZFHX4 cause a recognizable pattern of developmental delay, intellectual disability,
              and characteristic facial features — establishing a distinct clinical entity.
            </motion.p>
          </div>

          {/* Stats strip */}
          <div className="mt-10 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#d4e5df] bg-[#d4e5df] sm:mt-14 sm:grid-cols-4">
            {topFindings.map((item) => (
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
        </div>
      </section>

      {/* ─── Key findings ────────────────────────────────────────────────── */}
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
          {[
            {
              icon: <Users className="size-5" />,
              title: "Recognizable neurodevelopmental disorder",
              body: "Fifty-seven individuals with ZFHX4 loss-of-function variants share a consistent pattern of developmental delay, intellectual disability, and dysmorphic facial features — establishing this as a distinct clinical entity.",
            },
            {
              icon: <Dna className="size-5" />,
              title: "Loss of function is the mechanism",
              body: "Protein-truncating variants and gene deletions prevent ZFHX4 from performing its role as a transcription factor, disrupting the regulation of genes critical for neurodevelopment.",
            },
            {
              icon: <Search className="size-5" />,
              title: "Craniofacial development confirmed",
              body: "Zebrafish experiments and human genetic data link ZFHX4 to cleft lip and palate, expanding the known phenotypic spectrum and confirming its role in facial development.",
            },
            {
              icon: <FileText className="size-5" />,
              title: "First identified in 2021",
              body: "An initial case report described a recognizable neuropsychological and facial phenotype, providing early clinical evidence that preceded the larger cohort confirmation.",
            },
          ].map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border border-[#dbe6e2] bg-white p-6"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-[#edf5f2] text-[#398b74]">
                {item.icon}
              </div>
              <h3 className="text-base font-semibold text-[#18322f]">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#58706b]">{item.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

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
              <div className="flex h-[380px] flex-col gap-3 overflow-y-auto p-5 sm:h-[420px] sm:p-6">
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
                onSubmit={handleSend}
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
              {chatMessages.length <= 1 && (
                <div className="flex flex-wrap gap-2 border-t border-[#edf1ef] px-4 py-3 sm:px-5">
                  {[
                    "What was found in the studies?",
                    "How many people were studied?",
                    "Is this inherited?",
                    "What are the symptoms?",
                  ].map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setChatInput(q);
                      }}
                      className="cursor-pointer rounded-full border border-[#d5e2de] bg-white px-3 py-1.5 text-xs font-medium text-[#526965] transition-colors hover:border-[#9ec8bb] hover:bg-[#f2f8f5]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Studies ─────────────────────────────────────────────────────── */}
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
            All four papers in chronological order. Open access where available.
          </p>
        </div>

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

                  {/* Key findings */}
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
                  <span className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-[#8a9b96] lg:justify-start">
                    <FileText className="size-3.5" />
                    {paper.source}
                    <ExternalLink className="size-3" />
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
