"use client";

import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { AnimatePresence, MotionConfig, motion, useReducedMotion, type Variants } from "motion/react";
import { X } from "lucide-react";
import { type Artifact } from "@/lib/data";
import { ArtImg } from "./ArtImg";

/* ──────────────────────────────────────────────────────────────
   Artifact lightbox — the focal "popup card".

   Built on Radix Dialog primitives (focus-trap, Esc-to-close,
   scroll-lock, portal + ARIA come for free) but with the open/close
   motion handed to Framer Motion via `forceMount` + <AnimatePresence>.
   The card doesn't just pop: it settles up into place on a soft spring
   while a blur clears — a "resolve into focus" that echoes the gallery's
   Getty tracing feel — then its text quietly rises in a small stagger.

   Motion owns the whole transform (scale + the −50%/−50% centering + the
   settle drift are all baked into one x/y/scale set), so there's no CSS
   translate fighting it. Reduced-motion collapses everything to a plain
   cross-fade.
   ────────────────────────────────────────────────────────────── */

// Elegant, low-bounce spring — a settle, not a boing.
const SPRING = { type: "spring" as const, bounce: 0.16, duration: 0.55 };

// Card: fade + scale up + rise + blur-clear. The −50% keeps it centred while
// it scales (transform-origin is centre); y carries both the centring and the
// upward settle, so it drifts from −44% → −50%.
const cardMotion: Variants = {
  initial: { opacity: 0, scale: 0.94, x: "-50%", y: "-44%", filter: "blur(12px)" },
  animate: {
    opacity: 1,
    scale: 1,
    x: "-50%",
    y: "-50%",
    filter: "blur(0px)",
    // Text resolves *with* the card, not after it — a short delay + tight
    // stagger so the copy feels part of the same gesture, never a second beat.
    transition: { ...SPRING, delayChildren: 0.04, staggerChildren: 0.04 },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    x: "-50%",
    y: "-47%",
    filter: "blur(8px)",
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] },
  },
};

// Reduced-motion: honour the request for stillness — a plain fade, no
// transform, no blur.
const cardMotionReduced: Variants = {
  initial: { opacity: 0, x: "-50%", y: "-50%" },
  animate: { opacity: 1, x: "-50%", y: "-50%", transition: { duration: 0.2 } },
  exit: { opacity: 0, x: "-50%", y: "-50%", transition: { duration: 0.15 } },
};

const overlayMotion: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.22, ease: "easeIn" } },
};

// Text lines resolve in after the card lands (inherits the card's staggered
// animate state). The image column stays put — only the copy "arrives".
const line: Variants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] } },
};

export function ArtifactLightbox({
  artifact,
  onOpenChange,
}: {
  artifact: Artifact | null;
  onOpenChange: (open: boolean) => void;
}) {
  const open = !!artifact;
  const reduce = useReducedMotion();

  // Keep the last artifact around through the exit animation so the card still
  // has content to show while it's fading out (parent sets `artifact` to null
  // to close).
  const [shown, setShown] = useState<Artifact | null>(artifact);
  useEffect(() => {
    if (artifact) setShown(artifact);
  }, [artifact]);

  const card = reduce ? cardMotionReduced : cardMotion;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && shown && (
          <MotionConfig reducedMotion="user">
            <DialogPrimitive.Portal forceMount>
              {/* Backdrop */}
              <DialogPrimitive.Overlay asChild forceMount>
                <motion.div
                  className="fixed inset-0 z-50 bg-teal/70 backdrop-blur-sm"
                  variants={overlayMotion}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                />
              </DialogPrimitive.Overlay>

              {/* The card */}
              <DialogPrimitive.Content asChild forceMount>
                <motion.div
                  className="fixed left-1/2 top-1/2 z-50 grid max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-4xl gap-0 overflow-y-auto rounded-2xl bg-[#fbfaf8] shadow-2xl will-change-transform md:max-h-none md:grid-cols-2 md:overflow-hidden"
                  variants={card}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {/* Image — top on mobile, fixed-height left column on desktop */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand-4 sm:aspect-[5/4] md:aspect-auto md:h-[30rem]">
                    <ArtImg
                      a={shown}
                      className="h-full w-full"
                      imgClassName="h-full w-full object-cover object-[center_25%]"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-col justify-center p-6 md:p-9">
                    <DialogPrimitive.Title asChild>
                      <motion.h2
                        variants={line}
                        className="font-display text-3xl font-medium leading-tight text-teal md:text-4xl"
                      >
                        {shown.name}
                      </motion.h2>
                    </DialogPrimitive.Title>

                    <motion.div
                      variants={line}
                      className="my-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-teal-2"
                    >
                      <span>
                        <span className="font-semibold text-brown-3">Origin · </span>
                        {shown.origin}
                      </span>
                      <span>
                        <span className="font-semibold text-brown-3">Material · </span>
                        {shown.material}
                      </span>
                    </motion.div>

                    <DialogPrimitive.Description asChild>
                      <motion.p
                        variants={line}
                        className="font-display text-lg leading-relaxed text-teal-2 md:text-xl"
                      >
                        {shown.blurb}
                      </motion.p>
                    </DialogPrimitive.Description>
                  </div>

                  {/* Close */}
                  <DialogPrimitive.Close
                    className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-teal text-white opacity-90 transition hover:scale-110 hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </DialogPrimitive.Close>
                </motion.div>
              </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
          </MotionConfig>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  );
}
