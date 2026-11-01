import { booking } from "@/content";
import BookingWizard from "@/components/booking/BookingWizard";
import Reveal from "@/components/ui/Reveal";

export default function Booking() {
  return (
    <section id="book" aria-labelledby="book-title" className="relative bg-sky/60 px-4 py-20 sm:px-6 md:py-28">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">{booking.eyebrow}</p>
        <h2 id="book-title" className="mt-4 text-[2.25rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-ink sm:text-5xl">
          {booking.title}
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-muted">{booking.subtitle}</p>
      </Reveal>
      <Reveal className="mt-10 md:mt-12" delay={0.1}>
        <BookingWizard />
      </Reveal>
      <p className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 text-center text-sm text-muted">
        <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-ink ring-1 ring-line">Demo</span>
        {booking.demoNote}
      </p>
    </section>
  );
}
