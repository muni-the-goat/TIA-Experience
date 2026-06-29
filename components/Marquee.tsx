"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Infinite gold marquee that accelerates and skews with scroll velocity,
 * and flips direction based on scroll direction — a tactile "Awwwards" bridge.
 */
export default function Marquee({
  text,
  variant = "gold",
}: {
  text: string;
  variant?: "gold" | "outline";
}) {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const loop = gsap.to(track.current, {
        xPercent: -50,
        duration: 24,
        ease: "none",
        repeat: -1,
      });

      if (reduce) {
        loop.progress(0).pause();
        return;
      }

      ScrollTrigger.create({
        trigger: root.current,
        start: "top bottom",
        end: "bottom top",
        onUpdate: (self) => {
          const v = self.getVelocity();
          const dir = v < 0 ? -1 : 1;
          const speed = 1 + gsap.utils.clamp(0, 8, Math.abs(v) / 350);
          loop.timeScale(dir * speed);
          gsap.to(track.current, {
            skewX: gsap.utils.clamp(-10, 10, (v / -260)),
            duration: 0.5,
            ease: "power3.out",
            overwrite: "auto",
          });
        },
      });
    },
    { scope: root }
  );

  const isGold = variant === "gold";
  const phrase = (
    <span className="mx-6 inline-flex items-center gap-6">
      {text}
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" aria-hidden>
        <path
          d="M12 2l2.2 5.4L20 8l-4 4 1 6-5-2.8L7 18l1-6-4-4 5.8-.6z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );

  return (
    <div
      ref={root}
      aria-hidden
      className={`relative overflow-hidden py-5 md:py-7 ${
        isGold ? "bg-gold text-teal" : "border-y border-teal/10 bg-transparent text-teal"
      }`}
    >
      <div ref={track} className="flex w-max whitespace-nowrap will-change-transform">
        {/* Two identical halves for a seamless -50% loop */}
        {[0, 1].map((half) => (
          <div
            key={half}
            className={`flex font-display text-2xl font-bold uppercase tracking-tight md:text-4xl ${
              isGold ? "" : "text-stroke"
            }`}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i} className="mq-item">
                {phrase}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
