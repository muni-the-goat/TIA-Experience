"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Global scroll-motion orchestration:
 *  - `.stack-section` elements rise + scale + un-round as they enter, so each
 *    section seamlessly stacks over the previous one (cinematic continuity).
 *  - `.depth-slow` / `.depth-fast` get subtle parallax depth.
 * All disabled under prefers-reduced-motion.
 */
export default function MotionLayer() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Seamless stacking reveal
      gsap.utils.toArray<HTMLElement>(".stack-section").forEach((sec) => {
        gsap.set(sec, { transformOrigin: "50% 0%" });
        gsap.fromTo(
          sec,
          { yPercent: 4, scale: 0.95, autoAlpha: 0.55, borderTopLeftRadius: 56, borderTopRightRadius: 56 },
          {
            yPercent: 0,
            scale: 1,
            autoAlpha: 1,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            ease: "none",
            scrollTrigger: {
              trigger: sec,
              start: "top bottom",
              end: "top 58%",
              scrub: true,
            },
          }
        );
      });

      // Lightweight parallax for layered elements
      gsap.utils.toArray<HTMLElement>(".depth-slow").forEach((el) => {
        gsap.to(el, {
          yPercent: -12,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
      gsap.utils.toArray<HTMLElement>(".depth-fast").forEach((el) => {
        gsap.to(el, {
          yPercent: 16,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    });

    // Make sure positions are correct once everything is mounted
    const r = requestAnimationFrame(() => ScrollTrigger.refresh());

    // Re-measure after the preloader unlocks scroll
    const onReveal = () => ScrollTrigger.refresh();
    window.addEventListener("tia:revealed", onReveal);

    return () => {
      cancelAnimationFrame(r);
      window.removeEventListener("tia:revealed", onReveal);
      ctx.revert();
    };
  }, []);

  return null;
}
