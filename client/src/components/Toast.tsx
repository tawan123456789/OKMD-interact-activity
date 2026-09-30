import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";
import styles from "./Toast.module.css";

type ToastKind = "success" | "error";

interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (kind: ToastKind, message: string) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, kind, message }]);
      window.setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      success: (m) => push("success", m),
      error: (m) => push("error", m),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className={styles.container} aria-live="polite" aria-atomic="false">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`${styles.toast} ${t.kind === "success" ? styles.success : styles.error}`}
            role="status"
          >
            {t.kind === "success" ? (
              <CheckCircle2 aria-hidden size={24} />
            ) : (
              <AlertTriangle aria-hidden size={24} />
            )}
            <span>{t.message}</span>
            <button
              className={styles.close}
              onClick={() => remove(t.id)}
              aria-label="Dismiss notification"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
