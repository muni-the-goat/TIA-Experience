"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TracingScroll, { type TracingStep } from "./ui/tracing-scroll";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Airport photos that drift in from the gallery above — the same floating
// archive language, carried across the seam so the two sections read as one.
const BRIDGE = [
  { src: "/artifacts/A7400079.webp", top: 3, left: 1, w: 150, op: 0.16, speed: 26 },
  { src: "/artifacts/DJI_0293.webp", top: 7, left: 83, w: 172, op: 0.18, speed: -30 },
  { src: "/artifacts/DSC00062.webp", top: 22, left: -3, w: 188, op: 0.14, speed: 40 },
  { src: "/artifacts/DSC08155.webp", top: 24, left: 87, w: 158, op: 0.15, speed: -22 },
  { src: "/artifacts/DSC08151.webp", top: 40, left: -2, w: 160, op: 0.13, speed: -32 },
  { src: "/artifacts/DSC07493-Enhanced-NR.webp", top: 42, left: 88, w: 150, op: 0.14, speed: 28 },
  { src: "/artifacts/DJI_0299.webp", top: 56, left: 3, w: 142, op: 0.12, speed: 34 },
  { src: "/artifacts/A7400221.webp", top: 60, left: 85, w: 150, op: 0.13, speed: -36 },
  { src: "/artifacts/TIA_Sunset_V2.webp", top: 76, left: 5, w: 148, op: 0.12, speed: 38 },
  { src: "/artifacts/A7400237.webp", top: 78, left: 84, w: 156, op: 0.13, speed: -26 },
];

const LINE_1 = ["Hunt", "for", "treasure"];
const LINE_2 = ["across", "the", "gates"];

// Mappedin embed. `?floor=<floorId>` opens the map on a specific level.
// The artifacts live at the gates on Level 1, so open there by default.
// floorId is map-specific — to get it: open the map URL below, click
// "Level 1", then copy the `floor=` value from the browser address bar.
const MAP_ID = "68be4b135e313c000bd16ebd";
const LEVEL_1_FLOOR_ID = "m_4953bc7654224e65"; // Level 1 — the gates where the artifacts are
const MAP_SRC = `https://app.mappedin.com/map/${MAP_ID}${
  LEVEL_1_FLOOR_ID ? `?floor=${LEVEL_1_FLOOR_ID}` : ""
}`;

// The three "how to find the artifacts" steps. Each carries its own image; the
// TracingScroll component pins them and expands each image from a bottom-right
// thumbnail to full-bleed in sequence (Getty "Tracing Art" mechanic).
const HOW_STEPS: TracingStep[] = [
  {
    image: "/artifacts/DSC08151.webp",
    num: "I",
    title: "At every gate",
    body: (
      <>
        Artifacts are placed across{" "}
        <span className="font-medium text-white">all of the gates inside the terminal</span> — wherever
        your journey takes you, treasures are close by.
      </>
    ),
  },
  {
    image: "/artifacts/DSC08155.webp",
    num: "II",
    title: "Two per gate",
    body: (
      <>
        Each gate holds exactly <span className="font-medium text-white">two artifacts</span>. Find the
        pair at whichever gate you pass through.
      </>
    ),
  },
  {
    image: "/artifacts/A7400110.webp",
    num: "III",
    title: "No need to find them all",
    body: (
      <>
        For security, you can only reach your own gate — so finding every artifact isn&rsquo;t possible,
        and <span className="font-medium text-white">you don&rsquo;t need to</span>. Enjoy the two at your gate.
      </>
    ),
  },
];

