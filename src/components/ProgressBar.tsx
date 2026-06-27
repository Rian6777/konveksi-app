import { INK, PAPER_DARK, THREAD } from "../utils/constants";

export default function ProgressBar({ progress, label }: { progress: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, progress));
  return (
    <div>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: `${INK}80` }}>{label}</span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: THREAD }}>{pct}%</span>
        </div>
      )}
      <div
        style={{
          height: 10,
          borderRadius: 999,
          background: PAPER_DARK,
          overflow: "hidden",
          border: `1px solid ${INK}12`,
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: pct >= 100 ? "#3F6342" : THREAD,
            borderRadius: 999,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}
