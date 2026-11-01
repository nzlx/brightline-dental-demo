/** Line icons on a 24px grid, drawn with the current text color. */
const paths: Record<string, React.ReactNode> = {
  tooth: (
    <path d="M7.2 3.5C5 3.5 3.6 5.2 3.6 7.6c0 2.5 1 4 1.6 6.3.6 2.2.8 6.6 2.5 6.6 1.6 0 1.6-4.6 4.3-4.6s2.7 4.6 4.3 4.6c1.7 0 1.9-4.4 2.5-6.6.6-2.3 1.6-3.8 1.6-6.3 0-2.4-1.4-4.1-3.6-4.1-1.9 0-2.9 1-4.8 1s-2.9-1-4.8-1z" />
  ),
  sparkle: (
    <>
      <path d="M12 3.5l1.9 5 5 1.9-5 1.9-1.9 5-1.9-5-5-1.9 5-1.9z" />
      <path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
    </>
  ),
  chat: (
    <>
      <path d="M20 11.5c0 4-3.6 7-8 7-1.2 0-2.3-.2-3.3-.6L4 19.5l1.4-3.6C4.5 14.7 4 13.2 4 11.5c0-4 3.6-7 8-7s8 3 8 7z" />
      <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" strokeWidth="2.4" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6L6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" />
    </>
  ),
  aligner: (
    <>
      <path d="M4 9.5c0-2.5 3.6-4.5 8-4.5s8 2 8 4.5c0 3.6-2.3 9-4.2 9-1.6 0-1.7-3-3.8-3s-2.2 3-3.8 3C6.3 18.5 4 13.1 4 9.5z" />
      <path d="M7.5 9.5c1.2-.9 2.8-1.4 4.5-1.4s3.3.5 4.5 1.4" />
    </>
  ),
  implant: (
    <>
      <path d="M7.5 3.5h9c.8 0 1.5.7 1.5 1.5v1.5c0 1.7-1.3 3-3 3H9c-1.7 0-3-1.3-3-3V5c0-.8.7-1.5 1.5-1.5z" />
      <path d="M9 12h6M9.5 14.5h5M10 17h4M10.8 19.5h2.4" />
    </>
  ),
  kid: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8.8 14.2c.8 1.2 1.9 1.8 3.2 1.8s2.4-.6 3.2-1.8M9 10h.01M15 10h.01" strokeWidth="2" />
      <path d="M12 3.5c-.9 1-.9 2.2 0 3" />
    </>
  ),
  bolt: <path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z" />,
  shield: (
    <>
      <path d="M12 3l7 2.8v5.4c0 4.4-2.9 8.1-7 9.8-4.1-1.7-7-5.4-7-9.8V5.8z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  userPlus: (
    <>
      <circle cx="10" cy="8" r="3.5" />
      <path d="M3.5 19.5c.6-3.4 3.3-5.5 6.5-5.5 1.5 0 2.9.5 4 1.3M18.5 13v6M15.5 16h6" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19.5c.7-3.4 3.6-5.5 7-5.5s6.3 2.1 7 5.5" />
    </>
  ),
  phone: (
    <path d="M6.6 3.5h2.6l1.4 4-2 1.3a11 11 0 006.6 6.6l1.3-2 4 1.4v2.6c0 1.2-1 2.1-2.2 2.1C10.4 19.2 4.8 13.6 4.5 5.7c0-1.2.9-2.2 2.1-2.2z" />
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  star: <path d="M12 3.2l2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 17l-5.4 2.9 1.1-6.1-4.5-4.2 6.1-.8z" />,
  card: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M7 15h3" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.5l9 16H3z" />
      <path d="M12 10v4.5M12 17h.01" />
    </>
  ),
};

export default function Icon({
  name,
  className = "h-5 w-5",
  strokeWidth = 1.75,
  filled = false,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.tooth}
    </svg>
  );
}
