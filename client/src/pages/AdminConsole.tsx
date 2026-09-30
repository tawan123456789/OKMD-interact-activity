import { Dices, Type, Image } from "lucide-react";
import { AppHeader } from "../components/AppHeader";
import { AdminGameCard } from "../components/AdminGameCard";
import styles from "./AdminConsole.module.css";

export function AdminConsole() {
  return (
    <div className={styles.page}>
      <AppHeader />
      <main className={styles.grid}>
        <AdminGameCard
          title="Random Number"
          description="สุ่มตัวเลขจากช่วงที่กำหนด"
          playTo="/random-number"
          editTo="/random-number/edit"
          accent="primary"
          icon={<Dices />}
        />
        <AdminGameCard
          title="Guess the Word"
          description="เกมทายตัวอักษรเพื่อเปิดคำที่ซ่อนอยู่"
          playTo="/guess-word"
          editTo="/guess-word/edit"
          accent="secondary"
          icon={<Type />}
        />
        <AdminGameCard
          title="Guess the Picture"
          description="เปิดแผ่นป้ายเพื่อทายภาพที่ซ่อนอยู่"
          playTo="/guess-picture"
          editTo="/guess-picture/edit"
          accent="accent"
          icon={<Image />}
        />
      </main>
    </div>
  );
}
