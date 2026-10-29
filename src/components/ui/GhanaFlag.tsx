/**
 * Ghana flag rendered inline (CSP-safe, no external asset) with a gentle
 * waving animation driven by the `.ghana-flag` class in index.css.
 * Three horizontal bands — red, gold, green — with a black five-pointed
 * star centred on the gold band.
 */
export function GhanaFlag({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 30 20"
      role="img"
      aria-label="Ghana"
      className={`ghana-flag ${className}`}
    >
      <rect x="0" y="0" width="30" height="6.67" fill="#CE1126" />
      <rect x="0" y="6.67" width="30" height="6.66" fill="#FCD116" />
      <rect x="0" y="13.33" width="30" height="6.67" fill="#006B3F" />
      <polygon
        points="15,7.4 15.59,9.19 17.47,9.20 15.95,10.31 16.53,12.10 15,11 13.47,12.10 14.05,10.31 12.53,9.20 14.41,9.19"
        fill="#000000"
      />
    </svg>
  );
}
