import { INK } from "../utils/constants";

export function Skeleton({ height = 16, width = "100%", radius = 6 }: { height?: number; width?: string | number; radius?: number }) {
  return (
    <div
      style={{
        height,
        width,
        borderRadius: radius,
        background: `linear-gradient(90deg, ${INK}10 25%, ${INK}18 37%, ${INK}10 63%)`,
        backgroundSize: "400% 100%",
        animation: "shimmer 1.4s ease infinite",
      }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div
      style={{
        background: "#FFFDF8",
        border: `1.5px solid ${INK}12`,
        borderRadius: 14,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <Skeleton height={13} width="40%" />
      <Skeleton height={18} width="65%" />
      <Skeleton height={13} width="50%" />
      <Skeleton height={36} width="100%" radius={8} />
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
