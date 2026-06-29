"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Scattered artifact frames that orbit the headline. On reveal they "explode"
 * outward from the centre of the screen into their resting positions, then
 * float gently and respond to pointer + scroll parallax — echoing the Getty
 * "Tracing Art" hero. Every frame shows a real artifact from the collection.
 */
type Frame = {
  /** position of the frame centre, in % of the section */
  left: number;
  top: number;
  /** resting width in px (desktop) */
  w: number;
  /** resting rotation in deg */
  rot: number;
  /** parallax depth — bigger = moves more */
  depth: number;
  /** artifact photo */
  img: string;
  ratio: "3/4" | "4/5" | "1/1";
};

const FRAMES: Frame[] = [
  { left: 9, top: 31, w: 168, rot: -7, depth: 1.15, img: "/artifacts/IMG_2089.webp", ratio: "3/4" },
  { left: 6, top: 65, w: 124, rot: 5, depth: 0.7, img: "/artifacts/IMG_2085.webp", ratio: "4/5" },
  { left: 16, top: 87, w: 196, rot: -3, depth: 1.45, img: "/artifacts/IMG_2077.webp", ratio: "4/5" },
  { left: 25, top: 15, w: 118, rot: 8, depth: 0.6, img: "/artifacts/IMG_2080.webp", ratio: "3/4" },
  { left: 63, top: 13, w: 132, rot: 6, depth: 0.65, img: "/artifacts/IMG_2079.webp", ratio: "3/4" },
  { left: 78, top: 13, w: 104, rot: -9, depth: 0.5, img: "/artifacts/IMG_2084.webp", ratio: "4/5" },
  { left: 87, top: 25, w: 144, rot: 6, depth: 1.0, img: "/artifacts/IMG_2093.webp", ratio: "3/4" },
  { left: 94, top: 56, w: 120, rot: -5, depth: 0.7, img: "/artifacts/IMG_2078.webp", ratio: "4/5" },
  { left: 88, top: 84, w: 178, rot: 4, depth: 1.35, img: "/artifacts/IMG_2088.webp", ratio: "4/5" },
  { left: 50, top: 94, w: 150, rot: -2, depth: 1.2, img: "/artifacts/IMG_2090.webp", ratio: "3/4" },
];

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)" },
        (ctx) => {
          if (!ctx.conditions?.motion) return;

          // ── Floating gold dust ──
          gsap.utils.toArray<HTMLElement>(".dust").forEach((d) => {
            gsap.to(d, {
              y: gsap.utils.random(-40, 40),
              x: gsap.utils.random(-30, 30),
              opacity: gsap.utils.random(0.15, 0.6),
              duration: gsap.utils.random(3, 6),
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              delay: gsap.utils.random(0, 2),
            });
          });

          // ── Idle float on each frame (inner layer, never touched by parallax) ──
          gsap.utils.toArray<HTMLElement>(".frame-float").forEach((el) => {
            gsap.to(el, {
              y: gsap.utils.random(-18, 18),
              duration: gsap.utils.random(4, 7),
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              delay: gsap.utils.random(0, 2.5),
            });
          });

          // ── Entrance timeline (plays once the preloader lifts) ──
          const tl = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } });
          tl.from(".hero-kicker", { y: 24, autoAlpha: 0, duration: 0.8 })
            .from(
              ".hero-word > span",
              { yPercent: 120, skewY: 6, duration: 1.2, stagger: 0.08, ease: "expo.out" },
              "-=0.3"
            )
            .from(".hero-sub", { y: 24, autoAlpha: 0, duration: 0.8 }, "-=0.7")
            .from(".hero-meta", { y: 20, autoAlpha: 0, duration: 0.8 }, "-=0.6")
            .from(".hero-scroll", { autoAlpha: 0, y: 16, duration: 0.8 }, "-=0.5");

          // Frames explode outward from the centre of the viewport into place.
          const vw = window.innerWidth;
          const vh = window.innerHeight;
          gsap.utils.toArray<HTMLElement>(".frame-scroll").forEach((el, i) => {
            const r = el.getBoundingClientRect();
            const dx = (vw / 2 - (r.left + r.width / 2)) * 0.9;
            const dy = (vh / 2 - (r.top + r.height / 2)) * 0.9;
            tl.fromTo(
              el,
              { x: dx, y: dy, scale: 0.18, autoAlpha: 0, rotate: gsap.utils.random(-22, 22) },
              { x: 0, y: 0, scale: 1, autoAlpha: 1, rotate: 0, duration: 1.5, ease: "expo.out" },
              0.15 + i * 0.07
            );
          });

          const start = () => tl.play();
          if ((window as unknown as { __tiaRevealed?: boolean }).__tiaRevealed) {
            start();
          } else {
            window.addEventListener("tia:revealed", start, { once: true });
          }

          // ── Scroll parallax ──
          gsap.to(".hero-copy", {
            yPercent: -22,
            opacity: 0.2,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
          });
          gsap.to(".sun", {
            yPercent: 40,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
          });
          // Frames drift up at depth-varied speeds and fade as the section exits.
          gsap.utils.toArray<HTMLElement>(".frame-pos").forEach((el) => {
            const depth = parseFloat(el.dataset.depth || "1");
            gsap.to(el.querySelector(".frame-scroll"), {
              yPercent: -34 * depth,
              ease: "none",
              scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
            });
          });

          // ── Pointer parallax (own layer, so it never clobbers centering) ──
          const frames = gsap.utils.toArray<HTMLElement>(".frame-pos");
          const setters = frames.map((el) => {
            const px = el.querySelector(".frame-parallax");
            return {
              x: gsap.quickTo(px, "x", { duration: 0.9, ease: "power3" }),
              y: gsap.quickTo(px, "y", { duration: 0.9, ease: "power3" }),
              depth: parseFloat(el.dataset.depth || "1"),
            };
          });

          const onMove = (e: MouseEvent) => {
            const cx = (e.clientX / vw - 0.5) * 2;
            const cy = (e.clientY / vh - 0.5) * 2;
            gsap.to(".sun", { x: cx * 24, y: cy * 12, duration: 0.8 });
            gsap.to(".hero-copy", { x: cx * 8, duration: 0.8 });
            setters.forEach((s) => {
              s.x(cx * -16 * s.depth);
              s.y(cy * -12 * s.depth);
            });
          };
          window.addEventListener("mousemove", onMove);
          return () => window.removeEventListener("mousemove", onMove);
        }
      );
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="top"
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-white via-sand-5 to-sand-4 text-teal"
    >
      {/* Warm radial glow / rising sun */}
      <div className="sun pointer-events-none absolute left-1/2 top-[62%] -z-0 h-[80vmin] w-[80vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#D6A63A55_0%,#D6A63A22_35%,transparent_70%)] blur-md" />

      {/* Gold dust */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 22 }).map((_, i) => (
          <span
            key={i}
            className="dust absolute block h-1 w-1 rounded-full bg-gold"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              opacity: 0.25,
            }}
          />
        ))}
      </div>

      {/* Scattered artifact frames — hidden on small screens to keep copy clear */}
      <div className="pointer-events-none absolute inset-0 z-[5] hidden md:block">
        {FRAMES.map((f, i) => (
          <div
            key={i}
            className="frame-pos absolute"
            data-depth={f.depth}
            style={{
              left: `${f.left}%`,
              top: `${f.top}%`,
              width: f.w,
              transform: "translate(-50%, -50%)",
            }}
          >
            <div className="frame-parallax">
              <div className="frame-scroll">
                <div className="frame-float">
                  <div
                    className="frame-art relative overflow-hidden rounded-xl"
                    style={{ aspectRatio: f.ratio, transform: `rotate(${f.rot}deg)` }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={f.img}
                      alt=""
                      className="h-full w-full rounded-xl object-cover shadow-[0_30px_60px_-30px_rgba(9,59,63,0.55)] ring-1 ring-white/40"
                      draggable={false}
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-t from-teal/15 to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Copy */}
      <div className="hero-copy relative z-10 mx-auto max-w-content px-6 text-center">
        <p className="hero-kicker mb-6 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.42em] text-brown">
          <span className="h-px w-8 bg-gold/60" />
          Techo International Airport
          <span className="h-px w-8 bg-gold/60" />
        </p>

        <h1 className="font-display text-[18vw] font-black leading-[0.86] tracking-tight md:text-[11rem]">
          <span className="hero-word reveal-word">
            <span className="gold-text">Experience</span>
          </span>
        </h1>

        <p className="hero-sub mx-auto mt-6 max-w-xl text-pretty text-base font-light leading-relaxed text-teal-2 md:text-lg">
          Step off the plane and into a thousand years of Cambodia. Discover sacred
          artifacts on display — then hunt for hidden treasures across the terminal.
        </p>

        <div className="hero-meta mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href="#exhibition"
            className="rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-teal transition-transform duration-300 hover:scale-105"
          >
            Enter the Exhibition
          </a>
          <a
            href="#treasure-hunt"
            className="group inline-flex items-center gap-2 rounded-full border border-teal/25 px-7 py-3.5 text-sm font-semibold text-teal transition-colors hover:border-gold hover:text-gold-1"
          >
            Begin the Treasure Hunt
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>

      {/* Scroll cue */}
      <a
        href="#exhibition"
        className="hero-scroll absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-brown/70 transition-colors hover:text-gold-1"
      >
        Scroll
        <span className="relative block h-9 w-px overflow-hidden bg-teal/15">
          <span className="absolute inset-x-0 top-0 h-3 animate-scrollcue bg-gold" />
        </span>
      </a>
    </section>
  );
}
