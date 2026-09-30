import styles from "./GridPreview.module.css";
import { totalTiles } from "../../utils/pictureGrid";

interface GridPreviewProps {
  rows: number;
  cols: number;
}

/** Small live preview of the tile layout. */
export function GridPreview({ rows, cols }: GridPreviewProps) {
  const count = totalTiles(rows, cols);
  return (
    <div className={styles.wrap}>
      <div
        className={styles.grid}
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
        }}
        aria-hidden
      >
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className={styles.cell} />
        ))}
      </div>
      <p className={styles.count}>{count} Tiles</p>
    </div>
  );
}
