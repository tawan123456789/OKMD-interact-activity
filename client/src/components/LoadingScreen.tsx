import { Loader2 } from "lucide-react";
import styles from "./StateScreens.module.css";

export function LoadingScreen({ message = "Loading..." }: { message?: string }) {
  return (
    <div className={styles.center} role="status" aria-live="polite">
      <Loader2 className={styles.spin} size={64} aria-hidden />
      <p className={styles.text}>{message}</p>
    </div>
  );
}
