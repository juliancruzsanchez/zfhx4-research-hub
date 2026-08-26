import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Dna,
  ExternalLink,
  FileText,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Paper {
  id: number;
  title: string;
  authors: string;
  journal: string;
  year: string;
  type: "Core study" | "Clinical context" | "Related biology";
  topics: string[];
  summary: string;
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
    topics: ["Development", "Genetics", "Cohort study"],
    summary:
      "A peer-reviewed study of 57 people with ZFHX4 protein-truncating variants or deletions. It describes shared developmental features and provides evidence that ZFHX4 loss of function is the underlying mechanism.",
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
    topics: ["Development", "Genetics", "Early access"],
    summary:
      "The openly available preprint reporting 57 individuals, including 52 probands and 5 affected family members. The final peer-reviewed version is listed above; this record is kept for transparency and early access.",
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
    topics: ["Craniofacial", "Development", "Model organism"],
    summary:
      "Combines human genetic data with zebrafish experiments to explore ZFHX4 in cleft lip and palate and cleft palate only. Helpful context for understanding the gene's role in craniofacial development.",
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
    topics: ["Clinical features", "Case report", "Facial features"],
    summary:
      "Describes a person with a ZFHX4 variant and a recognizable pattern of neuropsychological and facial features, adding early clinical context to the later loss-of-function cohort work.",
    link: "https://pubmed.ncbi.nlm.nih.gov/34461323/",
    source: "PubMed",
    openAccess: false,
  },
];

const filters = ["All papers", "Core study", "Clinical context", "Related biology"] as const;
type Filter = (typeof filters)[number];

