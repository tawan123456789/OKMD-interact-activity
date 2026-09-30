import { useEffect, useRef, useState } from "react";
import { Trash2, Plus, Upload, ImageOff } from "lucide-react";
import { EditLayout } from "../../components/EditLayout";
import { LoadingScreen } from "../../components/LoadingScreen";
import { StateScreen } from "../../components/StateScreen";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { GridPreview } from "./GridPreview";
import { useConfig } from "../../hooks/useConfig";
import { useToast } from "../../components/Toast";
import { api } from "../../services/api";
import { GRID_MIN, GRID_MAX, DEFAULT_GRID, type PictureQuestion } from "../../types";
import { totalTiles } from "../../utils/pictureGrid";
import { generateId } from "../../utils/id";
import form from "../../styles/form.module.css";
import styles from "./GuessPictureEdit.module.css";

const PRESETS: Array<[number, number]> = [
  [2, 2],
  [3, 3],
  [3, 4],
  [4, 4],
  [4, 5],
  [5, 5],
];

const GRID_OPTIONS = Array.from(
  { length: GRID_MAX - GRID_MIN + 1 },
  (_, i) => GRID_MIN + i
);

function newPicture(): PictureQuestion {
  return {
    id: generateId(),
    image: "",
    answer: "",
    gridRows: DEFAULT_GRID,
    gridColumns: DEFAULT_GRID,
  };
}

function normalize(pictures: PictureQuestion[]): PictureQuestion[] {
  return pictures.map((p) => ({
    ...p,
    gridRows: p.gridRows ?? DEFAULT_GRID,
    gridColumns: p.gridColumns ?? DEFAULT_GRID,
  }));
}

