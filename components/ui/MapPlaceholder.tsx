import { contacts, site } from "@/content";

/** Illustrative map: soft streets with invented names, no real location data. */
export default function MapPlaceholder() {
  return (
    <figure className="card relative aspect-[13/11] w-full overflow-hidden rounded-[1.75rem] p-0">
      <svg
        viewBox="0 0 520 440"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Illustrated map showing the clinic's location in South Austin"
      >
        <defs>
          <pattern id="blocks" width="60" height="60" patternUnits="userSpaceOnUse">
            <rect width="60" height="60" fill="#eef5f8" />
            <rect x="7" y="7" width="46" height="46" rx="8" fill="#e3eef3" />
          </pattern>
        </defs>
        <rect width="520" height="440" fill="url(#blocks)" />
        {/* Creek */}
        <path d="M-10 340C90 312 150 370 250 352S420 280 530 300" fill="none" stroke="#cfe6f0" strokeWidth="24" strokeLinecap="round" />
        {/* Parks */}
        <rect x="340" y="56" width="120" height="96" rx="22" fill="#dcefe6" />
        <circle cx="372" cy="92" r="10" fill="#c5e3d4" />
        <circle cx="412" cy="118" r="13" fill="#c5e3d4" />
        <circle cx="430" cy="82" r="8" fill="#c5e3d4" />
        <rect x="36" y="36" width="96" height="66" rx="16" fill="#dcefe6" />
        {/* Streets */}
        <path d="M-10 214H530" stroke="#fff" strokeWidth="18" />
        <path d="M262 -10V450" stroke="#fff" strokeWidth="18" />
        <path d="M140 -10V450M-10 92H530M392 186V450M-10 290H262" stroke="#fff" strokeWidth="9" />
        <g fill="#7d93a3" fontFamily="system-ui, sans-serif" fontSize="10.5" letterSpacing="1.6" fontWeight="700">
          <text x="20" y="204">BLUEBONNET RIDGE DR</text>
          <text x="278" y="150" transform="rotate(-90 278 150)">CEDAR HOLLOW RD</text>
          <text x="300" y="372" fill="#6aa5bd">
            WILLOW CREEK
          </text>
          <text x="356" y="176">MESA PARK</text>
        </g>
        {/* Parking lot */}
        <rect x="290" y="232" width="70" height="44" rx="8" fill="#fff" stroke="#cfdde5" />
        <text x="325" y="259" textAnchor="middle" fill="#0b7c78" fontFamily="system-ui, sans-serif" fontSize="15" fontWeight="800">
          P
        </text>
        {/* Pin */}
        <g transform="translate(262 200)">
          <circle r="42" fill="#14a8a0" opacity="0.18" className="pin-pulse" />
          <path d="M0 10C-11-3-18-12-18-21a18 18 0 0136 0c0 9-7 18-18 31z" transform="translate(0 -16)" fill="#0b7c78" />
          <circle cy="-37" r="6.5" fill="#fff" />
        </g>
      </svg>
      <figcaption className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 rounded-2xl bg-white/95 px-4 py-3 shadow-[0_14px_30px_-20px_rgb(15_42_61/0.5)] ring-1 ring-line">
        <span>
          <span className="block font-bold text-ink">{site.shortName}</span>
          <span className="block text-sm text-muted">
            {contacts.address.street}, {contacts.address.city}
          </span>
        </span>
        <span className="shrink-0 text-xs text-muted">Map for illustration</span>
      </figcaption>
    </figure>
  );
}
