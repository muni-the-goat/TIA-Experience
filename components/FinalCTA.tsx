"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { KhmerBorder } from "./KhmerMotifs";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function FinalCTA() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".cta-el", {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: root.current, start: "top 78%" },
        });
        gsap.to(".cta-glow", {
          scale: 1.15,
          opacity: 0.8,
          duration: 4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="stack-section relative z-40 overflow-hidden bg-white py-32 text-center text-teal md:py-44">
      <div className="cta-glow pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#D6A63A55,transparent_70%)]" />
      <KhmerBorder className="absolute inset-x-0 top-0 h-5 w-full text-gold opacity-70" />

      <div className="relative mx-auto max-w-content px-6">
        <p className="cta-el mb-6 text-[11px] font-semibold uppercase tracking-[0.42em] text-brown">
          Your journey begins here
        </p>
        <h2 className="cta-el font-display text-5xl font-black leading-[0.95] tracking-tight md:text-8xl">
          Come for the flight. <br />
          <span className="gold-text">Stay for the story.</span>
        </h2>
        <p className="cta-el mx-auto mt-7 max-w-xl text-pretty text-lg font-light text-teal-2">
          The exhibition and treasure hunt are free for every traveller passing through Techo
          International Airport. No ticket. No queue. Just curiosity.
        </p>
        <div className="cta-el mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#treasure-hunt"
            className="rounded-full bg-gold px-8 py-4 text-sm font-semibold text-teal transition-transform duration-300 hover:scale-105"
            data-cursor
          >
            Start the Treasure Hunt
          </a>
          <a
            href="#artifacts"
            className="rounded-full border border-teal/25 px-8 py-4 text-sm font-semibold text-teal transition-colors hover:border-gold hover:text-gold-1"
            data-cursor
          >
            Revisit the Collection
          </a>
        </div>
      </div>
    </section>
  );
}
