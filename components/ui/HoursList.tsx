"use client";

import { useEffect, useState } from "react";
import { hours } from "@/content";
import { shortTime } from "@/lib/hours";
import { clinicNow, weekdayOf } from "@/lib/slots";

/** Weekly hours with today highlighted (Austin time, set after mount). */
export default function HoursList() {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => setToday(weekdayOf(clinicNow().key)), []);

  return (
    <dl className="divide-y divide-line text-[0.95rem]">
      {hours.map((h) => {
        const on = h.day === today;
        return (
          <div key={h.day} className={`flex items-center justify-between gap-4 px-3 py-2.5 ${on ? "rounded-xl bg-mint" : ""}`}>
            <dt className={on ? "font-bold text-teal-dark" : "text-ink/80"}>
              {h.label}
              {on && <span className="ml-2 text-xs font-bold uppercase tracking-wide">Today</span>}
            </dt>
            <dd className={`tabular-nums ${on ? "font-bold text-teal-dark" : h.open ? "font-semibold text-ink" : "text-muted"}`}>
              {h.open && h.close ? `${shortTime(h.open)} – ${shortTime(h.close)}` : "Closed"}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
