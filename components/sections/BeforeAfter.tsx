"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { beforeAfter as ba } from "@/content";
import BookButton from "@/components/ui/BookButton";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";

export default function BeforeAfter() {
  const [pos, setPos] = useState(50);
  const box = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const fromPointer = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  return (
    <section id="results" aria-labelledby="results-title" className="px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <SectionHeader id="results-title" eyebrow={ba.eyebrow} title={ba.title} subtitle={ba.subtitle}>
          <ul className="mt-6 space-y-2.5">
            {ba.points.map((p) => (
              <li key={p} className="flex items-center gap-2.5 font-semibold text-ink">
                <Icon name="check" className="h-4 w-4 text-teal-deep" strokeWidth={2.4} />
                {p}
              </li>
            ))}
          </ul>
          <BookButton preset={{ visitId: "whitening" }} className="btn btn-primary mt-8 h-12">
            {ba.cta}
          </BookButton>
        </SectionHeader>

        <Reveal delay={0.1}>
          <figure>
            <div
              ref={box}
              className="relative aspect-[3/2] cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-[1.75rem] bg-sky shadow-[0_40px_80px_-40px_rgb(15_42_61/0.5)]"
              onPointerDown={(e) => {
                dragging.current = true;
                e.currentTarget.setPointerCapture(e.pointerId);
                fromPointer(e.clientX);
              }}
              onPointerMove={(e) => dragging.current && fromPointer(e.clientX)}
              onPointerUp={() => (dragging.current = false)}
              onPointerCancel={() => (dragging.current = false)}
            >
              <Image
                src={ba.after.src}
                alt={`${ba.alt}, after whitening (simulated)`}
                fill
                quality={85}
                sizes="(min-width: 1152px) 680px, (min-width: 1024px) 58vw, 100vw"
                className="pointer-events-none object-cover"
                draggable={false}
              />
              <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
                <Image
                  src={ba.before.src}
                  alt={`${ba.alt}, before whitening (simulated)`}
                  fill
                  quality={85}
                  sizes="(min-width: 1152px) 680px, (min-width: 1024px) 58vw, 100vw"
                  className="pointer-events-none object-cover"
                  draggable={false}
                />
              </div>

              <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white backdrop-blur">
                {ba.before.label}
              </span>
              <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-wide text-ink backdrop-blur">
                {ba.after.label}
              </span>

              {/* Divider + handle */}
              <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }} aria-hidden="true">
                <div className="absolute inset-y-0 -left-px w-0.5 bg-white shadow-[0_0_12px_rgb(0_0_0/0.35)]" />
                <div className="handle absolute left-0 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-teal-deep shadow-lg">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 7l-5 5 5 5M15 7l5 5-5 5" />
                  </svg>
                </div>
              </div>

              {/* Keyboard and screen-reader control (pointer dragging is handled on the box) */}
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={Math.round(pos)}
                onChange={(e) => setPos(Number(e.target.value))}
                aria-label="Compare before and after: slide to reveal"
                aria-valuetext={`${Math.round(pos)}% before`}
                className="peer absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
                style={{ pointerEvents: "none" }}
              />
              <span className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-teal-deep ring-offset-2 peer-focus-visible:ring-2" aria-hidden="true" />
            </div>
            <figcaption className="mt-4 flex items-start gap-2 text-sm text-muted">
              <Icon name="alert" className="mt-0.5 h-4 w-4 shrink-0" />
              {ba.caption}
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
