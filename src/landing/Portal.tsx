/** Decorative portal. Inline SVG, no assets. Hidden from assistive tech. */
export function Portal() {
  return (
    <svg className="portal" viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="pf-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#49f5e8" stopOpacity="0.9" />
          <stop offset="55%" stopColor="#8b5cf6" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#170d2b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="190" fill="url(#pf-core)" />
      <g className="ring ring-a">
        <ellipse cx="200" cy="200" rx="170" ry="170" fill="none" stroke="#8b5cf6" strokeWidth="6" strokeDasharray="40 18" />
      </g>
      <g className="ring ring-b">
        <ellipse cx="200" cy="200" rx="130" ry="130" fill="none" stroke="#49f5e8" strokeWidth="4" strokeDasharray="12 14" />
      </g>
      <circle cx="200" cy="200" r="86" fill="#080911" stroke="#ff7518" strokeWidth="3" />
      <path d="M200 114 L184 170 L212 190 L190 286" fill="none" stroke="#ff7518" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
