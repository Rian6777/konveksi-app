import { INK, THREAD } from "../utils/constants";
import type { HistoryEntry } from "../utils/types";

export default function Timeline({ history }: { history: HistoryEntry[] }) {
  if (!history || history.length === 0) {
    return <div style={{ fontSize: 13, color: `${INK}60`, fontStyle: "italic" }}>Belum ada riwayat.</div>;
  }

  const sorted = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {sorted.map((h, i) => {
        const isLast = i === sorted.length - 1;
        return (
          <div key={i} style={{ display: "flex", gap: 12 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: "50%",
                  background: isLast ? THREAD : `${INK}30`,
                  border: isLast ? `2px solid ${THREAD}` : "none",
                  marginTop: 3,
                  flexShrink: 0,
                }}
              />
              {!isLast && <div style={{ width: 2, flex: 1, background: `${INK}18`, minHeight: 24 }} />}
            </div>
            <div style={{ paddingBottom: 18 }}>
              <div style={{ fontSize: 11.5, color: `${INK}60`, fontWeight: 600 }}>
                {new Date(h.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: isLast ? 700 : 600,
                  color: isLast ? INK : `${INK}85`,
                  marginTop: 1,
                }}
              >
                {h.title}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
