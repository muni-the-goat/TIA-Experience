"use client";

import * as React from "react";
import Image from "next/image";
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

// Scroll-linked useTransform input ranges must stay within [0, 1] and be
// strictly increasing, otherwise Motion's native (WAAPI) scroll animation
// throws "Offsets must be monotonically non-decreasing". This clamps each
// breakpoint into range and nudges any that would collide.
function seq(points: number[]): number[] {
  let prev = -Infinity;
  return points.map((p) => {
    let v = Math.max(0, Math.min(1, p));
    if (v <= prev) v = Math.min(1, prev + 1e-4);
    prev = v;
    return v;
  });
}

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
  /** Small heading shown top-left over the imagery. */
  label?: string;
}

/**
 * Getty "Tracing Art" scroll mechanic. A stack of full-bleed images stays
 * pinned; each successive image first appears as a small thumbnail in the
 * bottom-right corner, then expands (clip-path) to cover the screen as you
 * scroll — while each step's text is revealed on the left in sequence.
 */
export default function TracingScroll({
  steps,
  scrollHeight = 2400,
  className,
  label,
}: TracingScrollProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const total = steps.length;

  return (
    <div
      ref={ref}
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
          <ImageLayer
            key={`img-${i}`}
            progress={scrollYProgress}
            index={i}
            total={total}
            image={s.image}
          />
        ))}

        {/* Legibility scrim — stronger on the left where the text sits */}
        <Chrome progress={scrollYProgress} label={label} />

        {steps.map((s, i) => (
          <StepText
            key={`txt-${i}`}
            progress={scrollYProgress}
            index={i}
            total={total}
            num={s.num}
            title={s.title}
            body={s.body}
          />
        ))}
      </div>
    </div>
  );
}

function ImageLayer({
  progress,
  index,
  total,
  image,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  image: string;
}) {
  const slot = 1 / total;
  const slotStart = index * slot;
  const first = index === 0;

  // The reveal is driven entirely by transforms (scale + translate + opacity)
  // — never a paint-triggering property like clip-path. The GPU composites a
  // once-rasterised layer each frame with zero repaint, which is what keeps the
  // scroll smooth on mobile. The first layer scales up from a centred card;
  // later layers fade in as a bottom-right thumbnail, hold, then scale up to
  // full-bleed. Each expanded layer fully covers the one beneath it, so layers
  // never show through each other.
  const growStart = slotStart - slot * 0.55;
  const growEnd = slotStart - slot * 0.38;
  const expandStart = slotStart - 0.02;
  const expandEnd = slotStart + slot * 0.4;

  const range = first ? [0, 0.16] : seq([growStart, growEnd, expandStart, expandEnd]);
  // scale: card/thumbnail size → 1 (full-bleed). Never above 1, so the layer is
  // always rasterised at (or above) its displayed size — full-bleed stays crisp.
  const scale = useTransform(progress, range, first ? [0.4, 1] : [0.32, 0.32, 0.32, 1]);
  // translate (% of the viewport-sized layer): first layer stays centred; later
  // layers sit bottom-right as a thumbnail, then slide to centre as they grow.
  const xPct = useTransform(progress, range, first ? [0, 0] : [30, 30, 30, 0]);
  const yPct = useTransform(progress, range, first ? [0, 0] : [27, 27, 27, 0]);
  const x = useMotionTemplate`${xPct}%`;
  const y = useMotionTemplate`${yPct}%`;
  const radius = useTransform(progress, range, first ? [26, 0] : [40, 40, 40, 0]);
  // Later layers fade their thumbnail in; the first layer is always opaque.
  const fade = useTransform(progress, range, [0, 1, 1, 1]);
  const opacity = first ? 1 : fade;

  // Render through next/image (fill + object-cover). With a transform-only
  // reveal there is no per-frame repaint, so source resolution no longer costs
  // scroll performance — we can keep quality high for a crisp full-bleed image.
  return (
    <motion.div
      aria-hidden
      className="absolute inset-0 overflow-hidden"
      style={{ scale, x, y, opacity, borderRadius: radius, willChange: "transform" }}
    >
      <Image
        src={image}
        alt=""
        fill
        sizes="100vw"
        quality={85}
        priority={first}
        className="object-cover object-center"
        draggable={false}
      />
    </motion.div>
  );
}

function StepText({
  progress,
  index,
  total,
  num,
  title,
  body,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  num: string;
  title: string;
  body: React.ReactNode;
}) {
  const slot = 1 / total;
  const slotStart = index * slot;
  const slotEnd = (index + 1) * slot;
  const last = index === total - 1;
  // Text resolves once its image has finished expanding — for the first image
  // that means after its card has grown to full-bleed (~0.16), so white text
  // never lands on the cream card. Land it a touch earlier than the image
  // finishes so the copy is fully opaque while that image sits full-bleed.
  const inAt = index === 0 ? 0.19 : slotStart + slot * 0.3;
  const outAt = last ? 1 : slotEnd - slot * 0.12;

  const opacity = useTransform(
    progress,
    last ? seq([inAt - 0.04, inAt + 0.04]) : seq([inAt - 0.04, inAt + 0.04, outAt - 0.04, outAt + 0.02]),
    last ? [0, 1] : [0, 1, 1, 0]
  );
  const yNum = useTransform(progress, seq([inAt - 0.05, inAt + 0.03]), [30, 0]);
  const yTitle = useTransform(progress, seq([inAt - 0.05, inAt + 0.05]), [55, 0]);
  const yBody = useTransform(progress, seq([inAt - 0.05, inAt + 0.08]), [90, 0]);

  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute inset-0 flex flex-col justify-center px-8 md:px-14 lg:px-24"
    >
      <div className="max-w-md">
        <motion.span style={{ y: yNum }} className="block font-display text-xs font-bold uppercase tracking-[0.45em] text-gold-3">
          {num}
        </motion.span>
        <motion.h3 style={{ y: yTitle }} className="mt-3 font-editorial text-4xl italic leading-tight text-white [text-shadow:0_2px_20px_rgba(9,59,63,0.6)] md:text-5xl">
          {title}
        </motion.h3>
        <motion.p style={{ y: yBody }} className="mt-4 text-pretty text-sm font-light leading-relaxed text-sand-4 [text-shadow:0_1px_14px_rgba(9,59,63,0.55)] md:text-base">
          {body}
        </motion.p>
      </div>
    </motion.div>
  );
}

function Chrome({ progress, label }: { progress: MotionValue<number>; label?: string }) {
  // Hold off until the first image has filled the stage (~0.16), so the teal
  // scrim and gold label never sit over the cream card.
  const opacity = useTransform(progress, seq([0.14, 0.2]), [0, 1]);
  return (
    <>
      <motion.div
        style={{ opacity }}
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,rgba(9,59,63,0.92)_0%,rgba(9,59,63,0.72)_34%,rgba(9,59,63,0.28)_64%,transparent_92%)]"
      />
      {label ? (
        <motion.div
          style={{ opacity }}
          className="pointer-events-none absolute left-0 top-1/2 flex -translate-y-[120px] items-center gap-4 px-8 md:-translate-y-[168px] md:px-14 lg:px-24"
        >
          <span className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.34em] text-gold-3 [text-shadow:0_1px_12px_rgba(9,59,63,0.6)]">
            {label}
          </span>
          <span className="h-px w-16 bg-gradient-to-r from-gold/60 to-transparent" />
        </motion.div>
      ) : null}
    </>
  );
}
