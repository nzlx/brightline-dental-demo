"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { reviews, reviewsSection as rs } from "@/content";
import { Arrow } from "@/components/ui/Arrow";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";

// DEMO CONTENT: reviews and the rating summary come from content.ts and are fictional.
const AUTOPLAY_MS = 6500;

function Stars({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <span className="flex gap-0.5 text-[#f2b705]" aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <Icon key={i} name="star" className={className} filled />
      ))}
    </span>
  );
}

export default function Reviews() {
  const track = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  const [perView, setPerView] = useState(1);
  const paused = useRef(false);
  const activeRef = useRef(0);
  activeRef.current = active;
  const pages = Math.max(reviews.length - perView + 1, 1);

  const step = () => {
    const el = track.current;
    const card = el?.querySelector("li");
    if (!el || !card) return 0;
    return card.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || "0");
  };

  const goTo = useCallback((i: number) => {
    const el = track.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: Math.min(i * step(), max), behavior: "smooth" });
  }, []);

  // Keep the active index and cards-per-view in sync with the scroll position and width.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const s = step();
      if (!s) return;
      const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4;
      setActive(atEnd ? reviews.length - Math.max(1, Math.round(el.clientWidth / s)) : Math.round(el.scrollLeft / s));
    };
    const onResize = () => {
      const s = step();
      if (s) setPerView(Math.max(1, Math.round(el.clientWidth / s)));
      onScroll();
    };
    onResize();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Autoplay: only while on screen and not hovered/focused, never with reduced motion.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = track.current;
    if (!el) return;
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    const id = setInterval(() => {
      if (!visible || paused.current) return;
      const a = activeRef.current;
      goTo(a + 1 >= pages ? 0 : a + 1);
    }, AUTOPLAY_MS);
    return () => {
      clearInterval(id);
      io.disconnect();
    };
  }, [pages, goTo]);

  const pause = (v: boolean) => () => {
    paused.current = v;
  };

  return (
    <section id="reviews" aria-labelledby="reviews-title" className="overflow-hidden bg-surface px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <Reveal className="max-w-xl">
            <p className="eyebrow">{rs.eyebrow}</p>
            <h2 id="reviews-title" className="mt-4 text-balance text-[2.1rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink sm:text-5xl">
              {rs.title}
            </h2>
          </Reveal>
          <Reveal delay={0.1} className="flex items-center gap-4 self-start rounded-2xl bg-white px-5 py-4 ring-1 ring-line md:self-auto">
            <span className="text-5xl font-extrabold leading-none tracking-[-0.04em] text-ink">{rs.rating}</span>
            <span>
              <Stars className="h-5 w-5" />
              <span className="mt-1 block text-sm text-muted">
                Average from <strong className="font-bold text-ink">{rs.count}</strong>
              </span>
            </span>
            <span className="sr-only">Average rating {rs.rating} out of 5</span>
          </Reveal>
        </div>

        <div
          className="relative mt-10"
          onMouseEnter={pause(true)}
          onMouseLeave={pause(false)}
          onFocusCapture={pause(true)}
          onBlurCapture={pause(false)}
          onTouchStart={pause(true)}
        >
          <ul
            ref={track}
            aria-label="Patient reviews"
            className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-2 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
          >
            {reviews.map((r, i) => (
              <li
                key={r.name}
                className="w-[86%] shrink-0 snap-start sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${reviews.length}`}
              >
                <figure className="card flex h-full flex-col rounded-[1.5rem] p-6">
                  <div className="flex items-center justify-between">
                    <Stars />
                    <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-bold text-teal-dark">{r.tag}</span>
                  </div>
                  <blockquote className="mt-4 flex-1 text-[0.98rem] leading-relaxed text-ink/90">“{r.text}”</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-sky font-bold text-teal-deep" aria-hidden="true">
                      {r.name[0]}
                    </span>
                    <span className="text-sm">
                      <span className="block font-bold text-ink">{r.name}</span>
                      <span className="text-muted">
                        {r.area} · {r.when}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex" role="group" aria-label="Choose a review">
              {Array.from({ length: pages }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Show review ${i + 1}`}
                  aria-current={i === active ? "true" : undefined}
                  onClick={() => goTo(i)}
                  className="grid h-6 min-w-6 place-items-center"
                >
                  <span className={`block h-2 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-teal-deep" : "w-2 bg-line"}`} />
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Previous reviews"
                disabled={active === 0}
                onClick={() => goTo(active - 1)}
                className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-teal-deep hover:text-teal-deep disabled:opacity-35"
              >
                <Arrow dir="left" />
              </button>
              <button
                type="button"
                aria-label="Next reviews"
                disabled={active >= pages - 1}
                onClick={() => goTo(active + 1)}
                className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-teal-deep hover:text-teal-deep disabled:opacity-35"
              >
                <Arrow dir="right" />
              </button>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">Demo content: reviews are fictional.</p>
        </div>
      </div>
    </section>
  );
}
