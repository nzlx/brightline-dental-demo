# Brightline Family Dental: demo website

A portfolio demo of a modern website for a family dental practice in Austin, Texas.
**Brightline Family Dental is fictional.** The address, phone number (555-01xx), doctors, offers and reviews are made up.

## Highlights

- **Online booking wizard**: visit type → new/existing patient → provider → date → time → patient details with insurance → review.
  Emergency visits skip the calendar and show today's soonest openings. The $99 new patient special applies automatically.
  Availability is simulated in the browser (Austin time). Nothing is sent or stored.
- Live "Open now" status in Central Time, a services grid with expandable details, team cards with "Book with Dr. X",
  insurance and financing, a reviews slider, a before/after whitening slider (labeled as an illustration), FAQ, and location and hours.
- Mobile-first, with a floating Call + Book bar on phones.

## Stack

Next.js 15 (App Router, statically prerendered single page) · React 19 · Tailwind CSS 4 · Framer Motion · Lenis · TypeScript.

All copy lives in [`content.ts`](content.ts).

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

Demo website by NeoCode.
