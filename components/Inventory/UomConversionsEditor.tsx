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
    <div className="col-span-1 sm:col-span-2 border border-slate-200 rounded-xl p-4 bg-slate-50 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
          {t("inventory.uomConversions")}
        </label>
        <button
          type="button"
          onClick={addRow}
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1.5 py-0.5"
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
          <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-xs font-bold text-slate-500 px-1">
            <span className="sm:col-span-3">{t("inventory.conversionUnit")}</span>
            <span className="sm:col-span-2">{t("inventory.conversionFactor")}</span>
            <span className="sm:col-span-3">{t("inventory.convertFrom")}</span>
            <span className="sm:col-span-3">{t("inventory.defaultSellingUnit")}</span>
            <span className="sm:col-span-1" />
          </div>
          {conversions.map((row, index) => (
            <div
              key={index}
              className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-white rounded-lg border border-slate-200 p-2.5 shadow-sm"
            >
              <div className="sm:col-span-3">
                <label className="sm:hidden text-xs font-bold text-slate-500 uppercase block mb-1">
                  {t("inventory.conversionUnit")}
                </label>
                <input
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={row.unit}
                  placeholder={t("inventory.conversionUnitPlaceholder")}
                  onChange={(e) => updateRow(index, { unit: e.target.value })}
                  aria-label={t("inventory.conversionUnit")}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="sm:hidden text-xs font-bold text-slate-500 uppercase block mb-1">
                  {t("inventory.conversionFactor")}
                </label>
                <input
                  type="number"
                  min="0.0001"
                  step="any"
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={row.factor}
                  onChange={(e) =>
                    updateRow(index, { factor: Number(e.target.value) || 0 })
                  }
                  aria-label={t("inventory.conversionFactor")}
                />
              </div>
              <div className="sm:col-span-3">
                <label className="sm:hidden text-xs font-bold text-slate-500 uppercase block mb-1">
                  {t("inventory.convertFrom")}
                </label>
                <select
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={row.convertFrom || ""}
                  onChange={(e) =>
                    updateRow(index, { convertFrom: e.target.value || null })
                  }
                  aria-label={t("inventory.convertFrom")}
                >
                  <option value="">
                    {t("inventory.baseUnitOption").replace("{base}", baseUnit || "—")}
                  </option>
                  {conversions
                    .filter((_, i) => i !== index && conversions[i].unit)
                    .map((c, i) => (
                      <option key={i} value={c.unit}>
                        {c.unit}
                      </option>
                    ))}
                </select>
              </div>
              <div className="sm:col-span-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                  <input
                    type="radio"
                    checked={!!row.isDefaultSellingUnit}
                    onChange={() => setDefaultSelling(index)}
                    className="text-primary focus:ring-primary"
                  />
                  {t("inventory.defaultSellingUnitShort")}
                </label>
              </div>
              <div className="sm:col-span-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="w-9 h-9 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                  aria-label={t("common.delete")}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
