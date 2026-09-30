import { Link } from "react-router-dom";
import { Play, Pencil } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./AdminGameCard.module.css";

interface AdminGameCardProps {
  title: string;
  description: string;
  playTo: string;
  editTo: string;
  accent: "primary" | "secondary" | "accent";
  icon: ReactNode;
}

export function AdminGameCard({
  title,
  description,
  playTo,
  editTo,
  accent,
  icon,
}: AdminGameCardProps) {
  return (
    <article className={`${styles.card} ${styles[accent]}`}>
      <div className={styles.icon} aria-hidden>
        {icon}
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      <div className={styles.actions}>
        <Link to={playTo} className="btn btn--lg btn--primary">
          <Play aria-hidden />
          <span>PLAY</span>
        </Link>
        <Link to={editTo} className="btn btn--lg">
          <Pencil aria-hidden />
          <span>EDIT</span>
        </Link>
      </div>
    </article>
  );
}
