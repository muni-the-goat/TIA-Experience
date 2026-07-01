"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

type Lenis = { stop?: () => void; start?: () => void; scrollTo?: (t: number, o?: object) => void };

/**
 * Cinematic intro: brand + 000→100 counter, then a staggered panel lift
 * reveals the page. Locks scroll while playing; respects reduced motion.
 */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const lenis = (window as unknown as { __lenis?: Lenis }).__lenis;

      const reveal = () => {
        document.documentElement.style.overflow = "";
        window.scrollTo(0, 0);
        lenis?.scrollTo?.(0, { immediate: true });
        lenis?.start?.();
        (window as unknown as { __tiaRevealed?: boolean }).__tiaRevealed = true;
        window.dispatchEvent(new Event("tia:revealed"));
      };

      // Lock scroll
      document.documentElement.style.overflow = "hidden";
      lenis?.stop?.();
      window.scrollTo(0, 0);

      if (reduce) {
        gsap.set(root.current, { autoAlpha: 0, pointerEvents: "none" });
        reveal();
        return;
      }

      const counter = { v: 0 };
      const tl = gsap.timeline({ onComplete: reveal });

      tl.from(".pl-logo", { y: 24, autoAlpha: 0, duration: 0.5, ease: "power3.out" })
        .from(".pl-label", { autoAlpha: 0, duration: 0.35 }, "-=0.35")
        .to(
          counter,
          {
            v: 100,
            duration: 0.8,
            ease: "power2.inOut",
            onUpdate: () => {
              const val = Math.round(counter.v);
              if (count.current) count.current.textContent = String(val).padStart(3, "0");
              if (fill.current) fill.current.style.transform = `scaleX(${counter.v / 100})`;
            },
          },
          "-=0.25"
        )
        .to(".pl-content", { autoAlpha: 0, y: -24, duration: 0.35, ease: "power2.in" }, "+=0.05")
        .to(
          ".pl-panel",
          { yPercent: -100, duration: 0.6, ease: "expo.inOut", stagger: 0.04 },
          "-=0.1"
        )
        .set(root.current, { autoAlpha: 0, pointerEvents: "none" });
    },
    { scope: root }
  );

  return (
    <div ref={root} className="fixed inset-0 z-[2000] flex items-center justify-center">
      {/* Lifting panels */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="pl-panel h-full flex-1 border-r border-sand-4/60 bg-white last:border-r-0"
          />
        ))}
      </div>

      <div className="pl-content relative z-10 flex flex-col items-center px-8 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/TIA-Logo.svg" alt="" className="pl-logo h-16 w-auto md:h-20" />

        <p className="pl-label mt-6 text-[10px] font-semibold uppercase tracking-[0.5em] text-brown">
          Loading the Experience
        </p>

        <div className="pl-label mt-5 flex items-center gap-4">
          <span ref={count} className="font-display text-2xl font-bold tabular-nums text-teal">
            000
          </span>
          <span className="relative block h-px w-40 overflow-hidden bg-teal/15">
            <span
              ref={fill}
              className="absolute inset-0 origin-left scale-x-0 bg-gold"
            />
          </span>
        </div>
      </div>
    </div>
  );
}
