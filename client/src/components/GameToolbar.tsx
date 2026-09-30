import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Home, RotateCcw } from "lucide-react";
import { FullscreenButton } from "./FullscreenButton";
import styles from "./GameToolbar.module.css";

interface GameToolbarProps {
  title: string;
  onReset?: () => void;
  /** Extra controls rendered in the center (e.g. prev/next/random). */
  center?: ReactNode;
  /** Extra info rendered on the right (e.g. progress). */
  info?: ReactNode;
}

export function GameToolbar({ title, onReset, center, info }: GameToolbarProps) {
  return (
    <div className={styles.bar}>
      <div className={styles.left}>
        <Link to="/" className="btn btn--sm btn--ghost" aria-label="Back to Admin">
          <Home size={20} aria-hidden />
          <span>Admin</span>
        </Link>
        <span className={styles.title}>{title}</span>
      </div>

      {center && <div className={styles.center}>{center}</div>}

      <div className={styles.right}>
        {info}
        {onReset && (
          <button className="btn btn--sm" onClick={onReset} aria-label="Reset game">
            <RotateCcw size={20} aria-hidden />
            <span>Reset</span>
          </button>
        )}
        <FullscreenButton />
      </div>
    </div>
  );
}
