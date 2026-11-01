"use client";

import { useEffect, useState } from "react";
import { formatTime, openStatus, relativeDay } from "@/lib/slots";

type Status = ReturnType<typeof openStatus>;

/** Live "Open now" line in Austin time. Renders a same-size placeholder until mounted (no CLS, no hydration mismatch). */
export default function OpenNow({ className = "" }: { className?: string }) {
  const [st, setSt] = useState<Status | null>(null);

  useEffect(() => {
    const tick = () => setSt(openStatus());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  let title = " ";
  let sub = " ";
  if (st?.open) {
    title = st.closingSoon ? "Closing soon" : "Open now";
    sub = `Until ${formatTime(st.until)} today`;
  } else if (st) {
    title = "Closed now";
    sub = st.nextKey ? `Opens ${st.today ? "today" : st.tomorrow ? "tomorrow" : relativeDay(st.nextKey).replace(/,.*/, "")} at ${formatTime(st.nextTime!)}` : "";
  }

  return (
    <div className={`flex items-center gap-3 ${className}`} aria-live="polite">
      <span className="relative grid h-3 w-3 place-items-center" aria-hidden="true">
        {st?.open && <span className="ping-soft absolute inset-0 rounded-full bg-ok/50" />}
        <span className={`h-2.5 w-2.5 rounded-full ${st ? (st.open ? "bg-ok" : "bg-sun-deep") : "bg-line"}`} />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-bold text-ink">{title}</span>
        <span className="block text-xs text-muted">{sub}</span>
      </span>
    </div>
  );
}
