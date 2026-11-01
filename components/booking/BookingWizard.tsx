"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import Image from "next/image";
import { AnimatePresence, m } from "framer-motion";
import { booking, contacts } from "@/content";
import { BOOKING_EVENT, type BookingPreset } from "@/lib/booking-bus";
import { scrollToTarget } from "@/lib/scroll";
import { dayStatus, formatDate, formatTime, getVisit, slotsFor } from "@/lib/slots";
import {
  confirmationCode,
  flow,
  getProvider,
  initialState,
  isEmergency,
  onlyProvider,
  providerLabel,
  validate,
  type BookingState,
  type Details,
  type StepId,
} from "./types";
import StepVisit from "./StepVisit";
import StepPatient from "./StepPatient";
import StepProvider from "./StepProvider";
import Calendar from "./Calendar";
import { EmergencyTimes, TimeSlots } from "./TimeSlots";
import DetailsForm from "./DetailsForm";
import Review from "./Review";
import Success from "./Success";
import { Arrow } from "@/components/ui/Arrow";
import Icon from "@/components/ui/Icon";

type Action =
  | { type: "preset"; preset: BookingPreset }
  | { type: "visit"; id: string }
  | { type: "patient"; value: "new" | "existing" }
  | { type: "provider"; id: string }
  | { type: "date"; key: string }
  | { type: "time"; date: string; time: string; assignedId: string }
  | { type: "details"; details: Details }
  | { type: "goto"; step: StepId }
  | { type: "confirm"; code: string }
  | { type: "reset" };

const ORDER: StepId[] = ["visit", "patient", "provider", "date", "time", "details", "review", "done"];

function answered(s: BookingState, step: StepId) {
  switch (step) {
    case "visit":
      return !!s.visitId;
    case "patient":
      return !!s.patient;
    case "provider":
      return !!s.providerId;
    case "date":
      return !!s.date;
    case "time":
      return !!s.time;
    case "details":
      return Object.keys(validate(s.details)).length === 0;
    default:
      return true;
  }
}

/** First step that still needs an answer, never past the details form (review is reached by submitting it). */
function missingStep(s: BookingState): StepId {
  return flow(s).find((st) => !answered(s, st)) ?? "details";
}

/** After the visit or provider changes, keep the provider/date/time only if they still fit. */
function revalidate(s: BookingState): BookingState {
  const visit = getVisit(s.visitId);
  if (!visit) return s;
  let next = s;
  const solo = onlyProvider(s.visitId);
  if (solo) next = { ...next, providerId: solo };
  else if (next.providerId && next.providerId !== booking.anyProvider.id && !visit.providers.includes(next.providerId as never)) {
    next = { ...next, providerId: null };
  }
  if (!next.providerId || !next.date) return { ...next, time: next.providerId ? next.time : null, assignedId: null };
  if (!visit.emergency) {
    const st = dayStatus(next.date!, visit.id, next.providerId);
    if (st !== "open" && st !== "few") return { ...next, date: null, time: null, assignedId: null };
  }
  if (!next.time) return visit.emergency ? { ...next, date: null } : next;
  const slot = slotsFor(next.date!, visit.id, next.providerId).find((x) => x.time === next.time);
  return slot?.available
    ? { ...next, assignedId: slot.providerId ?? null }
    : { ...next, date: visit.emergency ? null : next.date, time: null, assignedId: null };
}

function advance(prev: BookingState, next: BookingState): BookingState {
  const order = flow(next);
  const missing = missingStep(next);
  const cur = Math.max(0, order.indexOf(prev.step));
  const step = order.indexOf(missing) > cur ? missing : (order[cur + 1] ?? "details");
  return { ...next, step, dir: 1 };
}

