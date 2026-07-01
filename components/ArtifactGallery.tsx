"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { artifacts, type Artifact } from "@/lib/data";
import { Motif } from "./KhmerMotifs";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ──────────────────────────────────────────────────────────────
   Image with graceful fall-back to the inline SVG motif.
   ────────────────────────────────────────────────────────────── */
function ArtImg({
  a,
  className,
  imgClassName,
}: {
  a: Artifact;
  className?: string;
  imgClassName?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = a.image && !failed;

  if (showImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={a.image}
        alt={`${a.name} — ${a.era}, ${a.origin}`}
        loading="lazy"
        onError={() => setFailed(true)}
        className={imgClassName}
      />
    );
  }
  return (
    <div className={`grid place-items-center bg-sand-4 ${className ?? ""}`}>
      <Motif kind={a.motif} className="h-1/2 w-1/2" stroke="#C9A24A" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Scattered background field — faint airport concept sketches plus
   a few small artifact photos, drifting with parallax like Getty's
   floating archive. Deterministic positions (SSR-safe). `top` is a %
   of the whole section height; `speed` is parallax travel in yPercent.
   ────────────────────────────────────────────────────────────── */
type Sketch = {
  kind: "sketch";
  src: string;
  top: number;
  left: number;
  w: number;
  op: number;
  speed: number;
  rot?: number;
};
type Float = {
  kind: "art";
  ref: number;
  top: number;
  left: number;
  w: number;
  rot: number;
  op: number;
  speed: number;
};
type Photo = {
  kind: "photo";
  src: string;
  top: number;
  left: number;
  w: number;
  op: number;
  speed: number;
  rot?: number;
};
type Scatter = Sketch | Float | Photo;

// Airport concept sketches (gold & pencil line-art on transparent bg).
const SK = {
  plane: "/sketch-photo/aircraft.png",
  tower: "/sketch-photo/Control%20tower.png",
  terminalGold: "/sketch-photo/gold.png",
  terminalInk: "/sketch-photo/good.png",
  apron: "/sketch-photo/ggv.png",
};

// Supporting airport photos (terminal, atrium, exhibition) — the mid layer.
const PH = {
  exterior: "/artifacts/A7400079.webp",
  facade: "/artifacts/A7400221.webp",
  apron: "/artifacts/A7400237.webp",
  atrium: "/artifacts/DJI_0293.webp",
  aerial: "/artifacts/DJI_0299.webp",
  hall: "/artifacts/DSC00062.webp",
  interior: "/artifacts/DSC07493-Enhanced-NR.webp",
  lounge: "/artifacts/DSC08151.webp",
  gate: "/artifacts/DSC08155.webp",
  sunset: "/artifacts/TIA_Sunset_V2.webp",
};

const PHOTO_SRCS = Object.values(PH);
const SKETCH_SRCS = Object.values(SK);

// Stable pseudo-random (identical on server & client → no hydration mismatch).
const rand = (seed: number) => {
  const x = Math.sin(seed) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Build a dense floating field (Getty "Tracing Art" feel) without collisions.
 *
 * Images are dropped into vertical "lanes" down the left/right gutters (the
 * centre is left clear for the focal card + text). Consecutive items alternate
 * far-left → far-right → mid-left → mid-right, so vertical neighbours always
 * sit on opposite sides, and same-lane items are many rows apart — keeping the
 * field busy yet non-overlapping. `top` is a % of the whole (very tall)
 * section; positions are deterministic so SSR and client markup match.
 */
const LANES = [-4, 92, 13, 79]; // far-left, far-right, mid-left, mid-right

function buildScatter(): Scatter[] {
  const N = 64;
  const out: Scatter[] = [];

  for (let i = 0; i < N; i++) {
    const a = rand(i * 12.9898 + 4.1);
    const b = rand(i * 78.233 + 1.7);
    const c = rand(i * 3.17 + 9.2);
    const d = rand(i * 27.61 + 5.5);
    const roll = rand(i * 5.77 + 2.3);

    const lane = LANES[i % LANES.length];
    const isFar = lane < 0 || lane > 90;

    // Monotonic vertical march + tiny jitter so rows never band up.
    const top = Math.max(1, Math.min(99, ((i + 0.5) / N) * 100 + (a - 0.5) * (90 / N)));
    const left = lane + (b - 0.5) * 4; // ±2 horizontal jitter
    const rot = (c - 0.5) * 12;
    const speed = (d - 0.5) * 78; // parallax travel

    if (i % 8 === 3) {
      // Clickable artifact thumbnail.
      out.push({
        kind: "art",
        ref: Math.floor(roll * artifacts.length),
        top,
        left: Math.max(0, Math.min(88, left)),
        w: 100 + Math.round(a * 34),
        rot,
        op: 0.42 + c * 0.14,
        speed,
      });
    } else if (roll < 0.36 && isFar) {
      // Faint airport line-sketch — only in the far lanes (free to bleed off-edge).
      out.push({
        kind: "sketch",
        src: SKETCH_SRCS[Math.floor(b * SKETCH_SRCS.length)],
        top,
        left,
        w: 200 + Math.round(c * 200),
        op: 0.1 + a * 0.12,
        speed,
        rot: rot * 0.5,
      });
    } else {
      // Supporting airport photo.
      out.push({
        kind: "photo",
        src: PHOTO_SRCS[Math.floor(d * PHOTO_SRCS.length)],
        top,
        left,
        w: 150 + Math.round(b * 60),
        op: (isFar ? 0.32 : 0.28) + c * 0.14,
        speed,
        rot,
      });
    }
  }

  return out;
}

const SCATTER: Scatter[] = buildScatter();

export default function ArtifactGallery() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<Artifact | null>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Parallax drift of the scattered field.
      if (!reduce) {
        gsap.utils.toArray<HTMLElement>(".scatter").forEach((el) => {
          gsap.to(el, {
            yPercent: Number(el.dataset.speed),
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        });
      }

      // Active chapter tracking — drives the sticky stage + the rail.
      gsap.utils.toArray<HTMLElement>(".chapter").forEach((ch) => {
        const idx = Number(ch.dataset.idx);
        ScrollTrigger.create({
          trigger: ch,
          start: "top center",
          end: "bottom center",
          onToggle: (self) => self.isActive && setActive(idx),
        });
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="artifacts"
      className="relative bg-[#fbfaf8] text-teal"
    >
      {/* ── Scattered floating field ──
          Getty "Tracing Art" ambient layer: faint artworks drift past with
          parallax. On mobile only the edge-bleeding (far-lane) items are shown
          so the focal card keeps a clear centre; the busier mid-lane items are
          desktop-only. Clipped by its own wrapper so the section can keep
          position:sticky (an overflow-hidden ancestor would break it). */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
        {SCATTER.map((s, i) => {
          // Items hugging the gutters bleed off-screen and frame the centre —
          // keep those on mobile; hide the central-lane clutter below md.
          const edge = s.kind === "sketch" || s.left <= 8 || s.left >= 82;
          const vis = edge ? "" : "hidden md:block";
          return s.kind === "sketch" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={s.src}
              alt=""
              loading="lazy"
              draggable={false}
              data-speed={s.speed}
              className={`scatter absolute select-none ${vis}`}
              style={{
                top: `${s.top}%`,
                left: `${s.left}%`,
                width: s.w,
                opacity: s.op,
                rotate: `${s.rot ?? 0}deg`,
              }}
            />
          ) : s.kind === "photo" ? (
            <Image
              key={i}
              src={s.src}
              alt=""
              width={s.w}
              height={Math.round(s.w * 0.62)}
              loading="lazy"
              sizes={`${s.w}px`}
              draggable={false}
              data-speed={s.speed}
              className={`scatter absolute select-none rounded-sm object-cover shadow-[0_18px_50px_-30px_rgba(9,59,63,0.45)] grayscale-[0.12] ${vis}`}
              style={{
                top: `${s.top}%`,
                left: `${s.left}%`,
                opacity: s.op,
                rotate: `${s.rot ?? 0}deg`,
              }}
            />
          ) : (
            <button
              key={i}
              type="button"
              data-speed={s.speed}
              data-cursor
              onClick={() => setLightbox(artifacts[s.ref])}
              aria-label={`View ${artifacts[s.ref].name}`}
              className={`scatter group pointer-events-auto absolute overflow-hidden rounded-sm shadow-[0_18px_50px_-30px_rgba(9,59,63,0.5)] transition-[opacity,transform] duration-500 hover:!opacity-100 hover:scale-[1.04] ${vis}`}
              style={{
                top: `${s.top}%`,
                left: `${s.left}%`,
                width: s.w,
                rotate: `${s.rot}deg`,
                opacity: s.op,
              }}
            >
              <ArtImg
                a={artifacts[s.ref]}
                className="aspect-[3/4] w-full"
                imgClassName="aspect-[3/4] w-full object-cover grayscale-[0.15] transition-[filter] duration-500 group-hover:grayscale-0"
              />
            </button>
          );
        })}
      </div>

      {/* The collection intro now lives in the hero (it resolves into the
          cleared centre as the hero images ring out), so the gallery opens
          straight into the artifact-by-artifact sticky composition. */}

      {/* ── One sticky composition (image + text) that cross-fades as you
          scroll — the Getty "Tracing Art" focal stage, on every breakpoint.
          Empty spacer sections below provide the scroll distance and drive
          which artifact is active. ── */}
      <div className="relative">
        {/* Sticky stage — image and its description stay together, centred */}
        <div className="pointer-events-none sticky top-0 z-10 flex h-[100svh] flex-col items-center justify-center px-6">
          <div className="relative aspect-[4/5] w-[min(66vw,17rem)] md:w-[min(50vw,12.5rem)]">
            {artifacts.map((a, i) => (
              <button
                key={a.id}
                type="button"
                data-cursor
                onClick={() => setLightbox(a)}
                aria-label={`View ${a.name}`}
                tabIndex={active === i ? 0 : -1}
                className="group absolute inset-0 overflow-hidden rounded-sm shadow-[0_40px_90px_-50px_rgba(9,59,63,0.65)] transition-[opacity,transform] duration-700 ease-out"
                style={{
                  opacity: active === i ? 1 : 0,
                  transform: active === i ? "scale(1)" : "scale(0.94)",
                  // Only the visible card is interactive — otherwise the last
                  // button in the stack would swallow every click.
                  pointerEvents: active === i ? "auto" : "none",
                }}
              >
                <ArtImg
                  a={a}
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover object-[center_25%] transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                />
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-teal/15 to-transparent" />
              </button>
            ))}
          </div>

          {/* Caption + description, cross-fading per artifact, locked under the image */}
          <div
            key={active}
            className="mt-6 max-w-xl text-center md:mt-7"
            style={{ animation: "fadeUp 0.6s var(--ease-tia)" }}
          >
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-brown">
              {artifacts[active].era}
            </p>
            <p className="font-editorial text-2xl italic text-teal">{artifacts[active].name}</p>
            <p className="mt-1 text-xs text-teal-2/70">
              {artifacts[active].origin} · {artifacts[active].material}
            </p>
            <p className="mt-4 text-pretty font-editorial text-base font-medium leading-snug text-teal md:mt-5 md:text-xl">
              {artifacts[active].blurb}
            </p>
          </div>

          {/* Mobile timeline scrubber — Getty-style, pinned to the bottom of the
              stage so it only shows while the gallery is in view. */}
          <div className="absolute inset-x-6 bottom-6 flex items-center gap-3 md:hidden">
            <span className="whitespace-nowrap font-editorial text-xs italic text-teal-2">
              {artifacts[active].index} / {String(artifacts.length).padStart(2, "0")}
            </span>
            <span className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-teal/15">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-gold transition-all duration-500 ease-out"
                style={{ width: `${((active + 1) / artifacts.length) * 100}%` }}
              />
            </span>
          </div>
        </div>

        {/* Invisible spacers — one screen per artifact — drive the active state */}
        <div className="-mt-[100svh]" aria-hidden>
          {artifacts.map((a, i) => (
            <div key={a.id} data-idx={i} className="chapter h-[100svh]" />
          ))}
        </div>
      </div>

      {/* ── End cap → treasure hunt ── */}
      <div className="relative z-10 mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
        <p className="font-editorial text-3xl italic text-brown-3 md:text-4xl">
          That was only the beginning.
        </p>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-teal-2">
          The artifacts are half the story. Five hidden treasures wait across the terminal —
          ready for you to find.
        </p>
        <a
          href="#treasure-hunt"
          data-cursor
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-teal transition-transform hover:scale-105"
        >
          Start the Treasure Hunt →
        </a>
      </div>

      {/* ── Progress indicator (right) — one grouped scroll thumb, Getty-style ── */}
      <div
        aria-hidden
        className="pointer-events-none fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 items-center gap-3 lg:flex"
      >
        <span className="font-editorial text-sm italic text-teal-2">
          {artifacts[active].name}
        </span>
        <span className="relative block h-28 w-[3px] overflow-hidden rounded-full bg-teal/15">
          <span
            className="absolute left-0 w-full rounded-full bg-gold transition-all duration-500 ease-out"
            style={{
              height: `${100 / artifacts.length}%`,
              top: `${(active / (artifacts.length - 1)) * (100 - 100 / artifacts.length)}%`,
            }}
          />
        </span>
      </div>

      {/* ── Lightbox (shadcn Dialog · Radix) ── */}
      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="grid max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-4xl gap-0 overflow-y-auto rounded-2xl p-0 md:max-h-none md:grid-cols-2 md:overflow-hidden">
          {lightbox && (
            <>
              {/* Image — top on mobile, fixed-height left column on desktop */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand-4 sm:aspect-[5/4] md:aspect-auto md:h-[30rem]">
                <ArtImg
                  a={lightbox}
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover object-[center_25%]"
                />
              </div>

              {/* Details */}
              <div className="flex flex-col justify-center p-6 md:p-9">
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-brown">
                  {lightbox.era}
                </p>
                <DialogTitle className="font-editorial text-3xl font-medium leading-tight text-teal md:text-4xl">
                  {lightbox.name}
                </DialogTitle>
                <div className="my-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-teal-2">
                  <span>
                    <span className="font-semibold text-brown-3">Origin · </span>
                    {lightbox.origin}
                  </span>
                  <span>
                    <span className="font-semibold text-brown-3">Material · </span>
                    {lightbox.material}
                  </span>
                </div>
                <DialogDescription className="font-editorial text-lg leading-relaxed text-teal-2 md:text-xl">
                  {lightbox.blurb}
                </DialogDescription>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
