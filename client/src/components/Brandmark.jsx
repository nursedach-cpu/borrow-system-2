// Small inline logo mark — a stylized package + check, in PEA violet.
// Inline SVG (not an <img>) so it inherits crisp rendering at any size and
// avoids an extra network request.
export default function Brandmark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="512" height="512" rx="112" fill="#6a2c8f" />
      <g fill="none" stroke="#ffffff" strokeWidth="26" strokeLinejoin="round" strokeLinecap="round">
        <path d="M256 150 L370 210 L370 330 L256 390 L142 330 L142 210 Z" />
        <path d="M142 210 L256 270 L370 210" />
        <path d="M256 270 L256 390" />
      </g>
      <circle cx="370" cy="360" r="58" fill="#0f7b6c" stroke="#ffffff" strokeWidth="16" />
      <path d="M348 360 L364 376 L394 344" fill="none" stroke="#ffffff" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
