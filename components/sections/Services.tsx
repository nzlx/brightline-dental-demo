"use client";

import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { services, servicesSection } from "@/content";
import BookButton from "@/components/ui/BookButton";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";

export default function Services() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <section id="services" aria-labelledby="services-title" className="px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeader id="services-title" {...servicesSection} />

        <ul className="mt-12 grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => {
            const isOpen = open === s.id;
            const emergency = s.id === "emergency";
            return (
              <Reveal as="li" key={s.id} delay={(i % 4) * 0.06} y={20}>
                <article
                  className={`card flex flex-col rounded-[1.5rem] p-6 transition-shadow duration-300 hover:shadow-[0_30px_60px_-36px_rgb(15_42_61/0.4)] ${
                    isOpen ? "ring-2 ring-teal-deep/25" : ""
                  }`}
                >
                  <span
                    className={`grid h-12 w-12 place-items-center rounded-2xl ${emergency ? "bg-sun-soft text-sun-deep" : "bg-mint text-teal-deep"}`}
                  >
                    <Icon name={s.icon} className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold leading-snug text-ink">{s.name}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{s.short}</p>

                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`svc-${s.id}`}
                    onClick={() => setOpen(isOpen ? null : s.id)}
                    className="mt-4 inline-flex items-center gap-1.5 self-start rounded-full py-1 text-sm font-bold text-teal-deep"
                  >
                    {isOpen ? "Show less" : "Learn more"}
                    <Icon name="chevron" className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} strokeWidth={2.2} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <m.div
                        id={`svc-${s.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <ul className="mt-3 space-y-2 border-t border-line pt-4 text-sm text-ink/90">
                          {s.details.map((d) => (
                            <li key={d} className="flex gap-2">
                              <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-teal-deep" strokeWidth={2.2} />
                              {d}
                            </li>
                          ))}
                        </ul>
                        <p className="mt-4 rounded-xl bg-surface px-3 py-2.5 text-sm text-muted">{s.note}</p>
                        <BookButton preset={{ visitId: s.visitId }} className="btn btn-primary mt-4 h-11 min-h-0 w-full text-sm">
                          {emergency ? "Get seen today" : "Book this visit"}
                        </BookButton>
                      </m.div>
                    )}
                  </AnimatePresence>
                </article>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
