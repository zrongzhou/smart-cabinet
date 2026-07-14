interface LogoProps {
  className?: string;
  /** Pixel size of the double-star mark (width & height of the SVG). */
  size?: number;
  /** Render only the mark (no wordmark). */
  markOnly?: boolean;
  /** Text color of the wordmark. */
  textClassName?: string;
}

/**
 * Qtech brand mark — a "double star": a large four-point sparkle paired with a
 * smaller offset sparkle, both filled with the deep-blue gradient
 * (#1d4ed8 → #1e3a8a). The small star carries reduced opacity so the pair
 * reads as a balanced, layered mark without the two shapes crossing into a
 * messy overlap. Optionally paired with the wordmark "Qtech" and the
 * "TOOL CABINET" tagline.
 *
 * The gradient id is shared by every instance on the page; because all
 * definitions are identical this is safe and avoids duplicate-id flicker.
 */
export default function Logo({
  className = '',
  size = 40,
  markOnly = false,
  textClassName = 'text-ink-900',
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="qtechMark" x1="4" y1="6" x2="44" y2="42" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1d4ed8" />
            <stop offset="1" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>
        {/* Primary star — large four-point sparkle */}
        <path
          d="M19 11 L22.2 22.8 L34 26 L22.2 29.2 L19 41 L15.8 29.2 L4 26 L15.8 22.8 Z"
          fill="url(#qtechMark)"
        />
        {/* Secondary star — smaller four-point sparkle, offset to the upper-right */}
        <path
          d="M35 5.5 L36.4 10.6 L41.5 12 L36.4 13.4 L35 18.5 L33.6 13.4 L28.5 12 L33.6 10.6 Z"
          fill="url(#qtechMark)"
          opacity="0.6"
        />
      </svg>
      {!markOnly && (
        <span className="flex flex-col leading-none">
          <span className={`text-xl font-extrabold tracking-tight ${textClassName}`}>Qtech</span>
          <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-brand-600">
            Tool Cabinet
          </span>
        </span>
      )}
    </span>
  );
}
