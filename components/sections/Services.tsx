"use client";

import { useEffect, useRef, useState } from "react";
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
      <div className="relative mx-auto max-w-6xl">
        {/* Landing spot for the hero tooth, which glides and shrinks here on scroll. */}
        <div id="tooth-anchor-services" aria-hidden="true" className="pointer-events-none mx-auto mb-4 h-44 w-36 lg:absolute lg:-top-6 lg:right-4 lg:mb-0 lg:h-[19rem] lg:w-60" />
        <SectionHeader id="services-title" {...servicesSection} />

        {/* Rows stretch, so every card in a row is the same height and "Learn more" lines up at the bottom. */}
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal as="li" key={s.id} delay={(i % 4) * 0.06} y={20} className="h-full">
              <ServiceCard service={s} isOpen={open === s.id} onToggle={(v) => setOpen(v ? s.id : null)} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ServiceCard({
  service: s,
  isOpen,
  onToggle,
}: {
  service: (typeof services)[number];
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}) {
  const emergency = s.id === "emergency";
  const opener = useRef<HTMLButtonElement>(null);
  const closer = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Move focus into the panel when it opens and back to "Learn more" when it closes.
  useEffect(() => {
    if (isOpen) closer.current?.focus({ preventScroll: true });
    else if (wasOpen.current) opener.current?.focus({ preventScroll: true });
    wasOpen.current = isOpen;
  }, [isOpen]);

  return (
    <article
      className="card relative flex h-full min-h-[19.5rem] flex-col overflow-hidden rounded-[1.5rem] p-6 transition-shadow duration-300 hover:shadow-[0_30px_60px_-36px_rgb(15_42_61/0.4)] sm:min-h-[21rem]"
      onKeyDown={(e) => {
        if (e.key === "Escape" && isOpen) onToggle(false);
      }}
    >
      <span className={`grid h-12 w-12 place-items-center rounded-2xl ${emergency ? "bg-sun-soft text-sun-deep" : "bg-mint text-teal-deep"}`}>
        <Icon name={s.icon} className="h-6 w-6" />
      </span>
      <h3 className="mt-5 text-lg font-bold leading-snug text-ink">{s.name}</h3>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{s.short}</p>

      <button
        ref={opener}
        type="button"
        aria-expanded={isOpen}
        aria-controls={`svc-${s.id}`}
        onClick={() => onToggle(true)}
        className="mt-auto inline-flex items-center gap-1.5 self-start rounded-full pt-5 text-sm font-bold text-teal-deep"
      >
        Learn more
        <Icon name="plus" className="h-4 w-4" strokeWidth={2.4} />
      </button>

      {/* Details slide up over this card only, so neighbors never move. */}
      <AnimatePresence>
        {isOpen && (
          <m.div
            id={`svc-${s.id}`}
            role="region"
            aria-label={`${s.name} details`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex flex-col overflow-y-auto bg-white p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="font-bold leading-snug text-ink">{s.name}</p>
              <button
                ref={closer}
                type="button"
                onClick={() => onToggle(false)}
                aria-label={`Close ${s.name} details`}
                className="-mr-2 -mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mint text-teal-deep transition-colors hover:bg-teal-deep hover:text-white"
              >
                <Icon name="plus" className="h-4 w-4 rotate-45" strokeWidth={2.4} />
              </button>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-ink/90">
              {s.details.map((d) => (
                <li key={d} className="flex gap-2">
                  <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-teal-deep" strokeWidth={2.2} />
                  {d}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted">{s.note}</p>
            <div className="mt-auto shrink-0 pt-4">
              <BookButton preset={{ visitId: s.visitId }} className="btn btn-primary h-11 min-h-0 w-full text-sm">
                {emergency ? "Get seen today" : "Book this visit"}
              </BookButton>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </article>
  );
}
