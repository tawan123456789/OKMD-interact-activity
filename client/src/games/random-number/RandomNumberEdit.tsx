import { useEffect, useState } from "react";
import { EditLayout } from "../../components/EditLayout";
import { LoadingScreen } from "../../components/LoadingScreen";
import { StateScreen } from "../../components/StateScreen";
import { useConfig } from "../../hooks/useConfig";
import { useToast } from "../../components/Toast";
import { api } from "../../services/api";
import form from "../../styles/form.module.css";

export function RandomNumberEdit() {
  const { data, loading, error, reload } = useConfig(api.getRandomNumber);
  const toast = useToast();

  const [min, setMin] = useState("1");
  const [max, setMax] = useState("100");
  const [saving, setSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (data) {
      setMin(String(data.min));
      setMax(String(data.max));
    }
  }, [data]);

  const dirty =
    !!data && (String(data.min) !== min || String(data.max) !== max);

  function validate(): { min: number; max: number } | null {
    const minN = Number(min);
    const maxN = Number(max);
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
    setValidationError(null);
    return { min: minN, max: maxN };
  }

  async function onSave() {
    const valid = validate();
    if (!valid) {
      toast.error(validationError ?? "Invalid range");
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
      subtitle="กำหนดช่วงตัวเลขที่ใช้สุ่ม"
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
        {validationError && <p className={form.error}>{validationError}</p>}
      </div>
    </EditLayout>
  );
}
