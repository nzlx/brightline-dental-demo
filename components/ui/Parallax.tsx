"use client";

import { useRef } from "react";
import { m, useReducedMotion, useScroll, useTransform } from "framer-motion";

/** Moves its content slower than the page while the wrapper crosses the viewport. */
export default function Parallax({
  children,
  className = "",
  amount = 0.2,
  through = false,
}: {
  children: React.ReactNode;
  className?: string;
  amount?: number;
  /** false: starts at page top (hero). true: drifts while the block crosses the whole viewport. */
  through?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: through ? ["start end", "end start"] : ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [through ? `${-amount * 100}%` : "0%", `${amount * 100}%`]);

  return (
    <div ref={ref} className={className}>
      <m.div className="absolute inset-0 will-change-transform" style={reduce ? undefined : { y }}>
        {children}
      </m.div>
    </div>
  );
}
