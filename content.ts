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
 * `hero.highlight` is the phrase set in the teal → blue gradient.
 */
export const hero = {
  eyebrow: "Family dentistry in South Austin",
  title: "The dentist your family actually looks forward to.",
  highlight: "looks forward to.",
  /** The title broken into the lines that rise from under the mask (the last one is highlighted). */
  titleLines: ["The dentist your", "family actually", "looks forward to."],
  subtitle:
    "Cleanings, fillings, whitening and same-day emergencies — with a team that explains everything and never rushes you.",
  cta: "Book a Visit",
  callCta: "Call Now",
  image: {
    src: "/images/hero-clinic.jpg",
    alt: "A smiling patient in a dental chair chatting with her dentist in a bright, modern treatment room",
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
  photo: string;
  photoAlt: string;
  /** Short title on the team card. */
  focus: string;
  education: string[];
  bio: string;
  languages: string;
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
    photo: "/images/team-carter.jpg",
    photoAlt: "Dr. Emily Carter smiling in a white coat, holding a stethoscope",
    focus: "General & family dentistry",
    education: ["DDS, UT Health San Antonio School of Dentistry", "BS in Biology, Texas State University"],
    bio: "Emily opened Brightline in 2012 to be the kind of dentist she wished she'd had growing up: patient, upfront about costs, and never preachy about flossing. She sees whole families, often three generations at a time.",
    languages: "English",
    daysOff: [5],
  },
  {
    id: "nguyen",
    name: "Dr. Daniel Nguyen",
    shortName: "Dr. Nguyen",
    credential: "DDS",
    role: "Implants & restorative dentistry",
    avatar: "/images/avatar-nguyen.jpg",
    photo: "/images/team-nguyen.jpg",
    photoAlt: "Dr. Daniel Nguyen in a white coat with his arms crossed, smiling",
    focus: "Implants, crowns & restorations",
    education: ["DDS, Texas A&M School of Dentistry", "Advanced implant training, 300+ CE hours"],
    bio: "Daniel plans every implant with 3D imaging, so you know exactly what to expect before day one. Patients call him the calmest person in any room, which helps when you're nervous about a procedure.",
    languages: "English, Vietnamese",
    daysOff: [6],
  },
  {
    id: "shah",
    name: "Dr. Priya Shah",
    shortName: "Dr. Shah",
    credential: "DDS",
    role: "Kids' dentistry & clear aligners",
    avatar: "/images/avatar-shah.jpg",
    photo: "/images/team-shah.jpg",
    photoAlt: "Dr. Priya Shah in glasses and a white coat, smiling outdoors",
    focus: "Kids' dentistry & clear aligners",
    education: ["DDS, UTHealth Houston School of Dentistry", "Certified clear aligner provider"],
    bio: "Priya turns first visits into a game: kids get to drive the chair and pick a prize. Grown-ups come to her for clear aligners, with a 3D preview of the result before they commit.",
    languages: "English, Hindi, Gujarati",
    daysOff: [1],
  },
  {
    id: "lopez",
    name: "Maria Lopez",
    shortName: "Maria",
    credential: "RDH",
    role: "Registered dental hygienist · Habla español",
    avatar: "/images/avatar-lopez.jpg",
    photo: "/images/team-lopez.jpg",
    photoAlt: "Maria Lopez in blue scrubs and glasses, smiling",
    focus: "Cleanings & gum health",
    education: ["AAS in Dental Hygiene, Austin Community College", "Licensed by the Texas State Board of Dental Examiners"],
    bio: "Maria has the gentlest hands in Austin, according to our reviews. She'll walk you through what she sees on every tooth and never lectures.",
    languages: "English, Spanish",
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
  eyebrow: "New patient special",
  price: "$99",
  value: "$350 value",
  title: "Exam, cleaning & X-rays",
  text: "New to Brightline and paying out of pocket? Start with everything you need for a healthy baseline, for one simple price.",
  includes: ["Comprehensive exam with a dentist", "Professional cleaning", "Full set of digital X-rays", "A clear, no-pressure treatment plan"],
  cta: "Claim the $99 visit",
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

export const servicesSection = {
  eyebrow: "What we do",
  title: "Care for every smile, under one roof",
  subtitle: "From a toddler's first checkup to a grandparent's implant, your whole family can see the same trusted team.",
};

export const services: {
  id: string;
  icon: string;
  name: string;
  short: string;
  details: string[];
  note: string;
  visitId: string;
}[] = [
  {
    id: "cleanings",
    icon: "sparkle",
    name: "Cleanings & Prevention",
    short: "Gentle cleanings, exams and low-dose digital X-rays every six months.",
    details: ["Exam with a dentist at every visit", "Oral cancer screening", "Fluoride and sealants for kids and adults", "Personalized home-care tips"],
    note: "Most insurance plans cover two cleanings a year at 100%.",
    visitId: "cleaning",
  },
  {
    id: "fillings",
    icon: "tooth",
    name: "Tooth-Colored Fillings",
    short: "Fix cavities with natural-looking composite, usually in one visit.",
    details: ["Mercury-free composite that matches your teeth", "Numbing that actually works (we check)", "Replacement of old silver fillings", "Same-week appointments"],
    note: "Most fillings take under an hour.",
    visitId: "tooth-pain",
  },
  {
    id: "whitening",
    icon: "sun",
    name: "Teeth Whitening",
    short: "Brighter teeth in one appointment, or custom trays to use at home.",
    details: ["In-office whitening in about 90 minutes", "Custom take-home trays", "Low-sensitivity gel", "Shade check before and after"],
    note: "Results vary. We'll tell you honestly what to expect.",
    visitId: "whitening",
  },
  {
    id: "aligners",
    icon: "aligner",
    name: "Clear Aligners",
    short: "Straighten your smile with nearly invisible, removable aligners.",
    details: ["Free consultation with a 3D scan", "Preview your new smile before you start", "Check-ins every 6–8 weeks", "Retainers included"],
    note: "Many adults finish in 6 to 18 months.",
    visitId: "aligners",
  },
  {
    id: "implants",
    icon: "implant",
    name: "Dental Implants",
    short: "Permanent, natural-feeling replacements for missing teeth.",
    details: ["3D imaging and guided placement", "Single teeth, bridges or full arches", "Placement and crown done in-house", "Clear pricing before you commit"],
    note: "Free implant consultation for new patients.",
    visitId: "implants",
  },
  {
    id: "kids",
    icon: "kid",
    name: "Kids' Dentistry",
    short: "Fun, gentle visits that help kids feel at home in the chair.",
    details: ["First visit by age 1", "Sealants and fluoride", "Tell-show-do approach, no surprises", "Parents welcome in the room"],
    note: "Book siblings back-to-back for one easy trip.",
    visitId: "kids",
  },
  {
    id: "emergency",
    icon: "bolt",
    name: "Emergency Care",
    short: "Toothache, swelling or a broken tooth? We see emergencies the same day.",
    details: ["Same-day appointments held every weekday", "Pain relief first, then a plan", "Broken teeth, lost fillings, abscesses", "After-hours call-back line"],
    note: "In severe pain? Call us first.",
    visitId: "emergency",
  },
  {
    id: "crowns",
    icon: "crown",
    name: "Crowns & Bridges",
    short: "Restore cracked or worn teeth so they look and work like new.",
    details: ["Durable, natural-looking porcelain", "Precise digital impressions (no goop)", "Bridges to replace a missing tooth", "Temporary crown the same day"],
    note: "We'll check your coverage before any work begins.",
    visitId: "consultation",
  },
];

export const teamSection = {
  eyebrow: "Our doctors",
  title: "Meet the team you'll actually see",
  subtitle: "No revolving door of associates: the same friendly faces, visit after visit.",
};

export const insuranceSection = {
  eyebrow: "Insurance & financing",
  title: "Great care shouldn't be a guessing game",
  subtitle: "We're in network with most major PPO plans and file every claim for you. You'll know your cost before treatment starts.",
  listTitle: "In-network PPO plans",
  listNote: "Don't see yours? We'll check your benefits for free and file out-of-network claims for you.",
  financing: [
    {
      icon: "calendar",
      title: "Monthly payment plans",
      text: "Spread larger treatment into easy monthly payments, with 0% options for qualified patients through trusted third-party lenders.",
    },
    {
      icon: "shield",
      title: "Brightline Membership",
      text: "No insurance? $29/month covers two cleanings, exams and X-rays a year, plus 15% off any treatment.",
    },
    {
      icon: "card",
      title: "HSA & FSA welcome",
      text: "Pay with your health savings or flexible spending card. All major credit cards accepted too.",
    },
  ],
};

export const reviewsSection = {
  eyebrow: "Patient reviews",
  title: "Austin families love their checkups",
  rating: "4.9",
  count: "312 reviews",
};

// DEMO CONTENT: reviews are fictional, written for this demo website.
export const reviews = [
  {
    name: "Jessica R.",
    area: "Travis Heights",
    tag: "Cleaning",
    when: "2 weeks ago",
    text: "I've avoided the dentist for years because of anxiety. Maria explained everything before she did it and checked in constantly. I actually left smiling. Already booked my next cleaning.",
  },
  {
    name: "Marcus T.",
    area: "Circle C",
    tag: "Emergency",
    when: "1 month ago",
    text: "Cracked a molar on a Saturday morning. Booked online, was in the chair by 11 and out without pain by noon. Dr. Nguyen walked me through every option and the cost up front.",
  },
  {
    name: "The Alvarez family",
    area: "South Lamar",
    tag: "Kids' visit",
    when: "3 weeks ago",
    text: "Dr. Shah let our 4-year-old drive the chair and count her own teeth. She now asks when she gets to go back to the dentist. That's never happened in our family before!",
  },
  {
    name: "Danielle K.",
    area: "Zilker",
    tag: "Clear aligners",
    when: "2 months ago",
    text: "Seeing the 3D preview of my smile sold me. Nine months later I'm done, and the check-ins never took more than 15 minutes. Super easy to fit into a work schedule.",
  },
  {
    name: "Robert W.",
    area: "Westgate",
    tag: "Implant",
    when: "1 month ago",
    text: "I was quoted twice as much elsewhere for a single implant. Here I got a clear plan, a real price and a result I honestly can't tell apart from my own teeth.",
  },
  {
    name: "Priscilla M.",
    area: "Sunset Valley",
    tag: "Whitening",
    when: "5 days ago",
    text: "Front desk verified my insurance before I even showed up, so there were no surprises. Whitening took one afternoon and my wedding photos look amazing.",
  },
];

export const beforeAfter = {
  eyebrow: "Whitening results",
  title: "See the difference a single visit can make",
  subtitle: "Drag the slider to compare. In-office whitening typically brightens teeth several shades in about 90 minutes.",
  before: { src: "/images/smile-before.jpg", label: "Before" },
  after: { src: "/images/smile-after.jpg", label: "After" },
  alt: "A woman smiling, lower face",
  caption: "Illustration only: a simulated whitening result, not an actual patient. Individual results vary.",
  cta: "Book a whitening visit",
  points: ["Shade check before and after", "Low-sensitivity gel", "Take-home trays to keep it bright"],
};

export const faqSection = {
  eyebrow: "FAQ",
  title: "Questions we hear a lot",
  subtitle: "Can't find what you're looking for? Call us. A real person answers.",
};

export const faqs = [
  {
    q: "Do you take my insurance?",
    a: "We're in network with most major PPO plans, including Delta Dental, Cigna, Aetna, MetLife, Guardian, UnitedHealthcare and Blue Cross Blue Shield of Texas. Before your visit we verify your benefits and tell you what's covered. If we're out of network, we'll still file the claim for you.",
  },
  {
    q: "What if I don't have dental insurance?",
    a: "You're in good company. New patients can start with our $99 exam, cleaning and X-rays (demo offer). After that, our Brightline Membership covers your preventive care for $29 a month and takes 15% off treatment. We also offer monthly payment plans.",
  },
  {
    q: "I'm nervous about pain. How do you keep visits comfortable?",
    a: "Tell us, and we'll go at your pace. We use a numbing gel before any injection, check that you're fully numb before we start, and agree on a hand signal so you can pause anytime. Noise-canceling headphones and nitrous oxide (laughing gas) are available too.",
  },
  {
    q: "What happens at my first visit?",
    a: "Plan on about 90 minutes. You'll get a tour, digital X-rays, a thorough exam with a dentist and, in most cases, a cleaning. We'll walk you through what we see on screen and give you a written plan with costs. No pressure, no surprise charges. Your intake forms arrive by email so you can fill them out at home.",
  },
  {
    q: "When should my child first see the dentist?",
    a: "By their first birthday, or when the first tooth comes in. Early visits are short and fun. They help kids get comfortable and let us catch problems early. We see kids of all ages, and parents are always welcome in the room.",
  },
  {
    q: "What counts as a dental emergency?",
    a: "Severe toothache, swelling in your face or gums, a knocked-out or broken tooth, or bleeding that won't stop. Call us right away: we hold same-day time every weekday, and our on-call dentist returns after-hours calls within 30 minutes. If you have trouble breathing or swallowing, go to the ER.",
  },
  {
    q: "Can I book online if I'm a new patient?",
    a: "Absolutely. Pick a visit type, choose a time, and you're set. It takes about a minute. We'll email a confirmation and your new-patient forms right after.",
  },
];

export const visitSection = {
  eyebrow: "Visit us",
  title: "Easy to find, easy to park",
  subtitle: "In South Austin, about fifteen minutes from downtown.",
  parking: [
    { icon: "car", title: "Free parking", text: "Our own lot, right by the front door. No meters, no garage." },
    { icon: "access", title: "Fully accessible", text: "Ground-floor office with step-free entry and wide doorways." },
    { icon: "bolt", title: "EV charging", text: "Two Level 2 chargers for patients while you're in the chair." },
  ],
  directions: "Get directions",
};

export const footer = {
  blurb: "Gentle, modern family dentistry in South Austin since 2012. Same-day emergencies, most insurance accepted.",
  demoNote:
    "This is a demo website for a fictional dental practice. Names, address, phone number, offers and reviews are made up for illustration.",
};