function reducer(s: BookingState, a: Action): BookingState {
  switch (a.type) {
    case "preset": {
      const base = s.step === "done" ? initialState : s;
      const { visitId, providerId, patient } = a.preset;
      const next = revalidate({
        ...base,
        visitId: visitId ?? base.visitId,
        providerId: providerId ?? base.providerId,
        patient: patient ?? base.patient,
      });
      return { ...next, step: missingStep(next), dir: 1 };
    }
    case "visit": {
      // Switching to or from an emergency changes how times are offered, so start the time over.
      const reset = !!getVisit(a.id)?.emergency !== isEmergency(s) ? { date: null, time: null, assignedId: null } : {};
      return advance(s, revalidate({ ...s, ...reset, visitId: a.id }));
    }
    case "patient":
      return advance(s, { ...s, patient: a.value });
    case "provider":
      return advance(s, revalidate({ ...s, providerId: a.id }));
    case "date":
      return advance(s, { ...s, date: a.key, time: s.date === a.key ? s.time : null });
    case "time":
      return advance(s, { ...s, date: a.date, time: a.time, assignedId: a.assignedId as BookingState["assignedId"] });
    case "details":
      return { ...s, details: a.details, step: "review", dir: 1 };
    case "goto":
      return { ...s, step: a.step, dir: ORDER.indexOf(a.step) < ORDER.indexOf(s.step) ? -1 : 1 };
    case "confirm":
      return { ...s, confirmation: a.code, step: "done", dir: 1 };
    case "reset":
      return { ...initialState, dir: -1 };
  }
}

