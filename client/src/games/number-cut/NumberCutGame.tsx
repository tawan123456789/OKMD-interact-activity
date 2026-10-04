import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Scissors, RotateCcw } from "lucide-react";
import { GameToolbar } from "../../components/GameToolbar";
import { LoadingScreen } from "../../components/LoadingScreen";
import { StateScreen } from "../../components/StateScreen";
import { useConfig } from "../../hooks/useConfig";
import { api } from "../../services/api";
import { NumberBar } from "./NumberBar";
import {
  createInitialState,
  performCut,
  isFinalRound,
  isSingleNumber,
  randomIntInclusive,
  type NumberCutState,
} from "./logic";
import styles from "./NumberCutGame.module.css";

const ANIM_MS = 900;

export function NumberCutGame() {
  const { data, loading, error, reload } = useConfig(api.getNumberCut);

  const [state, setState] = useState<NumberCutState | null>(null);
  const [animating, setAnimating] = useState(false);
  const [marker, setMarker] = useState<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;
  }, []);

  const startNewGame = useCallback(() => {
    clearTimers();
    if (!data) return;
    setState(createInitialState(data.min, data.max, data.rounds));
    setMarker(null);
    setAnimating(false);
  }, [data, clearTimers]);

  // Initialize when config loads.
  useEffect(() => {
    if (data) startNewGame();
    return clearTimers;
  }, [data, startNewGame, clearTimers]);

  const handleCut = useCallback(() => {
    if (!state || animating || state.finished) return;
    setAnimating(true);

    // Shuffle the marker across the active range during the animation.
    intervalRef.current = window.setInterval(() => {
      setMarker(randomIntInclusive(state.currentMin, state.currentMax));
    }, 55);

    timeoutRef.current = window.setTimeout(() => {
      clearTimers();
      const next = performCut(state);
      // Rest the marker on the meaningful point for this step.
      if (next.finished && next.finalPosition !== null) {
        setMarker(next.finalPosition);
      } else if (next.lastCutPoint !== null) {
        setMarker(next.lastCutPoint);
      } else if (next.finished) {
        setMarker(next.finalAnswer);
      }
      setState(next);
      setAnimating(false);
    }, ANIM_MS);
  }, [state, animating, clearTimers]);

  if (loading) return <LoadingScreen message="กำลังโหลดค่าเกม..." />;
  if (error || !data || !state) {
    return (
      <StateScreen title="โหลดค่าไม่สำเร็จ" message="Unable to load game configuration.">
        <button className="btn btn--primary" onClick={reload}>
          Retry
        </button>
        <Link to="/" className="btn">
          Admin
        </Link>
      </StateScreen>
    );
  }

  const finalStep = isFinalRound(state) || isSingleNumber(state);
  const directionLabel = state.direction === "high" ? "CUT HIGH" : "CUT LOW";
  const directionThai = state.direction === "high" ? "ตัดหาง (ตัดเลขมาก)" : "ตัดหัว (ตัดเลขน้อย)";

  return (
    <div className={styles.page}>
      <GameToolbar
        title="Number Cut"
        onReset={startNewGame}
        info={
          <span className={styles.roundInfo}>
            Round {Math.min(state.currentRound, state.totalRounds)} / {state.totalRounds}
          </span>
        }
      />

      <main className={styles.stage}>
        {/* Round progress dots */}
        <div className={styles.dots} aria-hidden>
          {Array.from({ length: state.totalRounds }, (_, i) => (
            <span
              key={i}
              className={`${styles.dot} ${i < state.currentRound - 1 || state.finished ? styles.dotDone : ""} ${
                i === state.currentRound - 1 && !state.finished ? styles.dotActive : ""
              }`}
            />
          ))}
        </div>

        {state.finished ? (
          <div className={styles.finalPanel}>
            <p className={styles.finalLabel}>FINAL NUMBER</p>
            <p className={styles.finalNumber}>{state.finalAnswer}</p>
          </div>
        ) : (
          <>
            <p
              className={`${styles.direction} ${
                finalStep ? styles.finalDirection : ""
              }`}
            >
              {finalStep ? "FINAL ROUND" : directionLabel}
            </p>
            {!finalStep && <p className={styles.directionSub}>{directionThai}</p>}
            <p className={styles.cutPoint}>
              {marker !== null ? Math.round(marker) : "—"}
            </p>
          </>
        )}

        <NumberBar state={state} marker={marker} />

        <p className={styles.remaining}>
          Remaining: {state.currentMin}–{state.currentMax}
        </p>

        <div className={styles.actions}>
          {state.finished ? (
            <button className="btn btn--lg btn--primary" onClick={startNewGame}>
              <RotateCcw aria-hidden />
              <span>PLAY AGAIN</span>
            </button>
          ) : (
            <button
              className="btn btn--lg btn--accent"
              onClick={handleCut}
              disabled={animating}
            >
              <Scissors aria-hidden />
              <span>{finalStep ? "REVEAL" : "CUT"}</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
