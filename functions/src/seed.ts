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

/* ─── Paper data (verified from PubMed, August 2026) ─────────────────────────── */

interface SeedPaper {
  pmid: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  type: "Core study" | "Clinical context" | "Related biology" | "Review" | "Mechanism";
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
  /* ─── CORE: The definitive cohort studies ─────────────────────────────────── */
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

  /* ─── CORE: Case reports ─────────────────────────────────────────────────── */
  {
    pmid: "34461323",
    title: "A ZFHX4 mutation associated with a recognizable neuropsychological and facial phenotype",
    authors: "Fontana et al.",
    journal: "European Journal of Medical Genetics",
    year: "2021",
    type: "Clinical context",
    summary:
      "Case report describing a female patient with a de novo heterozygous ZFHX4 variant presenting with mild intellectual disability, autism spectrum disorder, strabismus, ptosis, low-set and prominent ears, high-arched palate, and microretrognathia. The first point mutation in ZFHX4 associated with a recognizable phenotype.",
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
      "Describes a girl with a unilateral cleft lip, alveolus and palate, tooth agenesis, and mild dysmorphic features found to carry both a de novo loss-of-function ZFHX4 variant and a maternal 16q24.1 deletion encompassing USP10. Supports ZFHX4 as a novel cleft gene.",
    keyFindings: [
      "De novo loss-of-function ZFHX4 variant (p.(Asn838fs)) in a patient with cleft lip, alveolus and palate",
      "Concurrent maternal 16q24.1 deletion encompassing the cleft candidate gene USP10",
      "Supports ZFHX4 as a novel cleft gene",
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

  /* ─── CORE: Orofacial clefting / craniofacial ────────────────────────────── */
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
    pmid: "39320016",
    title: "Expression analysis of genes including Zfhx4 in mice and zebrafish reveals a temporospatial conserved molecular basis underlying craniofacial development",
    authors: "Liu et al.",
    journal: "Developmental Dynamics",
    year: "2025",
    type: "Related biology",
    summary:
      "Characterizes the expression of Zfhx4 alongside other craniofacial genes in mice and zebrafish, revealing a temporospatially conserved molecular basis underlying craniofacial development. Establishes ZFHX4 as a novel pathogenic gene associated with orofacial clefts in humans.",
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

  /* ─── RELATED BIOLOGY: Animal models and mechanisms ───────────────────────── */
  {
    pmid: "42208531",
    title: "ZFHX4 is necessary for dopaminergic neuron differentiation and controls cell cycle by regulating LIN28A",
    authors: "Valceschini et al.",
    journal: "Stem Cell Reports",
    year: "2026",
    type: "Mechanism",
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
    pmid: "33475140",
    title: "Ablation of Zfhx4 results in early postnatal lethality by disrupting the respiratory center in mice",
    authors: "Zhang et al.",
    journal: "Journal of Molecular Cell Biology",
    year: "2021",
    type: "Mechanism",
    summary:
      "Zfhx4 knockout mice die shortly after birth from an inability to initiate respiration. Zfhx4 is specifically expressed in brainstem regions and is coexpressed with Phox2b and Math1. Zfhx4 ablation greatly decreases expression of these proteins, especially in the retrotrapezoid nucleus. ChIP-seq identified Phox2b as a direct downstream target of Zfhx4, establishing it as a critical regulator of perinatal breathing.",
    keyFindings: [
      "Zfhx4 knockout mice are neonatal lethal due to respiratory failure",
      "Zfhx4 is specifically expressed in brainstem regions controlling respiration",
      "Phox2b is a direct downstream target of Zfhx4 (confirmed by ChIP-seq)",
      "Zfhx4 is essential for perinatal breathing via the retrotrapezoid nucleus",
    ],
    tags: ["Mouse knockout", "Brainstem", "Respiratory center", "Phox2b", "Neonatal lethality"],
    symptomsIdentified: ["Neonatal lethality", "Respiratory failure"],
    participants: "Not applicable (mouse model study)",
    link: "https://pubmed.ncbi.nlm.nih.gov/33475140/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8260053/",
    source: "PMC",
    openAccess: true,
  },
  {
    pmid: "34732852",
    title: "Zfhx4 regulates endochondral ossification as the transcriptional platform of Osterix in mice",
    authors: "Nakamura et al.",
    journal: "Communications Biology",
    year: "2021",
    type: "Mechanism",
    summary:
      "Identifies Zfhx4 as a crucial transcriptional partner of Osterix in endochondral ossification. Zfhx4-deficient mice have reduced expression of matrix metallopeptidase 13 and inhibited calcification of cartilage matrices. Zfhx4 coordinates the transcriptional network of Osterix and consequently endochondral ossification, providing a mechanism for the skeletal features observed in ZFHX4-related disorders.",
    keyFindings: [
      "Zfhx4 is highly expressed in cartilage and interacts physically with Osterix",
      "Zfhx4-deficient mice show inhibited calcification of cartilage matrices",
      "Zfhx4 coordinates the transcriptional network of Osterix for endochondral ossification",
      "Double mutant mice (Zfhx4 + Osterix) show more severe phenotype than Zfhx4 alone",
    ],
    tags: ["Bone development", "Endochondral ossification", "Osterix", "Mouse model", "Cartilage"],
    symptomsIdentified: ["Skeletal abnormalities", "Short stature"],
    participants: "Not applicable (mouse model study)",
    link: "https://pubmed.ncbi.nlm.nih.gov/34732852/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC8566502/",
    source: "PMC",
    openAccess: true,
  },

  /* ─── RELATED BIOLOGY: Ocular phenotype ──────────────────────────────────── */
  {
    pmid: "39450701",
    title: "Further Evidence for a Possible Role for ZFHX4 in Human Ocular Development and Disease",
    authors: "Reis et al.",
    journal: "American Journal of Medical Genetics Part A",
    year: "2025",
    type: "Related biology",
    summary:
      "Provides further evidence for ZFHX4's role in human ocular development and disease, building on the anterior segment dysgenesis observed in ZFHX4-related neurodevelopmental disorder cohort and 8q21.11 deletion patients with Peters anomaly.",
    keyFindings: [
      "Additional evidence for ZFHX4 in human ocular development",
      "Links ZFHX4 to anterior segment dysgenesis and ocular anomalies",
    ],
    tags: ["Ocular development", "Anterior segment dysgenesis", "Peters anomaly"],
    symptomsIdentified: ["Anterior segment dysgenesis", "Ocular anomalies"],
    participants: "Not specified",
    link: "https://pubmed.ncbi.nlm.nih.gov/39450701/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11821440/",
    source: "PMC",
    openAccess: true,
  },
  {
    pmid: "40650233",
    title: "Novel Genetic Variants and Clinical Profiles in Peters Anomaly Spectrum Disorders",
    authors: "Delas et al.",
    journal: "International Journal of Molecular Sciences",
    year: "2025",
    type: "Clinical context",
    summary:
      "Reports a patient with a heterozygous ~1.6 Mb deletion spanning PEX2 and ZFHX4 genes presenting with Peters anomaly. Both patients had de novo variants, expanding the genetic landscape of Peters anomaly spectrum disorders.",
    keyFindings: [
      "Heterozygous deletion spanning PEX2 and ZFHX4 in a Peters anomaly patient",
      "Phenotypic variability between patients with ZFHX4-region deletions and FOXC1 variants",
    ],
    tags: ["Peters anomaly", "Ocular dysgenesis", "Microdeletion", "Genetic variants"],
    symptomsIdentified: ["Peters anomaly", "Corneal opacity", "Systemic anomalies"],
    participants: "2 individuals (case series)",
    link: "https://pubmed.ncbi.nlm.nih.gov/40650233/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12250460/",
    source: "PMC",
    openAccess: true,
  },
  {
    pmid: "34969027",
    title: "Advances in the Genetics of Congenital Ptosis",
    authors: "Wu et al.",
    journal: "Ophthalmic Research",
    year: "2022",
    type: "Review",
    summary:
      "Comprehensive review of the genetics of congenital ptosis. Identifies ZFHX4 and COL25A1 as genes involved in simple congenital ptosis. Reviews the pathogenesis, epidemiology, and clinical features of congenital ptosis and associated syndromes.",
    keyFindings: [
      "ZFHX4 identified as a gene involved in simple congenital ptosis",
      "Reviews the myogenic and neurogenic pathogenesis of congenital ptosis",
      "Prevalence ranges from 0.79 to 1.99 per 10,000 people",
    ],
    tags: ["Ptosis", "Review", "Genetics", "Congenital eye anomaly"],
    symptomsIdentified: ["Congenital ptosis", "Drooping upper eyelid"],
    participants: "Review (no original cohort)",
    link: "https://pubmed.ncbi.nlm.nih.gov/34969027/",
    pdfLink: "",
    source: "PubMed",
    openAccess: false,
  },
  {
    pmid: "41524020",
    title: "Genetic analysis of Han-Chinese patients with isolated congenital ptosis",
    authors: "Zhang et al.",
    journal: "International Journal of Ophthalmology",
    year: "2026",
    type: "Clinical context",
    summary:
      "Genetic analysis of Han-Chinese patients with isolated congenital ptosis, identifying ZFHX4 variants among the genetic causes of this condition.",
    keyFindings: [
      "ZFHX4 variants identified in Han-Chinese patients with isolated congenital ptosis",
      "Adds population-specific data for ZFHX4-related ptosis",
    ],
    tags: ["Ptosis", "Genetic analysis", "Han-Chinese population"],
    symptomsIdentified: ["Isolated congenital ptosis"],
    participants: "Han-Chinese cohort (size not specified)",
    link: "https://pubmed.ncbi.nlm.nih.gov/41524020/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12782065/",
    source: "PMC",
    openAccess: true,
  },
  {
    pmid: "32962661",
    title: "Genetic analysis of children with congenital ocular anomalies in three ecological regions of Nepal",
    authors: "Adhikari et al.",
    journal: "BMC Medical Genetics",
    year: "2020",
    type: "Clinical context",
    summary:
      "Population-based study from Nepal identifying a missense alteration (G12411T) of the ZFHX4 gene in a child with congenital ptosis. First of its kind from Nepal, identifying unique mutations in the Nepalese population.",
    keyFindings: [
      "Missense alteration in ZFHX4 gene identified in a child with congenital ptosis",
      "Unique ZFHX4 variant identified in the Nepalese population",
    ],
    tags: ["Ptosis", "Population genetics", "Nepal", "Congenital ocular anomaly"],
    symptomsIdentified: ["Congenital ptosis"],
    participants: "25 children with congenital ocular anomalies (Nepal)",
    link: "https://pubmed.ncbi.nlm.nih.gov/32962661/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7510079/",
    source: "PMC",
    openAccess: true,
  },

  /* ─── RELATED BIOLOGY: Speech / language development ──────────────────────── */
  {
    pmid: "29463886",
    title: "A set of regulatory genes co-expressed in embryonic human brain is implicated in disrupted speech development",
    authors: "Eising et al.",
    journal: "Molecular Psychiatry",
    year: "2019",
    type: "Related biology",
    summary:
      "Whole-genome sequencing study of 19 unrelated individuals with childhood apraxia of speech. Identified novel loss-of-function variants in ZFHX4 alongside KAT6A, SETBP1, TNRC6B, and MKL2. Shows these genes cluster within a single co-expression module highly expressed during early human brain development, implicating gene regulatory pathways in speech acquisition.",
    keyFindings: [
      "ZFHX4 loss-of-function variants identified in individuals with childhood apraxia of speech",
      "ZFHX4 clusters with other speech-related genes in a brain co-expression module",
      "Gene regulatory pathways in the developing brain contribute to speech acquisition",
    ],
    tags: ["Speech development", "Childhood apraxia of speech", "Co-expression", "Brain development"],
    symptomsIdentified: ["Childhood apraxia of speech", "Speech impairment"],
    participants: "19 individuals with childhood apraxia of speech",
    link: "https://pubmed.ncbi.nlm.nih.gov/29463886/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC6756287/",
    source: "PMC",
    openAccess: true,
  },
  {
    pmid: "39381681",
    title: "Expanding the molecular landscape of childhood apraxia of speech: evidence from a single-center experience",
    authors: "Formicola et al.",
    journal: "Frontiers in Neuroscience",
    year: "2024",
    type: "Related biology",
    summary:
      "Expands the molecular landscape of childhood apraxia of speech, adding evidence for ZFHX4 variants in speech and language disorders.",
    keyFindings: [
      "ZFHX4 variants identified in childhood apraxia of speech cohort",
      "Expands the molecular understanding of speech motor planning disorders",
    ],
    tags: ["Childhood apraxia of speech", "Speech development", "Molecular genetics"],
    symptomsIdentified: ["Childhood apraxia of speech"],
    participants: "Single-center cohort (size not specified)",
    link: "https://pubmed.ncbi.nlm.nih.gov/39381681/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11459770/",
    source: "PMC",
    openAccess: true,
  },
  {
    pmid: "41159814",
    title: "Genomic Investigations of Spoken and Written Language Abilities: A Guide to Advances in Approaches, Technologies, and Discovery",
    authors: "Fisher SE",
    journal: "Journal of Speech, Language, and Hearing Research",
    year: "2025",
    type: "Review",
    summary:
      "Comprehensive review of genomic investigations of spoken and written language abilities, including discussion of ZFHX4 as a gene implicated in speech and language disorders through loss-of-function variants.",
    keyFindings: [
      "ZFHX4 discussed as a gene implicated in speech/language disorders",
      "Reviews advances in genomic approaches to studying language abilities",
    ],
    tags: ["Review", "Language genetics", "Genomic methods"],
    symptomsIdentified: ["Speech and language impairment"],
    participants: "Review (no original cohort)",
    link: "https://pubmed.ncbi.nlm.nih.gov/41159814/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12614925/",
    source: "PMC",
    openAccess: true,
  },

  /* ─── RELATED BIOLOGY: 8q21.11 microdeletion syndrome ────────────────────── */
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
  {
    pmid: "33565068",
    title: "Clinical characterization and genetic analysis of a newborn with chromosome 8q21.11 deletion syndrome",
    authors: "Li et al.",
    journal: "Chinese Journal of Medical Genetics",
    year: "2021",
    type: "Clinical context",
    summary:
      "Clinical characterization and genetic analysis of a newborn with corneal opacity caused by a de novo 5.5 Mb microdeletion at chromosome 8q21.11-q21.13 encompassing ZFHX4 and PEX2 genes. Diagnosed with 8q21.11 deletion syndrome.",
    keyFindings: [
      "De novo 5.5 Mb microdeletion at 8q21.11-q21.13 encompassing ZFHX4 and PEX2",
      "Newborn presented with corneal opacity",
      "ZFHX4 proposed as a key gene underlying the 8q21.11 deletion syndrome",
    ],
    tags: ["8q21.11", "Microdeletion", "Newborn", "Corneal opacity"],
    symptomsIdentified: ["Corneal opacity", "8q21.11 deletion syndrome"],
    participants: "1 individual (case report)",
    link: "https://pubmed.ncbi.nlm.nih.gov/33565068/",
    pdfLink: "",
    source: "PubMed",
    openAccess: false,
  },
  {
    pmid: "41736988",
    title: "Prenatal Diagnosis and Genotype-Phenotype Correlation in 8q21.11 Microdeletion Syndrome: A Case Report",
    authors: "Libotte et al.",
    journal: "International Medical Case Reports Journal",
    year: "2026",
    type: "Clinical context",
    summary:
      "Prenatal diagnosis of 8q21.11 microdeletion syndrome in a fetus with increased nuchal translucency. The deletion has a critical small region of overlap of 539.77 Kb with ZFHX4 implicated in neurodevelopmental disorders and ocular anomalies.",
    keyFindings: [
      "Prenatal diagnosis of 8q21.11 microdeletion with ZFHX4 in the critical region",
      "Critical small region of overlap (SRO) of 539.77 Kb identified",
      "Underscores importance of high-resolution genomic testing in prenatal assessment",
    ],
    tags: ["8q21.11", "Prenatal diagnosis", "Microdeletion", "Nuchal translucency"],
    symptomsIdentified: ["Prenatal anomalies", "Intellectual disability", "Facial dysmorphism"],
    participants: "1 fetus (prenatal case)",
    link: "https://pubmed.ncbi.nlm.nih.gov/41736988/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12927719/",
    source: "PMC",
    openAccess: true,
  },

  /* ─── RELATED BIOLOGY: Schizophrenia / psychiatric ────────────────────────── */
  {
    pmid: "39439118",
    title: "Rare nonsynonymous germline and mosaic de novo variants in Japanese patients with schizophrenia",
    authors: "Watanabe et al.",
    journal: "Psychiatry and Clinical Neurosciences",
    year: "2025",
    type: "Related biology",
    summary:
      "Whole-exome sequencing study identifying a nonsense mosaic de novo variant in ZFHX4 among 73 Japanese individuals with schizophrenia. Part of eight DNVs found in known risk genes for psychiatric and neurodevelopmental disorders.",
    keyFindings: [
      "Nonsense mosaic de novo variant in ZFHX4 identified in schizophrenia patient",
      "ZFHX4 among known risk genes for psychiatric and neurodevelopmental disorders",
    ],
    tags: ["Schizophrenia", "Mosaic variant", "De novo variant", "Psychiatric genetics"],
    symptomsIdentified: ["Schizophrenia"],
    participants: "73 affected offspring and 134 parents from 67 families (Japan)",
    link: "https://pubmed.ncbi.nlm.nih.gov/39439118/",
    pdfLink: "",
    source: "PubMed",
    openAccess: false,
  },

  /* ─── RELATED BIOLOGY: Heart defects ──────────────────────────────────────── */
  {
    pmid: "24127225",
    title: "Identification of novel candidate gene loci and increased sex chromosome aneuploidy among infants with conotruncal heart defects",
    authors: "Osoegawa et al.",
    journal: "American Journal of Medical Genetics Part A",
    year: "2014",
    type: "Related biology",
    summary:
      "Population-based study screening 389 California infants with conotruncal heart defects. Identified ZFHX4 as one of five high-priority candidate genes along with GATA4, CRKL, BMPR1A, and SNAI2 for outflow tract development.",
    keyFindings: [
      "ZFHX4 identified as a high-priority candidate gene for conotruncal heart defects",
      "Found among five candidate genes (GATA4, CRKL, BMPR1A, SNAI2, ZFHX4) for outflow tract development",
    ],
    tags: ["Congenital heart defect", "Conotruncal", "Candidate gene", "Outflow tract"],
    symptomsIdentified: ["Conotruncal heart defects", "Tetralogy of Fallot"],
    participants: "389 California infants with conotruncal defects (from 974,579 births)",
    link: "https://pubmed.ncbi.nlm.nih.gov/24127225/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC3946915/",
    source: "PMC",
    openAccess: true,
  },

  /* ─── RELATED BIOLOGY: Gene function / molecular mechanism ────────────────── */
  {
    pmid: "24440720",
    title: "ZFHX4 interacts with the NuRD core member CHD4 and regulates the glioblastoma tumor-initiating cell state",
    authors: "Chudnovsky et al.",
    journal: "Cell Reports",
    year: "2014",
    type: "Mechanism",
    summary:
      "Demonstrates that ZFHX4 interacts with the NuRD (nucleosome remodeling and deacetylase) complex member CHD4, providing insight into the molecular function of ZFHX4 as a transcriptional regulator. Important for understanding how ZFHX4 loss disrupts gene regulatory networks.",
    keyFindings: [
      "ZFHX4 physically interacts with CHD4, a core member of the NuRD chromatin remodeling complex",
      "ZFHX4 regulates the tumor-initiating cell state through NuRD interaction",
      "Provides molecular mechanism for ZFHX4's role as a transcriptional regulator",
    ],
    tags: ["NuRD complex", "CHD4", "Transcriptional regulation", "Molecular mechanism"],
    symptomsIdentified: [],
    participants: "Not applicable (molecular biology study)",
    link: "https://pubmed.ncbi.nlm.nih.gov/24440720/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4041390/",
    source: "PMC",
    openAccess: true,
  },
  {
    pmid: "26643480",
    title: "Identification of Drosophila Zfh2 as a Mediator of Hypercapnic Immune Regulation by a Genome-Wide RNA Interference Screen",
    authors: "Helenius et al.",
    journal: "Journal of Immunology",
    year: "2016",
    type: "Related biology",
    summary:
      "Identifies Drosophila Zfh2 (a homolog of ZFHX4) as a mediator of hypercapnic immune regulation through a genome-wide RNAi screen. Provides evolutionary context for ZFHX4 family function.",
    keyFindings: [
      "Drosophila Zfh2 (ZFHX4 homolog) mediates hypercapnic immune regulation",
      "Evolutionary conservation of ZFHX4 family in biological regulation",
    ],
    tags: ["Drosophila", "Homolog", "Evolutionary biology", "Immune regulation"],
    symptomsIdentified: [],
    participants: "Not applicable (Drosophila study)",
    link: "https://pubmed.ncbi.nlm.nih.gov/26643480/",
    pdfLink: "https://pmc.ncbi.nlm.nih.gov/articles/PMC4707113/",
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

  // Count open access
  const openAccessCount = papers.filter((p) => p.openAccess).length;
  const yearRange = `${Math.min(...papers.map((p) => parseInt(p.year)))} – ${Math.max(...papers.map((p) => parseInt(p.year)))}`;

  // Initial site content for all 3 reading levels
  const contentRef = db.collection("siteContent").doc("main");

  const laymanSynthesis =
    "When the ZFHX4 gene doesn't work properly, it causes a condition that affects how a child's brain and body develop. " +
    "Researchers studied 63 people and found that these gene changes lead to learning difficulties, unique facial features, " +
    "differences in brain structure, behavioral changes, being shorter than average, and weak muscle tone. Some children " +
    "also have a cleft palate and eye problems.\n\n" +
    "Doctors have also found that when just one copy of the ZFHX4 gene is changed (through a single spelling error in the " +
    "DNA), children can have similar features — though usually milder. Scientists have shown that ZFHX4 is needed for " +
    "brain cells to develop properly, and when it's disrupted in zebrafish, they develop abnormal facial features and " +
    "behaviors that are similar to what's seen in humans.\n\n" +
    "ZFHX4 also affects the mouth and face: changes in this gene have been found in children born with a cleft lip or " +
    "cleft palate, which is when the lip or roof of the mouth doesn't fully close during pregnancy. Other features " +
    "linked to ZFHX4 include droopy eyelids (ptosis), eye development problems, difficulty with speech and language, " +
    "heart defects, and in some cases, mental health conditions.\n\n" +
    "In mice, removing ZFHX4 prevents newborns from breathing properly, showing just how essential this gene is. " +
    "At the cellular level, ZFHX4 works as a switch that turns other genes on and off during development. " +
    "Overall, ZFHX4 plays a vital role in how the brain, face, and body form before and after birth.";

  const clinicalSynthesis =
    "Loss-of-function variants in ZFHX4 are associated with a recognizable neurodevelopmental disorder. " +
    "A multinational cohort of 63 individuals (Pérez Baca et al., 2025) established that protein-truncating variants, " +
    "microdeletions, and inversions affecting ZFHX4 produce a consistent phenotype: variable developmental delay " +
    "and intellectual disability, distinctive facial dysmorphology, central nervous system morphological abnormalities, " +
    "behavioral alterations, short stature, hypotonia, and occasional cleft palate and anterior segment dysgenesis.\n\n" +
    "De novo ZFHX4 point mutations produce the same recognizable phenotype, overlapping with but milder than 8q21.11 " +
    "deletion syndrome (Fontana et al., 2021; Goel & O'Donnell, 2025). Functional studies demonstrate that ZFHX4 is " +
    "required for neuronal differentiation and that disruption causes craniofacial and behavioral abnormalities in " +
    "zebrafish models.\n\n" +
    "ZFHX4 is also implicated in orofacial development, with variants linked to syndromic and nonsyndromic cleft " +
    "lip/palate. Additional phenotypic features include congenital ptosis, anterior segment dysgenesis/Peters " +
    "anomaly, childhood apraxia of speech, conotruncal heart defects, and mosaic variants in schizophrenia.\n\n" +
    "Molecular mechanisms include interaction with the NuRD chromatin remodeling complex, regulation of dopaminergic " +
    "neuron differentiation via LIN28A, and transcriptional partnership with Osterix in endochondral ossification.";

  const scientistSynthesis =
    "Biallelic and monoallelic loss-of-function (LoF) variants in the zinc finger homeobox 4 gene (ZFHX4; 8q21.11) " +
    "delineate a autosomal dominant neurodevelopmental disorder (Pérez Baca et al., 2025; n=63). The mutational " +
    "spectrum comprises protein-truncating variants (PTVs), copy-number losses, and inversions disrupting the " +
    "ZFHX4 locus, producing a consistent phenotype of variable ID/DD, distinctive facial gestalt, CNS " +
    "morphological anomalies, behavioral dysregulation, short stature, hypotonia, cleft palate, and anterior " +
    "segment dysgenesis. Phenotypic severity correlates with variant type, with PTVs and large deletions " +
    "associated with more severe presentation relative to missense variants.\n\n" +
    "ZFHX4 encodes a multi-ZnF transcription factor that physically interacts with the NuRD (nucleosome remodeling " +
    "and deacetylase) chromatin remodeling complex via CHD4 (Chudnovsky et al., 2014), positioning it as an " +
    "epigenetic regulator of developmental gene networks. ZFHX4 is required for proper neuronal differentiation " +
    "and controls dopaminergic neuron specification through LIN28A regulation (Valceschini et al., 2026), while " +
    "also functioning as a transcriptional partner of Osterix/Sp7 in endochondral ossification (Nakamura et al., 2021).\n\n" +
    "Loss-of-function studies in mouse (Zfhx4-null) demonstrate neonatal lethality due to respiratory failure " +
    "secondary to absence of retrotrapezoid nucleus neurons (Zhang et al., 2021). Zebrafish models recapitulate " +
    "craniofacial and behavioral phenotypes (Ishorst et al., 2025). The ZFHX4 locus also harbors a long non-coding " +
    "RNA (ZFHX4-AS1) involved in neural differentiation regulation.\n\n" +
    "Convergent human genetic evidence implicates ZFHX4 in orofacial clefting (Ishorst et al., 2025; Créton et al., " +
    "2023; Sorrentino et al., 2024; Liu et al., 2025; Silva et al., 2026), congenital ptosis (Wu et al., 2022; " +
    "Zhang et al., 2026), Peters anomaly (Happ et al., 2016; Delas et al., 2025; Reis et al., 2025), childhood " +
    "apraxia of speech (Eising et al., 2019; Formicola et al., 2024), conotruncal heart defects (Osoegawa et al., " +
    "2014), and schizophrenia (Watanabe et al., 2025). The 8q21.11 microdeletion syndrome encompasses ZFHX4 and " +
    "adjacent genes including HEY1 (Ben Ayed et al., 2021) and USP10 (Créton et al., 2023).";

  batch.set(
    contentRef,
    {
      currentUnderstanding_layman: laymanSynthesis,
      currentUnderstanding_clinical: clinicalSynthesis,
      currentUnderstanding_scientist: scientistSynthesis,
      currentUnderstanding: laymanSynthesis,
      highlights_layman: [
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
          title: "Evidence spanning 2011–2026",
          body: "From the first 8q21.11 deletion characterization (Palomares et al., 2011) through the first case report (Fontana et al., 2021) to cohort confirmation and mechanistic studies in stem cells and zebrafish, the evidence base continues to grow.",
          icon: "file",
        },
      ],
      highlights_clinical: [
        {
          title: "Recognizable neurodevelopmental disorder",
          body: "A multinational cohort of 63 individuals with ZFHX4 LoF variants presents a consistent phenotype of developmental delay, intellectual disability, distinctive facial dysmorphology, CNS anomalies, and behavioral alterations (Pérez Baca et al., 2025).",
          icon: "users",
        },
        {
          title: "Loss of function is the mechanism",
          body: "PTVs, microdeletions, and inversions ablate ZFHX4 transcription factor activity, disrupting developmental gene networks critical for embryonic and neuronal differentiation.",
          icon: "dna",
        },
        {
          title: "Novel cleft-associated gene",
          body: "Convergent evidence from human genetics and zebrafish models links ZFHX4 to syndromic and nonsyndromic orofacial clefting (Ishorst et al., 2025).",
          icon: "search",
        },
        {
          title: "Evidence spanning 2011–2026",
          body: "From 8q21.11 deletion syndrome characterization through cohort studies, zebrafish models, and stem-cell mechanistic data, the evidence base is maturing rapidly.",
          icon: "file",
        },
      ],
      highlights_scientist: [
        {
          title: "Delineated autosomal dominant LoF syndrome",
          body: "63 individuals with biallelic/monoallelic ZFHX4 PTVs, CNVs, and inversions demonstrate a consistent phenotypic spectrum of ID/DD, dysmorphic facies, CNS structural anomalies, and hypotonia (Pérez Baca et al., 2025).",
          icon: "users",
        },
        {
          title: "Epigenetic mechanism via NuRD complex",
          body: "ZFHX4 physically interacts with CHD4/NuRD, functioning as an epigenetic transcriptional regulator of developmental gene networks including dopaminergic neuron specification via LIN28A.",
          icon: "dna",
        },
        {
          title: "Pleiotropic phenotypic spectrum",
          body: "Convergent human genetic evidence implicates ZFHX4 in orofacial clefting, congenital ptosis, Peters anomaly, childhood apraxia of speech, conotruncal heart defects, and schizophrenia.",
          icon: "search",
        },
        {
          title: "Cross-species functional validation",
          body: "Zfhx4-null mice exhibit neonatal lethality from RTN neuron absence; zebrafish models recapitulate craniofacial and behavioral phenotypes, confirming conserved developmental function.",
          icon: "file",
        },
      ],
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
          title: "Evidence spanning 2011–2026",
          body: "From the first 8q21.11 deletion characterization (Palomares et al., 2011) through the first case report (Fontana et al., 2021) to cohort confirmation and mechanistic studies in stem cells and zebrafish, the evidence base continues to grow.",
          icon: "file",
        },
      ],
      stats_layman: [
        { stat: "63", label: "people studied", detail: "largest study so far" },
        { stat: `${papers.length}`, label: "research papers", detail: yearRange },
        { stat: "1", label: "root cause", detail: "ZFHX4 gene not working properly" },
        { stat: `${openAccessCount}`, label: "free to read", detail: `of ${papers.length} papers` },
      ],
      stats_clinical: [
        { stat: "63", label: "patients characterized", detail: "cohort (Pérez Baca et al., 2025)" },
        { stat: `${papers.length}`, label: "research papers", detail: yearRange },
        { stat: "1", label: "confirmed mechanism", detail: "ZFHX4 loss of function" },
        { stat: `${openAccessCount}`, label: "open access", detail: `of ${papers.length} papers` },
      ],
      stats_scientist: [
        { stat: "63", label: "individuals (n=63)", detail: "largest LoF cohort to date" },
        { stat: `${papers.length}`, label: "published studies", detail: yearRange },
        { stat: "1", label: "molecular mechanism", detail: "ZFHX4 haploinsufficiency + NuRD" },
        { stat: `${openAccessCount}`, label: "open access", detail: `of ${papers.length} papers` },
      ],
      stats: [
        { stat: "63", label: "people studied", detail: "largest cohort (57 probands + 6 family)" },
        { stat: `${papers.length}`, label: "research papers", detail: yearRange },
        { stat: "1", label: "confirmed mechanism", detail: "ZFHX4 loss of function" },
        { stat: `${openAccessCount}`, label: "open access", detail: `of ${papers.length} papers` },
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
