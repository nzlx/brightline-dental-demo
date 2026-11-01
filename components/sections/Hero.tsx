import Image from "next/image";
import { contacts, hero } from "@/content";
import BookButton from "@/components/ui/BookButton";
import Icon from "@/components/ui/Icon";
import OpenNow from "@/components/ui/OpenNow";

export default function Hero() {
  const cut = hero.title.lastIndexOf(hero.highlight);
  const lead = hero.title.slice(0, cut);

  return (
    <section id="top" aria-label="Welcome" className="relative isolate overflow-hidden">
      {/* Soft sky and mint light behind the content */}
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(50%_55%_at_88%_30%,rgb(207_230_240/0.9),transparent_70%),radial-gradient(40%_45%_at_0%_100%,rgb(226_245_242/0.9),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-14 pt-28 sm:px-6 md:grid-cols-[1.05fr_0.95fr] md:gap-10 md:pb-24 md:pt-36 lg:gap-14">
        <div>
          <p className="eyebrow fade-up">{hero.eyebrow}</p>

          <h1
            className="fade-up mt-5 text-[2.6rem] font-extrabold leading-[1.06] tracking-[-0.035em] text-ink sm:text-[3.4rem] md:text-[3.1rem] lg:text-[3.9rem]"
            style={{ animationDelay: "0.05s" }}
          >
            {lead}
            <span className="marker">{hero.highlight}</span>
          </h1>

          <p className="fade-up mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted sm:text-xl" style={{ animationDelay: "0.15s" }}>
            {hero.subtitle}
          </p>

          <div className="fade-up mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ animationDelay: "0.25s" }}>
            <BookButton className="btn btn-primary h-14 px-8 text-base">
              <Icon name="calendar" className="h-5 w-5" />
              {hero.cta}
            </BookButton>
            <a href={contacts.phoneHref} className="btn btn-outline h-14 px-7 text-base">
              <Icon name="phone" className="h-5 w-5 text-teal-deep" />
              {hero.callCta}
              <span className="font-semibold text-muted">· {contacts.phoneDisplay}</span>
            </a>
          </div>

          <ul className="fade-up mt-9 grid gap-3 sm:flex sm:flex-wrap sm:gap-x-6" style={{ animationDelay: "0.35s" }}>
            {hero.trust.map((t) => (
              <li key={t.label} className="flex items-center gap-2.5 text-[0.95rem] font-semibold text-ink">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-mint text-teal-deep">
                  <Icon name={t.icon} className="h-[18px] w-[18px]" />
                </span>
                {t.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-md md:max-w-none">
          <div className="absolute -right-3 -top-3 -z-10 h-2/3 w-2/3 rounded-[2rem] bg-sun-soft sm:-right-5 sm:-top-5" aria-hidden="true" />
          <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] md:aspect-square bg-sky shadow-[0_40px_80px_-40px_rgb(15_42_61/0.45)]">
            <Image
              src={hero.image.src}
              alt={hero.image.alt}
              fill
              priority
              fetchPriority="high"
              quality={70}
              sizes="(min-width: 1152px) 520px, (min-width: 768px) 46vw, 92vw"
              className="object-cover"
            />
          </div>

          <div
            className="fade-up absolute -bottom-5 left-3 rounded-2xl bg-white px-4 py-3 shadow-[0_20px_40px_-20px_rgb(15_42_61/0.45)] ring-1 ring-line sm:-left-6"
            style={{ animationDelay: "0.5s" }}
          >
            <OpenNow className="min-w-[10.5rem]" />
          </div>
          <div
            className="fade-up absolute right-3 top-5 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-[0_20px_40px_-20px_rgb(15_42_61/0.45)] ring-1 ring-line sm:-right-6"
            style={{ animationDelay: "0.6s" }}
          >
            <span className="text-2xl font-extrabold leading-none tracking-tight text-ink">{hero.rating.value}</span>
            <span className="leading-tight">
              <span className="flex gap-0.5 text-[#f2b705]" aria-hidden="true">
                {Array.from({ length: 5 }, (_, i) => (
                  <Icon key={i} name="star" className="h-3.5 w-3.5" filled />
                ))}
              </span>
              <span className="block text-xs text-muted">{hero.rating.label}</span>
            </span>
            <span className="sr-only">Rated {hero.rating.value} out of 5</span>
          </div>
        </div>
      </div>
    </section>
  );
}
