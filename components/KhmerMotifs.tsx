// Self-contained inline SVG artwork — Khmer-inspired motifs so the page is
// visually rich without external image assets. Decorative => aria-hidden.

type MotifProps = { className?: string; stroke?: string };

export function Motif({ kind, className, stroke = "#D6A63A" }: MotifProps & { kind: string }) {
  switch (kind) {
    case "naga":
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden fill="none">
          <g stroke={stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            {/* coiled body */}
            <path d="M60 76c0 13-14 15-9 27 4 9 18 9 22 1" />
            {/* fanned naga hood — five necks */}
            <path d="M60 76C58 58 60 47 60 37" />
            <path d="M60 76C53 60 47 51 43 44" />
            <path d="M60 76C67 60 73 51 77 44" />
            <path d="M60 76C47 63 38 58 31 52" />
            <path d="M60 76C73 63 82 58 89 52" />
          </g>
          {/* five heads */}
          <g fill={stroke}>
            {([
              [60, 34],
              [42, 41],
              [78, 41],
              [29, 49],
              [91, 49],
            ] as const).map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="4.2" />
            ))}
          </g>
        </svg>
      );
    case "lotus":
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden fill="none">
          <g stroke={stroke} strokeWidth="2.5" strokeLinejoin="round">
            <path d="M60 100C40 88 34 64 60 30c26 34 20 58 0 70z" />
            <path d="M60 100C36 96 22 78 26 52c30 6 36 28 34 48z" />
            <path d="M60 100c24-4 38-22 34-48-30 6-36 28-34 48z" />
          </g>
        </svg>
      );
    case "apsara":
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden fill="none">
          <g stroke={stroke} strokeWidth="2.5" strokeLinecap="round">
            <circle cx="60" cy="26" r="9" />
            <path d="M60 35v34" />
            <path d="M60 44c-14-2-22-12-30-6M60 44c14-2 22-12 30-6" />
            <path d="M60 69c-8 6-12 18-22 22M60 69c8 6 12 18 22 22" />
            <path d="M52 18l-8-8M68 18l8-8" />
          </g>
        </svg>
      );
    case "garuda":
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden fill="none">
          <g stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
            <path d="M60 22l6 14h-12z" />
            <path d="M60 36v50" />
            <path d="M60 48C40 40 20 44 10 60c18 6 30 4 50-4M60 48c20-8 40-4 50 12-18 6-30 4-50-4" />
            <path d="M60 86c-8 0-14 6-14 12h28c0-6-6-12-14-12z" />
          </g>
        </svg>
      );
    case "temple":
    default:
      return (
        <svg viewBox="0 0 120 120" className={className} aria-hidden fill="none">
          <g stroke={stroke} strokeWidth="2.5" strokeLinejoin="round">
            <path d="M60 16c4 14 8 20 16 28-6 2-6 8-6 12H50c0-4 0-10-6-12 8-8 12-14 16-28z" />
            <path d="M30 70c0-6 6-10 6-10s6 4 6 10" />
            <path d="M78 70c0-6 6-10 6-10s6 4 6 10" />
            <rect x="26" y="86" width="68" height="22" />
            <path d="M20 108h80" />
          </g>
        </svg>
      );
  }
}
