"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import BlurText from "@/components/BlurText";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Hero on the Getty "Tracing Art" model: a flanked composition —
 *
 *   Experience  〰️[ S-curve of artifact images ]〰️  TIA
 *
 * The artifacts stream onto the S-curve, then morph into a scattered field on
 * scroll (pinned + scrubbed). The two words animate with ReactBits BlurText
 * (Motion). Works on every breakpoint: a 3-column grid on desktop, a stacked
 * column on mobile, with phone-tuned card sizing.
 */

const ART = [
  "/artifacts/IMG_2089.webp",
  "/artifacts/IMG_2085.webp",
  "/artifacts/IMG_2077.webp",
  "/artifacts/IMG_2080.webp",
  "/artifacts/IMG_2090.webp",
  "/artifacts/IMG_2079.webp",
  "/artifacts/IMG_2084.webp",
  "/artifacts/IMG_2093.webp",
  "/artifacts/IMG_2078.webp",
  "/artifacts/IMG_2088.webp",
  "/artifacts/IMG_2096.JPG",
  "/artifacts/IMG_2091.webp",
];

const CARD_W = 118;
const CARD_H = 164;

// Stable pseudo-random for deterministic scatter targets.
const rand = (s: number) => {
  const x = Math.sin(s) * 43758.5453;
  return x - Math.floor(x);
};

