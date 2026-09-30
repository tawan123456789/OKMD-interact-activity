import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { GameToolbar } from "../../components/GameToolbar";
import { ItemNav } from "../../components/ItemNav";
import { LoadingScreen } from "../../components/LoadingScreen";
import { StateScreen } from "../../components/StateScreen";
import { useConfig } from "../../hooks/useConfig";
import { useItemSelection } from "../../hooks/useItemSelection";
import { api } from "../../services/api";
import {
  buildCells,
  applyGuess,
  isCorrectGuess,
  isSolved,
  normalizeChar,
  ENGLISH_KEYBOARD,
  THAI_KEYBOARD,
  hasThai,
  type WordCell,
} from "../../utils/guessWord";
import styles from "./GuessWordGame.module.css";

type KeyState = "unused" | "correct" | "wrong";

export function GuessWordGame() {
  const { data, loading, error, reload } = useConfig(api.getGuessWord);
  const words = data?.words ?? [];
  const { index, next, prev, random } = useItemSelection(words.length);

  const currentWord = words[index] ?? "";
  const [cells, setCells] = useState<WordCell[]>([]);
  const [keyStates, setKeyStates] = useState<Record<string, KeyState>>({});

  // Rebuild game state whenever the current word changes.
  useEffect(() => {
    setCells(buildCells(currentWord));
    setKeyStates({});
  }, [currentWord]);

  const solved = cells.length > 0 && isSolved(cells);

  const keyboard = useMemo(
    () => (hasThai(currentWord) ? THAI_KEYBOARD : ENGLISH_KEYBOARD),
    [currentWord]
  );

  const handleGuess = useCallback(
    (letter: string) => {
      const key = normalizeChar(letter);
      if (keyStates[key] || solved) return;
      const correct = isCorrectGuess(cells, letter);
      if (correct) {
        setCells((c) => applyGuess(c, letter));
        setKeyStates((s) => ({ ...s, [key]: "correct" }));
      } else {
        setKeyStates((s) => ({ ...s, [key]: "wrong" }));
      }
    },
    [cells, keyStates, solved]
  );

  const resetWord = useCallback(() => {
    setCells(buildCells(currentWord));
    setKeyStates({});
  }, [currentWord]);

  if (loading) return <LoadingScreen />;
  if (error) {
    return (
      <StateScreen title="โหลดค่าไม่สำเร็จ" message="Unable to load game configuration.">
        <button className="btn btn--primary" onClick={reload}>
          Retry
        </button>
        <Link to="/" className="btn">Admin</Link>
      </StateScreen>
    );
  }
  if (words.length === 0) {
    return (
      <StateScreen title="No words configured." message="ยังไม่มีคำในเกม">
        <Link to="/guess-word/edit" className="btn btn--primary">Go to Edit</Link>
        <Link to="/" className="btn">Admin</Link>
      </StateScreen>
    );
  }

  return (
    <div className={styles.page}>
      <GameToolbar
        title="Guess the Word"
        onReset={resetWord}
        center={
          <ItemNav
            onPrev={prev}
            onNext={next}
            onRandom={random}
            position={`${index + 1} / ${words.length}`}
          />
        }
      />

      <main className={styles.stage}>
        <div className={styles.word} aria-label="คำที่ต้องทาย">
          {cells.map((cell, i) =>
            cell.guessable ? (
              <span
                key={i}
                className={`${styles.cell} ${cell.revealed ? styles.revealed : ""}`}
              >
                <span className={styles.cellChar}>{cell.revealed ? cell.char : ""}</span>
              </span>
            ) : cell.char.trim() === "" ? (
              <span key={i} className={styles.space} aria-hidden />
            ) : (
              <span key={i} className={`${styles.cell} ${styles.revealed} ${styles.symbol}`}>
                <span className={styles.cellChar}>{cell.char}</span>
              </span>
            )
          )}
        </div>

        {solved ? (
          <div className={styles.wonPanel}>
            <p className={styles.won}>CORRECT!</p>
            <p className={styles.fullWord}>{currentWord}</p>
            <div className={styles.wonActions}>
              <button className="btn btn--lg" onClick={resetWord}>RESET</button>
              <button className="btn btn--lg btn--secondary" onClick={next}>
                <span>NEXT WORD</span>
                <ArrowRight aria-hidden />
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.keyboard}>
            {keyboard.map((letter) => {
              const state = keyStates[normalizeChar(letter)] ?? "unused";
              return (
                <button
                  key={letter}
                  className={`${styles.key} ${styles[state]}`}
                  onClick={() => handleGuess(letter)}
                  disabled={state !== "unused"}
                  aria-label={`ตัวอักษร ${letter}${
                    state === "wrong" ? " (ผิด)" : state === "correct" ? " (ถูก)" : ""
                  }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
