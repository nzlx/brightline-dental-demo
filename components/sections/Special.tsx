import { newPatientSpecial as sp } from "@/content";
import BookButton from "@/components/ui/BookButton";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";

export default function Special() {
  return (
    <section id="special" aria-labelledby="special-title" className="px-4 pb-20 sm:px-6 md:pb-28">
      <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-sun-soft px-6 py-10 sm:px-10 md:px-14 md:py-14">
        {/* Soft sun circles */}
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sun/60" aria-hidden="true" />
        <div className="absolute -bottom-28 right-40 hidden h-56 w-56 rounded-full bg-sun/35 md:block" aria-hidden="true" />

        <div className="relative grid items-center gap-10 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-ink">
              <Icon name="star" className="h-4 w-4 text-sun-deep" filled />
              {sp.eyebrow}
            </p>
            <h2 id="special-title" className="mt-5 text-[2.1rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink sm:text-5xl">
              {sp.title}
            </h2>
            <p className="mt-4 max-w-lg text-pretty text-lg leading-relaxed text-ink/75">{sp.text}</p>
            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
              {sp.includes.map((x) => (
                <li key={x} className="flex items-start gap-2.5 font-semibold text-ink">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-teal-deep text-white">
                    <Icon name="check" className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {x}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-[1.75rem] bg-white p-7 text-center shadow-[0_30px_60px_-30px_rgb(138_100_0/0.45)] sm:p-9">
            <span className="mb-3 inline-block rounded-full bg-surface sm:absolute sm:right-4 sm:top-4 sm:mb-0 px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-wide text-muted">
              Demo offer
            </span>
            <p className="text-sm font-semibold text-muted">New patients pay just</p>
            <p className="mt-1 text-7xl font-extrabold leading-none tracking-[-0.04em] text-ink sm:text-8xl">{sp.price}</p>
            <p className="mt-3 text-sm text-muted">
              <s>{sp.value}</s> · no insurance needed
            </p>
            <BookButton preset={{ visitId: sp.visitId, patient: "new" }} className="btn btn-primary mt-6 h-14 w-full text-base">
              {sp.cta}
            </BookButton>
            <p className="mt-4 text-xs leading-relaxed text-muted">{sp.fine}</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
