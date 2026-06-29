"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Merged Hero + "Experience the Event" intro as one scroll-driven morph.
 *
 * Flow (adapted from the scroll-morph-hero concept, rebuilt on the project's
 * GSAP + Lenis stack so page scroll is never hijacked):
 *   1. On reveal, the artifacts fly from a scatter into a RING around the
 *      "Experience" headline.
 *   2. As the user scrolls, the section pins and real scroll progress morphs
 *      the ring into a bottom ARCH while the hero copy fades out and the
 *      "Experience the Event" content (headline · lead · stats) fades in.
 *   3. The section unpins and the page continues into the Collection.
 */

// Every artifact in /public/artifacts — all of them are used in the ring/arch.
const ART = [
  "/artifacts/IMG_2089.webp",
  "/artifacts/IMG_2077.webp",
  "/artifacts/IMG_2079.webp",
  "/artifacts/IMG_2093.webp",
  "/artifacts/IMG_2088.webp",
  "/artifacts/IMG_2090.webp",
  "/artifacts/IMG_2080.webp",
  "/artifacts/IMG_2084.webp",
  "/artifacts/IMG_2091.webp",
  "/artifacts/IMG_2078.webp",
  "/artifacts/IMG_2085.webp",
  "/artifacts/IMG_2096.JPG",
];

const CARD_W = 66;
const CARD_H = 92;

type Pos = { x: number; y: number; rot: number; scale: number };

