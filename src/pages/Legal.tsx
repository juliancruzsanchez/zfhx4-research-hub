import { FileText, ShieldCheck } from "lucide-react";
import { Link, useParams } from "react-router";

const pages = {
  privacy: { title: "Privacy notice", intro: "This placeholder will describe how ZFHX4 Research Hub handles account data, uploaded medical records, AI processing, and symptom logs." },
  terms: { title: "Terms of use", intro: "This placeholder will describe acceptable use, account responsibilities, document permissions, and service limitations." },
  medical: { title: "Medical information notice", intro: "ZFHX4 Research Hub provides information organization and research assistance. It does not diagnose, treat, or replace advice from a qualified clinician." },
} as const;

export default function Legal() {
  const { page = "privacy" } = useParams();
  const content = pages[page as keyof typeof pages] ?? pages.privacy;
  return <main className="min-h-screen bg-[#f6f8f7] px-5 py-12 text-[#18322f] sm:px-8"><div className="mx-auto max-w-2xl"><Link to="/" className="text-sm font-medium text-[#398b74] hover:underline">Back to ZFHX4 Research Hub</Link><div className="mt-12 rounded-2xl border border-[#dbe6e2] bg-white p-7 sm:p-10"><div className="flex size-11 items-center justify-center rounded-xl bg-[#e7f4ef] text-[#398b74]"><ShieldCheck className="size-5" /></div><h1 className="mt-6 text-3xl font-semibold tracking-[-0.05em]">{content.title}</h1><p className="mt-4 text-base leading-7 text-[#5e766f]">{content.intro}</p><div className="mt-8 flex items-center gap-2 border-t border-[#edf1ef] pt-5 text-xs text-[#879791]"><FileText className="size-4" /> Legal content will be completed before public launch.</div></div></div></main>;
}
