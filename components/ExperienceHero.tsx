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
        // Kept compact so the curve clears the caption + the TIA word below.
        const streamH = H * 0.62;
        const ampX = Math.min(W * 0.27, 115);

        const vw = window.innerWidth;
        const vh = window.innerHeight;

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

          // Even ring around the centre, with a gap at the top for the logo, so
          // the images frame a clear middle for the editorial text and never
          // pile up. Only the radius jitters (angles stay evenly spaced).
          const topAngle = -Math.PI / 2;
          const gapFrac = 0.2; // skip the top 20% of the ring (logo zone)
          const f = gapFrac / 2 + (N === 1 ? 0.5 : i / (N - 1)) * (1 - gapFrac);
          const ang = topAngle + f * Math.PI * 2;
          const rx = vw * (0.33 + rand(i * 4.3 + 2) * 0.08);
          const ry = vh * (0.3 + rand(i * 6.7 + 8) * 0.08);
          scatter[i] = {
            x: Math.cos(ang) * rx,
            y: Math.sin(ang) * ry,
            rot: (rand(i * 3.3 + 2) - 0.5) * 26,
            scale: cardScale,
          };
        }
      };
      compute();
      ScrollTrigger.addEventListener("refreshInit", compute);
      const cleanup = () => ScrollTrigger.removeEventListener("refreshInit", compute);

      // ── Reduced motion: show the composed end-state (images ringed, text in) ──
      if (reduce) {
        cards.forEach((c, i) =>
          gsap.set(c, { x: scatter[i].x, y: scatter[i].y, rotation: scatter[i].rot, scale: scatter[i].scale, autoAlpha: 1 })
        );
        gsap.set(".xh-fade", { autoAlpha: 0 });
        return cleanup;
      }

      // Pre-reveal: cards parked on the curve (small + hidden); intro waits.
      cards.forEach((c, i) =>
        gsap.set(c, { x: stream[i].x, y: stream[i].y, rotation: stream[i].rot, scale: 0.5, autoAlpha: 0 })
      );
      gsap.set(".xh-intro-el", { autoAlpha: 0, y: 40, filter: "blur(12px)" });

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

      // ── Scroll (pinned): the curve rings out, then the collection text moves in ──
      const scatterTl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=160%",
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      // Phase 1 — the curve fans out into a ring around the centre.
      cards.forEach((c, i) => {
        scatterTl.to(
          c,
          {
            x: () => scatter[i].x,
            y: () => scatter[i].y,
            rotation: () => scatter[i].rot,
            ease: "power2.inOut",
            duration: 1,
          },
          0
        );
      });
      // Experience / TIA / caption fade out early.
      scatterTl.to(".xh-fade", { autoAlpha: 0, ease: "none", duration: 0.35 }, 0);
      // Phase 2 — the collection text resolves into the cleared centre.
      scatterTl.to(
        ".xh-intro-el",
        { autoAlpha: 1, y: 0, filter: "blur(0px)", ease: "power3.out", stagger: 0.08, duration: 0.55 },
        0.55
      );

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
      <div className="relative min-h-dvh overflow-hidden bg-[#fbfaf8]">
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

        {/* Collection intro — resolves into the cleared centre as the images ring out */}
        <div className="xh-intro pointer-events-none absolute inset-0 z-20 mx-auto flex max-w-3xl flex-col items-center justify-center px-6 text-center">
          <p className="xh-intro-el mb-6 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-brown">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-gold text-[11px] leading-none tracking-normal text-white">
              02
            </span>
            The Collection
          </p>
          <h2 className="xh-intro-el font-editorial text-[2rem] font-medium leading-[1.08] text-teal sm:text-[2.6rem] md:text-[4rem]">
            A thousand years of Khmer devotion,
            <span className="italic text-brown-3"> drifting through the halls</span> from
            Angkor to Techo.
          </h2>
          <p className="xh-intro-el mt-6 max-w-xl font-editorial text-base italic text-teal-2 md:text-xl">
            Twelve sacred treasures — carved in stone, gathered here as a single journey
            through the sculptural memory of Cambodia.
          </p>
        </div>
      </div>

      {/* Anchor for the nav */}
      <div id="exhibition" aria-hidden className="h-0" />
    </section>
  );
}
