"use client";

import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { contacts, faqSection, faqs } from "@/content";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" aria-labelledby="faq-title" className="bg-surface px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div>
          <SectionHeader id="faq-title" {...faqSection} />
          <Reveal delay={0.1} className="mt-8 hidden rounded-[1.5rem] bg-white p-6 ring-1 ring-line lg:block">
            <p className="font-bold text-ink">Still have a question?</p>
            <p className="mt-1 text-sm text-muted">Call or email us. We usually reply within the hour.</p>
            <a href={contacts.phoneHref} className="btn btn-primary mt-4 h-11 min-h-0 w-full text-sm">
              <Icon name="phone" className="h-4 w-4" /> {contacts.phoneDisplay}
            </a>
            <a href={`mailto:${contacts.email}`} className="link mt-3 flex items-center justify-center gap-1.5 text-sm">
              <Icon name="mail" className="h-4 w-4" /> {contacts.email}
            </a>
          </Reveal>
        </div>

        <Reveal delay={0.05}>
          <ul className="divide-y divide-line overflow-hidden rounded-[1.5rem] bg-white ring-1 ring-line">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <li key={f.q}>
                  <h3>
                    <button
                      type="button"
                      id={`faq-q-${i}`}
                      aria-expanded={isOpen}
                      aria-controls={`faq-a-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left text-[1.02rem] font-bold text-ink transition-colors hover:text-teal-deep sm:px-6"
                    >
                      {f.q}
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
                          isOpen ? "bg-teal-deep text-white" : "bg-mint text-teal-deep"
                        }`}
                      >
                        <Icon name="plus" className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`} strokeWidth={2.4} />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <m.div
                        id={`faq-a-${i}`}
                        role="region"
                        aria-labelledby={`faq-q-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-6 pr-14 leading-relaxed text-muted sm:px-6 sm:pr-16">{f.a}</p>
                      </m.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
          <p className="mt-6 text-center text-sm text-muted lg:hidden">
            Still have a question?{" "}
            <a href={contacts.phoneHref} className="link">
              Call {contacts.phoneDisplay}
            </a>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
