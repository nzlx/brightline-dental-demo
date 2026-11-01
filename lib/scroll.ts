import type Lenis from "lenis";

let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

const HEADER_OFFSET = -72;

/** Smooth-scrolls to an element or selector, accounting for the sticky header. */
export function scrollToTarget(target: string | HTMLElement, opts: { offset?: number; immediate?: boolean } = {}) {
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!el) return;
  // Absolute target from the real scroll position: Lenis' own element math adds scroll-padding
  // and can start from a stale position after it was stopped (menu, lightbox).
  const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY + (opts.offset ?? HEADER_OFFSET));
  if (lenis) {
    lenis.scrollTo(top, { duration: 1.1, immediate: opts.immediate, force: true });
  } else {
    window.scrollTo({ top, behavior: opts.immediate ? "auto" : "smooth" });
  }
}
