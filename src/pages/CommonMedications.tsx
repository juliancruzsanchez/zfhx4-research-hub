import { motion } from "framer-motion";
import { ArrowLeft, Dna, Pill, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";

import { subscribeToCommonMedications, type CommonMedication } from "@/lib/firebase-data";

export default function CommonMedications() {
  const [medications, setMedications] = useState<CommonMedication[]>([]);

  useEffect(() => {
    const unsub = subscribeToCommonMedications(setMedications);
    return unsub;
  }, []);

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
                <Pill className="size-3.5" />
              </span>
              Treatment overview
            </div>
            <h1 className="text-[clamp(2rem,4vw,3.5rem)] font-semibold leading-[1.08] tracking-[-0.05em] text-[#18322f]">
              Commonly prescribed medications
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-[#58706b] sm:text-[17px]">
              Medications frequently discussed in the context of ZFHX4-related conditions. This is a reference overview — your care team will advise on what is appropriate for your situation.
            </p>
          </div>
        </div>
      </section>

      {/* Medications list */}
      <section className="mx-auto max-w-[1240px] px-5 py-10 sm:px-8 sm:py-14 lg:px-10">
        {medications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#cddbd6] bg-white px-6 py-16 text-center">
            <Pill className="mx-auto size-6 text-[#9aada7]" />
            <h3 className="mt-4 text-base font-semibold text-[#29443e]">No medications listed yet</h3>
            <p className="mt-1 text-sm text-[#71837f]">Commonly prescribed medications will appear here once published by the editorial team.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {medications.map((med, i) => (
              <motion.article
                key={med.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="rounded-2xl border border-[#dbe6e2] bg-white p-5 sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#edf5f2] text-[#398b74]">
                        <Pill className="size-4" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#18322f]">{med.name}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-[#58706b]">
                      <span className="font-medium text-[#3b5c54]">Purpose:</span> {med.purpose}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#58706b]">
                      <span className="font-medium text-[#3b5c54]">Common dosing:</span> {med.dosage}
                    </p>
                    {med.sideEffects && (
                      <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#fef8f0] p-3">
                        <ShieldAlert className="mt-0.5 size-4 shrink-0 text-[#c4903a]" />
                        <p className="text-xs leading-5 text-[#7a6230]">
                          <span className="font-semibold">Possible side effects / notes:</span> {med.sideEffects}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-10 rounded-2xl border border-[#d4e5df] bg-white px-6 py-5">
          <p className="text-sm leading-6 text-[#71837f]">
            <span className="font-semibold text-[#526965]">Important:</span> This information is for reference only and does not replace professional medical advice. Medication choices, dosages, and monitoring should always be determined by your healthcare team based on individual needs.
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