export default function BookingWizard() {
  const [s, dispatch] = useReducer(reducer, initialState);
  const cardRef = useRef<HTMLDivElement>(null);
  const userNav = useRef(false);
  const visit = getVisit(s.visitId);
  const emergency = isEmergency(s);
  const steps = flow(s);
  const stepIndex = steps.indexOf(s.step);
  const reachable = steps.indexOf(missingStep(s));

  const act = useCallback((a: Action) => {
    userNav.current = true;
    dispatch(a);
  }, []);

  // Presets from "Book with Dr. Shah", service cards and the new patient special elsewhere on the page.
  useEffect(() => {
    const onPreset = (e: Event) => act({ type: "preset", preset: (e as CustomEvent<BookingPreset>).detail ?? {} });
    window.addEventListener(BOOKING_EVENT, onPreset);
    return () => window.removeEventListener(BOOKING_EVENT, onPreset);
  }, [act]);

  // Keep the card in view when a step changes while scrolled down a long list.
  useEffect(() => {
    if (!userNav.current || !cardRef.current) return;
    if (cardRef.current.getBoundingClientRect().top < 80) scrollToTarget(cardRef.current, { offset: -92 });
  }, [s.step]);

  const focusHeading = () => {
    if (!userNav.current) return;
    cardRef.current?.querySelector<HTMLElement>("[data-step-heading]")?.focus({ preventScroll: true });
  };

  const goto = (step: StepId) => act({ type: "goto", step });
  const onTime = (date: string, time: string, assignedId: string) => act({ type: "time", date, time, assignedId });

  const heading = (() => {
    if (s.step === "time" && emergency) return booking.headings.emergencyTime;
    if (s.step === "done") return "";
    return booking.headings[s.step];
  })();

  const renderStep = () => {
    switch (s.step) {
      case "visit":
        return <StepVisit selected={s.visitId} onSelect={(id) => act({ type: "visit", id })} />;
      case "patient":
        return <StepPatient visitId={s.visitId} selected={s.patient} onSelect={(value) => act({ type: "patient", value })} />;
      case "provider":
        return <StepProvider visitId={s.visitId!} selected={s.providerId} onSelect={(id) => act({ type: "provider", id })} />;
      case "date":
        return (
          <Calendar
            selected={s.date}
            visitId={s.visitId!}
            providerId={s.providerId!}
            onSelect={(key) => act({ type: "date", key })}
          />
        );
      case "time":
        return emergency ? (
          <EmergencyTimes visitId={s.visitId!} providerId={s.providerId!} selectedDate={s.date} selected={s.time} onSelect={onTime} />
        ) : (
          <TimeSlots
            date={s.date!}
            visitId={s.visitId!}
            providerId={s.providerId!}
            selected={s.time}
            onSelect={onTime}
            onChangeDate={() => goto("date")}
          />
        );
      case "details":
        return (
          <DetailsForm
            initial={s.details}
            kids={s.visitId === "kids"}
            emergency={emergency}
            onSubmit={(details) => act({ type: "details", details })}
          />
        );
      case "review":
        return <Review state={s} onEdit={goto} onConfirm={() => act({ type: "confirm", code: confirmationCode() })} />;
      default:
        return <Success state={s} onReset={() => act({ type: "reset" })} />;
    }
  };

  const assigned = getProvider(s.assignedId);
  const summary = [
    { step: "visit" as StepId, label: "Visit", value: visit?.name },
    { step: "patient" as StepId, label: "Patient", value: s.patient && (s.patient === "new" ? "New patient" : "Returning patient") },
    {
      step: "provider" as StepId,
      label: "With",
      value: s.providerId && (s.time && assigned ? assigned.name : providerLabel(s.providerId)),
    },
    {
      step: (emergency ? "time" : "date") as StepId,
      label: "When",
      value:
        s.date &&
        `${formatDate(s.date, { weekday: "short", month: "short", day: "numeric" })}${s.time ? ` · ${formatTime(s.time)}` : ""}`,
    },
  ];

  const inWizard = s.step !== "review" && s.step !== "done";
  const showFooter = inWizard && (stepIndex > 0 || !!visit);
  const canContinue = s.step !== "details" && reachable > stepIndex;
  const avatarFor = s.time && assigned ? assigned : getProvider(s.providerId);

  return (
    <div ref={cardRef} className="card mx-auto grid max-w-5xl overflow-hidden rounded-[28px] lg:grid-cols-[1fr_300px]">
      <div className="p-4 pb-6 sm:p-8">
        {s.step !== "done" && (
          <>
            <Progress steps={steps} current={s.step} reachable={reachable} onGo={goto} />
            {summary.some((x) => x.value) && (
              <ul className="mt-4 flex flex-wrap gap-2 lg:hidden" aria-label="Your selections">
                {summary
                  .filter((x) => x.value)
                  .map((c) => (
                    <li key={c.label}>
                      <button
                        type="button"
                        onClick={() => goto(c.step)}
                        className="rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-ink/85 transition-colors hover:bg-mint hover:text-teal-dark"
                        aria-label={`${c.value}. Change ${c.label.toLowerCase()}`}
                      >
                        {c.value}
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </>
        )}

        <p className="sr-only" aria-live="polite">
          {s.step === "done"
            ? "Appointment confirmed"
            : s.step === "review"
              ? heading
              : `Step ${stepIndex + 1} of ${steps.length}: ${heading}`}
        </p>

        <div className={s.step === "done" ? "relative" : "relative mt-6 min-h-[320px]"}>
          <AnimatePresence mode="wait" custom={s.dir} initial={false}>
            <m.div
              key={s.step}
              custom={s.dir}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 20 }),
                center: { opacity: 1, x: 0 },
                exit: (d: number) => ({ opacity: 0, x: d * -20 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onAnimationComplete={(def) => def === "center" && focusHeading()}
            >
              {heading && (
                <h3 data-step-heading tabIndex={-1} className="mb-5 text-2xl font-extrabold tracking-[-0.02em] text-ink outline-none sm:text-[1.7rem]">
                  {heading}
                </h3>
              )}
              {renderStep()}
            </m.div>
          </AnimatePresence>
        </div>

        {showFooter && (
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
            {stepIndex > 0 ? (
              <button type="button" className="btn btn-outline px-5" onClick={() => goto(steps[stepIndex - 1])}>
                <Arrow dir="left" /> Back
              </button>
            ) : (
              <span />
            )}
            {s.step === "details" ? (
              <button type="submit" form="booking-details" className="btn btn-primary">
                Review<span className="hidden sm:inline">&nbsp;my visit</span> <Arrow dir="right" />
              </button>
            ) : canContinue ? (
              <button type="button" className="btn btn-primary" onClick={() => goto(steps[stepIndex + 1])}>
                Continue <Arrow dir="right" />
              </button>
            ) : (
              <span />
            )}
          </div>
        )}
      </div>

      {/* Desktop summary rail */}
      <aside aria-label="Your visit" className="hidden border-l border-line bg-surface p-6 lg:flex lg:flex-col">
        <p className="text-sm font-bold text-ink">Your visit</p>
        <ul className="mt-4 space-y-2">
          {summary.map((r) => (
            <li key={r.label}>
              <button
                type="button"
                disabled={!r.value || s.step === "done"}
                onClick={() => goto(r.step)}
                className="group flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left ring-1 ring-line transition-shadow enabled:hover:ring-teal-deep disabled:cursor-default"
              >
                {r.label === "With" && avatarFor ? (
                  <Image src={avatarFor.avatar} alt="" width={36} height={36} className="h-9 w-9 shrink-0 rounded-full object-cover" />
                ) : (
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${r.value ? "bg-mint text-teal-deep" : "bg-surface text-muted/60"}`}
                  >
                    <Icon
                      name={r.label === "Visit" ? (visit?.icon ?? "tooth") : r.label === "Patient" ? "user" : r.label === "With" ? "userPlus" : "calendar"}
                      className="h-[18px] w-[18px]"
                    />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block text-xs font-semibold text-muted">{r.label}</span>
                  <span className={`block truncate text-sm font-semibold ${r.value ? "text-ink" : "text-muted/60"}`}>
                    {r.value || "Not chosen yet"}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-6">
          <div className="rounded-2xl bg-white p-4 ring-1 ring-line">
            <p className="text-sm font-bold text-ink">Prefer to talk to a person?</p>
            <p className="mt-1 text-sm text-muted">Our front desk is happy to help.</p>
            <a href={contacts.phoneHref} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-teal-deep hover:underline">
              <Icon name="phone" className="h-4 w-4" /> {contacts.phoneDisplay}
            </a>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Progress({
  steps,
  current,
  reachable,
  onGo,
}: {
  steps: StepId[];
  current: StepId;
  reachable: number;
  onGo: (s: StepId) => void;
}) {
  const review = current === "review";
  const idx = review ? steps.length : steps.indexOf(current);
  const pct = review ? 100 : ((idx + 0.5) / steps.length) * 100;
  const labels = booking.steps as Record<string, string>;
  return (
    <nav aria-label="Booking progress">
      {/* Phone and tablet: counter + bar */}
      <div className="md:hidden">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-muted">{review ? "Last step" : `Step ${idx + 1} of ${steps.length}`}</span>
          <span className="font-bold text-teal-deep">{review ? "Review" : labels[current]}</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sky">
          <div className="h-full rounded-full bg-teal-deep transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Desktop: labeled steps */}
      <ol className="hidden items-center gap-1.5 md:flex">
        {steps.map((st, i) => {
          const done = i < idx;
          const active = i === idx;
          const can = i <= reachable && !active;
          return (
            <li key={st} className="flex flex-1 items-center gap-1.5 last:flex-none">
              <button
                type="button"
                disabled={!can}
                onClick={() => onGo(st)}
                aria-current={active ? "step" : undefined}
                className={`flex items-center gap-2 rounded-full py-1 pr-1.5 text-sm font-semibold transition-colors disabled:cursor-default ${
                  active ? "text-ink" : done ? "text-teal-deep hover:text-ink" : "text-muted"
                }`}
              >
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold transition-colors duration-300 ${
                    active ? "bg-teal-deep text-white" : done ? "bg-mint text-teal-deep" : "bg-surface text-muted ring-1 ring-line"
                  }`}
                >
                  {done ? <Icon name="check" className="h-3.5 w-3.5" strokeWidth={2.6} /> : i + 1}
                </span>
                {labels[st]}
              </button>
              {i < steps.length - 1 && <span className={`h-0.5 flex-1 rounded-full ${done ? "bg-teal" : "bg-line"}`} aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