export default function Landing() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("All papers");

  const filteredPapers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return papers.filter((paper) => {
      const matchesFilter =
        activeFilter === "All papers" || paper.type === activeFilter;
      const searchableText = [
        paper.title,
        paper.authors,
        paper.journal,
        paper.type,
        ...paper.topics,
      ]
        .join(" ")
        .toLowerCase();
      return matchesFilter && searchableText.includes(normalizedQuery);
    });
  }, [activeFilter, query]);

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen bg-[#f6f8f7] text-[#18322f]"
    >
      <header className="border-b border-[#dce7e3] bg-[#fbfcfb]">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <a href="/" className="flex items-center gap-3" aria-label="ZFHX4 Research home">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#18322f] text-[#d9f0e9]">
              <Dna className="size-[19px]" strokeWidth={1.8} />
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#18322f]">
              ZFHX4 Research
            </span>
          </a>
          <div className="flex items-center gap-2 text-xs font-medium text-[#6a7d79] sm:gap-5">
            <span className="hidden sm:inline">A family-first paper index</span>
            <span className="flex items-center gap-1.5 rounded-full border border-[#dce7e3] bg-white px-3 py-1.5 text-[#37665d]">
              <span className="size-1.5 rounded-full bg-[#3b9a7f]" />
              Version 1
            </span>
          </div>
        </div>
      </header>

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
                <BookOpen className="size-3.5" />
              </span>
              Research, made easier to find
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14, duration: 0.45 }}
              className="max-w-2xl text-[clamp(2.35rem,5vw,4.6rem)] font-semibold leading-[1.02] tracking-[-0.055em] text-[#18322f]"
            >
              Understanding <span className="text-[#398b74]">ZFHX4</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.45 }}
              className="mt-6 max-w-xl text-base leading-7 text-[#58706b] sm:text-[17px]"
            >
              A clear, growing collection of research about loss of function in ZFHX4, gathered for families and the people who support them.
            </motion.p>
          </div>

          <div className="mt-10 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-[#d4e5df] bg-[#d4e5df] sm:mt-14 sm:grid-cols-4">
            {[
              ["04", "papers indexed"],
              ["57", "people in core study"],
              ["2021", "earliest paper here"],
              ["Open", "access where available"],
            ].map(([value, label]) => (
              <div key={label} className="bg-[#f8fbfa] px-4 py-4 sm:px-5 sm:py-5">
                <p className="text-xl font-semibold tracking-[-0.03em] text-[#18322f] sm:text-2xl">{value}</p>
                <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[#718681]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1240px] px-5 py-9 sm:px-8 sm:py-12 lg:px-10">
        <div className="flex flex-col justify-between gap-6 border-b border-[#dce7e3] pb-7 md:flex-row md:items-end">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-[#6c827c]">
              <span className="size-2 rounded-full bg-[#3b9a7f]" />
              The library
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-[#18322f] sm:text-3xl">
              Papers worth starting with
            </h2>
            <p className="mt-2 text-sm leading-6 text-[#71837f]">
              {filteredPapers.length} {filteredPapers.length === 1 ? "paper" : "papers"} matching your view
            </p>
          </div>
          <div className="flex w-full max-w-md items-center gap-2 rounded-xl border border-[#d5e2de] bg-white px-3 ring-offset-2 transition focus-within:ring-2 focus-within:ring-[#a9d8c9] md:w-[300px]">
            <Search className="size-4 shrink-0 text-[#8ba09a]" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, topic, author..."
              aria-label="Search papers"
              className="h-11 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 py-6">
          <SlidersHorizontal className="mr-1 size-4 text-[#81958f]" />
          {filters.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <Button
                key={filter}
                variant="outline"
                size="sm"
                onClick={() => setActiveFilter(filter)}
                className={isActive
                  ? "h-9 cursor-pointer border-[#18322f] bg-[#18322f] px-3.5 text-xs font-medium text-white hover:bg-[#264a44] hover:text-white"
                  : "h-9 cursor-pointer border-[#d6e3df] bg-white px-3.5 text-xs font-medium text-[#5d736d] hover:border-[#9ec8bb] hover:bg-[#f2f8f5] hover:text-[#18322f]"}
              >
                {isActive && <Check className="mr-1.5 size-3.5" />}
                {filter}
              </Button>
            );
          })}
        </div>

        <div className="space-y-4">
          {filteredPapers.map((paper, index) => (
            <motion.article
              key={paper.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.35 }}
              className="group rounded-2xl border border-[#dbe6e2] bg-white p-5 transition-colors hover:border-[#a8cabe] sm:p-7"
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <Badge className="border-0 bg-[#e7f4ef] px-2.5 py-1 text-[11px] font-semibold text-[#317762] hover:bg-[#e7f4ef]">
                      {paper.type}
                    </Badge>
                    {paper.openAccess && (
                      <span className="text-[11px] font-medium text-[#78918a]">Open access</span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold leading-7 tracking-[-0.025em] text-[#18322f] sm:text-xl sm:leading-8">
                    {paper.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#71837f]">
                    {paper.authors} <span className="mx-1.5 text-[#b0bfba]">·</span> {paper.journal} <span className="mx-1.5 text-[#b0bfba]">·</span> {paper.year}
                  </p>
                  <p className="mt-5 max-w-2xl text-sm leading-6 text-[#526965]">
                    {paper.summary}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {paper.topics.map((topic) => (
                      <span key={topic} className="rounded-md bg-[#f4f7f6] px-2.5 py-1 text-[11px] font-medium text-[#72847f]">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 border-t border-[#edf1ef] pt-5 lg:w-[142px] lg:flex-col lg:items-stretch lg:border-0 lg:pt-1">
                  <Button asChild className="h-10 flex-1 cursor-pointer gap-2 bg-[#398b74] px-4 text-sm font-medium text-white hover:bg-[#2d755f] lg:w-full lg:flex-none">
                    <a href={paper.link} target="_blank" rel="noopener noreferrer">
                      Read paper
                      <ArrowUpRight className="size-4" />
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

          {filteredPapers.length === 0 && (
            <div className="border border-dashed border-[#cddbd6] bg-white px-6 py-16 text-center">
              <Search className="mx-auto size-6 text-[#9aada7]" />
              <h3 className="mt-4 text-base font-semibold text-[#29443e]">No papers found</h3>
              <p className="mt-1 text-sm text-[#71837f]">Try a different search term or topic.</p>
            </div>
          )}
        </div>

        <footer className="mt-12 border-t border-[#dce7e3] py-6 text-xs leading-5 text-[#83938f]">
          <p>
            This library is an information resource, not medical advice. Research findings can change as new evidence becomes available. Always discuss papers and individual care with your clinical team.
          </p>
          <p className="mt-2 flex items-center gap-1.5">
            Curated for families <span className="text-[#b1c0bb">·</span> Links open at their original source
          </p>
        </footer>
      </section>
    </motion.main>
  );
}
