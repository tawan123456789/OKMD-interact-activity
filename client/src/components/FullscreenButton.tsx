import { Maximize, Minimize } from "lucide-react";
import { useFullscreen } from "../hooks/useFullscreen";

export function FullscreenButton({ className }: { className?: string }) {
  const { isFullscreen, toggle } = useFullscreen();
  return (
    <button
      className={`btn btn--sm btn--ghost ${className ?? ""}`}
      onClick={toggle}
      aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
    >
      {isFullscreen ? <Minimize size={20} aria-hidden /> : <Maximize size={20} aria-hidden />}
      <span>{isFullscreen ? "Exit" : "Fullscreen"}</span>
    </button>
  );
}
