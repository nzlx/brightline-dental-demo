import { hours } from "@/content";

/** "09:00" → "9 AM", "13:30" → "1:30 PM". */
export function shortTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "AM" : "PM"}`;
}

/** Collapses consecutive days with identical hours: [{ days: "Tue–Fri", time: "9 AM–7 PM" }, …]. */
export function groupedHours() {
  const out: { days: string; time: string }[] = [];
  let start = 0;
  for (let i = 1; i <= hours.length; i++) {
    const a = hours[start];
    const b = hours[i];
    if (b && b.open === a.open && b.close === a.close) continue;
    const short = (s: string) => s.slice(0, 3);
    const days = i - 1 === start ? short(a.label) : `${short(a.label)}–${short(hours[i - 1].label)}`;
    out.push({ days, time: a.open && a.close ? `${shortTime(a.open)}–${shortTime(a.close)}` : "Closed" });
    start = i;
  }
  return out;
}
