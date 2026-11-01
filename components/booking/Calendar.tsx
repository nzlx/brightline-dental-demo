"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { booking } from "@/content";
import { addDays, clinicNow, dayStatus, formatDate, parseKey, toKey, weekdayOf, type DayStatus } from "@/lib/slots";
import { providerLabel } from "./types";

type Props = { selected: string | null; visitId: string; providerId: string; onSelect: (key: string) => void };

const WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const monthKey = (key: string) => key.slice(0, 7);

export default function Calendar({ selected, visitId, providerId, onSelect }: Props) {
  const now = useMemo(() => clinicNow(), []);
  const last = addDays(now.key, booking.daysAhead - 1);

  const status = useMemo(() => {
    const map = new Map<string, DayStatus>();
    for (let i = 0; i < booking.daysAhead; i++) {
      const k = addDays(now.key, i);
      map.set(k, dayStatus(k, visitId, providerId, now));
    }
    return map;
  }, [now, visitId, providerId]);

  const bookable = (k: string) => {
    const st = status.get(k);
    return st === "open" || st === "few";
  };
  const firstOpen = [...status.keys()].find(bookable) ?? now.key;

  const [focusKey, setFocusKey] = useState(selected ?? firstOpen);
  const [view, setView] = useState(monthKey(focusKey));
  const refs = useRef(new Map<string, HTMLButtonElement>());
  const keyNav = useRef(false);

  useEffect(() => {
    if (!keyNav.current) return;
    keyNav.current = false;
    refs.current.get(focusKey)?.focus();
  }, [focusKey, view]);

  const { y, m } = parseKey(`${view}-01`);
  const firstWd = weekdayOf(`${view}-01`);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (string | null)[] = [
    ...Array<null>(firstWd).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => toKey(y, m, i + 1)),
  ];
  while (cells.length % 7) cells.push(null);

  const shiftMonth = (delta: number) => {
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    setView(toKey(d.getUTCFullYear(), d.getUTCMonth() + 1, 1).slice(0, 7));
  };
  const canPrev = view > monthKey(now.key);
  const canNext = view < monthKey(last);

  const moveFocus = (k: string) => {
    if (k < now.key) k = now.key;
    if (k > last) k = last;
    keyNav.current = true;
    setFocusKey(k);
    if (monthKey(k) !== view) setView(monthKey(k));
  };

  const onKeyDown = (e: React.KeyboardEvent, k: string) => {
    const wd = weekdayOf(k);
    const map: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
      Home: -wd,
      End: 6 - wd,
      PageUp: -28,
      PageDown: 28,
    };
    if (e.key in map) {
      e.preventDefault();
      moveFocus(addDays(k, map[e.key]));
    }
  };

  // The tab stop sits on the focused day if it's in view, otherwise on the first in-range day shown.
  const visibleInRange = cells.filter((k): k is string => !!k && k >= now.key && k <= last);
  const tabKey = visibleInRange.includes(focusKey) ? focusKey : (visibleInRange.find(bookable) ?? visibleInRange[0]);

  const who = providerLabel(providerId);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold text-ink" aria-live="polite">
          {formatDate(`${view}-01`, { month: "long", year: "numeric" })}
        </p>
        <div className="flex gap-2">
          <NavBtn label="Previous month" disabled={!canPrev} onClick={() => shiftMonth(-1)} d="M12.5 4.5L7 10l5.5 5.5" />
          <NavBtn label="Next month" disabled={!canNext} onClick={() => shiftMonth(1)} d="M7.5 4.5L13 10l-5.5 5.5" />
        </div>
      </div>

      <div role="grid" aria-label="Choose a date" className="mt-4">
        <div role="row" className="grid grid-cols-7 gap-1.5">
          {WEEK.map((w) => (
            <span role="columnheader" key={w} className="pb-1 text-center text-xs font-semibold text-muted">
              {w}
            </span>
          ))}
        </div>
        {Array.from({ length: cells.length / 7 }, (_, r) => (
          <div role="row" key={r} className="mt-1.5 grid grid-cols-7 gap-1.5">
            {cells.slice(r * 7, r * 7 + 7).map((k, i) => {
              if (!k) return <span role="gridcell" key={`e${i}`} />;
              const inRange = k >= now.key && k <= last;
              const st = inRange ? status.get(k)! : "past";
              const ok = st === "open" || st === "few";
              const on = k === selected;
              const today = k === now.key;
              const reason: Record<DayStatus, string> = {
                open: "available",
                few: "only a few times left",
                full: "fully booked",
                closed: "closed",
                off: `${who} is out of the office`,
                past: "not available",
              };
              return (
                <span role="gridcell" key={k} aria-selected={on}>
                  <button
                    ref={(el) => {
                      if (el) refs.current.set(k, el);
                      else refs.current.delete(k);
                    }}
                    type="button"
                    tabIndex={k === tabKey ? 0 : -1}
                    aria-disabled={!ok}
                    aria-label={`${formatDate(k)}${today ? ", today" : ""}, ${reason[st]}`}
                    onKeyDown={(e) => onKeyDown(e, k)}
                    onFocus={() => setFocusKey(k)}
                    onClick={() => ok && onSelect(k)}
                    className={`relative flex aspect-square w-full flex-col items-center justify-center rounded-xl text-[15px] font-semibold tabular-nums transition-colors sm:aspect-[1.3] ${
                      on
                        ? "bg-teal-deep text-white"
                        : ok
                          ? "bg-sky/70 text-ink hover:bg-mint hover:text-teal-deep"
                          : "cursor-not-allowed font-normal text-ink/25"
                    } ${today && !on ? "ring-2 ring-teal/50" : ""}`}
                  >
                    {parseKey(k).d}
                    {st === "few" && !on && (
                      <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-sun-deep" aria-hidden="true" />
                    )}
                  </button>
                </span>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-sun-deep" aria-hidden="true" /> Few times left
        </span>
        <span>Closed Sundays</span>
        {!selected && bookable(firstOpen) && (
          <button
            type="button"
            onClick={() => onSelect(firstOpen)}
            className="ml-auto rounded-full bg-mint px-3 py-1.5 font-semibold text-teal-dark transition-colors hover:bg-sky-deep"
          >
            Soonest: {formatDate(firstOpen, { weekday: "short", month: "short", day: "numeric" })}
          </button>
        )}
      </div>
    </div>
  );
}

function NavBtn({ label, disabled, onClick, d }: { label: string; disabled: boolean; onClick: () => void; d: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-10 w-10 place-items-center rounded-full border border-line text-ink transition-colors hover:border-teal-deep hover:text-teal-deep disabled:opacity-30 disabled:hover:border-line disabled:hover:text-ink"
    >
      <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
        <path d={d} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
