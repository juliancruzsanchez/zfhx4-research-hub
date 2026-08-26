/**
 * Seed script — populates Firestore with known ZFHX4 loss-of-function studies.
 *
 * Usage:
 *   export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
 *   bun run seed
 *
 * Or authenticate locally:
 *   gcloud auth application-default login
 *   bun run seed
 */

import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "node:fs";

/* ─── Firebase init ──────────────────────────────────────────────────────────── */

function initAdmin() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH && existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)) {
    const serviceAccount = JSON.parse(
      readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH, "utf8"),
    );
    return initializeApp({ credential: cert(serviceAccount) });
  }
  return initializeApp({ credential: applicationDefault() });
}

/* ─── Paper data (verified from PubMed, July 2026) ───────────────────────────── */

interface SeedPaper {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  type: "Core study" | "Clinical context" | "Related biology" | "Review";
  summary: string;
  keyFindings: string[];
  tags: string[];
  symptomsIdentified: string[];
  participants: string;
  link: string;
  pdfLink: string;
  source: string;
  openAccess: boolean;
}

const papers: SeedPaper[] = [
  {
    pmid: "40367947",
    title: "Loss of function of the zinc finger homeobox 4 gene, ZFHX4, underlies a neurodevelopmental disorder",
    authors: "Pérez Baca et al.",
    journal: "American Journal of Human Genetics",
    year: "2025",
    type: "Core study",
    summary:
      "The definitive cohort study reporting 63 individuals (57 probands and 6 affected family members) with protein-truncating variants, (micro)deletions, or an inversion affecting ZFHX4. Confirms ZFHX4 loss of function causes a recognizable neurodevelopmental disorder and demonstrates craniofacial and behavioral abnormalities in zfhx4 crispant zebrafish.",
    keyFindings: [
      "63 individuals with ZFHX4 loss-of-function variants or deletions identified",
      "Phenotype includes variable developmental delay and intellectual disability, distinctive facial features, CNS morphological abnormalities, behavioral alterations, short stature, and hypotonia",
      "Occasional cleft palate and anterior segment dysgenesis observed",
      "8q21.11 microdeletions and intragenic loss-of-function variants produce largely overlapping phenotypes",
      "ZFHX4 expression increases during human brain development and neuronal differentiation",
      "zfhx4 crispant zebrafish show shorter Meckel's cartilage, smaller ethmoid plates, reduced movement, and hindbrain abnormalities",
    ],
    tags: ["Neurodevelopment", "Loss of function", "Cohort study", "Zebrafish model", "8q21.11"],
    symptomsIdentified: [
      "Developmental delay",
      "Intellectual disability",
      "Hypotonia",
      "Distinctive facial features",
      "Behavioral alterations",
      "Short stature",
      "Cleft palate",
    ],
    participants: "63 individuals (57 probands, 6 affected family members)",
    link: "https://pubmed.ncbi.nlm.nih.gov/40367947/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12256859/",
    source: "PMC",
    openAccess: true,
  },
  {
    pmid: "39148819",
    title: "Loss-of-function of the Zinc Finger Homeobox 4 (ZFHX4) gene underlies a neurodevelopmental disorder",
    authors: "Del Rocío et al.",
    journal: "medRxiv preprint",
    year: "2024",
    type: "Core study",
    summary:
      "The openly available preprint version of the ZFHX4 cohort study, reporting the initial identification of individuals with ZFHX4 loss-of-function variants. Includes the in vivo zebrafish work suggesting a role for zfhx4 in facial skeleton patterning, palatal development, and behavior. Later peer-reviewed as Pérez Baca et al. (2025) in the American Journal of Human Genetics.",
    keyFindings: [
      "Early access report of the ZFHX4 loss-of-function cohort",
      "Zebrafish work suggests a role for zfhx4 in facial skeleton patterning, palatal development, and behavior",
      "Preprint of the peer-reviewed Pérez Baca et al. (2025) study",
    ],
    tags: ["Neurodevelopment", "Loss of function", "Preprint", "Zebrafish model"],
    symptomsIdentified: ["Developmental delay", "Intellectual disability", "Facial dysmorphism"],
    participants: "Not specified (preprint cohort)",
    link: "https://pubmed.ncbi.nlm.nih.gov/39148819/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11326360/",
    source: "PMC",
    openAccess: true,
  },
  {
    pmid: "39702590",
    title: "Role of ZFHX4 in orofacial clefting based on human genetic data and zebrafish models",
    authors: "Ishorst et al.",
    journal: "European Journal of Human Genetics",
    year: "2025",
    type: "Related biology",
    summary:
      "Investigates ZFHX4's role in orofacial clefting by combining human genetic data with zebrafish experiments. Demonstrates that ZFHX4 variants can lead to both nonsyndromic and syndromic forms of cleft lip and/or palate and cleft palate only, expanding the phenotypic spectrum of ZFHX4-related conditions.",
    keyFindings: [
      "ZFHX4 variants linked to cleft lip and/or palate (CL/P) and cleft palate only (CPO)",
      "Variants can cause both syndromic and nonsyndromic forms of clefting",
      "Zebrafish experiments confirm ZFHX4's role in craniofacial development",
    ],
    tags: ["Orofacial clefting", "Craniofacial", "Zebrafish model", "Human genetics"],
    symptomsIdentified: ["Cleft lip and/or palate", "Cleft palate only", "Craniofacial anomalies"],
    participants: "Not specified",
    link: "https://pubmed.ncbi.nlm.nih.gov/39702590/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7617551/",
    source: "PMC",
    openAccess: true,
  },
  {
    pmid: "34461323",
    title: "A ZFHX4 mutation associated with a recognizable neuropsychological and facial phenotype",
    authors: "Fontana et al.",
    journal: "European Journal of Medical Genetics",
    year: "2021",
    type: "Clinical context",
    summary:
      "Case report describing a female patient with a de novo heterozygous ZFHX4 variant presenting with mild intellectual disability, autism spectrum disorder, strabismus, ptosis, low-set and prominent ears, high-arched palate, and microretrognathia. Provides early clinical evidence that point mutations in ZFHX4 can cause a recognizable neuropsychological and facial phenotype, distinct from but overlapping with 8q21.11 deletion syndrome.",
    keyFindings: [
      "First point mutation in ZFHX4 associated with a recognizable phenotype",
      "Features include mild intellectual disability, autism spectrum disorder, strabismus, and ptosis",
      "High-arched palate and microretrognathia among facial features",
      "Phenotype overlaps with but is milder than 8q21.11 deletion syndrome",
    ],
    tags: ["Case report", "Autism spectrum disorder", "Facial dysmorphism", "De novo variant"],
    symptomsIdentified: [
      "Mild intellectual disability",
      "Autism spectrum disorder",
      "Strabismus",
      "Ptosis",
      "High-arched palate",
      "Microretrognathia",
    ],
    participants: "1 individual (case report)",
    link: "https://pubmed.ncbi.nlm.nih.gov/34461323/",
    pdfLink: "",
    source: "PubMed",
    openAccess: false,
  },
  {
    pmid: "40657976",
    title: "A de-novo frameshift variant in ZFHX4 associated with a recognisable neurodevelopmental disorder: a case report",
    authors: "Goel & O'Donnell",
    journal: "Clinical Dysmorphology",
    year: "2025",
    type: "Clinical context",
    summary:
      "Independent case report describing a patient with a de novo frameshift variant in ZFHX4 presenting with a recognizable neurodevelopmental disorder. Adds independent clinical validation of the ZFHX4 loss-of-function phenotype described in the larger cohort study.",
    keyFindings: [
      "De novo frameshift variant in ZFHX4 causes a recognizable neurodevelopmental disorder",
      "Independent case confirms the phenotype reported in the larger cohort",
    ],
    tags: ["Case report", "Frameshift variant", "De novo variant", "Neurodevelopment"],
    symptomsIdentified: ["Neurodevelopmental delay", "Recognizable facial features"],
    participants: "1 individual (case report)",
    link: "https://pubmed.ncbi.nlm.nih.gov/40657976/",
    pdfLink: "",
    source: "PubMed",
    openAccess: false,
  },
  {
    pmid: "36595458",
    title: "Concurrent de novo ZFHX4 variant and 16q24.1 deletion in a patient with orofacial clefting; a potential role of ZFHX4 and USP10",
    authors: "Créton et al.",
    journal: "American Journal of Medical Genetics Part A",
    year: "2023",
    type: "Clinical context",
    summary:
      "Describes a girl with a unilateral cleft lip, alveolus and palate, tooth agenesis, and mild dysmorphic features found to carry both a de novo loss-of-function ZFHX4 variant and a maternal 16q24.1 deletion encompassing USP10. Supports ZFHX4 as a novel cleft gene and suggests USP10 may contribute to the etiology of orofacial clefts in humans.",
    keyFindings: [
      "De novo loss-of-function ZFHX4 variant (p.(Asn838fs)) in a patient with cleft lip, alveolus and palate",
      "Concurrent maternal 16q24.1 deletion encompassing the cleft candidate gene USP10",
      "Supports ZFHX4 as a novel cleft gene",
      "USP10 may contribute to orofacial cleft etiology",
    ],
    tags: ["Orofacial clefting", "Case report", "De novo variant", "Cleft gene"],
    symptomsIdentified: ["Cleft lip and palate", "Tooth agenesis", "Mild dysmorphic features"],
    participants: "1 individual (case report)",
    link: "https://pubmed.ncbi.nlm.nih.gov/36595458/",
    pdfLink: "",
    source: "PubMed",
    openAccess: false,
  },
  {
    pmid: "37434517",
    title: "ZFHX4 truncating variant and orofacial clefting",
    authors: "Sorrentino et al.",
    journal: "American Journal of Medical Genetics Part A",
    year: "2024",
    type: "Clinical context",
    summary:
      "A commentary supporting the role of ZFHX4 truncating variants in orofacial clefting, in response to the Créton et al. (2023) case report. Adds clinical support for ZFHX4 as a cleft-associated gene.",
    keyFindings: [
      "Supports ZFHX4 truncating variants as a cause of orofacial clefting",
      "Clinical commentary reinforcing ZFHX4's role in craniofacial development",
    ],
    tags: ["Orofacial clefting", "Commentary", "Truncating variant"],
    symptomsIdentified: ["Orofacial clefting"],
    participants: "Not specified",
    link: "https://pubmed.ncbi.nlm.nih.gov/37434517/",
    pdfLink: "",
    source: "PubMed",
    openAccess: false,
  },
  {
    pmid: "39320016",
    title: "Expression analysis of genes including Zfhx4 in mice and zebrafish reveals a temporospatial conserved molecular basis underlying craniofacial development",
    authors: "Liu et al.",
    journal: "Developmental Dynamics",
    year: "2025",
    type: "Related biology",
    summary:
      "Characterizes the expression of Zfhx4 alongside other craniofacial genes in mice and zebrafish, revealing a temporospatially conserved molecular basis underlying craniofacial development. Establishes ZFHX4 as a novel pathogenic gene associated with orofacial clefts in humans and provides developmental context for its role.",
    keyFindings: [
      "Zfhx4 expression is temporospatially conserved in mice and zebrafish",
      "Confirms ZFHX4 as a novel pathogenic gene for orofacial clefts in humans",
      "Provides developmental context for ZFHX4's role in craniofacial biology",
    ],
    tags: ["Craniofacial development", "Mouse model", "Zebrafish model", "Gene expression"],
    symptomsIdentified: ["Craniofacial anomalies"],
    participants: "Not applicable (animal model study)",
    link: "https://pubmed.ncbi.nlm.nih.gov/39320016/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11877995/",
    source: "PMC",
    openAccess: true,
  },
  {
    pmid: "42208531",
    title: "ZFHX4 is necessary for dopaminergic neuron differentiation and controls cell cycle by regulating LIN28A",
    authors: "Valceschini et al.",
    journal: "Stem Cell Reports",
    year: "2026",
    type: "Related biology",
    summary:
      "Functional study demonstrating that ZFHX4 is required for dopaminergic neuron differentiation and controls cell cycle by regulating LIN28A. Provides mechanistic insight into how ZFHX4 loss of function disrupts neural development at the cellular level.",
    keyFindings: [
      "ZFHX4 is necessary for dopaminergic neuron differentiation",
      "ZFHX4 controls cell cycle via regulation of LIN28A",
      "Provides cellular mechanism for ZFHX4-related neurodevelopmental phenotypes",
    ],
    tags: ["Neurodevelopment", "Dopaminergic neurons", "Cell cycle", "Mechanism"],
    symptomsIdentified: [],
    participants: "Not applicable (cell biology study)",
    link: "https://pubmed.ncbi.nlm.nih.gov/42208531/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13261933/",
    source: "PMC",
    openAccess: true,
  },
  {
    pmid: "41912658",
    title: "Rare variants in embryonic development and cell signalling genes in syndromic and non-syndromic orofacial clefts: evidence from a Colombian Caribbean cohort",
    authors: "Silva et al.",
    journal: "Journal of Human Genetics",
    year: "2026",
    type: "Related biology",
    summary:
      "Population study from a Colombian Caribbean cohort identifying rare variants in embryonic development and cell signaling genes — including ZFHX4 — in syndromic and nonsyndromic orofacial clefts. Adds human population evidence for ZFHX4's involvement in cleft etiology.",
    keyFindings: [
      "Rare ZFHX4 variants identified in a Colombian cohort with orofacial clefts",
      "Supports ZFHX4's role in both syndromic and nonsyndromic clefting",
    ],
    tags: ["Orofacial clefting", "Population study", "Rare variants"],
    symptomsIdentified: ["Syndromic orofacial clefts", "Nonsyndromic orofacial clefts"],
    participants: "Colombian Caribbean cohort (size not specified)",
    link: "https://pubmed.ncbi.nlm.nih.gov/41912658/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC13303074/",
    source: "PMC",
    openAccess: true,
  },
  {
    pmid: "21802062",
    title: "Characterization of a 8q21.11 microdeletion syndrome associated with intellectual disability and a recognizable phenotype",
    authors: "Palomares et al.",
    journal: "American Journal of Human Genetics",
    year: "2011",
    type: "Clinical context",
    summary:
      "The foundational medical-journal paper characterizing the 8q21.11 microdeletion syndrome — a microdeletion that encompasses the ZFHX4 gene — associated with intellectual disability, a recognizable facial phenotype, and other features. Established the syndrome later shown to result from ZFHX4 loss of function.",
    keyFindings: [
      "First detailed characterization of 8q21.11 microdeletion syndrome, which encompasses ZFHX4",
      "Associated with intellectual disability and a recognizable facial phenotype",
      "Provided the clinical foundation later linked to ZFHX4 loss of function",
    ],
    tags: ["8q21.11", "Microdeletion syndrome", "Intellectual disability", "Medical genetics"],
    symptomsIdentified: ["Intellectual disability", "Recognizable facial phenotype"],
    participants: "Not specified (microdeletion cohort)",
    link: "https://pubmed.ncbi.nlm.nih.gov/21802062/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3155189/",
    source: "PMC",
    openAccess: true,
  },
  {
    pmid: "27378168",
    title: "8q21.11 microdeletion in two patients with syndromic Peters anomaly",
    authors: "Happ et al.",
    journal: "American Journal of Medical Genetics Part A",
    year: "2016",
    type: "Clinical context",
    summary:
      "Case report of two patients with 8q21.11 microdeletions — encompassing ZFHX4 — presenting with syndromic Peters anomaly (an anterior segment eye malformation). Contributed to defining the ocular phenotype associated with deletion of the ZFHX4 region.",
    keyFindings: [
      "8q21.11 microdeletion (encompassing ZFHX4) in two patients with Peters anomaly",
      "Defined anterior segment eye involvement in 8q21.11 deletion syndrome",
    ],
    tags: ["8q21.11", "Peters anomaly", "Eye malformation", "Microdeletion"],
    symptomsIdentified: ["Peters anomaly", "Anterior segment dysgenesis"],
    participants: "2 individuals (case series)",
    link: "https://pubmed.ncbi.nlm.nih.gov/27378168/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC5119633/",
    source: "PMC",
    openAccess: true,
  },
  {
    pmid: "34549899",
    title: "8q21.11 microdeletion syndrome: Delineation of HEY1 as a candidate gene in neurodevelopmental and cardiac defects",
    authors: "Ben Ayed et al.",
    journal: "Molecular Genetics & Genomic Medicine",
    year: "2021",
    type: "Related biology",
    summary:
      "Delineates the 8q21.11 microdeletion syndrome — the region containing ZFHX4 — and investigates candidate genes contributing to neurodevelopmental and cardiac defects. Provides important context for understanding which genes in the deleted region drive the phenotype.",
    keyFindings: [
      "Delineates 8q21.11 microdeletion syndrome including the ZFHX4 locus",
      "Proposes HEY1 as a candidate gene for neurodevelopmental and cardiac defects",
      "Adds context for the gene content of the ZFHX4 region",
    ],
    tags: ["8q21.11", "HEY1", "Microdeletion syndrome", "Candidate gene"],
    symptomsIdentified: ["Neurodevelopmental defects", "Cardiac defects"],
    participants: "Not specified",
    link: "https://pubmed.ncbi.nlm.nih.gov/34549899/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8606210/",
    source: "PMC",
    openAccess: true,
  },
];

