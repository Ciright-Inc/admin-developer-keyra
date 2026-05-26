import { cn } from "@/lib/utils";

export function MaterialIcon({
  name,
  size = 18,
  className,
  filled = false,
  weight = 400,
}: {
  name: string;
  size?: number;
  className?: string;
  filled?: boolean;
  weight?: 300 | 400 | 500 | 600 | 700;
}) {
  return (
    <span
      aria-hidden
      className={cn("material-symbols-outlined inline-grid place-items-center select-none", className)}
      style={{
        fontSize: `${size}px`,
        width: `${size}px`,
        height: `${size}px`,
        lineHeight: `${size}px`,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' 24`,
      }}
    >
      {name}
    </span>
  );
}
