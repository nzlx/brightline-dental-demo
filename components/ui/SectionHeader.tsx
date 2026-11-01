import Reveal from "./Reveal";

export default function SectionHeader({
  id,
  eyebrow,
  title,
  subtitle,
  align = "left",
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  children?: React.ReactNode;
}) {
  const center = align === "center";
  return (
    <Reveal className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="mt-4 text-balance text-[2.1rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-ink sm:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className={`mt-4 text-pretty text-lg leading-relaxed text-muted ${center ? "mx-auto max-w-xl" : "max-w-xl"}`}>{subtitle}</p>
      )}
      {children}
    </Reveal>
  );
}
