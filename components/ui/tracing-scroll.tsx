"use client";

import * as React from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export interface TracingStep {
  /** Full-bleed image for this step. */
  image: string;
  num: string;
  title: string;
  body: React.ReactNode;
}

interface TracingScrollProps {
  steps: TracingStep[];
  /** Extra scroll distance (px) over which the sequence stays pinned. @default 2400 */
  scrollHeight?: number;
  className?: string;
  /** Small heading shown left-centre over the imagery. */
  label?: string;
}

/**
 * Getty "Tracing Art" scroll mechanic. A stack of full-bleed images stays
 * pinned (CSS sticky); the first expands from a centred card, each later one
 * fades in as a bottom-right thumbnail then scales up to cover the screen,
 * while each step's text is revealed on the left in sequence.
 *
 * Driven by one GSAP ScrollTrigger-scrubbed timeline — like every other
 * scroll section on the site — instead of Motion's useScroll. Motion hands
 * scroll-linked transforms to Safari's native scroll timeline, whose progress
 * mapping doesn't match the JS one; on iOS that desynced the images from the
 * text and produced a visible shake as the two engines fought. GSAP applies
 * transform-only updates from a single JS source of truth (synced to Lenis
 * via ScrollTrigger), so everything moves together, smoothly.
 * All animated properties are compositor-friendly (transform/opacity +
 * corner radius) — never clip-path — so scrolling triggers no repaints.
 */
