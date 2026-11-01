import Image from "next/image";
import { providers, teamSection } from "@/content";
import BookButton from "@/components/ui/BookButton";
import Icon from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";

export default function Team() {
  return (
    <section id="doctors" aria-labelledby="doctors-title" className="bg-surface px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <SectionHeader id="doctors-title" {...teamSection} />

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {providers.map((p, i) => {
            const first = p.credential === "DDS" ? p.shortName : p.name.split(" ")[0];
            return (
              <Reveal as="li" key={p.id} delay={i * 0.07} y={24} className="h-full">
                <article className="card flex h-full flex-col overflow-hidden rounded-[1.75rem]">
                  <div className="relative aspect-square bg-sky sm:aspect-[4/5]">
                    <Image
                      src={p.photo}
                      alt={p.photoAlt}
                      fill
                      quality={70}
                      sizes="(min-width: 1024px) 270px, (min-width: 640px) 45vw, 92vw"
                      className="object-cover object-top"
                    />
                    <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-teal-dark shadow-sm">
                      {p.focus}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-extrabold tracking-[-0.01em] text-ink">
                      {p.name}, <span className="text-teal-deep">{p.credential}</span>
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{p.bio}</p>
                    <ul className="mt-4 space-y-2 text-sm text-ink/85">
                      {p.education.map((e) => (
                        <li key={e} className="flex gap-2">
                          <Icon name="graduation" className="mt-0.5 h-4 w-4 shrink-0 text-teal-deep" />
                          {e}
                        </li>
                      ))}
                      <li className="flex gap-2">
                        <Icon name="globe" className="mt-0.5 h-4 w-4 shrink-0 text-teal-deep" />
                        {p.languages}
                      </li>
                    </ul>
                    <div className="mt-auto pt-5">
                      <BookButton preset={{ providerId: p.id }} className="btn btn-outline h-11 min-h-0 w-full text-sm">
                        Book with {first}
                      </BookButton>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
