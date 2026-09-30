import { useEffect, useState } from "react";
import { EditLayout } from "../../components/EditLayout";
import { LoadingScreen } from "../../components/LoadingScreen";
import { StateScreen } from "../../components/StateScreen";
import { useConfig } from "../../hooks/useConfig";
import { useToast } from "../../components/Toast";
import { api } from "../../services/api";
import {
  SHUFFLE_MIN,
  SHUFFLE_MAX,
  SHUFFLE_DEFAULT,
  type RandomNumberConfig,
} from "../../types";
import form from "../../styles/form.module.css";

export function RandomNumberEdit() {
  const { data, loading, error, reload } = useConfig(api.getRandomNumber);
  const toast = useToast();

  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [shuffle, setShuffle] = useState(String(SHUFFLE_DEFAULT));
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setMin(String(data.min));
      setMax(String(data.max));
      // Backward compat: old configs may not have shuffleSeconds.
      setShuffle(String(data.shuffleSeconds ?? SHUFFLE_DEFAULT));
    }
  }, [data]);

  const dirty =
    !!data &&
    (String(data.min) !== min ||
      String(data.max) !== max ||
      String(data.shuffleSeconds ?? SHUFFLE_DEFAULT) !== shuffle);

  function validate(): RandomNumberConfig | null {
    const minN = Number(min);
    const maxN = Number(max);
    const shuffleN = Number(shuffle);
    if (!Number.isInteger(minN)) {
      setValidationError("Minimum must be an integer");
      return null;
    }
    if (!Number.isInteger(maxN)) {
      setValidationError("Maximum must be an integer");
      return null;
    }
    if (minN > maxN) {
      setValidationError("Minimum must be less than or equal to Maximum");
      return null;
    }
    if (!Number.isFinite(shuffleN) || shuffleN < SHUFFLE_MIN || shuffleN > SHUFFLE_MAX) {
      setValidationError(
        `Shuffle duration must be between ${SHUFFLE_MIN} and ${SHUFFLE_MAX} seconds.`
      );
      return null;
    }
    setValidationError(null);
    return { min: minN, max: maxN, shuffleSeconds: shuffleN };
  }

  async function onSave() {
    const valid = validate();
    if (!valid) {
      toast.error(validationError ?? "Invalid config");
      return;
    }
    setSaving(true);
    try {
      await api.saveRandomNumber(valid);
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
        <button className="btn btn--primary" onClick={reload}>
          Retry
        </button>
      </StateScreen>
    );
  }

  return (
    <EditLayout
      title="Random Number Config"
      subtitle="กำหนดช่วงตัวเลขและระยะเวลาการสุ่ม"
      dirty={dirty}
      saving={saving}
      onSave={onSave}
      onReload={reload}
    >
      <div className={form.section}>
        <div className={form.field}>
          <label className={form.label} htmlFor="min">
            Minimum Number
          </label>
          <input
            id="min"
            className={form.input}
            type="number"
            value={min}
            onChange={(e) => setMin(e.target.value)}
          />
        </div>
        <div className={form.field}>
          <label className={form.label} htmlFor="max">
            Maximum Number
          </label>
          <input
            id="max"
            className={form.input}
            type="number"
            value={max}
            onChange={(e) => setMax(e.target.value)}
          />
        </div>
        <div className={form.field}>
          <label className={form.label} htmlFor="shuffle">
            ระยะเวลาการสุ่ม (วินาที)
          </label>
          <input
            id="shuffle"
            className={form.input}
            type="number"
            step="0.1"
            min={SHUFFLE_MIN}
            max={SHUFFLE_MAX}
            value={shuffle}
            onChange={(e) => setShuffle(e.target.value)}
          />
          <span className={form.hint}>
            ระยะเวลาที่ตัวเลขจะหมุนก่อนหยุดที่ผลลัพธ์ ({SHUFFLE_MIN}–{SHUFFLE_MAX} วินาที)
          </span>
        </div>
        {validationError && <p className={form.error}>{validationError}</p>}
      </div>
    </EditLayout>
  );
}