export default function ExperienceHero() {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);

  // The flanking words (ReactBits BlurText, powered by Motion) hold until the
  // preloader lifts, then resolve from blurred to crisp.
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || (window as unknown as { __tiaRevealed?: boolean }).__tiaRevealed) {
      setRevealed(true);
      return;
    }
    const on = () => setRevealed(true);
    window.addEventListener("tia:revealed", on, { once: true });
    const fallback = setTimeout(() => setRevealed(true), 2500); // safety if event missed
    return () => {
      window.removeEventListener("tia:revealed", on);
      clearTimeout(fallback);
    };
  }, []);

  useGSAP(
    () => {
      const stageEl = stage.current;
      if (!stageEl) return;

      const cards = gsap.utils.toArray<HTMLElement>(".xh-card");
      const N = cards.length;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      type Pos = { x: number; y: number; rot: number; scale: number };
      const stream: Pos[] = [];
      const scatter: Pos[] = [];

      // Card positions are transforms from the stage centre (anchored 50/50),
      // which sits at the viewport centre — so scatter uses vw/vh from centre.
      const compute = () => {
        const W = stageEl.clientWidth;
        const H = stageEl.clientHeight;
        const mobile = window.innerWidth < 768;
        const cardScale = mobile ? 0.5 : 0.82;

        // Desktop: horizontal S (x spreads, y waves).
        const streamW = Math.min(W * 0.82, 560);
        const ampY = Math.min(H * 0.2, 175);
        // Mobile: vertical S (y spreads down, x waves) — like Getty on phones.
        const streamH = H * 0.86;
        const ampX = Math.min(W * 0.3, 130);

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const cols = mobile ? 3 : 4;
        const rows = Math.ceil(N / cols);
        const cellW = (vw * 0.92) / cols;
        const cellH = (vh * 0.74) / rows;

        for (let i = 0; i < N; i++) {
          const t = N === 1 ? 0.5 : i / (N - 1);
          // One full sine — the Getty "S" (horizontal on desktop, vertical on mobile).
          stream[i] = mobile
            ? {
                x: Math.sin(t * Math.PI * 2) * ampX,
                y: (t - 0.5) * streamH,
                rot: Math.cos(t * Math.PI * 2) * 10,
                scale: cardScale,
              }
            : {
                x: (t - 0.5) * streamW,
                y: Math.sin(t * Math.PI * 2) * ampY,
                rot: Math.cos(t * Math.PI * 2) * 12,
                scale: cardScale,
              };

          // Even grid across the viewport + jitter → scattered field.
          const col = i % cols;
          const row = Math.floor(i / cols);
          scatter[i] = {
            x: -vw * 0.46 + cellW * (col + 0.5) + (rand(i * 12.9 + 1) - 0.5) * cellW * 0.5,
            y: -vh * 0.38 + cellH * (row + 0.5) + (rand(i * 7.7 + 3) - 0.5) * cellH * 0.5,
            rot: (rand(i * 3.3 + 2) - 0.5) * 30,
            scale: cardScale,
          };
        }
      };
      compute();
      ScrollTrigger.addEventListener("refreshInit", compute);
      const cleanup = () => ScrollTrigger.removeEventListener("refreshInit", compute);

      // ── Reduced motion: land straight on the curve ──
      if (reduce) {
        cards.forEach((c, i) =>
          gsap.set(c, { x: stream[i].x, y: stream[i].y, rotation: stream[i].rot, scale: stream[i].scale, autoAlpha: 1 })
        );
        return cleanup;
      }

      // Pre-reveal: cards parked on the curve but small + hidden.
      cards.forEach((c, i) =>
        gsap.set(c, { x: stream[i].x, y: stream[i].y, rotation: stream[i].rot, scale: 0.5, autoAlpha: 0 })
      );

      // ── ENTRANCE: deal the deck onto the S-curve ──
      const tl = gsap.timeline({ paused: true });
      cards.forEach((c, i) => {
        tl.to(
          c,
          { scale: () => stream[i].scale, autoAlpha: 1, duration: 0.7, ease: "power3.out" },
          i * 0.05
        );
      });

      const start = () => tl.play();
      if ((window as unknown as { __tiaRevealed?: boolean }).__tiaRevealed) start();
      else window.addEventListener("tia:revealed", start, { once: true });

      // ── Idle float ──
      gsap.utils.toArray<HTMLElement>(".xh-float").forEach((el) => {
        gsap.to(el, {
          y: gsap.utils.random(-10, 10),
          duration: gsap.utils.random(4, 7),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: gsap.utils.random(0, 2.5),
        });
      });

      // ── Scroll: the S-curve morphs into a scattered field (pinned) ──
      const scatterTl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=120%",
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      cards.forEach((c, i) => {
        scatterTl.to(
          c,
          {
            x: () => scatter[i].x,
            y: () => scatter[i].y,
            rotation: () => scatter[i].rot,
            ease: "power2.inOut",
          },
          0
        );
      });
      // Words + caption fade as the curve disperses.
      scatterTl.to(".xh-fade", { autoAlpha: 0, ease: "none" }, 0);

      // ── Subtle pointer parallax (desktop pointers only) ──
      const setters = cards.map((el, i) => {
        const px = el.querySelector(".xh-parallax");
        const depth = 0.5 + Math.abs(i / (N - 1) - 0.5);
        return {
          x: gsap.quickTo(px, "x", { duration: 0.9, ease: "power3" }),
          y: gsap.quickTo(px, "y", { duration: 0.9, ease: "power3" }),
          depth,
        };
      });
      const onMove = (e: MouseEvent) => {
        const cx = (e.clientX / window.innerWidth - 0.5) * 2;
        const cy = (e.clientY / window.innerHeight - 0.5) * 2;
        setters.forEach((s) => {
          s.x(cx * -10 * s.depth);
          s.y(cy * -8 * s.depth);
        });
      };
      window.addEventListener("mousemove", onMove);

      return () => {
        window.removeEventListener("mousemove", onMove);
        cleanup();
      };
    },
    { scope: root }
  );

  return (
    <section ref={root} id="top" className="relative text-teal">
      <div className="relative min-h-dvh overflow-hidden bg-white">
        {/* Soft warm wash so the white isn't clinical */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[110vmin] w-[110vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(214,166,58,0.10)_0%,transparent_60%)]" />

        {/* Semantic heading (visual version is the animated words) */}
        <h1 className="sr-only">Experience TIA — Treasures of Cambodia at Techo International Airport</h1>

        {/* Stacked column on mobile · Experience 〰️[ S-curve ]〰️ TIA grid on desktop */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-4 pt-24 pb-10 md:grid md:grid-cols-[1fr_42vw_1fr] md:items-center md:gap-0 md:p-0">
          {/* Left / top word */}
          <div aria-hidden className="xh-fade md:justify-self-end md:pr-[1.5vw]">
            {revealed ? (
              <BlurText
                text="Experience"
                animateBy="letters"
                direction="top"
                delay={55}
                stepDuration={0.4}
                className="!flex-nowrap justify-center font-editorial text-5xl font-medium leading-none text-teal md:justify-end md:text-6xl xl:text-7xl"
              />
            ) : (
              <span className="font-editorial text-5xl font-medium leading-none text-teal opacity-0 md:text-6xl xl:text-7xl">
                Experience
              </span>
            )}
          </div>

          {/* Centre stage — the S-curve */}
          <div ref={stage} className="relative w-full flex-1 md:h-[66vh] md:flex-none">
            {ART.map((src, i) => (
              <div
                key={i}
                className="xh-card absolute left-1/2 top-1/2 will-change-transform"
                style={{ width: CARD_W, height: CARD_H, marginLeft: -CARD_W / 2, marginTop: -CARD_H / 2 }}
              >
                <div className="xh-parallax h-full w-full">
                  <div className="xh-float h-full w-full">
                    <div className="relative h-full w-full overflow-hidden rounded-lg shadow-[0_24px_50px_-26px_rgba(9,59,63,0.5)] ring-1 ring-black/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-full w-full object-cover" draggable={false} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <p className="xh-fade absolute bottom-[3%] left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.35em] text-brown/80 md:text-[11px] md:tracking-[0.4em]">
              A Heritage Exhibition
            </p>
          </div>

          {/* Right / bottom word */}
          <div aria-hidden className="xh-fade md:justify-self-start md:pl-[1.5vw]">
            {revealed ? (
              <BlurText
                text="TIA"
                animateBy="letters"
                direction="bottom"
                delay={110}
                stepDuration={0.45}
                className="!flex-nowrap justify-center font-editorial text-6xl font-semibold leading-none text-gold md:justify-start md:text-8xl"
              />
            ) : (
              <span className="font-editorial text-6xl font-semibold leading-none text-gold opacity-0 md:text-8xl">
                TIA
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Anchor for the nav */}
      <div id="exhibition" aria-hidden className="h-0" />
    </section>
  );
}
