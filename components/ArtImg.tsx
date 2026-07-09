"use client";

import { useState } from "react";
import { type Artifact } from "@/lib/data";
import { Motif } from "./KhmerMotifs";

/* ──────────────────────────────────────────────────────────────
   Image with graceful fall-back to the inline SVG motif.
   Shared by the gallery scatter/stage and the artifact lightbox.
   ────────────────────────────────────────────────────────────── */
export function ArtImg({
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
        alt={`${a.name}, ${a.era}, ${a.origin}`}
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
