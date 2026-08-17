import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { UomConversion } from "../../types/uom";
import { useLanguage } from "../../context/LanguageContext";

interface UomConversionsEditorProps {
  baseUnit: string;
  conversions: UomConversion[];
  onChange: (conversions: UomConversion[]) => void;
}

const emptyRow = (): UomConversion => ({
  unit: "",
  factor: 1,
  isDefaultSellingUnit: false,
  convertFrom: null,
});

export const UomConversionsEditor: React.FC<UomConversionsEditorProps> = ({
  baseUnit,
  conversions,
  onChange,
}) => {
  const { t } = useLanguage();

  const updateRow = (index: number, patch: Partial<UomConversion>) => {
    const next = conversions.map((row, i) =>
      i === index ? { ...row, ...patch } : row,
    );
    onChange(next);
  };

  const setDefaultSelling = (index: number) => {
    onChange(
      conversions.map((row, i) => ({
        ...row,
        isDefaultSellingUnit: i === index,
      })),
    );
  };

  const removeRow = (index: number) => {
    onChange(conversions.filter((_, i) => i !== index));
  };

  const addRow = () => {
    const isFirst = conversions.length === 0;
    onChange([
      ...conversions,
      { ...emptyRow(), isDefaultSellingUnit: isFirst },
    ]);
  };

  return (
    <div className="col-span-2 border rounded-lg p-4 bg-slate-50">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
          {t("inventory.uomConversions")}
        </label>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80"
        >
          <Plus className="w-3.5 h-3.5" />
          {t("inventory.addConversion")}
        </button>
      </div>
      <p className="text-xs text-slate-500 mb-3">
        {t("inventory.uomConversionsHint").replace("{base}", baseUnit || "—")}
      </p>
      {conversions.length === 0 ? (
        <p className="text-xs text-slate-400 italic">
          {t("inventory.noConversions")}
        </p>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-500 px-1">
            <span className="col-span-3">{t("inventory.conversionUnit")}</span>
            <span className="col-span-2">{t("inventory.conversionFactor")}</span>
            <span className="col-span-3">Convert From</span>
            <span className="col-span-3">{t("inventory.defaultSellingUnit")}</span>
            <span className="col-span-1" />
          </div>
          {conversions.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 items-center bg-white rounded border p-2"
            >
              <input
                className="col-span-3 border rounded p-2 text-sm"
                value={row.unit}
                placeholder={t("inventory.conversionUnitPlaceholder")}
                onChange={(e) => updateRow(index, { unit: e.target.value })}
              />
              <input
                type="number"
                min="0.0001"
                step="any"
                className="col-span-2 border rounded p-2 text-sm"
                value={row.factor}
                onChange={(e) =>
                  updateRow(index, { factor: Number(e.target.value) || 0 })
                }
              />
              <div className="col-span-3">
                <select
                  className="w-full border rounded p-2 text-sm bg-white"
                  value={row.convertFrom || ""}
                  onChange={(e) =>
                    updateRow(index, { convertFrom: e.target.value || null })
                  }
                >
                  <option value="">{baseUnit} (base)</option>
                  {conversions
                    .filter((_, i) => i !== index && conversions[i].unit)
                    .map((c, i) => (
                      <option key={i} value={c.unit}>
                        {c.unit}
                      </option>
                    ))}
                </select>
              </div>
              <label className="col-span-3 flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  checked={!!row.isDefaultSellingUnit}
                  onChange={() => setDefaultSelling(index)}
                />
                {t("inventory.defaultSellingUnitShort")}
              </label>
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="col-span-1 p-1.5 text-red-500 hover:bg-red-50 rounded"
                aria-label={t("common.delete")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
