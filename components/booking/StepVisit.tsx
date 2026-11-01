"use client";

import { booking, providers, visitTypes } from "@/content";
import { formatDuration } from "@/lib/slots";
import Icon from "@/components/ui/Icon";

type Props = {
  selected: string | null;
  /** Provider picked earlier ("Book with Dr. Shah"): visits they don't offer go to someone else. */
  providerId: string | null;
  onSelect: (id: string) => void;
  onClearProvider: () => void;
};

export default function StepVisit({ selected, providerId, onSelect, onClearProvider }: Props) {
  const preset = providerId && providerId !== booking.anyProvider.id ? providers.find((p) => p.id === providerId) : null;

  return (
    <div>
      {preset && (
        <p className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-mint px-4 py-3 text-sm text-teal-dark">
          <span>
            Booking with <strong className="font-bold">{preset.name}</strong>
          </span>
          <button type="button" onClick={onClearProvider} className="link text-sm">
            Any provider
          </button>
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {visitTypes.map((v) => {
          const on = v.id === selected;
          const other = preset && !v.providers.includes(preset.id);
          return (
            <button
              key={v.id}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(v.id)}
              className="tile group flex items-start gap-4 p-4 text-left"
            >
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl transition-colors ${
                  v.emergency ? "bg-sun-soft text-sun-deep" : on ? "bg-teal-deep text-white" : "bg-mint text-teal-deep"
                }`}
              >
                <Icon name={v.icon} className="h-[22px] w-[22px]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-bold text-ink">{v.name}</span>
                  {v.emergency && (
                    <span className="rounded-full bg-sun px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-ink">
                      Same day
                    </span>
                  )}
                </span>
                <span className="mt-1 block text-sm leading-snug text-muted">{v.description}</span>
                {other && <span className="mt-1.5 block text-xs font-semibold text-muted/80">With another provider</span>}
              </span>
              <span className="hidden shrink-0 pt-0.5 text-xs font-semibold text-muted min-[400px]:block">
                {formatDuration(v.duration)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
