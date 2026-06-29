"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { KhmerBorder } from "./KhmerMotifs";
import { artifacts, treasures } from "@/lib/data";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const line1 = "Every great journey".split(" ");
const line2 = "deserves a great".split(" ");
const line3 = "welcome.".split(" ");

const stats = [
  { value: "1,000+", label: "Years of heritage" },
  { value: String(artifacts.length), label: "Masterworks on display" },
  { value: String(treasures.length), label: "Treasures to find" },
];

export default function Intro() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".intro-word", {
          yPercent: 110,
          opacity: 0,
          duration: 1,
          ease: "expo.out",
          stagger: 0.06,
          scrollTrigger: { trigger: ".intro-head", start: "top 80%" },
        });
        gsap.from(".intro-stat", {
          y: 30,
          opacity: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: { trigger: ".intro-stats", start: "top 85%" },
        });
        gsap.from(".intro-lead", {
          y: 24,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: ".intro-lead", start: "top 88%" },
        });
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="exhibition"
      className="stack-section relative z-10 -mt-[5vh] overflow-hidden bg-sand-5 py-28 shadow-[0_-50px_90px_-50px_rgba(9,59,63,0.25)] md:py-40"
    >
      <KhmerBorder className="absolute inset-x-0 top-0 h-5 w-full text-gold opacity-70" />

      <div className="mx-auto max-w-content px-6">
        <p className="mb-8 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-brown">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-gold text-[11px] leading-none tracking-normal text-white">01</span>
          Experience the Event
        </p>

        <h2 className="intro-head font-display text-5xl font-black leading-[0.95] tracking-tight text-teal md:text-8xl">
          {[line1, line2, line3].map((line, i) => (
            <span key={i} className="block">
              {line.map((w, j) => (
                <span key={j} className="reveal-word mr-[0.25em]">
                  <span className={`intro-word ${i === 2 ? "gold-text" : ""}`}>{w}</span>
                </span>
              ))}
            </span>
          ))}
        </h2>

        <div className="mt-14 grid items-end gap-10 md:grid-cols-[1.4fr_1fr]">
          <p className="intro-lead max-w-xl text-pretty text-lg font-light leading-relaxed text-teal-2 md:text-xl">
            <span className="font-semibold text-teal">Treasures of Cambodia</span> brings the
            soul of the Kingdom into the heart of Techo International Airport. Sacred sandstone,
            gilded bronze, and the eternal dancers of Angkor — gathered for every traveller to
            witness, between one horizon and the next.
          </p>

          <div className="intro-stats grid grid-cols-3 gap-4 border-t border-teal/15 pt-8">
            {stats.map((s) => (
              <div key={s.label} className="intro-stat">
                <div className="font-display text-3xl font-bold text-gold md:text-4xl">{s.value}</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-brown">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
