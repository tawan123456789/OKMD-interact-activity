import { toPercent } from "./logic";
import type { NumberCutState } from "./logic";
import styles from "./NumberBar.module.css";

interface NumberBarProps {
  state: NumberCutState;
  /** Marker position (absolute value) to highlight, or null. */
  marker: number | null;
}

/**
 * The Number Bar is the primary visual. Its scale is ALWAYS the original
 * config range (configMin..configMax) so viewers can see how much has been
 * trimmed. The active range is highlighted; removed ends are muted.
 */
export function NumberBar({ state, marker }: NumberBarProps) {
  const { configMin, configMax, currentMin, currentMax } = state;

  const activeLeft = toPercent(currentMin, configMin, configMax);
  const activeRight = toPercent(currentMax, configMin, configMax);
  const activeWidth = activeRight - activeLeft;
  const markerPct = marker === null ? null : toPercent(marker, configMin, configMax);

  return (
    <div className={styles.wrap}>
      <div className={styles.endLabels}>
        <span>{configMin}</span>
        <span>{configMax}</span>
      </div>

      <div className={styles.track} role="img" aria-label={`Active range ${currentMin} to ${currentMax}`}>
        <div
          className={styles.active}
          style={{ left: `${activeLeft}%`, width: `${activeWidth}%` }}
        />

        {/* Current range boundary labels */}
        <div className={styles.boundary} style={{ left: `${activeLeft}%` }}>
          <span className={styles.boundaryLabel}>{currentMin}</span>
        </div>
        <div className={styles.boundary} style={{ left: `${activeRight}%` }}>
          <span className={`${styles.boundaryLabel} ${styles.boundaryRight}`}>{currentMax}</span>
        </div>

        {markerPct !== null && (
          <div className={styles.marker} style={{ left: `${markerPct}%` }}>
            <span className={styles.markerArrow} aria-hidden>
              ▲
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
