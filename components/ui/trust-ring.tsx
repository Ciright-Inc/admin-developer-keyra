import { trustScoreColor } from "@/lib/utils";

export function TrustRing({
  score,
  size = 56,
  strokeWidth = 4,
  label,
}: {
  score: number | null | undefined;
  size?: number;
  strokeWidth?: number;
  label?: string;
}) {
  const v = Math.max(0, Math.min(100, score ?? 0));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (v / 100) * circumference;
  const color = trustScoreColor(score ?? 0);

  return (
    <div className="ds-trust-ring relative" style={{ width: size, height: size }} title={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--ds-hairline-strong)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 600ms ease, stroke 200ms ease" }}
        />
      </svg>
      <span className="ds-trust-ring__value absolute inset-0 grid place-items-center" style={{ color }}>
        {score === null || score === undefined ? "—" : Math.round(v)}
      </span>
    </div>
  );
}
