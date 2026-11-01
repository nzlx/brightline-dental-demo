"use client";

import { newPatientSpecial } from "@/content";
import Icon from "@/components/ui/Icon";

type Props = { visitId: string | null; selected: "new" | "existing" | null; onSelect: (v: "new" | "existing") => void };

const options = [
  { id: "new", icon: "userPlus", title: "I'm a new patient", text: "First visit to Brightline. We'll email a few short forms." },
  { id: "existing", icon: "user", title: "I've been here before", text: "Welcome back! We already have your records." },
] as const;

export default function StepPatient({ visitId, selected, onSelect }: Props) {
  const kids = visitId === "kids";
  return (
    <div>
      {kids && <p className="mb-4 text-sm text-muted">Booking for your child? Answer for them — has your child visited us before?</p>}
      <div role="radiogroup" aria-label="Patient type" className="grid gap-3 sm:grid-cols-2">
        {options.map((o) => {
          const on = selected === o.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onSelect(o.id)}
              className="tile flex items-start gap-4 p-5 text-left"
            >
              <span
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-full transition-colors ${
                  on ? "bg-teal-deep text-white" : "bg-mint text-teal-deep"
                }`}
              >
                <Icon name={o.icon} className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-lg font-bold text-ink">{o.title}</span>
                <span className="mt-1 block text-sm leading-snug text-muted">{o.text}</span>
              </span>
            </button>
          );
        })}
      </div>

      {visitId === newPatientSpecial.visitId && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-sun-soft p-4 text-sm text-ink">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sun text-ink">
            <Icon name="star" className="h-4 w-4" filled />
          </span>
          <p className="leading-snug">
            <strong className="font-bold">New patient special: {newPatientSpecial.price}</strong> {newPatientSpecial.title.toLowerCase()}{" "}
            for new patients paying out of pocket. Applied automatically at checkout.
            <span className="mt-1 block text-xs text-muted">Demo offer</span>
          </p>
        </div>
      )}
    </div>
  );
}
