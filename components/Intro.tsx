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

/**
 * Floating artifact frames that echo the Hero — they drift in the right-hand
 * whitespace, idle-float, pop in on scroll, and respond to pointer parallax,
 * so the Intro reads as one continuous, living experience with the Hero.
 */
type Frame = {
  left: number;
  top: number;
  w: number;
  rot: number;
  depth: number;
  img: string;
  ratio: "3/4" | "4/5" | "1/1";
};

const FRAMES: Frame[] = [
  { left: 84, top: 24, w: 150, rot: 6, depth: 1.1, img: "/artifacts/IMG_2091.webp", ratio: "3/4" },
  { left: 95, top: 13, w: 104, rot: -9, depth: 0.55, img: "/artifacts/IMG_2096.JPG", ratio: "4/5" },
  { left: 92, top: 55, w: 124, rot: -5, depth: 0.75, img: "/artifacts/IMG_2089.webp", ratio: "4/5" },
  { left: 78, top: 74, w: 140, rot: 5, depth: 1.35, img: "/artifacts/IMG_2077.webp", ratio: "4/5" },
];

export default function Intro() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // ── Headline + copy reveal ──
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

        // ── Floating gold dust (matches Hero) ──
        gsap.utils.toArray<HTMLElement>(".intro-dust").forEach((d) => {
          gsap.to(d, {
            y: gsap.utils.random(-36, 36),
            x: gsap.utils.random(-26, 26),
            opacity: gsap.utils.random(0.15, 0.55),
            duration: gsap.utils.random(3, 6),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: gsap.utils.random(0, 2),
          });
        });

        // ── Idle float on each frame ──
        gsap.utils.toArray<HTMLElement>(".intro-frame-float").forEach((el) => {
          gsap.to(el, {
            y: gsap.utils.random(-16, 16),
            duration: gsap.utils.random(4, 7),
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: gsap.utils.random(0, 2.5),
          });
        });

        // ── Frames pop into place on scroll (echoes the Hero "explode") ──
        gsap.utils.toArray<HTMLElement>(".intro-frame-scroll").forEach((el, i) => {
          gsap.from(el, {
            scale: 0.4,
            autoAlpha: 0,
            y: 60,
            rotate: gsap.utils.random(-18, 18),
            duration: 1.3,
            ease: "expo.out",
            transformOrigin: "50% 50%",
            scrollTrigger: { trigger: root.current, start: "top 70%" },
            delay: i * 0.1,
          });
        });

        // ── Scroll parallax ──
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        gsap.to(".intro-sun", {
          yPercent: 26,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        });
        gsap.utils.toArray<HTMLElement>(".intro-frame-pos").forEach((el) => {
          const depth = parseFloat(el.dataset.depth || "1");
          gsap.to(el.querySelector(".intro-frame-scroll"), {
            yPercent: -30 * depth,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
          });
        });

        // ── Pointer parallax ──
        const setters = gsap.utils.toArray<HTMLElement>(".intro-frame-pos").map((el) => {
          const px = el.querySelector(".intro-frame-parallax");
          return {
            x: gsap.quickTo(px, "x", { duration: 0.9, ease: "power3" }),
            y: gsap.quickTo(px, "y", { duration: 0.9, ease: "power3" }),
            depth: parseFloat(el.dataset.depth || "1"),
          };
        });
        const onMove = (e: MouseEvent) => {
          const cx = (e.clientX / vw - 0.5) * 2;
          const cy = (e.clientY / vh - 0.5) * 2;
          gsap.to(".intro-sun", { x: cx * 20, y: cy * 10, duration: 0.8 });
          setters.forEach((s) => {
            s.x(cx * -14 * s.depth);
            s.y(cy * -10 * s.depth);
          });
        };
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="exhibition"
      className="stack-section relative z-10 -mt-[5vh] overflow-hidden bg-gradient-to-b from-sand-4 to-sand-3 py-28 shadow-[0_-50px_90px_-50px_rgba(9,59,63,0.25)] md:py-40"
    >
      <KhmerBorder className="absolute inset-x-0 top-0 h-5 w-full text-gold opacity-70" />

      {/* Warm radial glow — anchored to the floating cluster, echoes the Hero sun */}
      <div className="intro-sun pointer-events-none absolute right-[6%] top-[38%] -z-0 h-[60vmin] w-[60vmin] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#D6A63A3d_0%,#D6A63A18_38%,transparent_70%)] blur-md" />

      {/* Gold dust */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 16 }).map((_, i) => (
          <span
            key={i}
            className="intro-dust absolute block h-1 w-1 rounded-full bg-gold"
            style={{ left: `${(i * 41) % 100}%`, top: `${(i * 59) % 100}%`, opacity: 0.22 }}
          />
        ))}
      </div>

      {/* Scattered artifact frames — desktop only, kept clear of the copy */}
      <div className="pointer-events-none absolute inset-0 z-[5] hidden md:block">
        {FRAMES.map((f, i) => (
          <div
            key={i}
            className="intro-frame-pos absolute"
            data-depth={f.depth}
            style={{ left: `${f.left}%`, top: `${f.top}%`, width: f.w, transform: "translate(-50%, -50%)" }}
          >
            <div className="intro-frame-parallax">
              <div className="intro-frame-scroll">
                <div className="intro-frame-float">
                  <div
                    className="relative overflow-hidden rounded-xl"
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

      <div className="relative z-10 mx-auto max-w-content px-6">
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

        <div className="mt-14 grid items-end gap-10 md:max-w-[58%] md:grid-cols-[1.4fr_1fr]">
          <p className="intro-lead max-w-xl text-pretty text-lg font-light leading-relaxed text-teal-2 md:text-xl">
            <span className="font-semibold text-teal">Treasures of Cambodia</span> brings the
            soul of the Kingdom into the heart of Techo International Airport. Sacred sandstone,
            gilded bronze, and the eternal dancers of Angkor — gathered for every traveller to
            witness, between one horizon and the next.
          </p>

          <div className="intro-stats grid grid-cols-3 gap-4 border-t border-teal/15 pt-8 md:col-span-2 md:max-w-md">
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
