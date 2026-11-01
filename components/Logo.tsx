/** Smile-line mark + wordmark. */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 40 40" className="h-10 w-10 shrink-0" aria-hidden="true">
        <rect width="40" height="40" rx="12" fill="#0b7c78" />
        <path d="M10 19.5c2.6 6.2 17.4 6.2 20 0" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M28.5 7.5l1.2 3 3 1.2-3 1.2-1.2 3-1.2-3-3-1.2 3-1.2z" fill="#ffe27a" />
      </svg>
      <span className="leading-none">
        <span className="block text-[1.15rem] font-extrabold tracking-[-0.02em] text-ink">Brightline</span>
        <span className="mt-1 block text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-muted">Family Dental</span>
      </span>
    </span>
  );
}
