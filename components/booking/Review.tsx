"use client";

import { useState } from "react";
import { booking, newPatientSpecial } from "@/content";
import { formatDate, formatDuration, formatTime, getVisit } from "@/lib/slots";
import { Arrow } from "@/components/ui/Arrow";
import Icon from "@/components/ui/Icon";
import { getProvider, isEmergency, specialApplies, type BookingState, type StepId } from "./types";

type Props = { state: BookingState; onEdit: (step: StepId) => void; onConfirm: () => void };

/** What the patient should expect to pay, in plain words. */
export function costLine(s: BookingState) {
  const visit = getVisit(s.visitId)!;
  if (specialApplies(s)) return { value: `${newPatientSpecial.price} new patient special`, note: "Demo offer" };
  const ins = s.details.insurance;
  if (!ins || ins === booking.insuranceSelfPay) return { value: `Self-pay: ${visit.selfPay}`, note: "Ask about our membership plan" };
  if (ins === booking.insuranceOther) return { value: "We'll check your plan", note: "Our team will call if anything isn't covered" };
  return { value: `Billed to ${ins}`, note: "We verify your benefits before your visit" };
}

export default function Review({ state, onEdit, onConfirm }: Props) {
  const [busy, setBusy] = useState(false);
  const visit = getVisit(state.visitId)!;
  const provider = getProvider(state.assignedId);
  const isAny = state.providerId === booking.anyProvider.id;
  const cost = costLine(state);

  const rows: { step: StepId; label: string; value: string; extra?: string }[] = [
    { step: "visit", label: "Visit", value: visit.name, extra: `About ${formatDuration(visit.duration)}` },
    { step: "patient", label: "Patient", value: state.details.name, extra: state.patient === "new" ? "New patient" : "Returning patient" },
    {
      step: "provider",
      label: "With",
      value: provider ? `${provider.name}, ${provider.credential}` : "",
      extra: isAny ? "First available" : provider?.role,
    },
    {
      step: isEmergency(state) ? "time" : "date",
      label: "When",
      value: `${formatDate(state.date!)}`,
      extra: formatTime(state.time!),
    },
    { step: "details", label: "Contact", value: state.details.phone, extra: state.details.email },
    {
      step: "details",
      label: "Insurance",
      value: state.details.insurance,
      extra: state.details.memberId ? `Member ID ${state.details.memberId}` : undefined,
    },
  ];

  const confirm = () => {
    setBusy(true);
    // Simulated network round-trip: this demo never sends anything.
    setTimeout(onConfirm, 900);
  };

  return (
    <div>
      <dl className="divide-y divide-line rounded-2xl border border-line">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start gap-3 px-4 py-3.5">
            <dt className="w-[5.5rem] shrink-0 pt-0.5 text-sm font-semibold text-muted">{r.label}</dt>
            <dd className="min-w-0 flex-1">
              <span className="block font-semibold text-ink">{r.value}</span>
              {r.extra && <span className="block break-words text-sm text-muted">{r.extra}</span>}
            </dd>
            <button
              type="button"
              onClick={() => onEdit(r.step)}
              className="link shrink-0 rounded-full px-2 py-0.5 text-sm"
              aria-label={`Edit ${r.label.toLowerCase()}`}
            >
              Edit
            </button>
          </div>
        ))}
        {state.details.notes && (
          <div className="flex items-start gap-3 px-4 py-3.5">
            <dt className="w-[5.5rem] shrink-0 pt-0.5 text-sm font-semibold text-muted">Notes</dt>
            <dd className="min-w-0 flex-1 break-words text-sm text-ink/90">{state.details.notes}</dd>
          </div>
        )}
      </dl>

      <div
        className={`mt-4 flex items-center gap-3 rounded-2xl p-4 ${specialApplies(state) ? "bg-sun-soft" : "bg-mint"}`}
      >
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${
            specialApplies(state) ? "bg-sun text-ink" : "bg-white text-teal-deep"
          }`}
        >
          <Icon name={specialApplies(state) ? "star" : "card"} className="h-5 w-5" filled={specialApplies(state)} />
        </span>
        <p className="text-sm">
          <span className="block font-bold text-ink">{cost.value}</span>
          <span className="text-muted">{cost.note}</span>
        </p>
      </div>

      <p className="mt-4 px-1 text-sm text-muted">{booking.policy}</p>

      <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
        <button type="button" className="btn btn-outline px-5" onClick={() => onEdit("details")} disabled={busy}>
          <Arrow dir="left" /> Back
        </button>
        <button type="button" className="btn btn-primary min-w-[11rem]" onClick={confirm} disabled={busy} aria-busy={busy}>
          {busy ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true" />
              Booking…
            </>
          ) : (
            "Confirm visit"
          )}
        </button>
      </div>
    </div>
  );
}
