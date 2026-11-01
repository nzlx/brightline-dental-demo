"use client";

import { openBooking, type BookingPreset } from "@/lib/booking-bus";

/** Link to #book that also pre-fills the wizard. Works as a plain anchor without JS. */
export default function BookButton({
  children,
  className,
  preset,
  ...rest
}: { children: React.ReactNode; className?: string; preset?: BookingPreset } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "onClick"
>) {
  return (
    <a
      href="#book"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        openBooking(preset);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
