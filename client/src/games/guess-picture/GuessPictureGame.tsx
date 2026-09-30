import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Shuffle, Eye, ArrowRight } from "lucide-react";
import { GameToolbar } from "../../components/GameToolbar";
import { ItemNav } from "../../components/ItemNav";
import { LoadingScreen } from "../../components/LoadingScreen";
import { StateScreen } from "../../components/StateScreen";
import { useConfig } from "../../hooks/useConfig";
import { useItemSelection } from "../../hooks/useItemSelection";
import { api } from "../../services/api";
import {
  buildTiles,
  revealTile,
  revealAll,
  pickRandomClosedTile,
  revealedCount,
  allRevealed,
  type Tile,
} from "../../utils/pictureGrid";
import { DEFAULT_GRID, type PictureQuestion } from "../../types";
import styles from "./GuessPictureGame.module.css";

/** Grid values, defaulting for backward-compat with old config. */
function gridOf(picture: PictureQuestion) {
  return {
    rows: picture.gridRows ?? DEFAULT_GRID,
    cols: picture.gridColumns ?? DEFAULT_GRID,
  };
}

export function GuessPictureGame() {
  const { data, loading, error, reload } = useConfig(api.getGuessPicture);
  const pictures = data?.pictures ?? [];
  const { index, next, prev, random } = useItemSelection(pictures.length);

  const current = pictures[index];
  const { rows, cols } = current ? gridOf(current) : { rows: DEFAULT_GRID, cols: DEFAULT_GRID };

  const [tiles, setTiles] = useState<Tile[]>([]);
  const [answerShown, setAnswerShown] = useState(false);

  // Rebuild tiles whenever the picture (or its grid) changes.
  useEffect(() => {
    setTiles(buildTiles(rows, cols));
    setAnswerShown(false);
  }, [current?.id, rows, cols]);

  const opened = revealedCount(tiles);
  const total = tiles.length;
  const complete = allRevealed(tiles);

  const handleTileClick = useCallback((tileIndex: number) => {
    setTiles((t) => revealTile(t, tileIndex));
  }, []);

  const handleRandomTile = useCallback(() => {
    setTiles((t) => {
      const pick = pickRandomClosedTile(t);
      return pick === null ? t : revealTile(t, pick);
    });
  }, []);

  const handleReveal = useCallback(() => {
    setTiles((t) => revealAll(t));
    setAnswerShown(true);
  }, []);

  const handleReset = useCallback(() => {
    setTiles(buildTiles(rows, cols));
    setAnswerShown(false);
  }, [rows, cols]);

  const gridStyle = useMemo(
    () => ({
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
    }),
    [rows, cols]
  );

  if (loading) return <LoadingScreen />;
  if (error) {
    return (
      <StateScreen title="โหลดค่าไม่สำเร็จ" message="Unable to load game configuration.">
        <button className="btn btn--primary" onClick={reload}>Retry</button>
        <Link to="/" className="btn">Admin</Link>
      </StateScreen>
    );
  }
  if (pictures.length === 0 || !current) {
    return (
      <StateScreen title="No pictures configured." message="ยังไม่มีรูปในเกม">
        <Link to="/guess-picture/edit" className="btn btn--primary">Go to Edit</Link>
        <Link to="/" className="btn">Admin</Link>
      </StateScreen>
    );
  }

  return (
    <div className={styles.page}>
      <GameToolbar
        title="Guess the Picture"
        onReset={handleReset}
        center={
          <ItemNav
            onPrev={prev}
            onNext={next}
            onRandom={random}
            position={`${index + 1} / ${pictures.length}`}
          />
        }
        info={<span className={styles.progress}>Opened {opened} / {total}</span>}
      />

      <main className={styles.stage}>
        <div className={styles.frame}>
          <img
            className={styles.image}
            src={current.image}
            alt={answerShown ? current.answer : "รูปที่ถูกปิดด้วยแผ่นป้าย"}
          />
          <div className={styles.grid} style={gridStyle} role="group" aria-label="แผ่นป้าย">
            {tiles.map((tile) => (
              <button
                key={tile.index}
                className={`${styles.tile} ${tile.revealed ? styles.tileOpen : ""}`}
                onClick={() => handleTileClick(tile.index)}
                disabled={tile.revealed}
                aria-label={
                  tile.revealed
                    ? `แผ่นป้าย ${tile.number} เปิดแล้ว`
                    : `เปิดแผ่นป้าย ${tile.number}`
                }
              >
                {!tile.revealed && <span className={styles.tileNum}>{String(tile.number).padStart(2, "0")}</span>}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.controls}>
          <button
            className="btn btn--secondary"
            onClick={handleRandomTile}
            disabled={complete}
          >
            <Shuffle aria-hidden />
            <span>RANDOM TILE</span>
          </button>
          <button className="btn btn--accent" onClick={handleReveal}>
            <Eye aria-hidden />
            <span>REVEAL ANSWER</span>
          </button>
        </div>

        {answerShown && (
          <div className={styles.answerPanel} role="status">
            <p className={styles.answerLabel}>ANSWER</p>
            <p className={styles.answerText}>{current.answer}</p>
            <div className={styles.answerActions}>
              <button className="btn btn--lg" onClick={handleReset}>RESET</button>
              <button className="btn btn--lg btn--secondary" onClick={next}>
                <span>NEXT PICTURE</span>
                <ArrowRight aria-hidden />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
