import { contacts, hero } from "@/content";
import BookButton from "@/components/ui/BookButton";
import Icon from "@/components/ui/Icon";
import Magnetic from "@/components/ui/Magnetic";
import OpenNow from "@/components/ui/OpenNow";
import ToothStage from "@/components/tooth/ToothStage";

export default function Hero() {
  const last = hero.titleLines.length - 1;

  return (
    // No `isolate` here: the mesh gradient (z -2) and the fixed 3D canvas (z -1) must share the root stacking context.
    <section id="top" aria-label="Welcome" className="relative overflow-hidden">
      <div className="mesh" aria-hidden="true">
        <span className="m1" />
        <span className="m2" />
        <span className="m3" />
        <span className="m4" />
      </div>

      <div className="hero-grid mx-auto grid min-h-[100svh] max-w-7xl gap-x-6 px-4 pb-16 pt-24 sm:px-6 md:pt-28 lg:gap-x-4 lg:pb-20 lg:pt-32">
        <div className="[grid-area:head]">
          <p className="eyebrow fade-up">{hero.eyebrow}</p>
          <h1 className="mt-5 text-[2.45rem] font-extrabold leading-[1.02] tracking-[-0.045em] text-ink min-[400px]:text-[2.7rem] sm:text-[4rem] lg:text-[4.35rem] xl:text-[5.1rem]">
            {hero.titleLines.map((line, i) => (
              <span key={line} className="line-mask lg:whitespace-nowrap">
                <span style={{ animationDelay: `${0.05 + i * 0.09}s` }}>{i === last ? <span className="marker">{line}</span> : line}</span>
              </span>
            ))}
          </h1>
        </div>

        {/* 3D stage: the canvas tracks this box. The image is the scene's first frame, shown until it loads. */}
        <div className="relative [grid-area:tooth] lg:self-center">
          <div id="tooth-anchor" className="relative mx-auto my-5 aspect-[1/1.02] w-full max-w-[24rem] sm:max-w-md lg:my-0 lg:aspect-[4/5] lg:max-w-none">
            {/* Loading placeholder: a soft glow where the tooth will appear; fades out on the first 3D frame. */}
            <div className="tooth-placeholder pointer-events-none absolute inset-0 grid place-items-center" role="img" aria-label={hero.toothAlt}>
              <span className="tooth-glow" />
            </div>

            <div className="glass fade-up absolute -left-1 bottom-0 rounded-2xl px-3 py-2 sm:-left-6 sm:bottom-0 sm:px-4 sm:py-3" style={{ animationDelay: "0.7s" }}>
              <OpenNow className="sm:min-w-[10.5rem]" />
            </div>
            <div
              className="glass fade-up absolute right-0 top-0 flex items-center gap-2 rounded-2xl px-3 py-2 sm:-right-4 sm:top-0 sm:gap-2.5 sm:px-4 sm:py-3"
              style={{ animationDelay: "0.8s" }}
            >
              <span className="text-2xl font-extrabold leading-none tracking-tight text-ink">{hero.rating.value}</span>
              <span className="leading-tight">
                <span className="flex gap-0.5 text-[#f2b705]" aria-hidden="true">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Icon key={i} name="star" className="h-3.5 w-3.5" filled />
                  ))}
                </span>
                <span className="hidden text-xs text-muted sm:block">{hero.rating.label}</span>
              </span>
              <span className="sr-only">Rated {hero.rating.value} out of 5</span>
            </div>
            <div
              className="glass fade-up absolute -right-8 top-[48%] hidden items-center gap-2 rounded-full py-2 pl-2 pr-4 text-sm font-bold text-ink sm:flex lg:-right-16"
              style={{ animationDelay: "0.9s" }}
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-sun text-ink">
                <Icon name="bolt" className="h-4 w-4" />
              </span>
              Same-day emergencies
            </div>
          </div>
        </div>

        <div className="[grid-area:rest] lg:self-start">
          <p className="fade-up mt-2 max-w-xl text-pretty text-lg leading-relaxed text-muted sm:text-xl lg:mt-7" style={{ animationDelay: "0.3s" }}>
            {hero.subtitle}
          </p>

          <div id="hero-cta" className="fade-up mt-8 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ animationDelay: "0.4s" }}>
            <Magnetic className="w-full sm:w-auto">
              <BookButton className="btn btn-primary h-14 w-full px-8 text-base">
                <Icon name="calendar" className="h-5 w-5" />
                {hero.cta}
              </BookButton>
            </Magnetic>
            <Magnetic className="w-full sm:w-auto">
              <a href={contacts.phoneHref} className="btn btn-outline h-14 w-full bg-white/70 px-7 text-base backdrop-blur">
                <Icon name="phone" className="h-5 w-5 text-teal-deep" />
                {hero.callCta}
                <span className="font-semibold text-muted">· {contacts.phoneDisplay}</span>
              </a>
            </Magnetic>
          </div>

          <ul className="fade-up mt-9 grid gap-3 sm:flex sm:flex-wrap sm:gap-x-6" style={{ animationDelay: "0.5s" }}>
            {hero.trust.map((t) => (
              <li key={t.label} className="flex items-center gap-2.5 text-[0.95rem] font-semibold text-ink">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/80 text-teal-deep ring-1 ring-mint">
                  <Icon name={t.icon} className="h-[18px] w-[18px]" />
                </span>
                {t.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <a
        href="#services"
        className="fade-up absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-muted lg:flex"
        style={{ animationDelay: "1.1s" }}
      >
        Scroll
        <span className="relative h-10 w-[22px] rounded-full border-2 border-muted/40">
          <span className="scroll-dot absolute left-1/2 top-2 h-2 w-1 -translate-x-1/2 rounded-full bg-teal-deep" />
        </span>
      </a>

      <ToothStage />
    </section>
  );
}
