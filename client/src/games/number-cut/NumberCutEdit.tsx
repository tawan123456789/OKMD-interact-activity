import { useEffect, useState } from "react";
import { EditLayout } from "../../components/EditLayout";
import { LoadingScreen } from "../../components/LoadingScreen";
import { StateScreen } from "../../components/StateScreen";
import { useConfig } from "../../hooks/useConfig";
import { useToast } from "../../components/Toast";
import { api } from "../../services/api";
import { ROUNDS_MIN, ROUNDS_MAX, type NumberCutConfig } from "../../types";
import form from "../../styles/form.module.css";

export function NumberCutEdit() {
  const { data, loading, error, reload } = useConfig(api.getNumberCut);
  const toast = useToast();

  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [rounds, setRounds] = useState("6");
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setMin(String(data.min));
      setMax(String(data.max));
      setRounds(String(data.rounds));
    }
  }, [data]);

  const dirty =
    !!data &&
    (String(data.min) !== min ||
      String(data.max) !== max ||
      String(data.rounds) !== rounds);

  function validate(): NumberCutConfig | null {
    const minN = Number(min);
    const maxN = Number(max);
    const roundsN = Number(rounds);
    if (!Number.isInteger(minN)) {
      setValidationError("Minimum must be an integer");
      return null;
    }
    if (!Number.isInteger(maxN)) {
      setValidationError("Maximum must be an integer");
      return null;
    }
    if (minN >= maxN) {
      setValidationError("Minimum must be less than Maximum");
      return null;
    }
    if (maxN - minN < 2) {
      setValidationError("ช่วง (max - min) ต้องมีอย่างน้อย 2");
      return null;
    }
    if (!Number.isInteger(roundsN) || roundsN < ROUNDS_MIN || roundsN > ROUNDS_MAX) {
      setValidationError(`Number of rounds must be between ${ROUNDS_MIN} and ${ROUNDS_MAX}.`);
      return null;
    }
    setValidationError(null);
    return { min: minN, max: maxN, rounds: roundsN };
  }

  async function onSave() {
    const valid = validate();
    if (!valid) {
      toast.error(validationError ?? "Invalid config");
      return;
    }
    setSaving(true);
    try {
      await api.saveNumberCut(valid);
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

  const roundsN = Number(rounds);
  const cutRounds = Number.isInteger(roundsN) && roundsN >= 2 ? roundsN - 1 : "?";

  return (
    <EditLayout
      title="Number Cut Config"
      subtitle="กำหนดช่วงตัวเลขและจำนวนรอบ"
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
          <label className={form.label} htmlFor="rounds">
            Number of Rounds
          </label>
          <input
            id="rounds"
            className={form.input}
            type="number"
            min={ROUNDS_MIN}
            max={ROUNDS_MAX}
            value={rounds}
            onChange={(e) => setRounds(e.target.value)}
          />
          <span className={form.hint}>
            รอบสุดท้ายจะเลือกเลขที่ใกล้ที่สุด ดังนั้น {rounds || "?"} รอบ = {cutRounds} รอบตัด + 1 รอบสุดท้าย
          </span>
        </div>
        {validationError && <p className={form.error}>{validationError}</p>}
      </div>
    </EditLayout>
  );
}
