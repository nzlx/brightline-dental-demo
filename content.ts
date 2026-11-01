/**
 * All site copy lives here: texts, visit types, team, insurance, hours and contacts.
 * Brightline Family Dental is a fictional practice. The address (street included) and the
 * phone number are made up (555-01xx numbers are reserved for fiction).
 */

export const site = {
  name: "Brightline Family Dental",
  shortName: "Brightline Dental",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://brightline-dental-demo.vercel.app",
  description:
    "Family dentist in South Austin, TX. Cleanings, fillings, whitening, clear aligners, implants, kids' dentistry and same-day emergencies. Most insurance accepted. Book online in a minute.",
  established: 2012,
  credit: { label: "Demo website by NeoCode", href: "https://neocodestudio.vercel.app" },
};

export const contacts = {
  phoneDisplay: "(512) 555-0134",
  phoneHref: "tel:+15125550134",
  email: "hello@brightlinedental.example",
  address: {
    street: "4120 Bluebonnet Ridge Dr",
    city: "Austin",
    state: "TX",
    zip: "78745",
  },
  // Placeholder: points to the area, not to a real building.
  directionsHref: "https://maps.google.com/?q=South+Austin,+TX+78745",
  // Central Time, with daylight saving.
  timeZone: "America/Chicago",
};

export const socials = [
  { label: "Facebook", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "Google reviews", href: "#" },
];

export const nav = [
  { label: "Services", href: "#services" },
  { label: "Our Doctors", href: "#doctors" },
  { label: "Insurance", href: "#insurance" },
  { label: "Reviews", href: "#reviews" },
  { label: "FAQ", href: "#faq" },
  { label: "Visit Us", href: "#visit" },
];

/** Weekly hours. day: 0 = Sunday … 6 = Saturday. Times are 24h, clinic-local (Austin, Central Time). */
export const hours: { day: number; label: string; open: string | null; close: string | null }[] = [
  { day: 1, label: "Monday", open: "07:30", close: "17:00" },
  { day: 2, label: "Tuesday", open: "07:30", close: "17:00" },
  { day: 3, label: "Wednesday", open: "07:30", close: "17:00" },
  { day: 4, label: "Thursday", open: "07:30", close: "17:00" },
  { day: 5, label: "Friday", open: "07:30", close: "14:00" },
  { day: 6, label: "Saturday", open: "08:00", close: "13:00" },
  { day: 0, label: "Sunday", open: null, close: null },
];

/**
 * Headline options (pick one for `hero.title`):
 *  1. "The dentist your family actually looks forward to."   ← in use
 *  2. "Gentle dental care for every smile in your family."
 *  3. "Healthy smiles start right here in Austin."
 * `hero.highlight` is the phrase underlined with the yellow marker.
 */
export const hero = {
  eyebrow: "Family dentistry in South Austin",
  title: "The dentist your family actually looks forward to.",
  highlight: "looks forward to.",
  subtitle:
    "Cleanings, fillings, whitening and same-day emergencies — with a team that explains everything and never rushes you.",
  cta: "Book a Visit",
  callCta: "Call Now",
  image: {
    src: "/images/hero-office.jpg",
    alt: "A smiling dentist chatting with a relaxed patient in a bright, modern treatment room",
  },
  trust: [
    { icon: "userPlus", label: "Accepting new patients" },
    { icon: "shield", label: "Most insurance accepted" },
    { icon: "bolt", label: "Same-day emergencies" },
  ],
  rating: { value: "4.9", label: "312 patient reviews" },
};

export type ProviderId = "carter" | "nguyen" | "shah" | "lopez";

export type Provider = {
  id: ProviderId;
  name: string;
  shortName: string; // "Dr. Carter" / "Maria"
  credential: "DDS" | "RDH";
  role: string;
  avatar: string;
  /** Weekdays (0 = Sunday) this provider is not in the office. */
  daysOff: number[];
};

export const providers: Provider[] = [
  {
    id: "carter",
    name: "Dr. Emily Carter",
    shortName: "Dr. Carter",
    credential: "DDS",
    role: "Founder · General & family dentistry",
    avatar: "/images/avatar-carter.jpg",
    daysOff: [5],
  },
  {
    id: "nguyen",
    name: "Dr. Daniel Nguyen",
    shortName: "Dr. Nguyen",
    credential: "DDS",
    role: "Implants & restorative dentistry",
    avatar: "/images/avatar-nguyen.jpg",
    daysOff: [6],
  },
  {
    id: "shah",
    name: "Dr. Priya Shah",
    shortName: "Dr. Shah",
    credential: "DDS",
    role: "Kids' dentistry & clear aligners",
    avatar: "/images/avatar-shah.jpg",
    daysOff: [1],
  },
  {
    id: "lopez",
    name: "Maria Lopez",
    shortName: "Maria",
    credential: "RDH",
    role: "Registered dental hygienist · Habla español",
    avatar: "/images/avatar-lopez.jpg",
    daysOff: [],
  },
];

