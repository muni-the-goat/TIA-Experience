"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ShinyText from "./ShinyText";
import GradientText from "./GradientText";
import { Button } from "./ui/button";

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
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="visit"
      className="stack-section relative z-40 overflow-hidden bg-white py-32 text-center text-teal md:py-44"
    >
      <div className="relative mx-auto max-w-content px-6">
        {/* Eyebrow flanked by gold rules */}
        <div className="cta-el mb-6 flex items-center justify-center gap-4">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-gold/70 md:w-12" />
          <ShinyText
            text="Your journey begins here"
            className="text-[11px] font-semibold uppercase tracking-[0.42em]"
            color="#876C51"
            shineColor="#E7D2A9"
            speed={4}
          />
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-gold/70 md:w-12" />
        </div>

        <h2 className="cta-el font-display text-5xl font-bold leading-[0.95] tracking-tight md:text-8xl">
          <span className="block">Come for the flight.</span>
          <GradientText
            colors={["#876C51", "#D6A63A", "#E7D2A9", "#D6A63A", "#876C51"]}
            animationSpeed={7}
            className="!max-w-none !cursor-default !rounded-none !font-bold !backdrop-blur-0"
          >
            Stay for the story.
          </GradientText>
        </h2>

        <p className="cta-el mx-auto mt-7 max-w-xl text-pretty text-lg font-light leading-relaxed text-teal-2">
          The exhibition and treasure hunt are free for every traveller passing through Techo
          International Airport. No ticket. No queue. Just curiosity.
        </p>

        <div className="cta-el mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="group relative overflow-hidden">
            <a href="#treasure-hunt" data-cursor>
              <span className="relative z-10">Start the Treasure Hunt</span>
              <span aria-hidden className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
              {/* Shimmer sweep on hover */}
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/45 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full"
              />
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="group">
            <a href="#artifacts" data-cursor>
              Revisit the Collection
              <span aria-hidden className="opacity-60 transition-transform duration-300 group-hover:translate-x-1">
                ↗
              </span>
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
