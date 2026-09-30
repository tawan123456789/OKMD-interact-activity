import { useCallback, useEffect, useRef, useState } from "react";
import { Shuffle } from "lucide-react";
import { GameToolbar } from "../../components/GameToolbar";
import { LoadingScreen } from "../../components/LoadingScreen";
import { StateScreen } from "../../components/StateScreen";
import { useConfig } from "../../hooks/useConfig";
import { api } from "../../services/api";
import { randomInt } from "../../utils/random";
import { Link } from "react-router-dom";
import styles from "./RandomNumberGame.module.css";

export function RandomNumberGame() {
  const { data, loading, error, reload } = useConfig(api.getRandomNumber);

  const [display, setDisplay] = useState<string>("?");
  const [rolling, setRolling] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const roll = useCallback(() => {
    if (!data || rolling) return;
    setRolling(true);
    setHasResult(false);

    // Shuffle animation ~800ms.
    intervalRef.current = window.setInterval(() => {
      setDisplay(String(randomInt(data.min, data.max)));
    }, 60);

    timeoutRef.current = window.setTimeout(() => {
      clearTimers();
      const result = randomInt(data.min, data.max);
      setDisplay(String(result));
      setRolling(false);
      setHasResult(true);
    }, 800);
  }, [data, rolling, clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    setRolling(false);
    setHasResult(false);
    setDisplay("?");
  }, [clearTimers]);

  if (loading) return <LoadingScreen message="กำลังโหลดค่าเกม..." />;
  if (error || !data) {
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

  return (
    <div className={styles.page}>
      <GameToolbar title="Random Number" onReset={reset} />
      <main className={styles.stage}>
        <div
          className={`${styles.number} ${rolling ? styles.rolling : ""} ${
            hasResult ? styles.result : ""
          }`}
          aria-live="polite"
          aria-label={hasResult ? `ผลลัพธ์ ${display}` : "พร้อมสุ่ม"}
        >
          {display}
        </div>
        <button
          className={`btn btn--lg btn--secondary ${styles.rollBtn}`}
          onClick={roll}
          disabled={rolling}
        >
          <Shuffle aria-hidden />
          <span>RANDOM</span>
        </button>
        <p className={styles.range}>
          Range: {data.min} – {data.max}
        </p>
      </main>
    </div>
  );
}
