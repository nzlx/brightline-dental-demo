"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { contacts } from "@/content";
import BookButton from "./ui/BookButton";
import Icon from "./ui/Icon";

/**
 * Phone-only floating Call + Book bar. For a dental office a call matters as much as a booking,
 * so both get equal weight. Shows while the hero buttons are off screen, hides over the booking form and footer.
 */
export default function MobileActionBar() {
  const [pastHero, setPastHero] = useState(false);
  const [covered, setCovered] = useState(false);

  useEffect(() => {
    // Visible whenever the hero's own Call/Book buttons are off screen (including below the fold on load).
    const cta = document.getElementById("hero-cta");
    const heroIo = new IntersectionObserver(([e]) => setPastHero(!e.isIntersecting));
    if (cta) heroIo.observe(cta);
    const seen = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.isIntersecting ? seen.add(e.target) : seen.delete(e.target);
        setCovered(seen.size > 0);
      },
      { rootMargin: "-15% 0px -15% 0px" },
    );
    for (const id of ["book", "site-footer"]) {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    }
    return () => {
      heroIo.disconnect();
      io.disconnect();
    };
  }, []);

  const show = pastHero && !covered;

  return (
    <AnimatePresence>
      {show && (
        <m.div
          className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
        >
          <div className="grid grid-cols-2 gap-2 rounded-[1.4rem] bg-white/95 p-2 shadow-[0_18px_40px_-12px_rgb(15_42_61/0.45)] ring-1 ring-line backdrop-blur">
            <a href={contacts.phoneHref} className="btn btn-outline h-12 min-h-0 px-3 text-base" aria-label={`Call ${contacts.phoneDisplay}`}>
              <Icon name="phone" className="h-5 w-5 text-teal-deep" /> Call
            </a>
            <BookButton className="btn btn-primary h-12 min-h-0 px-3 text-base">
              <Icon name="calendar" className="h-5 w-5" /> Book
            </BookButton>
          </div>
        </m.div>
      )}
    </AnimatePresence>
  );
}
