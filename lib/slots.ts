import { booking, contacts, hours, providers, visitTypes, type Provider, type ProviderId } from "@/content";

/**
 * Demo availability engine. Everything is computed in the browser: each provider's day is
 * filled with pseudo-random "taken" half-hour cells, seeded by date + provider, so the same
 * day always shows the same openings. Lunch is blocked for everyone. Emergency visits use a
 * shorter lead time, so they can land later today.
 */

export type DateKey = string; // "YYYY-MM-DD", clinic-local
export type Slot = { time: string; available: boolean; providerId?: ProviderId };

const pad = (n: number) => String(n).padStart(2, "0");

export function toKey(y: number, m: number, d: number): DateKey {
  return `${y}-${pad(m)}-${pad(d)}`;
}

export function parseKey(key: DateKey) {
  const [y, m, d] = key.split("-").map(Number);
  return { y, m, d };
}

/** Weekday (0 = Sunday) of a clinic-local date. */
export function weekdayOf(key: DateKey) {
  const { y, m, d } = parseKey(key);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function addDays(key: DateKey, days: number): DateKey {
  const { y, m, d } = parseKey(key);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return toKey(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

/** Current date and minutes-since-midnight in Austin, whatever the visitor's own time zone. */
export function clinicNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: contacts.timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { key: toKey(get("year"), get("month"), get("day")), minutes: get("hour") * 60 + get("minute") };
}

export type Now = ReturnType<typeof clinicNow>;

export const toMinutes = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};
export const fromMinutes = (n: number) => `${pad(Math.floor(n / 60))}:${pad(n % 60)}`;

export function hoursOn(key: DateKey) {
  const h = hours.find((x) => x.day === weekdayOf(key));
  return h?.open && h.close ? { open: toMinutes(h.open), close: toMinutes(h.close) } : null;
}

export function worksOn(p: Provider, key: DateKey) {
  return !!hoursOn(key) && !p.daysOff.includes(weekdayOf(key));
}

/** Small deterministic hash → [0, 1). */
function rand(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

/** How full a day is: Mondays and Saturdays book up faster, the next few days are busier. */
function density(key: DateKey, now: Now) {
  const wd = weekdayOf(key);
  const base = wd === 6 ? 0.45 : wd === 1 ? 0.38 : 0.28;
  const soon = key <= addDays(now.key, 3) ? 0.08 : 0;
  return base + soon;
}

const lunch = { from: toMinutes(booking.lunch.from), to: toMinutes(booking.lunch.to) };

function cellTaken(id: ProviderId, key: DateKey, minute: number, now: Now) {
  if (minute >= lunch.from && minute < lunch.to) return true;
  return rand(`${key}|${id}|${minute}`) < density(key, now);
}

function providerSlots(p: Provider, key: DateKey, duration: number, earliest: number, now: Now): Slot[] {
  const h = hoursOn(key);
  if (!h || !worksOn(p, key)) return [];
  const out: Slot[] = [];
  for (let t = h.open; t + duration <= h.close; t += booking.slotStep) {
    if (t >= lunch.from && t < lunch.to) continue; // no starts during lunch
    let free = t >= earliest;
    for (let c = t - (t % 30); free && c < t + duration; c += 30) {
      if (cellTaken(p.id, key, c, now)) free = false;
    }
    out.push({ time: fromMinutes(t), available: free, providerId: free ? p.id : undefined });
  }
  return out;
}

/** Earliest bookable minute on a given day (respects the lead time for "today"). */
function earliestOn(key: DateKey, lead: number, now: Now) {
  if (key < now.key) return Infinity;
  if (key > now.key) return 0;
  const m = now.minutes + lead;
  return Math.ceil(m / booking.slotStep) * booking.slotStep;
}

export function getVisit(id: string | null) {
  return visitTypes.find((v) => v.id === id) ?? null;
}

/** Providers who can take a visit type, in the order listed for that visit. */
export function providersFor(visitId: string | null) {
  const v = getVisit(visitId);
  if (!v) return [];
  return v.providers.map((id) => providers.find((p) => p.id === id)!);
}

export function slotsFor(key: DateKey, visitId: string, providerId: string, now = clinicNow()): Slot[] {
  const v = getVisit(visitId);
  if (!v) return [];
  const earliest = earliestOn(key, v.emergency ? booking.emergencyLeadMinutes : booking.minLeadMinutes, now);
  if (providerId !== booking.anyProvider.id) {
    const p = providers.find((x) => x.id === providerId);
    return p ? providerSlots(p, key, v.duration, earliest, now) : [];
  }
  // "First available": merge everyone who does this visit, picking whoever is free.
  const per = providersFor(visitId)
    .map((p) => providerSlots(p, key, v.duration, earliest, now))
    .filter((s) => s.length);
  if (!per.length) return [];
  const times = per.reduce((acc, s) => (s.length > acc.length ? s : acc), per[0]).map((s) => s.time);
  return times.map((time) => {
    const free = per.map((s) => s.find((x) => x.time === time && x.available)).filter((s): s is Slot => !!s);
    if (!free.length) return { time, available: false };
    const pick = free[Math.floor(rand(`${key}|any|${time}`) * free.length)];
    return { time, available: true, providerId: pick.providerId };
  });
}

export type DayStatus = "closed" | "off" | "past" | "full" | "few" | "open";

export function dayStatus(key: DateKey, visitId: string, providerId: string, now = clinicNow()): DayStatus {
  if (key < now.key) return "past";
  if (!hoursOn(key)) return "closed";
  if (providerId !== booking.anyProvider.id) {
    const p = providers.find((x) => x.id === providerId);
    if (p && !worksOn(p, key)) return "off";
  }
  const free = slotsFor(key, visitId, providerId, now).filter((s) => s.available).length;
  return free === 0 ? "full" : free <= 3 ? "few" : "open";
}

/**
 * Emergency openings: every free slot left today, plus the next open day when today has
 * fewer than four (or the clinic is already closed).
 */
export function emergencyDays(visitId: string, providerId: string, now = clinicNow()) {
  const days: { key: DateKey; slots: Slot[] }[] = [];
  let found = 0;
  for (let i = 0; i < 8 && (days.length === 0 || (found < 4 && days.length < 2)); i++) {
    const key = addDays(now.key, i);
    const slots = slotsFor(key, visitId, providerId, now).filter((s) => s.available);
    if (!slots.length) continue;
    days.push({ key, slots });
    found += slots.length;
  }
  return days;
}

/** Open / closed right now, and the next change. */
export function openStatus(now = clinicNow()) {
  const today = hoursOn(now.key);
  if (today && now.minutes >= today.open && now.minutes < today.close) {
    return { open: true as const, until: fromMinutes(today.close), closingSoon: today.close - now.minutes <= 60 };
  }
  for (let i = 0; i < 8; i++) {
    const key = addDays(now.key, i);
    const h = hoursOn(key);
    if (!h || (i === 0 && now.minutes >= h.open)) continue;
    return { open: false as const, nextKey: key, nextTime: fromMinutes(h.open), today: i === 0, tomorrow: i === 1 };
  }
  return { open: false as const, nextKey: null, nextTime: null, today: false, tomorrow: false };
}

/* ----- formatting ----- */

export function formatTime(t: string) {
  const m = toMinutes(t);
  const h = Math.floor(m / 60);
  return `${((h + 11) % 12) + 1}:${pad(m % 60)} ${h < 12 ? "AM" : "PM"}`;
}

export function formatDate(key: DateKey, opts: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric" }) {
  const { y, m, d } = parseKey(key);
  return new Intl.DateTimeFormat("en-US", { ...opts, timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** "Today", "Tomorrow" or "Tuesday, Nov 3". */
export function relativeDay(key: DateKey, now = clinicNow()) {
  if (key === now.key) return "Today";
  if (key === addDays(now.key, 1)) return "Tomorrow";
  return formatDate(key, { weekday: "long", month: "short", day: "numeric" });
}

/** "75 min" → "1 hr 15 min". */
export function formatDuration(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (!h) return `${m} min`;
  return m ? `${h} hr ${m} min` : `${h} hr`;
}

/** Converts a clinic-local wall time to a UTC Date (DST-safe). */
export function clinicTimeToUtc(key: DateKey, time: string) {
  const { y, m, d } = parseKey(key);
  const mins = toMinutes(time);
  const guess = Date.UTC(y, m - 1, d, Math.floor(mins / 60), mins % 60);
  let utc = guess;
  for (let i = 0; i < 2; i++) {
    const local = clinicNow(new Date(utc));
    const { y: ly, m: lm, d: ld } = parseKey(local.key);
    const asUtc = Date.UTC(ly, lm - 1, ld, Math.floor(local.minutes / 60), local.minutes % 60);
    utc += guess - asUtc;
  }
  return new Date(utc);
}
