"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { treasures, huntSteps, type Treasure } from "@/lib/data";
import { Motif } from "./KhmerMotifs";

gsap.registerPlugin(ScrollTrigger, useGSAP, MotionPathPlugin);

const STORAGE_KEY = "tia-treasures";

// Seal motif per treasure index (1-5)
const SEALS = ["naga", "apsara", "garuda", "lotus", "temple"] as const;

// Clockwise rounded-rectangle path for the border-tracing creature
function roundedRectPath(x: number, y: number, w: number, h: number, r: number) {
  return (
    `M ${x + r},${y} H ${x + w - r} A ${r},${r} 0 0 1 ${x + w},${y + r} ` +
    `V ${y + h - r} A ${r},${r} 0 0 1 ${x + w - r},${y + h} ` +
    `H ${x + r} A ${r},${r} 0 0 1 ${x},${y + h - r} ` +
    `V ${y + r} A ${r},${r} 0 0 1 ${x + r},${y} Z`
  );
}

export default function TreasureHunt() {
  const root = useRef<HTMLDivElement>(null);
  const burstLayer = useRef<HTMLDivElement>(null);
  const sealsRef = useRef<HTMLDivElement>(null);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Treasure | null>(null);
  const [hintShown, setHintShown] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const complete = hydrated && found.size === treasures.length;

  // ── Load / persist progress ──
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setFound(new Set(JSON.parse(raw)));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify([...found]));
  }, [found, hydrated]);

  // ── Celebration burst ──
  const fireBurst = useCallback(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !burstLayer.current) return;
    const layer = burstLayer.current;
    const colors = ["#D6A63A", "#E2C384", "#EDE1CE", "#3C6669"];
    for (let i = 0; i < 60; i++) {
      const p = document.createElement("span");
      p.className = "absolute left-1/2 top-1/2 block h-2 w-2 rounded-[1px]";
      p.style.background = colors[i % colors.length];
      layer.appendChild(p);
      gsap.fromTo(
        p,
        { x: 0, y: 0, opacity: 1, scale: gsap.utils.random(0.6, 1.4) },
        {
          x: gsap.utils.random(-window.innerWidth / 2, window.innerWidth / 2),
          y: gsap.utils.random(-window.innerHeight / 2, window.innerHeight / 3),
          rotation: gsap.utils.random(-360, 360),
          opacity: 0,
          duration: gsap.utils.random(1.1, 2.2),
          ease: "power3.out",
          onComplete: () => p.remove(),
        }
      );
    }
  }, []);

  const toggleFound = (t: Treasure) => {
    setFound((prev) => {
      const next = new Set(prev);
      if (next.has(t.id)) {
        next.delete(t.id);
      } else {
        next.add(t.id);
        if (next.size === treasures.length) setTimeout(fireBurst, 150);
      }
      return next;
    });
  };

  const reset = () => setFound(new Set());

  const openClue = (t: Treasure) => {
    setSelected(t);
    setHintShown(false);
  };

  // ── Escape closes the modal ──
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  // ── Entrance + modal animations ──
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".th-head > *", {
          y: 30,
          opacity: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".th-head", start: "top 82%" },
        });
        gsap.from(".th-step", {
          y: 36,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: { trigger: ".th-steps", start: "top 82%" },
        });
        gsap.fromTo(
          ".th-mapwrap",
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: { trigger: ".th-mapwrap", start: "top 85%" },
          }
        );
        gsap.fromTo(
          ".th-clue",
          { x: 30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.08,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: { trigger: ".th-mapwrap", start: "top 80%" },
          }
        );
      });
    },
    { scope: root }
  );

  // animate modal in + send the themed creature around the border
  const modalRef = useRef<HTMLDivElement>(null);
  const creatureRef = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    if (!selected || !modalRef.current) return;

    gsap.fromTo(
      modalRef.current,
      { y: 30, opacity: 0, scale: 0.97 },
      { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: "power3.out" }
    );

    if (!creatureRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set(creatureRef.current, { autoAlpha: 0 });
      return;
    }

    const panel = modalRef.current;
    const inset = 6;
    const w = panel.offsetWidth - inset * 2;
    const h = panel.offsetHeight - inset * 2;
    if (w <= 0 || h <= 0) return;
    const path = roundedRectPath(inset, inset, w, h, 22);

    gsap.set(creatureRef.current, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    gsap.to(creatureRef.current, { autoAlpha: 1, duration: 0.5, delay: 0.35 });
    gsap.to(creatureRef.current, {
      duration: 8,
      repeat: -1,
      ease: "none",
      motionPath: { path, autoRotate: 90 },
    });
  }, [selected]);

  return (
    <section ref={root} id="treasure-hunt" className="relative overflow-hidden bg-sand-5 py-28 md:py-36">
      {/* celebration layer */}
      <div ref={burstLayer} className="pointer-events-none fixed inset-0 z-[700]" aria-hidden />

      <div className="mx-auto max-w-content px-6">
        {/* Header */}
        <div className="th-head max-w-3xl">
          <p className="mb-5 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-brown">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-gold text-[11px] leading-none tracking-normal text-white">02</span>
            The Treasure Hunt
          </p>
          <h2 className="font-display text-5xl font-black leading-[0.95] tracking-tight text-teal md:text-7xl">
            Hunt for treasure <br />
            <span className="gold-text">across the airport.</span>
          </h2>
          <p className="mt-6 max-w-xl text-pretty text-lg font-light leading-relaxed text-teal-2">
            Five legendary treasures are hidden throughout Techo International Airport. Solve each
            riddle, explore the terminal, and collect every seal to unlock your reward.
          </p>
        </div>

        {/* How it works */}
        <div className="th-steps mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {huntSteps.map((s) => (
            <div
              key={s.step}
              className="th-step rounded-2xl border border-teal/10 bg-white/60 p-6 transition-colors hover:border-gold/40"
            >
              <div className="font-display text-3xl font-black text-gold/40">{s.step}</div>
              <h3 className="mt-3 font-display text-lg font-bold text-teal">{s.title}</h3>
              <p className="mt-2 text-sm font-light leading-relaxed text-teal-2">{s.body}</p>
            </div>
          ))}
        </div>

        {/* Progress + seals */}
        <div className="mt-20 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-display text-2xl font-bold text-teal">Your Heritage Passport</h3>
            <p className="text-sm text-brown">
              {complete
                ? "Complete — every treasure found!"
                : `${found.size} of ${treasures.length} treasures found`}
            </p>
          </div>
          <div ref={sealsRef} className="flex items-center gap-3">
            {treasures.map((t) => {
              const got = found.has(t.id);
              return (
                <div
                  key={t.id}
                  title={got ? t.reward : "Not found yet"}
                  className={`grid h-12 w-12 place-items-center rounded-full border-2 transition-all duration-500 ${
                    got
                      ? "border-gold bg-gold/15 shadow-[0_0_20px_rgba(214,166,58,0.45)]"
                      : "border-dashed border-teal/25 opacity-50"
                  }`}
                >
                  <Motif kind={SEALS[t.index - 1]} className="h-7 w-7" stroke={got ? "#D6A63A" : "#093B3F"} />
                </div>
              );
            })}
            {found.size > 0 && (
              <button
                onClick={reset}
                className="ml-2 text-xs font-medium text-brown underline-offset-4 hover:underline"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Interactive 3D map + clue list */}
        <div className="th-mapwrap mt-8 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
          {/* Live Mappedin 3D terminal map */}
          <div className="relative min-h-[440px] overflow-hidden rounded-3xl border border-gold/30 bg-teal lg:min-h-[580px]">
            <iframe
              src="https://app.mappedin.com/map/68be4b135e313c000bd16ebd"
              title="Techo International Airport — interactive 3D terminal map"
              loading="lazy"
              allow="fullscreen; accelerometer; gyroscope; magnetometer"
              className="absolute inset-0 h-full w-full border-0"
            />
            <span className="pointer-events-none absolute left-5 top-4 z-10 rounded-full bg-sand-5/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-brown backdrop-blur-sm">
              Explore the terminal in 3D
            </span>

            {/* completion overlay */}
            {complete && (
              <div className="absolute inset-0 z-20 grid place-items-center bg-gold/95 backdrop-blur-sm">
                <div className="px-6 text-center">
                  <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full border-2 border-teal bg-white">
                    <Motif kind="temple" className="h-9 w-9" stroke="#093B3F" />
                  </div>
                  <h3 className="font-display text-3xl font-black text-teal">Treasure Hunt Complete</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-teal-2">
                    You found all five seals of Angkor. Show this screen at the Heritage Walk gift
                    pavilion to claim your commemorative keepsake.
                  </p>
                  <button
                    onClick={reset}
                    className="mt-5 rounded-full border border-teal/50 px-5 py-2 text-sm font-semibold text-teal hover:bg-teal hover:text-gold"
                    data-cursor
                  >
                    Play again
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Treasure clue list */}
          <div className="flex flex-col">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-brown">
              Treasure Clues
            </p>
            <div className="flex flex-col gap-3">
              {treasures.map((t) => {
                const got = found.has(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => openClue(t)}
                    data-cursor
                    aria-label={`Treasure ${t.index}: ${t.zone}${got ? " (found)" : ""}`}
                    className={`th-clue group flex items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300 ${
                      got
                        ? "border-gold/50 bg-gold/10"
                        : "border-teal/10 bg-white hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-md"
                    }`}
                  >
                    <span
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 ${
                        got ? "border-gold bg-gold/15" : "border-teal/15"
                      }`}
                    >
                      {got ? (
                        <span className="text-lg font-bold text-gold">✓</span>
                      ) : (
                        <Motif kind={SEALS[t.index - 1]} className="h-6 w-6" stroke="#093B3F" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-brown">
                        Treasure {t.index} · {t.zone}
                      </span>
                      <span className="block truncate font-display text-base font-bold text-teal">
                        {t.title}
                      </span>
                    </span>
                    <span className="shrink-0 text-brown transition-transform group-hover:translate-x-1">
                      {got ? "" : "→"}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-brown">
              Tap a clue to reveal its riddle, then explore the 3D map to track it down.
            </p>
          </div>
        </div>
      </div>

      {/* Clue modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[750] flex items-end justify-center p-0 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clue-title"
        >
          <div
            className="absolute inset-0 bg-teal/60 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div
            ref={modalRef}
            className="relative w-full max-w-lg rounded-t-3xl border border-gold/30 bg-sand-5 p-7 shadow-2xl sm:rounded-3xl md:p-9"
          >
            {/* Naga dragon gliding around the border */}
            <div
              ref={creatureRef}
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 z-20 h-14 w-14 [filter:drop-shadow(0_0_8px_rgba(214,166,58,0.85))]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/naga-sprite.png"
                alt=""
                draggable={false}
                className="naga-alive h-full w-full select-none object-contain"
              />
            </div>

            <button
              onClick={() => setSelected(null)}
              className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-teal/60 hover:bg-sand-4 hover:text-teal"
              aria-label="Close clue"
              data-cursor
            >
              ✕
            </button>

            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">
              Treasure {selected.index} · {selected.zone}
            </p>
            <h3 id="clue-title" className="mt-2 font-display text-3xl font-bold text-teal">
              {selected.title}
            </h3>

            <div className="mt-5 rounded-2xl border-l-2 border-gold bg-white/60 p-5">
              <p className="text-pretty font-display text-lg italic leading-relaxed text-teal-2">
                “{selected.riddle}”
              </p>
            </div>

            {hintShown ? (
              <p className="mt-4 rounded-xl bg-gold/10 px-4 py-3 text-sm text-brown">
                <span className="font-semibold text-teal">Hint · </span>
                {selected.hint}
              </p>
            ) : (
              <button
                onClick={() => setHintShown(true)}
                className="mt-4 text-sm font-medium text-brown underline-offset-4 hover:underline"
              >
                Need a hint?
              </button>
            )}

            <div className="mt-7 flex items-center gap-3">
              <button
                onClick={() => {
                  toggleFound(selected);
                  if (!found.has(selected.id)) setSelected(null);
                }}
                className={`flex-1 rounded-full px-6 py-3.5 text-sm font-semibold transition-colors ${
                  found.has(selected.id)
                    ? "border border-teal/30 text-teal hover:bg-sand-4"
                    : "bg-gold text-teal hover:bg-gold-2"
                }`}
                data-cursor
              >
                {found.has(selected.id) ? "Mark as not found" : `I found the ${selected.reward}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