export default function TreasureHunt() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Reduced motion — show the composed end state, no scroll-driven reveals.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([".th-word", ".th-intro", ".th-mapwrap"], {
          autoAlpha: 1,
          filter: "blur(0px)",
          y: 0,
        });
        gsap.set(".th-bridge", { autoAlpha: 1 });
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // ── The floating archive carries over from the gallery ──
        gsap.to(".th-bridge-img", {
          yPercent: (i, el) => Number((el as HTMLElement).dataset.speed),
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        });
        gsap.fromTo(
          ".th-bridge",
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 85%", end: "top 45%", scrub: true },
          }
        );

        // ── Headline morphs in: each word resolves blur → crisp on scroll,
        //    echoing the hero's BlurText so the language stays consistent. ──
        gsap.fromTo(
          ".th-word",
          { autoAlpha: 0.15, filter: "blur(10px)", yPercent: 40 },
          {
            autoAlpha: 1,
            filter: "blur(0px)",
            yPercent: 0,
            ease: "power2.out",
            stagger: 0.12,
            scrollTrigger: { trigger: ".th-head", start: "top 82%", end: "top 42%", scrub: 1 },
          }
        );

        // ── Intro line resolves just after the headline, same blur language ──
        gsap.fromTo(
          ".th-intro",
          { autoAlpha: 0, filter: "blur(8px)", y: 22 },
          {
            autoAlpha: 1,
            filter: "blur(0px)",
            y: 0,
            ease: "power2.out",
            scrollTrigger: { trigger: ".th-head", start: "top 70%", end: "top 38%", scrub: 1 },
          }
        );

        // ── Map rises + un-clips into place, closing the morph ──
        gsap.fromTo(
          ".th-mapwrap",
          { autoAlpha: 0, y: 60, clipPath: "inset(8% 4% 8% 4% round 24px)" },
          {
            autoAlpha: 1,
            y: 0,
            clipPath: "inset(0% 0% 0% 0% round 24px)",
            ease: "power3.out",
            scrollTrigger: { trigger: ".th-mapwrap", start: "top 90%", end: "top 50%", scrub: 1 },
          }
        );
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} id="treasure-hunt" className="relative overflow-x-clip bg-[#fbfaf8] py-28 md:py-36">
      {/* Floating archive drifting down from the gallery — the visual bridge */}
      <div className="th-bridge pointer-events-none absolute inset-0 z-0 hidden overflow-hidden md:block" aria-hidden>
        {BRIDGE.map((b, i) => (
          <Image
            key={i}
            src={b.src}
            alt=""
            width={b.w}
            height={Math.round(b.w * 1.3)}
            loading="lazy"
            sizes={`${b.w}px`}
            draggable={false}
            data-speed={b.speed}
            className="th-bridge-img absolute select-none rounded-sm object-cover shadow-[0_18px_50px_-30px_rgba(9,59,63,0.4)] grayscale-[0.2]"
            style={{ top: `${b.top}%`, left: `${b.left}%`, opacity: b.op }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-content px-6">
        {/* Header */}
        <div className="th-head mx-auto max-w-3xl text-center">
          <p className="mb-5 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-brown">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-gold text-[11px] leading-none tracking-normal text-white">03</span>
            The Treasure Hunt
          </p>
          <h2 className="font-display text-5xl font-bold leading-[0.95] tracking-tight text-teal md:text-7xl">
            {LINE_1.map((w) => (
              <span key={w} className="th-word mx-[0.12em] inline-block will-change-transform">
                {w}
              </span>
            ))}
            <br />
            {LINE_2.map((w) => (
              <span key={w} className="th-word gold-text mx-[0.12em] inline-block will-change-transform">
                {w}
              </span>
            ))}
          </h2>
          <p className="th-intro mx-auto mt-6 max-w-xl text-pretty text-lg font-light leading-relaxed text-teal-2">
            Cambodia&rsquo;s sacred artifacts are displayed at{" "}
            <span className="font-medium text-teal">every gate inside Techo International Airport</span>.
            Explore the terminal on the 3D map below and discover them as you travel.
          </p>
        </div>
      </div>

      {/* How to find them — full-bleed images that stay pinned; each expands
          from a bottom-right thumbnail to full while its step text is revealed
          in sequence (Getty "Tracing Art" mechanic). */}
      <TracingScroll
        className="relative z-10 mt-16"
        scrollHeight={2600}
        label="How to find the artifacts"
        steps={HOW_STEPS}
      />

      <div className="relative z-10 mx-auto max-w-content px-6">
        {/* Interactive 3D terminal map — full width */}
        <div className="th-mapwrap mt-8">
          <div className="relative min-h-[440px] overflow-hidden rounded-3xl border border-gold/30 bg-teal lg:min-h-[620px]">
            <iframe
              src={MAP_SRC}
              title="Techo International Airport — interactive 3D terminal map"
              loading="lazy"
              allow="fullscreen; accelerometer; gyroscope; magnetometer"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
