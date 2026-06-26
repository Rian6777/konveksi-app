import { STATUS } from "../utils/constants";
import type { OrderStatus } from "../utils/types";

export default function StatusPill({ status }: { status: OrderStatus }) {
  const s = STATUS[status];
  const Icon = s.icon;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        background: s.bg,
        color: s.color,
        fontSize: 12.5,
        fontWeight: 700,
        fontFamily: "'Space Grotesk', sans-serif",
        letterSpacing: 0.2,
      }}
    >
      <Icon size={13} strokeWidth={2.5} className={status === "proses" ? "spin-slow" : ""} />
      {s.label}
    </span>
  );
}
