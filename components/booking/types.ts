import { booking, newPatientSpecial, providers, type ProviderId } from "@/content";
import { getVisit, providersFor } from "@/lib/slots";

export type Details = {
  name: string;
  phone: string;
  email: string;
  dob: string;
  insurance: string;
  memberId: string;
  notes: string;
};

export type StepId = "visit" | "patient" | "provider" | "date" | "time" | "details" | "review" | "done";

export type BookingState = {
  step: StepId;
  dir: 1 | -1;
  visitId: string | null;
  patient: "new" | "existing" | null;
  providerId: string | null; // provider id or booking.anyProvider.id
  date: string | null;
  time: string | null;
  assignedId: ProviderId | null; // who actually takes the slot (matters for "first available")
  details: Details;
  confirmation: string | null;
};

export const emptyDetails: Details = { name: "", phone: "", email: "", dob: "", insurance: "", memberId: "", notes: "" };

export const initialState: BookingState = {
  step: "visit",
  dir: 1,
  visitId: null,
  patient: null,
  providerId: null,
  date: null,
  time: null,
  assignedId: null,
  details: emptyDetails,
  confirmation: null,
};

export const isEmergency = (s: Pick<BookingState, "visitId">) => !!getVisit(s.visitId)?.emergency;

/** Wizard steps for the current visit: emergencies skip the calendar and go straight to today's openings. */
export function flow(s: Pick<BookingState, "visitId">): StepId[] {
  return isEmergency(s)
    ? ["visit", "patient", "provider", "time", "details"]
    : ["visit", "patient", "provider", "date", "time", "details"];
}

export const getProvider = (id: string | null) => providers.find((p) => p.id === id) ?? null;
export const providerLabel = (id: string | null) =>
  id === booking.anyProvider.id ? booking.anyProvider.name : (getProvider(id)?.name ?? "");

/** Single-provider visits (implants) pick the provider automatically. */
export function onlyProvider(visitId: string | null) {
  const list = providersFor(visitId);
  return list.length === 1 ? list[0].id : null;
}

/** The $99 new-patient offer applies to a new patient's cleaning when they pay out of pocket. */
export function specialApplies(s: Pick<BookingState, "visitId" | "patient"> & { details?: Details }) {
  if (s.visitId !== newPatientSpecial.visitId || s.patient !== "new") return false;
  return !s.details?.insurance || s.details.insurance === booking.insuranceSelfPay;
}

/** US phone mask: (512) 555-0134. */
export function formatPhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("1")) d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length === 0) return "";
  if (d.length < 4) return `(${d}`;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

/** Date-of-birth mask: MM/DD/YYYY. */
export function formatDob(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  if (d.length < 3) return d;
  if (d.length < 5) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

function validDob(v: string) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v);
  if (!m) return false;
  const [mm, dd, yyyy] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(yyyy, mm - 1, dd));
  if (dt.getUTCMonth() !== mm - 1 || dt.getUTCDate() !== dd) return false;
  const year = new Date().getFullYear();
  return yyyy >= year - 110 && dt.getTime() <= Date.now();
}

export function validate(d: Details) {
  const errors: Partial<Record<keyof Details, string>> = {};
  if (d.name.trim().length < 2) errors.name = "Please enter the patient's full name.";
  const digits = d.phone.replace(/\D/g, "");
  if (digits.length !== 10) errors.phone = "Enter a 10-digit US phone number.";
  else if (/^[01]/.test(digits)) errors.phone = "That area code doesn't look right.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) errors.email = "Enter a valid email, like name@example.com.";
  if (!validDob(d.dob)) errors.dob = "Enter a valid date of birth (MM/DD/YYYY).";
  if (!d.insurance) errors.insurance = "Choose your insurance, or Self-pay.";
  return errors;
}

export function confirmationCode() {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 6; i++) c += abc[Math.floor(Math.random() * abc.length)];
  return `BL-${c}`;
}
