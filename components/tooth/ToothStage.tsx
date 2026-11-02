"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const ToothScene = dynamic(() => import("./ToothScene"), { ssr: false });

/**
 * Decides when (and whether) to load the 3D tooth. The placeholder image inside #tooth-anchor
 * stays until the first frame renders, then cross-fades to the live scene.
 * - prefers-reduced-motion: loads a still tooth (no turning, floating or particles).
 * - Desktop: loads when the browser is idle after page load.
 * - Phones/tablets: loads on the first interaction (or after a while), keeping the initial load light.
 */
export default function ToothStage() {
  const [mode, setMode] = useState<{ mobile: boolean; snapshot: boolean; still: boolean } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const snapshot = new URLSearchParams(location.search).has("tooth-snapshot");
    const mobile = !matchMedia("(pointer: fine)").matches || innerWidth < 1024;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = () => setMode({ mobile, snapshot, still });
    if (snapshot) return start();

    let done = false;
    const go = () => {
      if (done) return;
      done = true;
      cleanup();
      start();
    };
    const events = ["pointerdown", "touchstart", "scroll", "keydown", "wheel"] as const;
    let idle = 0;
    let timer = 0;
    const cleanup = () => {
      events.forEach((e) => removeEventListener(e, go));
      if (idle) cancelIdleCallback?.(idle);
      clearTimeout(timer);
    };
    if (mobile) {
      events.forEach((e) => addEventListener(e, go, { passive: true, once: true }));
      timer = window.setTimeout(go, 9000);
    } else {
      const whenIdle = () => {
        if ("requestIdleCallback" in window) idle = requestIdleCallback(go, { timeout: 1500 });
        else timer = setTimeout(go, 600) as unknown as number;
      };
      if (document.readyState === "complete") whenIdle();
      else addEventListener("load", whenIdle, { once: true });
      events.forEach((e) => addEventListener(e, go, { passive: true, once: true }));
    }
    return cleanup;
  }, []);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-tooth-live", ready);
    if (ready) (window as unknown as { __toothReady?: boolean }).__toothReady = true;
  }, [ready]);

  if (!mode) return null;
  return (
    <div className="tooth-canvas" style={{ opacity: ready ? 1 : 0, transition: "opacity 0.7s" }} aria-hidden="true">
      <ToothScene mobile={mode.mobile} snapshot={mode.snapshot} still={mode.still} onReady={() => setReady(true)} />
    </div>
  );
}
