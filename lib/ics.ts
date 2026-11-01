import { contacts, site } from "@/content";

const stamp = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
const esc = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/[,;]/g, (c) => `\\${c}`)
    .replace(/\n/g, "\\n");

/** Builds an .ics file in the browser and hands it to the visitor. Nothing is uploaded. */
export function downloadIcs(opts: { start: Date; minutes: number; title: string; description: string }) {
  const end = new Date(opts.start.getTime() + opts.minutes * 60_000);
  const a = contacts.address;
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Brightline Family Dental//Demo booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${Date.now()}-${Math.random().toString(36).slice(2)}@brightline-dental-demo`,
    `DTSTAMP:${stamp(new Date())}`,
    `DTSTART:${stamp(opts.start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${esc(opts.title)}`,
    `DESCRIPTION:${esc(opts.description)}`,
    `LOCATION:${esc(`${site.name}, ${a.street}, ${a.city}, ${a.state} ${a.zip}`)}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Dental appointment in 1 hour",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "brightline-dental-appointment.ics";
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
