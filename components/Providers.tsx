"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import { scrollToTarget, setLenis } from "@/lib/scroll";

export default function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lenis: Lenis | null = null;
    let raf = 0;
    if (!reduce) {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      setLenis(lenis);
      const loop = (t: number) => {
        lenis!.raf(t);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    // In-page anchors go through Lenis so they respect the sticky header.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href")!;
      if (id.length < 2) return;
      const el = document.querySelector<HTMLElement>(id);
      if (!el) return;
      e.preventDefault();
      scrollToTarget(el, id === "#main" ? { offset: 0 } : {});
      history.replaceState(null, "", id);
      if (id === "#main" || a.dataset.focusTarget !== undefined) {
        el.setAttribute("tabindex", "-1");
        el.focus({ preventScroll: true });
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(raf);
      lenis?.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
