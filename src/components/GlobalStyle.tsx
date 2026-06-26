import { INK, THREAD } from "../utils/constants";

export default function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
      * { box-sizing: border-box; }
      body { margin: 0; }
      .spin-slow { animation: spin 2.2s linear infinite; }
      @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      @keyframes slideUp { from { transform: translateY(24px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      @media (prefers-reduced-motion: reduce) {
        .spin-slow { animation: none; }
      }
      input:focus, select:focus, textarea:focus {
        border-color: ${THREAD} !important;
        box-shadow: 0 0 0 3px ${THREAD}22;
      }
      ::placeholder { color: ${INK}55; }
      button:focus-visible, input:focus-visible, select:focus-visible {
        outline: 2px solid ${THREAD};
        outline-offset: 2px;
      }
    `}</style>
  );
}
