import { contacts, footer, nav, site, socials } from "@/content";
import { groupedHours } from "@/lib/hours";
import Logo from "./Logo";
import BookButton from "./ui/BookButton";
import Icon from "./ui/Icon";

export default function Footer() {
  const a = contacts.address;
  return (
    <footer id="site-footer" className="bg-ink text-white/80">
      {/* Closing call to action */}
      <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[1.75rem] bg-teal-deep px-6 py-8 sm:px-10 md:flex-row md:items-center">
          <div>
            <p className="text-2xl font-extrabold tracking-[-0.02em] text-white sm:text-3xl">Ready when you are.</p>
            <p className="mt-1 text-white">Book online in a minute, or give us a call. We&apos;re happy to help.</p>
          </div>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <BookButton className="btn btn-sun h-12">
              <Icon name="calendar" className="h-5 w-5" /> Book a Visit
            </BookButton>
            <a href={contacts.phoneHref} className="btn h-12 border border-white/30 text-white hover:bg-white/10">
              <Icon name="phone" className="h-5 w-5" /> {contacts.phoneDisplay}
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <span className="inline-block rounded-2xl bg-white px-3 py-2">
            <Logo />
          </span>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/70">{footer.blurb}</p>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Social media">
            {socials.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  className="inline-flex rounded-full border border-white/20 px-3 py-1.5 text-xs font-semibold text-white/80 transition-colors hover:border-white/50 hover:text-white"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Visit</h2>
          <address className="mt-4 space-y-2 text-sm not-italic leading-relaxed">
            <p>
              {a.street}
              <br />
              {a.city}, {a.state} {a.zip}
            </p>
            <p>
              <a href={contacts.phoneHref} className="hover:text-white">
                {contacts.phoneDisplay}
              </a>
            </p>
            <p>
              <a href={`mailto:${contacts.email}`} className="break-all hover:text-white">
                {contacts.email}
              </a>
            </p>
          </address>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Hours</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {groupedHours().map((g) => (
              <li key={g.days} className="flex justify-between gap-4 md:block">
                <span className="text-white/60 md:block">{g.days}</span> <span>{g.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">Explore</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {nav.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="hover:text-white">
                  {n.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#book" className="hover:text-white">
                Book online
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-6 text-xs text-white/55 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p>
              © {new Date().getFullYear()} {site.name}. {footer.demoNote}
            </p>
          </div>
          <a href={site.credit.href} className="shrink-0 font-semibold text-white/80 hover:text-white">
            {site.credit.label}
          </a>
        </div>
      </div>
    </footer>
  );
}
