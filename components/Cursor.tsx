"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Custom gold ring cursor with a magnetic/grow effect on interactive elements.
 * Only mounts on fine-pointer (mouse) devices; touch users keep native behaviour.
 */
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine) return;

    document.body.classList.add("has-cursor");

    const xTo = gsap.quickTo(ring.current, "x", { duration: reduce ? 0 : 0.5, ease: "power3" });
    const yTo = gsap.quickTo(ring.current, "y", { duration: reduce ? 0 : 0.5, ease: "power3" });
    const dxTo = gsap.quickTo(dot.current, "x", { duration: 0.12, ease: "power3" });
    const dyTo = gsap.quickTo(dot.current, "y", { duration: 0.12, ease: "power3" });

    const move = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      dxTo(e.clientX);
      dyTo(e.clientY);
    };

    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive = t.closest("a, button, [data-cursor]");
      gsap.to(ring.current, {
        scale: interactive ? 1.9 : 1,
        borderColor: interactive ? "#D6A63A" : "rgba(214,166,58,0.6)",
        backgroundColor: interactive ? "rgba(214,166,58,0.12)" : "transparent",
        duration: 0.3,
      });
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      document.body.classList.remove("has-cursor");
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[2100] hidden md:block">
      <div
        ref={ring}
        className="absolute -ml-4 -mt-4 h-8 w-8 rounded-full border border-gold/60"
        style={{ top: 0, left: 0 }}
      />
      <div
        ref={dot}
        className="absolute -ml-0.5 -mt-0.5 h-1 w-1 rounded-full bg-gold"
        style={{ top: 0, left: 0 }}
      />
    </div>
  );
}