export function GuessPictureEdit() {
  const { data, loading, error, reload } = useConfig(api.getGuessPicture);
  const toast = useToast();

  const [pictures, setPictures] = useState<PictureQuestion[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    if (data) setPictures(normalize(data.pictures));
  }, [data]);

  const dirty =
    !!data && JSON.stringify(normalize(data.pictures)) !== JSON.stringify(pictures);

  function update(id: string, patch: Partial<PictureQuestion>) {
    setPictures((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  async function handleUpload(id: string, file: File) {
    setUploadingId(id);
    try {
      const { image } = await api.uploadImage(file);
      update(id, { image });
      toast.success("อัปโหลดรูปสำเร็จ");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingId(null);
    }
  }

  function confirmDelete() {
    if (!deleteId) return;
    setPictures((ps) => ps.filter((p) => p.id !== deleteId));
    setDeleteId(null);
  }

  function validate(): PictureQuestion[] | null {
    for (const [i, p] of pictures.entries()) {
      if (!p.image) {
        toast.error(`รูปที่ ${i + 1}: กรุณาอัปโหลดรูปภาพ`);
        return null;
      }
      if (!p.answer.trim()) {
        toast.error(`รูปที่ ${i + 1}: กรุณากรอกคำตอบ`);
        return null;
      }
      if (
        !Number.isInteger(p.gridRows) ||
        p.gridRows < GRID_MIN ||
        p.gridRows > GRID_MAX
      ) {
        toast.error(`รูปที่ ${i + 1}: Rows must be between ${GRID_MIN} and ${GRID_MAX}.`);
        return null;
      }
      if (
        !Number.isInteger(p.gridColumns) ||
        p.gridColumns < GRID_MIN ||
        p.gridColumns > GRID_MAX
      ) {
        toast.error(`รูปที่ ${i + 1}: Columns must be between ${GRID_MIN} and ${GRID_MAX}.`);
        return null;
      }
    }
    return pictures.map((p) => ({ ...p, answer: p.answer.trim() }));
  }

  async function onSave() {
    const valid = validate();
    if (!valid) return;
    setSaving(true);
    try {
      await api.saveGuessPicture({ pictures: valid });
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
      title="Guess the Picture Config"
      subtitle="จัดการรูปภาพ คำตอบ และรูปแบบแผ่นป้ายของแต่ละรูป"
      dirty={dirty}
      saving={saving}
      onSave={onSave}
      onReload={reload}
    >
      <div className={styles.list}>
        {pictures.map((p, i) => {
          const preset = `${p.gridRows}x${p.gridColumns}`;
          return (
            <div key={p.id} className={styles.card}>
              <div className={styles.cardHead}>
                <h3 className={styles.cardTitle}>Picture {i + 1}</h3>
                <button
                  className="btn btn--sm btn--accent"
                  onClick={() => setDeleteId(p.id)}
                  aria-label={`Delete picture ${i + 1}`}
                >
                  <Trash2 size={18} aria-hidden />
                  <span>DELETE</span>
                </button>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.imageCol}>
                  <div className={styles.preview}>
                    {p.image ? (
                      <img src={p.image} alt={p.answer || `Picture ${i + 1} preview`} />
                    ) : (
                      <div className={styles.noImage}>
                        <ImageOff size={40} aria-hidden />
                        <span>No image</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={(el) => {
                      fileInputs.current[p.id] = el;
                    }}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(p.id, file);
                      e.target.value = "";
                    }}
                  />
                  <button
                    className="btn btn--sm"
                    onClick={() => fileInputs.current[p.id]?.click()}
                    disabled={uploadingId === p.id}
                  >
                    <Upload size={18} aria-hidden />
                    <span>
                      {uploadingId === p.id
                        ? "Uploading..."
                        : p.image
                        ? "CHANGE IMAGE"
                        : "UPLOAD IMAGE"}
                    </span>
                  </button>
                </div>

                <div className={styles.fieldsCol}>
                  <div className={form.field}>
                    <label className={form.label} htmlFor={`answer-${p.id}`}>
                      Answer
                    </label>
                    <input
                      id={`answer-${p.id}`}
                      className={`${form.input} ${form.inputWide}`}
                      value={p.answer}
                      onChange={(e) => update(p.id, { answer: e.target.value })}
                      placeholder="คำตอบของรูปนี้..."
                    />
                  </div>

                  <div className={form.field}>
                    <span className={form.label}>Tile Layout</span>
                    <div className={styles.presets}>
                      {PRESETS.map(([r, c]) => {
                        const active = preset === `${r}x${c}`;
                        return (
                          <button
                            key={`${r}x${c}`}
                            className={`btn btn--sm ${active ? "btn--primary" : ""}`}
                            onClick={() => update(p.id, { gridRows: r, gridColumns: c })}
                          >
                            {r} × {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className={styles.gridSelectors}>
                    <div className={form.field}>
                      <label className={form.label} htmlFor={`rows-${p.id}`}>
                        Rows
                      </label>
                      <select
                        id={`rows-${p.id}`}
                        className={form.select}
                        value={p.gridRows}
                        onChange={(e) =>
                          update(p.id, { gridRows: Number(e.target.value) })
                        }
                      >
                        {GRID_OPTIONS.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={form.field}>
                      <label className={form.label} htmlFor={`cols-${p.id}`}>
                        Columns
                      </label>
                      <select
                        id={`cols-${p.id}`}
                        className={form.select}
                        value={p.gridColumns}
                        onChange={(e) =>
                          update(p.id, { gridColumns: Number(e.target.value) })
                        }
                      >
                        {GRID_OPTIONS.map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <p className={styles.total}>
                    Total Tiles: {totalTiles(p.gridRows, p.gridColumns)}
                  </p>

                  <GridPreview rows={p.gridRows} cols={p.gridColumns} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="btn" onClick={() => setPictures((ps) => [...ps, newPicture()])}>
        <Plus aria-hidden />
        <span>ADD PICTURE</span>
      </button>

      <ConfirmDialog
        open={deleteId !== null}
        title="Delete this picture?"
        message="ลบรูปนี้ออกจากรายการ (จะมีผลเมื่อกด Save)"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </EditLayout>
  );
}
