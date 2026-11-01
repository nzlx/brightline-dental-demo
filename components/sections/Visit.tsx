import { contacts, visitSection as vs } from "@/content";
import HoursList from "@/components/ui/HoursList";
import Icon from "@/components/ui/Icon";
import MapPlaceholder from "@/components/ui/MapPlaceholder";
import OpenNow from "@/components/ui/OpenNow";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";

export default function Visit() {
  const a = contacts.address;
  return (
    <section id="visit" aria-labelledby="visit-title" className="px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeader id="visit-title" eyebrow={vs.eyebrow} title={vs.title} subtitle={vs.subtitle} />

        <div className="mt-12 grid items-start gap-5 lg:grid-cols-2">
          <div className="grid gap-5">
            <Reveal>
              <MapPlaceholder />
            </Reveal>
            <Reveal delay={0.12} className="card rounded-[1.5rem] p-5 sm:p-6">
              <ul className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {vs.parking.map((p) => (
                  <li key={p.title} className="flex gap-3 xl:flex-col">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-mint text-teal-deep">
                      <Icon name={p.icon} className="h-[18px] w-[18px]" />
                    </span>
                    <span className="text-sm">
                      <span className="block font-bold text-ink">{p.title}</span>
                      <span className="text-muted">{p.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <div className="grid gap-5">
            <Reveal delay={0.06} className="card rounded-[1.5rem] p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-bold text-ink">Office hours</h3>
                <OpenNow className="rounded-full bg-surface px-3 py-1.5" />
              </div>
              <div className="-mx-3 mt-3">
                <HoursList />
              </div>
              <p className="mt-3 text-xs text-muted">Central Time · Emergency call-back line after hours</p>
            </Reveal>

            <Reveal delay={0.12} className="card rounded-[1.5rem] p-5 sm:p-6">
              <h3 className="font-bold text-ink">Address</h3>
              <address className="mt-2 not-italic leading-relaxed text-ink/85">
                {a.street}
                <br />
                {a.city}, {a.state} {a.zip}
              </address>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={contacts.directionsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary h-11 min-h-0 px-4 text-sm"
                >
                  <Icon name="pin" className="h-4 w-4" /> {vs.directions}
                </a>
                <a href={contacts.phoneHref} className="btn btn-outline h-11 min-h-0 px-4 text-sm">
                  <Icon name="phone" className="h-4 w-4 text-teal-deep" /> Call
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
