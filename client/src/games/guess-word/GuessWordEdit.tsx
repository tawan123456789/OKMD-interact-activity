import { useEffect, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { EditLayout } from "../../components/EditLayout";
import { LoadingScreen } from "../../components/LoadingScreen";
import { StateScreen } from "../../components/StateScreen";
import { useConfig } from "../../hooks/useConfig";
import { useToast } from "../../components/Toast";
import { api } from "../../services/api";
import form from "../../styles/form.module.css";
import styles from "./GuessWordEdit.module.css";

export function GuessWordEdit() {
  const { data, loading, error, reload } = useConfig(api.getGuessWord);
  const toast = useToast();

  const [words, setWords] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setWords(data.words);
  }, [data]);

  const dirty =
    !!data && JSON.stringify(data.words) !== JSON.stringify(words);

  function updateWord(i: number, value: string) {
    setWords((w) => w.map((word, idx) => (idx === i ? value : word)));
  }

  function deleteWord(i: number) {
    setWords((w) => w.filter((_, idx) => idx !== i));
  }

  function addWord() {
    setWords((w) => [...w, ""]);
  }

  function validate(): string[] | null {
    const trimmed = words.map((w) => w.trim());
    if (trimmed.length === 0) {
      toast.error("At least one word is required");
      return null;
    }
    if (trimmed.some((w) => w.length === 0)) {
      toast.error("Words cannot be empty");
      return null;
    }
    const seen = new Set<string>();
    for (const w of trimmed) {
      const key = w.toLowerCase();
      if (seen.has(key)) {
        toast.error(`Duplicate word: "${w}"`);
        return null;
      }
      seen.add(key);
    }
    return trimmed;
  }

  async function onSave() {
    const valid = validate();
    if (!valid) return;
    setSaving(true);
    try {
      await api.saveGuessWord({ words: valid });
      toast.success("Saved successfully");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingScreen />;
  if (error || !data) {
    return (
      <StateScreen title="โหลดค่าไม่สำเร็จ" message="Unable to load configuration.">
        <button className="btn btn--primary" onClick={reload}>Retry</button>
      </StateScreen>
    );
  }

  return (
    <EditLayout
      title="Guess the Word Config"
      subtitle="จัดการรายการคำที่ใช้ในเกม"
      dirty={dirty}
      saving={saving}
      onSave={onSave}
      onReload={reload}
    >
      <div className={form.section}>
        <h2 className={styles.heading}>WORDS</h2>
        <ol className={styles.list}>
          {words.map((word, i) => (
            <li key={i} className={styles.row}>
              <span className={styles.num}>{i + 1}.</span>
              <input
                className={`${form.input} ${form.inputWide} ${styles.wordInput}`}
                value={word}
                onChange={(e) => updateWord(i, e.target.value)}
                placeholder="พิมพ์คำ..."
                aria-label={`Word ${i + 1}`}
              />
              <button
                className="btn btn--sm btn--accent"
                onClick={() => deleteWord(i)}
                aria-label={`Delete word ${i + 1}`}
              >
                <Trash2 size={18} aria-hidden />
                <span>DELETE</span>
              </button>
            </li>
          ))}
        </ol>
        <button className="btn" onClick={addWord}>
          <Plus aria-hidden />
          <span>ADD WORD</span>
        </button>
      </div>
    </EditLayout>
  );
}