export default function TracingScroll({
  steps,
  scrollHeight = 2400,
  className,
  label,
}: TracingScrollProps) {
  const root = React.useRef<HTMLDivElement>(null);
  const total = steps.length;

  useGSAP(
    () => {
      const slot = 1 / total;

      // One master timeline scrubbed over the whole pinned scroll. A padding
      // zero-tween at t=1 fixes the timeline's duration at exactly 1, so every
      // position/duration below reads directly as a scroll-progress fraction.
      //
      // scrub is numeric, not `true`: with `true` the timeline snaps to the
      // exact scroll position at each scroll event, and iOS delivers those
      // positions unevenly relative to the render loop during touch/momentum
      // scroll — a full-screen image scaling 1:1 with scroll visibly judders
      // (each frame is "correct", the *timing* is what steps). A numeric scrub
      // makes GSAP glide the timeline toward the target on its own ticker,
      // decoupling animation smoothness from scroll-event timing.
      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
        },
      });
      tl.set({ pad: 0 }, { pad: 1 }, 1);

      // ── Image layers ──
      gsap.utils.toArray<HTMLElement>(".ts-layer").forEach((el, i) => {
        const first = i === 0;
        const slotStart = i * slot;

        if (first) {
          // Centred card on the cream stage → full-bleed over the opening
          // stretch of the pin. scale never exceeds 1, so the layer is always
          // rasterised at full size and the full-bleed image stays crisp.
          gsap.set(el, { scale: 0.4, borderRadius: 26, willChange: "transform" });
          tl.to(el, { scale: 1, borderRadius: 0, duration: 0.16 }, 0);
          return;
        }

        // Later layers: fade in as a bottom-right thumbnail, hold, then
        // scale + slide to full-bleed. autoAlpha (visibility) guarantees a
        // layer can never show before its turn.
        const growStart = slotStart - slot * 0.55;
        const growEnd = slotStart - slot * 0.38;
        const expandStart = slotStart - 0.02;
        const expandEnd = slotStart + slot * 0.4;

        gsap.set(el, {
          autoAlpha: 0,
          scale: 0.32,
          xPercent: 30,
          yPercent: 27,
          borderRadius: 40,
          willChange: "transform",
        });
        tl.to(el, { autoAlpha: 1, duration: growEnd - growStart }, growStart);
        tl.to(
          el,
          {
            scale: 1,
            xPercent: 0,
            yPercent: 0,
            borderRadius: 0,
            duration: expandEnd - expandStart,
          },
          expandStart
        );
      });

      // ── Scrim + label — hold off until the first image fills the stage,
      //    so the teal never sits over the cream card. ──
      gsap.set(".ts-chrome", { autoAlpha: 0 });
      tl.to(".ts-chrome", { autoAlpha: 1, duration: 0.06 }, 0.14);

      // ── Step texts — each resolves once its image has finished expanding,
      //    then hands off before the next image's turn. ──
      gsap.utils.toArray<HTMLElement>(".ts-text").forEach((el, i) => {
        const last = i === total - 1;
        const inAt = i === 0 ? 0.19 : i * slot + slot * 0.3;
        const outAt = (i + 1) * slot - slot * 0.12;

        gsap.set(el, { autoAlpha: 0 });
        gsap.set(el.querySelector(".ts-num"), { y: 30 });
        gsap.set(el.querySelector(".ts-title"), { y: 55 });
        gsap.set(el.querySelector(".ts-body"), { y: 90 });

        tl.to(el, { autoAlpha: 1, duration: 0.08 }, inAt - 0.04);
        tl.to(el.querySelector(".ts-num"), { y: 0, duration: 0.08 }, inAt - 0.05);
        tl.to(el.querySelector(".ts-title"), { y: 0, duration: 0.1 }, inAt - 0.05);
        tl.to(el.querySelector(".ts-body"), { y: 0, duration: 0.13 }, inAt - 0.05);
        if (!last) tl.to(el, { autoAlpha: 0, duration: 0.06 }, outAt - 0.04);
      });
    },
    { scope: root, dependencies: [total] }
  );

  return (
    <div
      ref={root}
      style={{ height: `calc(${scrollHeight}px + 100vh)` }}
      className={`relative w-full ${className ?? ""}`}
    >
      {/* Cream stage (matches the page) so the first image reads as a centred
          card sitting on the page before it expands — never a green void.
          `tia-stage-h` = 100svh with a 100vh fallback, so the pinned stage
          fills the *visible* viewport on mobile (behind the dynamic toolbar)
          exactly like the gallery stage — not the taller 100vh `h-screen`. */}
      <div className="tia-stage-h sticky top-0 w-full overflow-hidden bg-[#fbfaf8]">
        {steps.map((s, i) => (
          <div key={`img-${i}`} aria-hidden className="ts-layer absolute inset-0 overflow-hidden">
            <Image
              src={s.image}
              alt=""
              fill
              sizes="100vw"
              quality={85}
              priority={i === 0}
              className="object-cover object-center"
              draggable={false}
            />
          </div>
        ))}

        {/* Legibility scrim — stronger on the left where the text sits (#876C51) */}
        <div
          className="ts-chrome pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,rgba(135,108,81,0.92)_0%,rgba(135,108,81,0.72)_34%,rgba(135,108,81,0.28)_64%,transparent_92%)]"
        />
        {label ? (
          <div className="ts-chrome pointer-events-none absolute left-0 top-1/2 flex -translate-y-[120px] items-center gap-4 px-8 md:-translate-y-[168px] md:px-14 lg:px-24">
            <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.34em] text-gold-3 [text-shadow:0_1px_12px_rgba(9,59,63,0.6)]">
              {label}
            </span>
            <span className="h-px w-16 bg-gradient-to-r from-gold/60 to-transparent" />
          </div>
        ) : null}

        {steps.map((s, i) => (
          <div
            key={`txt-${i}`}
            className="ts-text pointer-events-none absolute inset-0 flex flex-col justify-center px-8 md:px-14 lg:px-24"
          >
            <div className="max-w-md">
              <span className="ts-num block font-display text-xs font-bold uppercase tracking-[0.45em] text-gold-3">
                {s.num}
              </span>
              <h3 className="ts-title mt-3 font-editorial text-4xl italic leading-tight text-white [text-shadow:0_2px_20px_rgba(9,59,63,0.6)] md:text-5xl">
                {s.title}
              </h3>
              <p className="ts-body mt-4 text-pretty text-sm font-light leading-relaxed text-sand-4 [text-shadow:0_1px_14px_rgba(9,59,63,0.55)] md:text-base">
                {s.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
