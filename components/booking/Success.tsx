"use client";

import { useEffect, useRef } from "react";
import { m } from "framer-motion";
import { booking, contacts, site } from "@/content";
import { downloadIcs } from "@/lib/ics";
import { clinicTimeToUtc, formatDate, formatTime, getVisit } from "@/lib/slots";
import Icon from "@/components/ui/Icon";
import { costLine } from "./Review";
import { getProvider, isEmergency, type BookingState } from "./types";

const ease = [0.16, 1, 0.3, 1] as const;

export default function Success({ state, onReset }: { state: BookingState; onReset: () => void }) {
  const visit = getVisit(state.visitId)!;
  const provider = getProvider(state.assignedId)!;
  const first = state.details.name.split(/\s+/)[0];
  const title = useRef<HTMLHeadingElement>(null);
  const emergency = isEmergency(state);

  useEffect(() => {
    title.current?.focus({ preventScroll: true });
  }, []);

  const addToCalendar = () =>
    downloadIcs({
      start: clinicTimeToUtc(state.date!, state.time!),
      minutes: visit.duration,
      title: `${visit.name} with ${provider.shortName} at ${site.shortName}`,
      description: `${visit.name} for ${state.details.name}. Confirmation ${state.confirmation}. Questions? Call ${contacts.phoneDisplay}. ${booking.policy}`,
    });

  return (
    <div className="py-2 sm:py-6">
      <div className="text-center">
        <div className="relative mx-auto h-20 w-20">
          {[0, 1].map((i) => (
            <span key={i} className="ping-soft absolute inset-0 rounded-full bg-teal/30" style={{ animationDelay: `${i * 0.6}s` }} />
          ))}
          <m.div
            className="relative grid h-20 w-20 place-items-center rounded-full bg-teal-deep text-white shadow-[0_18px_40px_-14px_rgb(11_124_120/0.7)]"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
          >
            <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true">
              <m.path
                d="M12 25l8 8 16-17"
                fill="none"
                stroke="currentColor"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: 0.25, ease }}
              />
            </svg>
          </m.div>
        </div>

        <m.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3, ease }}>
          <h3 ref={title} tabIndex={-1} className="mt-7 text-3xl font-extrabold tracking-[-0.02em] text-ink outline-none sm:text-4xl">
            {booking.success.title}
          </h3>
          <p className="mx-auto mt-3 max-w-md text-lg text-muted">
            See you {formatDate(state.date!, { weekday: "long", month: "long", day: "numeric" })} at{" "}
            <strong className="font-bold text-ink">{formatTime(state.time!)}</strong>, {first}.
          </p>
        </m.div>
      </div>

      <m.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.45, ease }}
        className="mx-auto mt-7 grid max-w-xl gap-3 sm:grid-cols-2"
      >
        <div className="rounded-2xl border border-line p-5">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-muted">Confirmation</span>
            <span className="font-mono font-bold tracking-wider text-teal-deep">{state.confirmation}</span>
          </div>
          <p className="mt-4 font-bold text-ink">{visit.name}</p>
          <p className="mt-0.5 text-sm text-muted">
            with {provider.name}, {provider.credential}
          </p>
          <p className="mt-3 text-sm text-ink">{costLine(state).value}</p>
        </div>
        <div className="rounded-2xl bg-surface p-5">
          <p className="font-bold text-ink">Please bring</p>
          <ul className="mt-2 space-y-1.5 text-sm text-ink/85">
            {booking.success.bring.map((b) => (
              <li key={b} className="flex gap-2">
                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-teal-deep" strokeWidth={2.2} />
                {b}
              </li>
            ))}
          </ul>
        </div>
        {(state.patient === "new" || emergency) && (
          <p
            className={`rounded-2xl p-4 text-sm leading-snug sm:col-span-2 ${emergency ? "bg-sun-soft text-ink" : "bg-mint text-teal-dark"}`}
          >
            {emergency ? booking.success.emergency : booking.success.newPatient}
          </p>
        )}
      </m.div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button type="button" className="btn btn-primary w-full sm:w-auto" onClick={addToCalendar}>
          <Icon name="calendar" className="h-4 w-4" />
          Add to calendar
        </button>
        <button type="button" className="btn btn-outline w-full sm:w-auto" onClick={onReset}>
          Book another visit
        </button>
      </div>
    </div>
  );
}
