/**
 * LogoLateral — horizontal logo (icon left, text right)
 * LogoMain    — stacked logo (icon top, text below)
 *
 * variant="light"  → white fills for dark backgrounds (navbar, sidebar, footer)
 * variant="dark"   → original dark fills for light backgrounds
 */

const TEAL = "#30D5C7";
const NAVY = "#0B0E2D";

export function LogoLateral({ variant = "light", className = "", height = 36 }) {
  const navyFill = variant === "light" ? "#ffffff" : NAVY;
  const textFill = variant === "light" ? "#ffffff" : NAVY;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 238.63 107.24"
      height={height}
      className={className}
      aria-label="GetOnePlot"
    >
      <path
        d="M15.11,94.92S2,80.63.04,65.32s70.02-15.57,70.02-15.57c0,0,3.98.66-7.41,6.01-11.38,5.35-38.5,18.55-44.34,36.81,0,0-1.43,4.44-3.2,2.36Z"
        fill={navyFill}
      />
      <path
        d="M78.98,48.04s5.02,5.79-8.88,12.36c-13.9,6.56-41.31,16.6-35.13,38.22,6.18,21.62,57.59-1.43,62.19-25.37,3.32-17.25-.37-21.73-18.17-25.21Z"
        fill={TEAL}
      />
      <polygon
        points=".72 50.48 .72 27.96 49.17 0 97.77 28.07 97.77 50.48 49.17 22.56 .72 50.48"
        fill={navyFill}
      />
      <text
        transform="translate(112.99 59.22)"
        style={{
          fill: textFill,
          fontFamily: "Outfit, sans-serif",
          fontSize: "18px",
          fontWeight: 600,
        }}
      >
        <tspan x="0" y="0">G</tspan>
        <tspan x="14" y="0" letterSpacing="-0.02em">E</tspan>
        <tspan x="24.44" y="0" letterSpacing="-0.02em">T</tspan>
        <tspan x="35.48" y="0"> ONE </tspan>
        <tspan x="80.82" y="0">P</tspan>
        <tspan x="91.78" y="0" letterSpacing="-0.05em">L</tspan>
        <tspan x="100.94" y="0" letterSpacing="-0.04em">O</tspan>
        <tspan x="114.61" y="0" letterSpacing="-0.02em">T</tspan>
      </text>
    </svg>
  );
}

export function LogoMain({ variant = "light", className = "", height = 80 }) {
  const navyFill = variant === "light" ? "#ffffff" : NAVY;
  const textFill = variant === "light" ? "#ffffff" : NAVY;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 111.68 134.2"
      height={height}
      className={className}
      aria-label="GetOnePlot"
    >
      <path
        d="M21.06,94.92s-13.11-14.28-15.07-29.6,70.02-15.57,70.02-15.57c0,0,3.98.66-7.41,6.01-11.38,5.35-38.5,18.55-44.34,36.81,0,0-1.43,4.44-3.2,2.36Z"
        fill={navyFill}
      />
      <path
        d="M84.92,48.04s5.02,5.79-8.88,12.36c-13.9,6.56-41.31,16.6-35.13,38.22,6.18,21.62,57.59-1.43,62.19-25.37,3.32-17.25-.37-21.73-18.17-25.21Z"
        fill={TEAL}
      />
      <polygon
        points="6.66 50.48 6.66 27.96 55.11 0 103.71 28.07 103.71 50.48 55.11 22.56 6.66 50.48"
        fill={navyFill}
      />
      <text
        transform="translate(0 130.79)"
        style={{
          fill: textFill,
          fontFamily: "Outfit, sans-serif",
          fontSize: "16px",
          fontWeight: 600,
        }}
      >
        <tspan x="0" y="0">G</tspan>
        <tspan x="12.45" y="0" letterSpacing="-0.02em">E</tspan>
        <tspan x="21.73" y="0" letterSpacing="-0.02em">T</tspan>
        <tspan x="31.54" y="0"> ONE </tspan>
        <tspan x="71.84" y="0">P</tspan>
        <tspan x="81.58" y="0" letterSpacing="-0.05em">L</tspan>
        <tspan x="89.73" y="0" letterSpacing="-0.04em">O</tspan>
        <tspan x="101.87" y="0" letterSpacing="-0.02em">T</tspan>
      </text>
    </svg>
  );
}
