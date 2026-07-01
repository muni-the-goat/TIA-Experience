"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Motif } from "./KhmerMotifs";

gsap.registerPlugin(ScrollTrigger, useGSAP);

// Airport photos that drift in from the gallery above — the same floating
// archive language, carried across the seam so the two sections read as one.
const BRIDGE = [
  { src: "/artifacts/A7400079.webp", top: 3, left: 1, w: 150, op: 0.16, speed: 26, rot: -4 },
  { src: "/artifacts/DJI_0293.webp", top: 7, left: 83, w: 172, op: 0.18, speed: -30, rot: 5 },
  { src: "/artifacts/DSC00062.webp", top: 29, left: -3, w: 188, op: 0.14, speed: 40, rot: 3 },
  { src: "/artifacts/DSC08155.webp", top: 24, left: 87, w: 158, op: 0.15, speed: -22, rot: -5 },
  { src: "/artifacts/DJI_0299.webp", top: 54, left: 3, w: 142, op: 0.12, speed: 34, rot: 4 },
  { src: "/artifacts/A7400221.webp", top: 60, left: 85, w: 150, op: 0.13, speed: -36, rot: -3 },
];

const LINE_1 = ["Hunt", "for", "treasure"];
const LINE_2 = ["across", "the", "gates."];

export default function TreasureHunt() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Reduced motion — show the composed end state, no scroll-driven reveals.
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set([".th-word", ".th-note", ".th-mapwrap"], {
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

        // ── Gate-rules note assembles as you arrive ──
        gsap.fromTo(
          ".th-note",
          { autoAlpha: 0, y: 44 },
          {
            autoAlpha: 1,
            y: 0,
            ease: "power3.out",
            scrollTrigger: { trigger: ".th-note", start: "top 88%", end: "top 55%", scrub: 1 },
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
    <section ref={root} id="treasure-hunt" className="relative overflow-hidden bg-[#fbfaf8] py-28 md:py-36">
      {/* Floating archive drifting down from the gallery — the visual bridge */}
      <div className="th-bridge pointer-events-none absolute inset-0 z-0 hidden overflow-hidden md:block" aria-hidden>
        {BRIDGE.map((b, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={b.src}
            alt=""
            loading="lazy"
            draggable={false}
            data-speed={b.speed}
            className="th-bridge-img absolute select-none rounded-sm object-cover shadow-[0_18px_50px_-30px_rgba(9,59,63,0.4)] grayscale-[0.2]"
            style={{ top: `${b.top}%`, left: `${b.left}%`, width: b.w, opacity: b.op, rotate: `${b.rot}deg` }}
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
          <h2 className="font-display text-5xl font-black leading-[0.95] tracking-tight text-teal md:text-7xl">
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
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg font-light leading-relaxed text-teal-2">
            Cambodia&rsquo;s sacred artifacts are displayed at{" "}
            <span className="font-medium text-teal">every gate inside Techo International Airport</span>.
            Explore the terminal on the 3D map below and discover them as you travel.
          </p>
        </div>

        {/* How to find them — museum exhibition placard */}
        <div className="th-note relative mx-auto mt-16 max-w-5xl overflow-hidden rounded-[28px] border border-gold/30 bg-gradient-to-b from-sand-5 to-[#f6f0e4] shadow-[0_60px_130px_-70px_rgba(9,59,63,0.55)]">
          <div className="px-6 py-12 sm:px-10 md:px-14 md:py-16">
            {/* Museum label heading — flanking gold rules */}
            <div className="mx-auto mb-12 flex max-w-md items-center justify-center gap-4">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/50" />
              <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.34em] text-brown">
                How to find the artifacts
              </span>
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/50" />
            </div>

            <div className="grid divide-y divide-gold/15 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {[
                {
                  motif: "temple",
                  num: "I",
                  title: "At every gate",
                  body: (
                    <>
                      Artifacts are placed across{" "}
                      <span className="font-medium text-teal">all of the gates inside the terminal</span> — wherever your journey takes you, treasures are close by.
                    </>
                  ),
                },
                {
                  motif: "apsara",
                  num: "II",
                  title: "Two per gate",
                  body: (
                    <>
                      Each gate holds exactly{" "}
                      <span className="font-medium text-teal">two artifacts</span>. Find the pair at whichever gate you pass through.
                    </>
                  ),
                },
                {
                  motif: "naga",
                  num: "III",
                  title: "No need to find them all",
                  body: (
                    <>
                      For security, you can only reach your own gate — so finding every artifact isn&rsquo;t possible, and{" "}
                      <span className="font-medium text-teal">you don&rsquo;t need to</span>. Enjoy the two at your gate.
                    </>
                  ),
                },
              ].map((r) => (
                <div key={r.num} className="flex flex-col items-center px-6 py-10 text-center first:pt-0 last:pb-0 sm:py-2 sm:first:pt-2 sm:last:pb-2">
                  {/* Motif seal */}
                  <span className="relative grid h-16 w-16 place-items-center rounded-full border border-gold/40 bg-white/70 shadow-[inset_0_0_0_4px_rgba(214,166,58,0.08)]">
                    <Motif kind={r.motif} className="h-8 w-8" stroke="#C9A24A" />
                  </span>
                  {/* Catalog numeral */}
                  <span className="mt-5 font-display text-[11px] font-bold uppercase tracking-[0.4em] text-gold">
                    {r.num}
                  </span>
                  <h3 className="mt-1.5 font-editorial text-2xl italic text-teal">{r.title}</h3>
                  <p className="mt-3 max-w-[26ch] text-sm font-light leading-relaxed text-teal-2">
                    {r.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive 3D terminal map — full width */}
        <div className="th-mapwrap mt-8">
          <div className="relative min-h-[440px] overflow-hidden rounded-3xl border border-gold/30 bg-teal lg:min-h-[620px]">
            <iframe
              src="https://app.mappedin.com/map/68be4b135e313c000bd16ebd"
              title="Techo International Airport — interactive 3D terminal map"
              loading="lazy"
              allow="fullscreen; accelerometer; gyroscope; magnetometer"
              className="absolute inset-0 h-full w-full border-0"
            />
            <span className="pointer-events-none absolute left-5 top-4 z-10 rounded-full bg-sand-5/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-brown backdrop-blur-sm">
              Explore the terminal in 3D
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
