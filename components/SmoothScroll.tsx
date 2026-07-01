"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth-scroll wired into GSAP's ticker + ScrollTrigger.
 * Disabled automatically when the user prefers reduced motion.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    // Expose for the preloader (scroll lock) and other motion components.
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  // Recompute all ScrollTrigger start/end positions once the layout has
  // actually settled. On a cold (uncached) load the pinned hero + sticky
  // gallery are measured while the preloader still locks scroll and images
  // are downloading, so their positions get baked in wrong — the pin/sticky
  // math is off and the gallery shows blank gaps until something forces a
  // refresh (e.g. a resize, or a cached reload). Refreshing after the
  // preloader handoff, fonts, images, and a couple of delayed passes fixes it.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();

    window.addEventListener("load", refresh);
    window.addEventListener("tia:revealed", refresh);
    if (document.fonts?.ready) document.fonts.ready.then(refresh).catch(() => {});
    const timers = [350, 1000, 2200].map((ms) => window.setTimeout(refresh, ms));

    return () => {
      window.removeEventListener("load", refresh);
      window.removeEventListener("tia:revealed", refresh);
      timers.forEach(clearTimeout);
    };
  }, []);

  return <>{children}</>;
}
