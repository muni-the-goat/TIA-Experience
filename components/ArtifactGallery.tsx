"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { artifacts, type Artifact } from "@/lib/data";
import { ArtImg } from "./ArtImg";
import { ArtifactLightbox } from "./ArtifactLightbox";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* ──────────────────────────────────────────────────────────────
   Scattered background field — faint airport concept sketches plus
   a few small artifact photos, drifting with parallax like Getty's
   floating archive. Deterministic positions (SSR-safe). `top` is a %
   of the whole section height; `speed` is parallax travel in yPercent.
   ────────────────────────────────────────────────────────────── */
// Horizontal position is anchored to the *nearest* screen edge: left-lane items
// carry `left`, right-lane items carry `right` (so their width extends inward and
// never bleeds off-screen). `mob` marks the gutter-hugging items kept on mobile.
// `depth` (0 = far, 1 = near) is the single value every depth cue — size,
// opacity, scroll parallax, mouse drift — derives from, so the cues agree.
type Pos = { left?: number; right?: number; mob: boolean; depth: number };
type Sketch = Pos & {
  kind: "sketch";
  src: string;
  top: number;
  w: number;
  op: number;
  speed: number;
  rot?: number;
};
type Float = Pos & {
  kind: "art";
  ref: number;
  top: number;
  w: number;
  rot: number;
  op: number;
  speed: number;
};
type Photo = Pos & {
  kind: "photo";
  src: string;
  top: number;
  w: number;
  op: number;
  speed: number;
  rot?: number;
};
// Transparent bas-relief panels (Khmer carvings, cut out on a clear
// background). Rendered edge-free like the sketches — no box, shadow or crop —
// so the carved figures float in the field rather than sitting in rectangles.
type Relief = Pos & {
  kind: "relief";
  src: string;
  top: number;
  w: number;
  op: number;
  speed: number;
  rot?: number;
};
type Scatter = Sketch | Float | Photo | Relief;

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

// Cut-out Khmer bas-relief panels (transparent background).
const RELIEF = {
  apsaraPray: "/artifacts/A7400184.webp",
  apsaraGate: "/artifacts/A7400203.webp",
  apsaraCourt: "/artifacts/A7400213.webp",
  apsaraTemple: "/artifacts/A7400221b.webp",
};

const PHOTO_SRCS = Object.values(PH);
const SKETCH_SRCS = Object.values(SK);
const RELIEF_SRCS = Object.values(RELIEF);

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
// Each lane hugs one screen edge, measured as a % distance *from that edge*, so
// right-lane items anchor via `right` and extend inward — never bleeding off.
const LANES = [
  { edge: "l" as const, base: 1, far: true }, // far-left  (flush to gutter)
  { edge: "r" as const, base: 1, far: true }, // far-right (flush to gutter)
  { edge: "l" as const, base: 13, far: false }, // mid-left
  { edge: "r" as const, base: 15, far: false }, // mid-right
];

const lerp = (t: number, lo: number, hi: number) => lo + t * (hi - lo);

// Scroll parallax from depth (Getty's perspective camera, faked in 1D):
// far planes lag the page (positive yPercent — pinned to the backdrop),
// near planes race ahead of it. One consistent direction per depth, with a
// small jitter so same-plane items don't march in lockstep.
const speedFor = (depth: number, jitter: number) =>
  28 - depth * 100 + (jitter - 0.5) * 12;

// Which kind an index becomes (order matters — art wins over sketch over
// relief). Split out so the relief pre-pass below and the build loop agree.
type Meta = { i: number; roll: number; isFar: boolean };
const kindOf = ({ i, roll, isFar }: Meta) =>
  i % 8 === 3 ? "art" : roll < 0.3 && isFar ? "sketch" : i % 5 === 1 && isFar ? "relief" : "photo";

