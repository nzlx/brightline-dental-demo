"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { contacts, nav } from "@/content";
import { groupedHours } from "@/lib/hours";
import { getLenis } from "@/lib/scroll";
import Logo from "./Logo";
import BookButton from "./ui/BookButton";
import Icon from "./ui/Icon";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile menu: lock scroll, close on Esc, keep Tab inside.
  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    panel.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key !== "Tab" || !panel.current) return;
      const items = [menuBtn.current!, ...panel.current.querySelectorAll<HTMLElement>("a,button")];
      const i = items.indexOf(document.activeElement as HTMLElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        items.at(-1)?.focus();
      } else if (!e.shiftKey && i === items.length - 1) {
        e.preventDefault();
        items[0].focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      lenis?.start();
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,box-shadow,border-color] duration-300 ${
        scrolled || open
          ? "border-line bg-white shadow-[0_10px_30px_-24px_rgb(15_42_61/0.4)] md:bg-white/90 md:backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <a href="#top" aria-label="Brightline Family Dental, back to top" className="rounded-xl" onClick={close}>
          <Logo />
        </a>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7 text-[0.95rem] font-medium">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="text-ink/75 transition-colors hover:text-teal-deep">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={contacts.phoneHref}
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-ink transition-colors hover:text-teal-deep md:inline-flex"
          >
            <Icon name="phone" className="h-4 w-4 text-teal-deep" />
            {contacts.phoneDisplay}
          </a>
          <BookButton className="btn btn-primary hidden h-11 min-h-0 px-5 text-sm sm:inline-flex">Book a Visit</BookButton>
          <button
            ref={menuBtn}
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-line bg-white text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-3 w-5" aria-hidden="true">
              <span
                className={`absolute left-0 h-[2px] w-5 rounded-full bg-current transition-transform duration-300 ${open ? "top-[5px] rotate-45" : "top-0"}`}
              />
              <span
                className={`absolute left-0 h-[2px] w-5 rounded-full bg-current transition-transform duration-300 ${open ? "top-[5px] -rotate-45" : "top-[10px]"}`}
              />
            </span>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <m.div
            ref={panel}
            id="mobile-menu"
            className="fixed inset-x-0 bottom-0 top-[72px] overflow-y-auto border-t border-line bg-white lg:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <nav aria-label="Mobile" className="px-5 pb-10 pt-4">
              <ul>
                {nav.map((n, i) => (
                  <m.li key={n.href} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * i + 0.04 }}>
                    <a
                      href={n.href}
                      onClick={close}
                      className="flex items-center justify-between border-b border-line py-4 text-xl font-bold text-ink"
                    >
                      {n.label}
                      <span className="text-teal-deep" aria-hidden="true">
                        →
                      </span>
                    </a>
                  </m.li>
                ))}
              </ul>
              <BookButton className="btn btn-primary mt-8 h-14 w-full text-base" onClickCapture={close}>
                <Icon name="calendar" className="h-5 w-5" /> Book a Visit
              </BookButton>
              <a href={contacts.phoneHref} className="btn btn-outline mt-3 h-14 w-full text-base">
                <Icon name="phone" className="h-5 w-5 text-teal-deep" /> Call {contacts.phoneDisplay}
              </a>
              <div className="mt-8 rounded-2xl bg-surface p-5 text-sm text-muted">
                <p className="mb-2 font-bold text-ink">Office hours</p>
                {groupedHours().map((g) => (
                  <p key={g.days} className="flex justify-between py-0.5">
                    <span>{g.days}</span>
                    <span className="font-medium text-ink/80">{g.time}</span>
                  </p>
                ))}
              </div>
            </nav>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
