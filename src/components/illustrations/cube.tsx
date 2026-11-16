const palettes = {
  star: ["#fde68a", "#fbbf24", "#f59e0b"],
  spark: ["#52525b", "#3f3f46", "#27272a"],
  check: ["#6ee7b7", "#34d399", "#10b981"],
  pin: ["#ffffff", "#f4f4f5", "#e4e4e7"],
  lock: ["#52525b", "#3f3f46", "#27272a"],
} as const;

export type CubeVariant = keyof typeof palettes;

export function Cube({ variant }: { variant: CubeVariant }) {
  const [top, left, right] = palettes[variant];
  return (
    <svg viewBox="0 0 130 150" aria-hidden="true">
      <ellipse cx="65" cy="117.52" rx="58.1952" ry="21.28" fill="#e4e4e7" />
      <g className="cube-faces">
        <g stroke="#18181b" strokeWidth="1.5" strokeLinejoin="round">
          <polygon points="16.504,38 65,66 65,122 16.504,94" fill={left} />
          <polygon points="113.496,38 65,66 65,122 113.496,94" fill={right} />
          <polygon points="65,10 113.496,38 65,66 16.504,38" fill={top} />
        </g>
        <g transform="translate(65 10) matrix(.866 .5 -.866 .5 0 0) scale(56)">
          {variant === "star" && <polygon fill="#fff" points=".5,.17 .59,.4 .83,.41 .64,.56 .7,.8 .5,.67 .3,.8 .36,.56 .17,.41 .41,.4" />}
          {variant === "spark" && <path fill="#fff" d="M.5 .15L.58 .42L.85 .5L.58 .58L.5 .85L.42 .58L.15 .5L.42 .42Z" />}
          {variant === "check" && <path d="M.25 .52L.43 .7L.75 .3" fill="none" stroke="#fff" strokeWidth=".1" strokeLinecap="round" strokeLinejoin="round" />}
          {variant === "pin" && <><circle cx=".5" cy=".5" r=".2" fill="none" stroke="#18181b" strokeWidth=".09" /><circle cx=".5" cy=".5" r=".06" fill="#18181b" /></>}
          {variant === "lock" && <><rect x=".3" y=".45" width=".4" height=".28" rx=".04" fill="#fff" /><path d="M.38 .45V.36a.12 .12 0 0 1 .24 0V.45" fill="none" stroke="#fff" strokeWidth=".07" /></>}
        </g>
      </g>
    </svg>
  );
}
