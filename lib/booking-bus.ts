import { scrollToTarget } from "@/lib/scroll";

export type BookingPreset = { visitId?: string; providerId?: string; patient?: "new" | "existing" };

export const BOOKING_EVENT = "brightline:book";

/** Opens the booking wizard with a visit type, provider and/or patient type already picked. */
export function openBooking(preset: BookingPreset = {}) {
  window.dispatchEvent(new CustomEvent<BookingPreset>(BOOKING_EVENT, { detail: preset }));
  scrollToTarget("#book");
}
