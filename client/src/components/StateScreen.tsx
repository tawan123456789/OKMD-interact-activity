import type { ReactNode } from "react";
import styles from "./StateScreens.module.css";

interface StateScreenProps {
  title: string;
  message?: string;
  children?: ReactNode;
}

/** Generic centered screen used for error / empty states. */
export function StateScreen({ title, message, children }: StateScreenProps) {
  return (
    <div className={styles.center} role="alert">
      <h2 className={styles.title}>{title}</h2>
      {message && <p className={styles.text}>{message}</p>}
      {children && <div className={styles.actions}>{children}</div>}
    </div>
  );
}
