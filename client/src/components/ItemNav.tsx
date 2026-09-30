import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";

interface ItemNavProps {
  onPrev: () => void;
  onNext: () => void;
  onRandom: () => void;
  position: string;
  disabled?: boolean;
}

export function ItemNav({ onPrev, onNext, onRandom, position, disabled }: ItemNavProps) {
  return (
    <>
      <button className="btn btn--sm" onClick={onPrev} disabled={disabled} aria-label="Previous">
        <ChevronLeft size={20} aria-hidden />
        <span>Prev</span>
      </button>
      <span style={{ fontWeight: 700, minWidth: "3.5rem", textAlign: "center" }}>{position}</span>
      <button className="btn btn--sm" onClick={onNext} disabled={disabled} aria-label="Next">
        <span>Next</span>
        <ChevronRight size={20} aria-hidden />
      </button>
      <button className="btn btn--sm" onClick={onRandom} disabled={disabled} aria-label="Random">
        <Shuffle size={18} aria-hidden />
        <span>Random</span>
      </button>
    </>
  );
}