/* ─── Seed logic ─────────────────────────────────────────────────────────────── */

async function seed() {
  const app = initAdmin();
  const db = getFirestore(app);
  const now = Timestamp.now();

  console.log(`Seeding ${papers.length} papers...`);

  const batch = db.batch();

  for (const paper of papers) {
    const ref = db.collection("papers").doc();
    batch.set(ref, {
      ...paper,
      status: "published",
      discoveredAt: now,
      approvedAt: now,
    });
  }

  // Initial site content (will be regenerated by synthesizeUnderstanding)
  const contentRef = db.collection("siteContent").doc("main");
  batch.set(
    contentRef,
    {
      currentUnderstanding:
        "Loss of function of the ZFHX4 gene causes a recognizable neurodevelopmental disorder. " +
        "A multinational cohort study of 63 individuals (Pérez Baca et al., 2025) established that " +
        "protein-truncating variants, microdeletions, and inversions affecting ZFHX4 produce a consistent " +
        "phenotype including variable developmental delay and intellectual disability, distinctive facial " +
        "features, central nervous system morphological abnormalities, behavioral alterations, short stature, " +
        "and hypotonia, with occasional cleft palate and anterior segment dysgenesis.\n\n" +
        "Independent case reports (Fontana et al., 2021; Goel & O'Donnell, 2025) confirm that de novo ZFHX4 " +
        "point mutations can cause the same recognizable phenotype, which overlaps with but is milder than " +
        "8q21.11 deletion syndrome. Functional studies show ZFHX4 is required for proper neuronal " +
        "differentiation (Valceschini et al., 2026) and that ZFHX4 disruption causes craniofacial and " +
        "behavioral abnormalities in zebrafish models (Pérez Baca et al., 2025; Ishorst et al., 2025).\n\n" +
        "ZFHX4 also plays a well-established role in orofacial development: variants have been linked to " +
        "both syndromic and nonsyndromic cleft lip and/or palate and cleft palate only (Ishorst et al., 2025; " +
        "Créton et al., 2023; Sorrentino et al., 2024; Liu et al., 2025; Silva et al., 2026), making ZFHX4 a " +
        "novel cleft-associated gene.\n\n" +
        "Taken together, the evidence delineates a ZFHX4-associated neurodevelopmental disorder with a " +
        "spectrum spanning neurodevelopmental, craniofacial, and behavioral features, and suggests a role " +
        "for ZFHX4 in facial skeleton patterning, palatal development, and neural development.",
      highlights: [
        {
          title: "Recognizable neurodevelopmental disorder",
          body: "63 individuals with ZFHX4 loss-of-function variants share developmental delay, intellectual disability, distinctive facial features, and behavioral alterations — establishing a distinct clinical entity (Pérez Baca et al., 2025).",
          icon: "users",
        },
        {
          title: "Loss of function is the mechanism",
          body: "Protein-truncating variants, microdeletions, and inversions prevent ZFHX4 from functioning as a transcription factor, disrupting genes critical for embryonic, neuronal, and axonal development.",
          icon: "dna",
        },
        {
          title: "Novel cleft-associated gene",
          body: "Human genetic data and zebrafish models link ZFHX4 to syndromic and nonsyndromic cleft lip and/or palate and cleft palate only (Ishorst et al., 2025).",
          icon: "search",
        },
        {
          title: "Evidence spanning 2021–2026",
          body: "From the first case report (Fontana et al., 2021) to cohort confirmation and mechanistic studies in stem cells and zebrafish, the evidence base continues to grow.",
          icon: "file",
        },
      ],
      stats: [
        { stat: "63", label: "people studied", detail: "largest cohort (57 probands + 6 family)" },
        { stat: "13", label: "research papers", detail: "2011 – 2026" },
        { stat: "1", label: "confirmed mechanism", detail: "ZFHX4 loss of function" },
        { stat: "Open", label: "access available", detail: "9 of 13 papers" },
      ],
      lastSynthesizedAt: now,
      lastRefreshAt: now,
      publishedPaperCount: papers.length,
    },
    { merge: true },
  );

  await batch.commit();

  console.log(`✅ Seeded ${papers.length} papers as published.`);
  console.log("✅ Wrote initial site content (synthesis, highlights, stats).");
  console.log("\nNext steps:");
  console.log("  1. Call synthesizeUnderstanding to regenerate synthesis from the AI:");
  console.log('     firebase functions:shell → synthesizeUnderstanding({})');
  console.log("  2. Or just use the 'Re-synthesize' button in the Workspace → Research papers tab.");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  });