function buildScatter(): Scatter[] {
  const N = 64;
  const out: Scatter[] = [];

  // Pre-pass: where the reliefs land. Each carving is ~10× the area of a
  // photo, so anything sharing its column would show through the overlap as
  // mush — pass 2 keeps a clearance zone (in section-% terms) around each.
  const reliefSpots: { edge: "l" | "r"; top: number }[] = [];
  for (let i = 0; i < N; i++) {
    const a = rand(i * 12.9898 + 4.1);
    const roll = rand(i * 5.77 + 2.3);
    const laneDef = LANES[i % LANES.length];
    if (kindOf({ i, roll, isFar: laneDef.far }) === "relief") {
      const top = Math.max(1, Math.min(99, ((i + 0.5) / N) * 100 + (a - 0.5) * (90 / N)));
      reliefSpots.push({ edge: laneDef.edge, top });
    }
  }
  // Asymmetric window: the image extends *downward* from its top anchor, and
  // fast near-plane parallax pulls it a little upward past neighbours.
  const CLEAR_UP = 4;
  const CLEAR_DOWN = 8;

  for (let i = 0; i < N; i++) {
    const a = rand(i * 12.9898 + 4.1);
    const b = rand(i * 78.233 + 1.7);
    const c = rand(i * 3.17 + 9.2);
    const d = rand(i * 27.61 + 5.5);
    const roll = rand(i * 5.77 + 2.3);

    const laneDef = LANES[i % LANES.length];
    const isFar = laneDef.far;
    const kind = kindOf({ i, roll, isFar });

    // Monotonic vertical march + tiny jitter so rows never band up.
    const top = Math.max(1, Math.min(99, ((i + 0.5) / N) * 100 + (a - 0.5) * (90 / N)));
    const off = Math.max(0, laneDef.base + (b - 0.5) * 4); // ±2 jitter, clamped ≥0
    const pos = laneDef.edge === "l" ? { left: off } : { right: off };
    const mob = isFar; // gutter-hugging items are the ones kept on mobile
    const rot = 0; // keep scattered images upright (no tilt)

    // Drop items that would sit inside a relief's clearance zone on the same
    // side — breathing room around the carvings beats raw field density.
    if (
      kind !== "relief" &&
      reliefSpots.some(
        (r) => r.edge === laneDef.edge && top > r.top - CLEAR_UP && top < r.top + CLEAR_DOWN
      )
    ) {
      continue;
    }

    // Each kind occupies one depth band; `t` is the item's position within
    // its band and drives size + opacity together (atmospheric perspective:
    // farther = smaller = more faded toward the #fbfaf8 paper).
    if (kind === "art") {
      // Clickable artifact thumbnail — mid plane, kept legible to invite the tap.
      const t = b;
      const depth = lerp(t, 0.4, 0.62);
      out.push({
        kind: "art",
        ref: Math.floor(roll * artifacts.length),
        top,
        ...pos,
        mob,
        depth,
        w: Math.round(lerp(t, 96, 150)),
        rot,
        op: lerp(t, 0.45, 0.62),
        speed: speedFor(depth, d),
      });
    } else if (kind === "sketch") {
      // Airport line-sketch — the farthest plane, a near-watermark backdrop.
      const t = a;
      const depth = lerp(t, 0, 0.18);
      out.push({
        kind: "sketch",
        src: SKETCH_SRCS[Math.floor(b * SKETCH_SRCS.length)],
        top,
        ...pos,
        mob,
        depth,
        w: 200 + Math.round(c * 200),
        op: lerp(t, 0.06, 0.14),
        speed: speedFor(depth, b),
        rot,
      });
    } else if (kind === "relief") {
      // Cut-out bas-relief carving — the near plane. Largest, near-opaque and
      // fastest travel: when something passes behind it, the carving occludes
      // it (translucency here reads as two images mushed together, not
      // depth). Far lanes only, so the carvings live in the gutters and
      // bleed off-frame. The transparent canvas is landscape with the figure
      // centred, so the extra width is what lets the carving itself read big.
      const t = b;
      const depth = lerp(t, 0.8, 1);
      const nearOff = laneDef.base - 10 + (b - 0.5) * 4;
      out.push({
        kind: "relief",
        src: RELIEF_SRCS[Math.floor(c * RELIEF_SRCS.length)],
        top,
        ...(laneDef.edge === "l" ? { left: nearOff } : { right: nearOff }),
        mob,
        depth,
        w: Math.round(lerp(t, 520, 840)),
        op: lerp(t, 0.85, 1),
        speed: speedFor(depth, d),
        rot,
      });
    } else {
      // Supporting airport photo — mid-far plane, faded hard toward the paper.
      const t = c;
      const depth = lerp(t, 0.25, 0.6);
      out.push({
        kind: "photo",
        src: PHOTO_SRCS[Math.floor(d * PHOTO_SRCS.length)],
        top,
        ...pos,
        mob,
        depth,
        w: Math.round(lerp(t, 120, 205)),
        op: lerp(t, 0.14, 0.4),
        speed: speedFor(depth, d),
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

      // The progress indicator is position:fixed, so it stays on screen for
      // the whole page — only show it while the gallery itself is in view,
      // otherwise it overlaps the treasure-hunt section below.
      gsap.set(".tia-progress", { autoAlpha: 0 });
      ScrollTrigger.create({
        trigger: root.current,
        start: "top 60%",
        end: "bottom 60%",
        onToggle: (self) =>
          gsap.to(".tia-progress", {
            autoAlpha: self.isActive ? 1 : 0,
            duration: 0.3,
            overwrite: "auto",
          }),
      });

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

      // Getty-style "camera" drift — the cursor nudges the whole field, near
      // planes more than far ones, spring-smoothed with quickTo so the
      // collage floats with inertia instead of tracking the mouse 1:1.
      // Desktop pointers only; scroll parallax owns yPercent, this owns x/y,
      // so the two compose without fighting.
      if (!reduce && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        const layers = gsap.utils.toArray<HTMLElement>(".scatter").map((el) => ({
          depth: Number(el.dataset.depth ?? 0),
          toX: gsap.quickTo(el, "x", { duration: 1.2, ease: "power3" }),
          toY: gsap.quickTo(el, "y", { duration: 1.2, ease: "power3" }),
        }));
        const drift = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          for (const l of layers) {
            // Counter-move (like a camera pan): near planes sweep further.
            l.toX(-nx * l.depth * 44);
            l.toY(-ny * l.depth * 28);
          }
        };
        window.addEventListener("pointermove", drift, { passive: true });
        return () => window.removeEventListener("pointermove", drift);
      }
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
          // Gutter-hugging items frame the centre — keep those on mobile; hide
          // the busier mid-lane clutter below md.
          const vis = s.mob ? "" : "hidden md:block";
          // Anchor to whichever edge the item was assigned (left or right).
          const hx = s.left != null ? { left: `${s.left}%` } : { right: `${s.right}%` };
          return s.kind === "sketch" || s.kind === "relief" ? (
            // Transparent cut-outs (line sketches + bas-relief panels) — no
            // box, shadow or crop, so only the artwork itself shows. Reliefs
            // are the near plane: stacked above the rest and softly blurred
            // (out-of-focus foreground) so the field reads with depth.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={s.src}
              alt=""
              loading="lazy"
              draggable={false}
              data-speed={s.speed}
              data-depth={s.depth}
              className={`scatter absolute select-none ${s.kind === "relief" ? "z-10" : ""} ${vis}`}
              style={{
                top: `${s.top}%`,
                ...hx,
                width: s.kind === "relief" ? `min(${s.w}px, 88vw)` : s.w,
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
              data-depth={s.depth}
              className={`scatter absolute select-none rounded-sm object-cover shadow-[0_18px_50px_-30px_rgba(9,59,63,0.45)] grayscale-[0.12] ${vis}`}
              style={{
                top: `${s.top}%`,
                ...hx,
                opacity: s.op,
                rotate: `${s.rot ?? 0}deg`,
              }}
            />
          ) : (
            <button
              key={i}
              type="button"
              data-speed={s.speed}
              data-depth={s.depth}
              data-cursor
              onClick={() => setLightbox(artifacts[s.ref])}
              aria-label={`View ${artifacts[s.ref].name}`}
              // No CSS transition on transform here — GSAP owns this element's
              // transform (scroll yPercent + mouse x/y) and a CSS transition
              // would re-smooth every frame into lag. Hover scale lives on the
              // inner image instead.
              className={`scatter group pointer-events-auto absolute overflow-hidden rounded-sm shadow-[0_18px_50px_-30px_rgba(9,59,63,0.5)] transition-opacity duration-500 hover:!opacity-100 ${vis}`}
              style={{
                top: `${s.top}%`,
                ...hx,
                width: s.w,
                rotate: `${s.rot}deg`,
                opacity: s.op,
              }}
            >
              <ArtImg
                a={artifacts[s.ref]}
                className="aspect-[3/4] w-full"
                imgClassName="aspect-[3/4] w-full object-cover grayscale-[0.15] transition-[filter,transform] duration-500 group-hover:scale-[1.04] group-hover:grayscale-0"
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
        <div className="tia-stage-h pointer-events-none sticky top-0 z-10 flex flex-col items-center justify-center px-6">
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
                  imgClassName="h-full w-full object-cover object-[center_25%] transition-transform [transition-duration:1200ms] ease-out group-hover:scale-[1.04]"
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
        <div className="tia-stage-mt" aria-hidden>
          {artifacts.map((a, i) => (
            <div key={a.id} data-idx={i} className="chapter tia-stage-h" />
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
        className="tia-progress pointer-events-none fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 items-center gap-3 lg:flex"
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

      {/* ── Lightbox — Radix Dialog a11y, Motion-driven "resolve into focus" ── */}
      <ArtifactLightbox artifact={lightbox} onOpenChange={(o) => !o && setLightbox(null)} />
    </section>
  );
}
