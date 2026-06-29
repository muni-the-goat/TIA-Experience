"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TempleSilhouette } from "./KhmerMotifs";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = gsap.matchMedia();

      reduce.add(
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

          // ── Entrance timeline (plays once the preloader lifts) ──
          const tl = gsap.timeline({ paused: true, defaults: { ease: "power4.out" } });
          tl.from(".hero-kicker", { y: 24, opacity: 0, duration: 0.8 })
            .from(
              ".hero-word > span",
              { yPercent: 120, skewY: 6, duration: 1.2, stagger: 0.08, ease: "expo.out" },
              "-=0.3"
            )
            .from(".hero-sub", { y: 24, opacity: 0, duration: 0.8 }, "-=0.7")
            .from(".hero-meta", { y: 20, opacity: 0, duration: 0.8 }, "-=0.6")
            .from(".temple", { yPercent: 18, opacity: 0, duration: 1.4, ease: "expo.out" }, 0.2);

          const start = () => tl.play();
          if ((window as unknown as { __tiaRevealed?: boolean }).__tiaRevealed) {
            start();
          } else {
            window.addEventListener("tia:revealed", start, { once: true });
          }

          // ── Parallax on scroll ──
          gsap.to(".temple", {
            yPercent: 28,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
          });
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

          // ── Pointer parallax ──
          const onMove = (e: MouseEvent) => {
            const cx = (e.clientX / window.innerWidth - 0.5) * 2;
            const cy = (e.clientY / window.innerHeight - 0.5) * 2;
            gsap.to(".temple", { x: cx * -18, duration: 0.8 });
            gsap.to(".sun", { x: cx * 24, y: cy * 12, duration: 0.8 });
            gsap.to(".hero-copy", { x: cx * 8, duration: 0.8 });
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
        {Array.from({ length: 26 }).map((_, i) => (
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

      {/* Temple silhouette */}
      <TempleSilhouette className="temple pointer-events-none absolute bottom-0 left-1/2 w-[140%] max-w-none -translate-x-1/2 translate-y-2 opacity-90 md:w-[80%]" stroke="#E7D2A9" />

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
            data-cursor
          >
            Enter the Exhibition
          </a>
          <a
            href="#treasure-hunt"
            className="group inline-flex items-center gap-2 rounded-full border border-teal/25 px-7 py-3.5 text-sm font-semibold text-teal transition-colors hover:border-gold hover:text-gold-1"
            data-cursor
          >
            Begin the Treasure Hunt
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