export default function ExperienceHero() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const stageEl = stage.current;
      if (!stageEl) return;
      const cards = gsap.utils.toArray<HTMLElement>(".xh-card");
      const N = cards.length;

      const circle: Pos[] = [];
      const arch: Pos[] = [];
      const scatter: Pos[] = [];

      // Positions are transforms relative to the stage centre (cards are
      // anchored at 50%/50%). Recomputed on every ScrollTrigger refresh so the
      // morph stays correct through resizes.
      const compute = () => {
        const W = stageEl.clientWidth;
        const H = stageEl.clientHeight;
        const isMobile = W < 768;
        const minDim = Math.min(W, H);

        const Rc = Math.min(minDim * 0.34, 300);
        const archWidth = Math.min(W * 0.94, 1180);
        const apexY = H * 0.04;
        const depth = H * 1.0;
        const archScale = isMobile ? 1.0 : 1.5;

        for (let i = 0; i < N; i++) {
          // Ring
          const a = (i / N) * 360;
          const ar = (a * Math.PI) / 180;
          circle[i] = { x: Math.cos(ar) * Rc, y: Math.sin(ar) * Rc, rot: a + 90, scale: 1 };

          // Rainbow arch (parabola, convex up) across the lower half
          const u = i / (N - 1) - 0.5;
          const x = u * archWidth;
          const y = apexY + u * u * depth;
          const slope = (Math.atan2(2 * u * depth, archWidth) * 180) / Math.PI * 0.7;
          arch[i] = { x, y, rot: slope, scale: archScale };

          // Initial scatter (computed once)
          if (!scatter[i]) {
            scatter[i] = {
              x: (Math.random() - 0.5) * W * 1.2,
              y: (Math.random() - 0.5) * H,
              rot: (Math.random() - 0.5) * 160,
              scale: 0.4,
            };
          }
        }
      };

      compute();
      ScrollTrigger.addEventListener("refreshInit", compute);

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;

      // ── Reduced motion: show the final composition statically ──
      if (reduce) {
        cards.forEach((c, i) =>
          gsap.set(c, { x: arch[i].x, y: arch[i].y, rotation: arch[i].rot, scale: arch[i].scale, autoAlpha: 1 })
        );
        gsap.set(".xh-hero", { autoAlpha: 0 });
        gsap.set(".xh-intro-overlay", { autoAlpha: 1, y: 0 });
        return () => ScrollTrigger.removeEventListener("refreshInit", compute);
      }

      // ── Floating gold dust (all breakpoints) ──
      gsap.utils.toArray<HTMLElement>(".xh-dust").forEach((d) => {
        gsap.to(d, {
          y: gsap.utils.random(-30, 30),
          x: gsap.utils.random(-20, 20),
          opacity: gsap.utils.random(0.15, 0.5),
          duration: gsap.utils.random(3, 6),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: gsap.utils.random(0, 2),
        });
      });

      // ── Mobile: no pin/morph. Hero + stacked intro block handle layout. ──
      if (!isDesktop) {
        return () => ScrollTrigger.removeEventListener("refreshInit", compute);
      }

      // ── Desktop entrance: scatter → ring (plays once the preloader lifts) ──
      gsap.set(".xh-intro-overlay", { autoAlpha: 0, y: 50 });
      cards.forEach((c, i) =>
        gsap.set(c, { x: scatter[i].x, y: scatter[i].y, rotation: scatter[i].rot, scale: scatter[i].scale, autoAlpha: 0 })
      );

      const introTl = gsap.timeline({ paused: true });
      cards.forEach((c, i) => {
        introTl.to(
          c,
          {
            x: circle[i].x,
            y: circle[i].y,
            rotation: circle[i].rot,
            scale: 1,
            autoAlpha: 1,
            duration: 1.2,
            ease: "expo.out",
          },
          i * 0.05
        );
      });
      introTl.from(".xh-hero-el", { y: 30, autoAlpha: 0, duration: 0.9, stagger: 0.08, ease: "power3.out" }, 0.35);

      const startEntrance = () => introTl.play();
      if ((window as unknown as { __tiaRevealed?: boolean }).__tiaRevealed) startEntrance();
      else window.addEventListener("tia:revealed", startEntrance, { once: true });

      // ── Scroll-driven morph: ring → arch, copy crossfade (pinned) ──
      const morph = gsap.timeline({
        scrollTrigger: {
          trigger: stageEl,
          start: "top top",
          end: () => "+=" + window.innerHeight * 2.2,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      cards.forEach((c, i) => {
        morph.fromTo(
          c,
          { x: () => circle[i].x, y: () => circle[i].y, rotation: () => circle[i].rot, scale: 1 },
          {
            x: () => arch[i].x,
            y: () => arch[i].y,
            rotation: () => arch[i].rot,
            scale: () => arch[i].scale,
            ease: "none",
            immediateRender: false,
            duration: 1,
          },
          0
        );
      });
      morph.to(".xh-hero", { autoAlpha: 0, yPercent: -12, ease: "power1.in", duration: 0.35 }, 0);
      morph.fromTo(
        ".xh-intro-overlay",
        { autoAlpha: 0, y: 50 },
        { autoAlpha: 1, y: 0, ease: "power2.out", immediateRender: false, duration: 0.4 },
        0.5
      );

      return () => ScrollTrigger.removeEventListener("refreshInit", compute);
    },
    { scope: root }
  );

  return (
    <section ref={root} id="top" className="relative text-teal">
      <div
        ref={stage}
        className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-white"
      >
        {/* Warm rising-sun glow */}
        <div className="pointer-events-none absolute left-1/2 top-[58%] -z-0 h-[80vmin] w-[80vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#D6A63A55_0%,#D6A63A22_35%,transparent_70%)] blur-md" />

        {/* Gold dust */}
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <span
              key={i}
              className="xh-dust absolute block h-1 w-1 rounded-full bg-gold"
              style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, opacity: 0.25 }}
            />
          ))}
        </div>

        {/* Morphing artifact cards — desktop only */}
        <div className="pointer-events-none absolute inset-0 z-[5] hidden md:block">
          {ART.map((src, i) => (
            <div
              key={i}
              className="xh-card absolute left-1/2 top-1/2 will-change-transform"
              style={{ width: CARD_W, height: CARD_H, marginLeft: -CARD_W / 2, marginTop: -CARD_H / 2 }}
            >
              <div className="relative h-full w-full overflow-hidden rounded-xl shadow-[0_30px_60px_-30px_rgba(9,59,63,0.55)] ring-1 ring-white/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-teal/20 to-transparent" />
              </div>
            </div>
          ))}
        </div>

        {/* Hero copy — the RING phase */}
        <div className="xh-hero relative z-10 mx-auto max-w-content px-6 text-center">
          <h1 className="xh-hero-el font-display text-[18vw] font-black leading-[0.86] tracking-tight md:text-[11rem]">
            <span className="gold-text">Experience</span>
          </h1>

          <p className="xh-hero-el mx-auto mt-6 max-w-xl text-pretty text-base font-light leading-relaxed text-teal-2 md:text-lg">
            Step off the plane and into a thousand years of Cambodia. Discover sacred
            artifacts on display — then hunt for hidden treasures across the terminal.
          </p>
        </div>

        {/* "Experience the Event" — the ARCH phase (desktop overlay) */}
        <div className="xh-intro-overlay pointer-events-none absolute inset-x-0 top-[12%] z-20 mx-auto hidden max-w-content flex-col items-center px-6 text-center md:flex">
          <h2 className="font-display text-5xl font-black leading-[0.95] tracking-tight text-teal md:text-7xl">
            Every great journey<br />
            deserves a great <span className="gold-text">welcome.</span>
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-pretty text-lg font-light leading-relaxed text-teal-2">
            <span className="font-semibold text-teal">Treasures of Cambodia</span> brings the soul of
            the Kingdom into the heart of Techo International Airport — gathered for every traveller to
            witness, between one horizon and the next.
          </p>
        </div>
      </div>

      {/* Anchor target: on desktop lands at the morph's climax; on mobile at the intro block */}
      <div id="exhibition" aria-hidden className="h-0" />

      {/* Mobile intro block — stacked, no morph */}
      <div className="relative bg-white px-6 py-20 md:hidden">
        <h2 className="font-display text-4xl font-black leading-[0.98] tracking-tight text-teal">
          Every great journey deserves a great <span className="gold-text">welcome.</span>
        </h2>
        <p className="mt-5 max-w-xl text-pretty text-base font-light leading-relaxed text-teal-2">
          <span className="font-semibold text-teal">Treasures of Cambodia</span> brings the soul of the
          Kingdom into the heart of Techo International Airport — gathered for every traveller to witness,
          between one horizon and the next.
        </p>
        <div className="mt-8 grid grid-cols-3 gap-2">
          {ART.map((src, i) => (
            <div key={i} className="aspect-[3/4] overflow-hidden rounded-lg ring-1 ring-white/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" draggable={false} loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
