import styles from "./AppHeader.module.css";

export function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.mark} aria-hidden>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
      <div>
        <h1 className={styles.title}>OKMD Activity Console</h1>
        <p className={styles.subtitle}>เครื่องมือดำเนินกิจกรรม Interactive ผ่านจอ</p>
      </div>
    </header>
  );
}
