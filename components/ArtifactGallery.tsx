"use client";

import { useRef, useState } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { artifacts, type Artifact } from "@/lib/data";
import { Motif } from "./KhmerMotifs";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Artifact photo with automatic fall-back to the inline SVG motif. */
function ArtifactMedia({ a }: { a: Artifact }) {
  const [failed, setFailed] = useState(false);
  const showImage = a.image && !failed;

  return (
    <div className="art-motif relative mb-6 grid aspect-square w-full place-items-center overflow-hidden rounded-2xl bg-sand-3 md:mb-0 md:h-full md:w-1/2">
      {showImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={a.image}
            alt={`${a.name} — ${a.era}, ${a.origin}`}
            loading="lazy"
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full object-cover object-[center_25%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-teal/25 via-transparent to-transparent" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_40%,rgba(214,166,58,0.18),transparent_70%)]" />
          <Motif kind={a.motif} className="relative h-40 w-40 md:h-56 md:w-56" stroke="#E2C384" />
        </>
      )}
    </div>
  );
}

export default function ArtifactGallery() {
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // ── Desktop: pinned horizontal scroll ──
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current!;
        const getDistance = () => el.scrollWidth - window.innerWidth;

        const tween = gsap.to(el, {
          x: () => -getDistance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => "+=" + getDistance(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              setActive(Math.round(self.progress * (artifacts.length - 1)));
            },
          },
        });

        // Per-card content reveal, driven by the horizontal tween
        gsap.utils.toArray<HTMLElement>(".art-card").forEach((card) => {
          gsap.from(card.querySelectorAll(".art-reveal"), {
            y: 40,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: "left 75%",
            },
          });
          // Artifact pops out (spring scale) rather than wiping in
          gsap.from(card.querySelector(".art-motif"), {
            scale: 0.55,
            autoAlpha: 0,
            duration: 0.9,
            ease: "back.out(1.7)",
            transformOrigin: "50% 50%",
            scrollTrigger: {
              trigger: card,
              containerAnimation: tween,
              start: "left 80%",
            },
          });
        });
      });

      // ── Mobile: simple fade-up per card on vertical scroll ──
      mm.add("(max-width: 767px)", () => {
        gsap.utils.toArray<HTMLElement>(".art-card").forEach((card) => {
          gsap.from(card, {
            y: 50,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: card, start: "top 85%" },
          });
          // Artifact pops out on mobile too
          gsap.from(card.querySelector(".art-motif"), {
            scale: 0.7,
            autoAlpha: 0,
            duration: 0.7,
            ease: "back.out(1.7)",
            transformOrigin: "50% 50%",
            scrollTrigger: { trigger: card, start: "top 80%" },
          });
        });
      });
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="artifacts"
      className="relative overflow-hidden bg-white text-teal"
    >
      {/* Section header (sits above the track on desktop via absolute) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 mx-auto max-w-content px-6 pt-10 md:pt-12">
        <div className="flex items-end justify-between">
          <div>
            <p className="mb-2 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.35em] text-brown">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-gold text-[11px] leading-none tracking-normal text-white">02</span>
              The Collection
            </p>
            <h2 className="font-display text-3xl font-black tracking-tight md:text-5xl">
              Treasures of <span className="gold-text">Cambodia</span>
            </h2>
          </div>
          {/* Progress counter — desktop only */}
          <div className="hidden items-center gap-3 md:flex">
            <span className="font-display text-2xl font-bold text-gold">
              {String(active + 1).padStart(2, "0")}
            </span>
            <span className="h-px w-12 bg-teal/15">
              <span
                className="block h-px bg-gold transition-all duration-300"
                style={{ width: `${((active + 1) / artifacts.length) * 100}%` }}
              />
            </span>
            <span className="text-sm text-teal/40">{String(artifacts.length).padStart(2, "0")}</span>
          </div>
        </div>
      </div>

      {/* Track: vertical on mobile, horizontal (pinned) on desktop */}
      <div className="md:flex md:min-h-dvh md:items-center">
        <div
          ref={track}
          className="flex flex-col gap-6 px-6 pb-20 pt-44 md:w-max md:flex-row md:items-center md:gap-10 md:px-[8vw] md:pb-0 md:pt-0"
        >
          {artifacts.map((a, i) => (
            <article
              key={a.id}
              className="art-card group relative w-full shrink-0 overflow-hidden rounded-3xl border border-teal/10 bg-white p-7 shadow-[0_24px_70px_-35px_rgba(9,59,63,0.35)] md:h-[64vh] md:w-[58vw] md:p-12 lg:w-[46vw]"
              style={{
                background: `linear-gradient(150deg, ${a.hue}1f 0%, #ffffff 58%)`,
              }}
            >
              {/* giant index watermark */}
              <span className="pointer-events-none absolute -right-4 -top-10 font-display text-[12rem] font-black leading-none text-teal/[0.05] md:text-[20rem]">
                {a.index}
              </span>

              <div className="relative flex h-full flex-col md:flex-row md:items-center md:gap-10">
                {/* Artifact photo (falls back to SVG motif) */}
                <ArtifactMedia a={a} />

                {/* Text */}
                <div className="md:w-1/2">
                  <p className="art-reveal mb-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-brown">
                    {a.era}
                  </p>
                  <h3 className="art-reveal font-display text-3xl font-bold leading-tight text-teal md:text-4xl">
                    {a.name}
                  </h3>
                  <div className="art-reveal my-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-teal-2">
                    <span>
                      <span className="font-semibold text-brown-3">Origin · </span>
                      {a.origin}
                    </span>
                    <span>
                      <span className="font-semibold text-brown-3">Material · </span>
                      {a.material}
                    </span>
                  </div>
                  <p className="art-reveal max-w-md text-pretty text-sm font-light leading-relaxed text-teal-2 md:text-base">
                    {a.blurb}
                  </p>
                </div>
              </div>
            </article>
          ))}

          {/* End cap — desktop */}
          <div className="hidden shrink-0 items-center pr-[8vw] md:flex">
            <div className="max-w-xs">
              <p className="font-display text-2xl font-bold text-brown-3">That was the beginning.</p>
              <p className="mt-3 text-sm text-teal-2">
                The artifacts are only half the story. Five hidden treasures wait across the
                terminal — ready for you to find.
              </p>
              <a
                href="#treasure-hunt"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-teal"
                data-cursor
              >
                Start the Treasure Hunt →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
