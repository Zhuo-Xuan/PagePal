export default function Lantern({ streak, size = 56 }) {
  const glow = Math.min(streak / 21, 1);

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="lanternGlow" cx="50%" cy="55%" r="60%">
          <stop offset="0%" stopColor="#E8A33D" stopOpacity={0.9 * glow} />
          <stop offset="100%" stopColor="#E8A33D" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="34" r="28" fill="url(#lanternGlow)" />
      <path d="M32 6 L38 16 H26 Z" fill="#8A8377" opacity="0.8" />
      <rect x="20" y="16" width="24" height="30" rx="4" fill="#3A3226" stroke="#8A8377" strokeWidth="1.5" />
      <rect x="24" y="20" width="16" height="22" rx="2" fill="#E8A33D" opacity={0.25 + 0.6 * glow} />
      <path d="M32 26 C29 30 29 34 32 37 C35 34 35 30 32 26 Z" fill="#FFDDA0" opacity={0.4 + 0.6 * glow} />
      <rect x="26" y="46" width="12" height="4" rx="1" fill="#8A8377" />
      <path d="M22 16 Q32 8 42 16" stroke="#8A8377" strokeWidth="1.5" fill="none" />
    </svg>
  );
}
