"use client";

import { useMemo } from "react";
import Image from "next/image";
import { booking } from "@/content";
import { addDays, clinicNow, formatTime, getVisit, providersFor, relativeDay, slotsFor } from "@/lib/slots";

type Props = { visitId: string; selected: string | null; onSelect: (id: string) => void };

/** First open slot for a provider in the booking window, as "Today · 3:30 PM". */
function nextOpening(visitId: string, providerId: string) {
  const now = clinicNow();
  for (let i = 0; i < booking.daysAhead; i++) {
    const key = addDays(now.key, i);
    const slot = slotsFor(key, visitId, providerId, now).find((s) => s.available);
    if (slot) return `${relativeDay(key, now)} · ${formatTime(slot.time)}`;
  }
  return null;
}

export default function StepProvider({ visitId, selected, onSelect }: Props) {
  const list = providersFor(visitId);
  const emergency = !!getVisit(visitId)?.emergency;
  const options = useMemo(
    () => [
      ...(list.length > 1 ? [{ id: booking.anyProvider.id, next: nextOpening(visitId, booking.anyProvider.id) }] : []),
      ...list.map((p) => ({ id: p.id, next: nextOpening(visitId, p.id) })),
    ],
    [visitId], // `list` is derived from visitId

  );

  return (
    <div role="radiogroup" aria-label="Provider" className="grid gap-3">
      {options.map((o) => {
        const p = list.find((x) => x.id === o.id);
        const on = selected === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onSelect(o.id)}
            className="tile flex items-center gap-4 p-3.5 pr-4 text-left sm:p-4"
          >
            {p ? (
              <Image src={p.avatar} alt="" width={56} height={56} className="h-14 w-14 shrink-0 rounded-full object-cover" />
            ) : (
              <span className="flex h-14 w-14 shrink-0 items-center" aria-hidden="true">
                {list.slice(0, 3).map((x, i) => (
                  <Image
                    key={x.id}
                    src={x.avatar}
                    alt=""
                    width={26}
                    height={26}
                    className={`h-[26px] w-[26px] rounded-full border-2 border-white object-cover ${i ? "-ml-[11px]" : ""}`}
                    style={{ zIndex: 3 - i }}
                  />
                ))}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-bold text-ink">{p ? `${p.name}, ${p.credential}` : booking.anyProvider.name}</span>
                {!p && emergency && (
                  <span className="rounded-full bg-sun px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-ink">
                    Fastest
                  </span>
                )}
              </span>
              <span className="mt-0.5 block text-sm leading-snug text-muted">{p ? p.role : booking.anyProvider.role}</span>
              <span className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-teal-deep">
                <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden="true" />
                {o.next ? `Next opening: ${o.next}` : "No openings in the next few weeks"}
              </span>
            </span>
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors ${
                on ? "border-teal-deep bg-teal-deep" : "border-line"
              }`}
              aria-hidden="true"
            >
              {on && <span className="h-2 w-2 rounded-full bg-white" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
