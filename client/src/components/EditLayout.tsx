import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, RefreshCw } from "lucide-react";
import styles from "./EditLayout.module.css";

interface EditLayoutProps {
  title: string;
  subtitle?: string;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onReload: () => void;
  children: ReactNode;
}

export function EditLayout({
  title,
  subtitle,
  dirty,
  saving,
  onSave,
  onReload,
  children,
}: EditLayoutProps) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link to="/" className="btn btn--sm">
            <ArrowLeft size={20} aria-hidden />
            <span>Back to Admin</span>
          </Link>
          <div>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        </div>

        <div className={styles.headerRight}>
          <span
            className={`${styles.status} ${dirty ? styles.dirty : styles.clean}`}
            aria-live="polite"
          >
            {dirty ? "● Unsaved changes" : "✓ All changes saved"}
          </span>
          <button className="btn btn--sm" onClick={onReload} disabled={saving}>
            <RefreshCw size={18} aria-hidden />
            <span>Reload</span>
          </button>
          <button
            className="btn btn--primary"
            onClick={onSave}
            disabled={saving || !dirty}
          >
            <Save size={20} aria-hidden />
            <span>{saving ? "Saving..." : "Save"}</span>
          </button>
        </div>
      </header>

      <main className={styles.content}>{children}</main>
    </div>
  );
}