export type VisitType = {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: number; // minutes the chair is held
  providers: ProviderId[];
  /** Self-pay price shown in the review step (demo pricing). */
  selfPay: string;
  emergency?: boolean;
};

export const visitTypes: VisitType[] = [
  {
    id: "cleaning",
    name: "Cleaning & Checkup",
    description: "Exam, gentle cleaning and any X-rays you're due for.",
    icon: "sparkle",
    duration: 60,
    providers: ["lopez", "carter", "shah"],
    selfPay: "$145",
  },
  {
    id: "consultation",
    name: "Consultation",
    description: "Talk through a concern, a treatment plan or a second opinion.",
    icon: "chat",
    duration: 30,
    providers: ["carter", "nguyen", "shah"],
    selfPay: "$59",
  },
  {
    id: "tooth-pain",
    name: "Tooth Pain or Filling",
    description: "Sensitivity, a cavity or a filling that came loose.",
    icon: "tooth",
    duration: 60,
    providers: ["carter", "nguyen"],
    selfPay: "from $120",
  },
  {
    id: "whitening",
    name: "Teeth Whitening",
    description: "In-office whitening or custom take-home trays.",
    icon: "sun",
    duration: 90,
    providers: ["carter", "shah"],
    selfPay: "$349",
  },
  {
    id: "aligners",
    name: "Clear Aligners Consult",
    description: "A quick 3D scan and a preview of your straighter smile.",
    icon: "aligner",
    duration: 45,
    providers: ["shah", "carter"],
    selfPay: "Free",
  },
  {
    id: "implants",
    name: "Implant Consultation",
    description: "Replace a missing tooth: 3D imaging and a clear plan.",
    icon: "implant",
    duration: 45,
    providers: ["nguyen"],
    selfPay: "Free",
  },
  {
    id: "kids",
    name: "Kids' Visit",
    description: "Happy, gentle checkups for little ones from age 1.",
    icon: "kid",
    duration: 45,
    providers: ["shah", "lopez"],
    selfPay: "$95",
  },
  {
    id: "emergency",
    name: "Emergency Visit",
    description: "Severe pain, swelling or a broken tooth. Seen today.",
    icon: "bolt",
    duration: 30,
    providers: ["carter", "nguyen", "shah"],
    selfPay: "$89 exam + X-ray",
    emergency: true,
  },
];

/** Listed as plain text: no carrier logos. */
export const insurers = [
  "Delta Dental",
  "Cigna",
  "Aetna",
  "MetLife",
  "Guardian",
  "UnitedHealthcare",
  "Humana",
  "Blue Cross Blue Shield of Texas",
  "Ameritas",
  "Principal",
];

export const newPatientSpecial = {
  price: "$99",
  title: "Exam, cleaning & X-rays",
  visitId: "cleaning",
  fine: "For new patients without dental insurance. Excludes deep cleaning. Demo offer — not a real promotion.",
};

export const booking = {
  eyebrow: "Online booking",
  title: "Book your visit in about a minute",
  subtitle: "Pick what you need, choose a time that works, and we'll take it from there.",
  steps: { visit: "Visit", patient: "Patient", provider: "Provider", date: "Date", time: "Time", details: "Details" },
  headings: {
    visit: "What brings you in?",
    patient: "Have you visited us before?",
    provider: "Who would you like to see?",
    date: "Pick a date",
    time: "Pick a time",
    emergencyTime: "Soonest emergency openings",
    details: "Patient details",
    review: "Review & confirm",
  },
  anyProvider: { id: "any", name: "First available", role: "Soonest opening with any of our team" },
  /** Slot grid and lead times, in minutes. */
  slotStep: 30,
  minLeadMinutes: 120,
  emergencyLeadMinutes: 30,
  daysAhead: 45,
  lunch: { from: "12:00", to: "13:00" },
  insuranceSelfPay: "Self-pay / no insurance",
  insuranceOther: "Other insurance",
  emergencyNote:
    "In severe pain, or have swelling that's spreading? Call us now — we keep time open every day for emergencies.",
  emergencyFullToday:
    "Today's online emergency times are taken, but we still see emergencies today. Call and we'll fit you in.",
  afterHoursNote:
    "We're closed right now. Grab the earliest opening below, or call — our on-call dentist returns emergency calls within 30 minutes.",
  policy: "Need to reschedule? Just call or text at least 24 hours ahead — no fees, no fuss.",
  demoNote: "Demo booking — nothing is sent or stored. Your details stay in your browser.",
  success: {
    title: "You're all set!",
    bring: ["Photo ID", "Insurance card (if you have one)", "A list of any medications you take"],
    newPatient: "New patient? Please arrive 10 minutes early. We'll email your intake forms so you can fill them out at home.",
    emergency: "If the pain or swelling gets worse before your visit, call us right away.",
  },
};
