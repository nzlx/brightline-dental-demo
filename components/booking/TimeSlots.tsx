"use client";

import { useMemo } from "react";
import { booking, contacts } from "@/content";
import { clinicNow, emergencyDays, formatDate, formatTime, openStatus, relativeDay, slotsFor, toMinutes, type Slot } from "@/lib/slots";
import Icon from "@/components/ui/Icon";
import { getProvider } from "./types";

type Pick = (date: string, time: string, providerId: string) => void;

const groups = [
  { label: "Morning", from: 0, to: 12 * 60 },
  { label: "Afternoon", from: 12 * 60, to: 24 * 60 },
];

export function TimeSlots(props: {
  date: string;
  visitId: string;
  providerId: string;
  selected: string | null;
  onSelect: Pick;
  onChangeDate: () => void;
}) {
  const { date, visitId, providerId, selected, onSelect, onChangeDate } = props;
  const slots = useMemo(() => slotsFor(date, visitId, providerId), [date, visitId, providerId]);
  const free = slots.filter((s) => s.available).length;
  const isAny = providerId === booking.anyProvider.id;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="font-semibold text-ink">
          {formatDate(date)}{" "}
          <span className="font-normal text-muted">
            · {free} open {free === 1 ? "time" : "times"}
          </span>
        </p>
        <button type="button" onClick={onChangeDate} className="link">
          Change date
        </button>
      </div>

      <div className="mt-5 space-y-6">
        {groups.map((g) => {
          const list = slots.filter((s) => {
            const t = toMinutes(s.time);
            return t >= g.from && t < g.to;
          });
          if (!list.length) return null;
          return (
            <fieldset key={g.label}>
              <legend className="mb-2.5 text-sm font-bold text-ink">{g.label}</legend>
              <SlotGrid list={list} selected={selected} showWho={isAny} onPick={(s) => onSelect(date, s.time, s.providerId!)} />
            </fieldset>
          );
        })}
      </div>
    </div>
  );
}

/** Emergency visits skip the calendar: today's remaining openings (and the next day's if today is thin). */
export function EmergencyTimes(props: {
  visitId: string;
  providerId: string;
  selectedDate: string | null;
  selected: string | null;
  onSelect: Pick;
}) {
  const { visitId, providerId, selectedDate, selected, onSelect } = props;
  const now = useMemo(() => clinicNow(), []);
  const days = useMemo(() => emergencyDays(visitId, providerId, now), [visitId, providerId, now]);
  const open = openStatus(now).open;
  const isAny = providerId === booking.anyProvider.id;
  const todayOpen = days[0]?.key === now.key;

  return (
    <div>
      <div className="flex flex-col gap-3 rounded-2xl border border-sun bg-sun-soft p-4 sm:flex-row sm:items-center">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sun text-ink">
          <Icon name="alert" className="h-5 w-5" />
        </span>
        <p className="flex-1 text-sm leading-snug text-ink">
          {!open ? booking.afterHoursNote : todayOpen ? booking.emergencyNote : booking.emergencyFullToday}
        </p>
        <a href={contacts.phoneHref} className="btn btn-primary h-11 min-h-0 shrink-0 px-5 text-sm">
          <Icon name="phone" className="h-4 w-4" /> Call {contacts.phoneDisplay}
        </a>
      </div>

      <div className="mt-6 space-y-6">
        {days.map((d) => (
          <fieldset key={d.key}>
            <legend className="mb-2.5 flex items-center gap-2 text-sm font-bold text-ink">
              {d.key === now.key && <span className="h-2 w-2 rounded-full bg-ok" aria-hidden="true" />}
              {relativeDay(d.key, now)}
              <span className="font-normal text-muted">
                · {formatDate(d.key, { month: "short", day: "numeric" })} · {d.slots.length} open
              </span>
            </legend>
            <SlotGrid
              list={d.slots}
              selected={selectedDate === d.key ? selected : null}
              showWho={isAny}
              onPick={(s) => onSelect(d.key, s.time, s.providerId!)}
            />
          </fieldset>
        ))}
        {!days.length && <p className="text-muted">No openings found online. Please call us. We&apos;ll fit you in.</p>}
      </div>
    </div>
  );
}

function SlotGrid({
  list,
  selected,
  showWho,
  onPick,
}: {
  list: Slot[];
  selected: string | null;
  showWho: boolean;
  onPick: (s: Slot) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {list.map((s) => {
        const on = s.time === selected;
        const who = showWho && s.providerId ? getProvider(s.providerId)?.shortName : null;
        return (
          <button
            key={s.time}
            type="button"
            disabled={!s.available}
            aria-pressed={on}
            aria-label={`${formatTime(s.time)}${s.available ? (who ? `, with ${who}` : "") : ", taken"}`}
            onClick={() => s.providerId && onPick(s)}
            className={`flex min-h-12 flex-col items-center justify-center rounded-xl border-[1.5px] px-1 py-2 text-sm font-semibold tabular-nums transition-colors ${
              on
                ? "border-teal-deep bg-teal-deep text-white"
                : s.available
                  ? "border-line bg-white text-ink hover:border-teal-deep hover:text-teal-deep"
                  : "cursor-not-allowed border-transparent bg-surface font-normal text-ink/30 line-through"
            }`}
          >
            {formatTime(s.time)}
            {who && <span className={`text-[11px] font-medium ${on ? "text-white/85" : "text-muted"}`}>{who}</span>}
          </button>
        );
      })}
    </div>
  );
}
