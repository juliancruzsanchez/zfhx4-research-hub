import { motion } from "framer-motion";
import { Activity, ArrowLeft, Dna, Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

import { subscribeToCommonSymptoms, type CommonSymptom } from "@/lib/firebase-data";

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
  neurological: { bg: "bg-[#f0eaf8]", text: "text-[#6b4c9a]", border: "border-[#d8c5f0]" },
  developmental: { bg: "bg-[#e8f4fd]", text: "text-[#2b6ca3]", border: "border-[#bdd8f0]" },
  behavioral: { bg: "bg-[#fef3e2]", text: "text-[#a06a1a]", border: "border-[#e8d5a3]" },
  physical: { bg: "bg-[#e7f4ef]", text: "text-[#286c59]", border: "border-[#b7d3c9]" },
  communication: { bg: "bg-[#fce8e8]", text: "text-[#a33b3b]", border: "border-[#f0bfbf]" },
  sensory: { bg: "bg-[#f5f0e8]", text: "text-[#7a6230]", border: "border-[#ddd0b0]" },
};

function getCategoryStyle(category: string) {
  const key = category.toLowerCase();
  return categoryColors[key] ?? { bg: "bg-[#f5f8f7]", text: "text-[#526965]", border: "border-[#dbe6e2]" };
}

export default function CommonSymptoms() {
  const [symptoms, setSymptoms] = useState<CommonSymptom[]>([]);

  useEffect(() => {
    const unsub = subscribeToCommonSymptoms(setSymptoms);
    return unsub;
  }, []);

  const categories = Array.from(new Set(symptoms.map((s) => s.category))).sort();

  return (
    <main className="min-h-screen bg-[#f6f8f7] text-[#18322f]">
      {/* Header */}
      <header className="border-b border-[#dce7e3] bg-[#fbfcfb]">
        <div className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-3" aria-label="ZFHX4 Research Hub home">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[#18322f] text-[#d9f0e9]">
              <Dna className="size-[19px]" strokeWidth={1.8} />
            </span>
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#18322f]">
              ZFHX4 Research Hub
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-[#526965] transition-colors hover:bg-[#edf5f2]"
          >
            <ArrowLeft className="size-3.5" />
            Back to home
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-[#dce7e3] bg-[#edf5f2]">
        <div className="mx-auto max-w-[1240px] px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#397768]">
              <span className="flex size-6 items-center justify-center rounded-md bg-white text-[#397768] ring-1 ring-[#d4e7e0]">
                <Stethoscope className="size-3.5" />
              </span>
              Clinical overview
            </div>
            <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.05em] text-[#18322f]">
              Common symptoms
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#58706b] sm:text-[17px]">
              An overview of symptoms commonly reported in individuals with ZFHX4 loss of function, drawn from published research. This is not a diagnostic checklist.
            </p>
          </div>
        </div>
      </section>

      {/* Symptoms grid */}
      <section className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        {symptoms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cddbd6] bg-white px-6 py-16 text-center">
            <Activity className="mx-auto size-6 text-[#9aada7]" />
            <h3 className="mt-4 text-base font-semibold text-[#29443e]">No symptoms listed yet</h3>
            <p className="mt-1 text-sm text-[#71837f]">Common symptoms will appear here once published by the editorial team.</p>
          </div>
        ) : categories.length > 0 ? (
          categories.map((category) => (
            <div key={category} className="mb-10">
              <h2 className="mb-4 text-lg font-semibold tracking-[-0.03em] text-[#18322f]">{category}</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {symptoms
                  .filter((s) => s.category === category)
                  .map((symptom, i) => {
                    const style = getCategoryStyle(symptom.category);
                    return (
                      <motion.div
                        key={symptom.id}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-30px" }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className={`rounded-2xl border ${style.border} bg-white p-5`}
                      >
                        <span className={`inline-block rounded-full ${style.bg} ${style.text} px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]`}>
                          {symptom.category}
                        </span>
                        <h3 className="mt-3 text-base font-semibold text-[#18322f]">{symptom.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#58706b]">{symptom.description}</p>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          ))
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {symptoms.map((symptom, i) => {
              const style = getCategoryStyle(symptom.category);
              return (
                <motion.div
                  key={symptom.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className={`rounded-2xl border ${style.border} bg-white p-5`}
                >
                  <span className={`inline-block rounded-full ${style.bg} ${style.text} px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em]`}>
                    {symptom.category}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-[#18322f]">{symptom.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#58706b]">{symptom.description}</p>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-10 rounded-2xl border border-[#d4e5df] bg-white px-6 py-5">
          <p className="text-sm leading-6 text-[#71837f]">
            <span className="font-semibold text-[#526965]">Important:</span> This list is for informational purposes only and does not constitute a diagnosis. Symptoms vary significantly between individuals. Always consult a qualified healthcare provider for assessment.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#dce7e3] bg-[#fbfcfb]">
        <div className="mx-auto max-w-[1240px] px-5 py-6 sm:px-8 lg:px-10">
          <p className="text-xs leading-5 text-[#83938f]">
            This library is an information resource, not medical advice. Research findings can
            change as new evidence becomes available.
          </p>
        </div>
      </footer>
    </main>
  );
}
