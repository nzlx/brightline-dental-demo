import { contacts, insuranceSection as ins, insurers } from "@/content";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";

export default function Insurance() {
  return (
    <section id="insurance" aria-labelledby="insurance-title" className="px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeader id="insurance-title" eyebrow={ins.eyebrow} title={ins.title} subtitle={ins.subtitle} />

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <Reveal className="card rounded-[1.75rem] p-6 sm:p-8">
            <h3 className="flex items-center gap-2.5 text-lg font-bold text-ink">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-mint text-teal-deep">
                <Icon name="shield" className="h-5 w-5" />
              </span>
              {ins.listTitle}
            </h3>
            <ul className="mt-6 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {insurers.map((name) => (
                <li key={name} className="flex items-center gap-2.5 border-b border-line pb-3 font-semibold text-ink">
                  <Icon name="check" className="h-4 w-4 shrink-0 text-teal-deep" strokeWidth={2.4} />
                  {name}
                </li>
              ))}
            </ul>
            <p className="mt-6 flex flex-col gap-3 rounded-2xl bg-surface p-4 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
              <span>{ins.listNote}</span>
              <a href={contacts.phoneHref} className="link inline-flex shrink-0 items-center gap-1.5">
                <Icon name="phone" className="h-4 w-4" /> {contacts.phoneDisplay}
              </a>
            </p>
          </Reveal>

          <ul className="grid gap-4">
            {ins.financing.map((f, i) => (
              <Reveal as="li" key={f.title} delay={0.08 * (i + 1)} className="flex gap-4 rounded-[1.5rem] bg-sky/70 p-5 sm:p-6">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white text-teal-deep">
                  <Icon name={f.icon} className="h-[22px] w-[22px]" />
                </span>
                <span>
                  <span className="block font-bold text-ink">{f.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{f.text}</span>
                </span>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
