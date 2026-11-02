import React, { useEffect, useMemo } from "react";
import { UomConversion } from "../../types/uom";
import { useLanguage } from "../../context/LanguageContext";

interface EcommerceUnitsSelectorProps {
  baseUnit?: string;
  conversions?: UomConversion[];
  value?: string[];
  onChange: (units: string[]) => void;
}

// Ecommerce Storefront တွင် ပြသမည့် unit များကို ရွေးချယ်နိုင်သော Component
export const EcommerceUnitsSelector: React.FC<EcommerceUnitsSelectorProps> = ({
  baseUnit,
  conversions = [],
  value = [],
  onChange,
}) => {
  const { t } = useLanguage();

  const trimmedBase = (baseUnit || "").trim();

  // တရားဝင်သော unit အားလုံး (base unit + non-empty conversions)
  const availableUnits = useMemo(() => {
    const list: { unit: string; isBase: boolean }[] = [];
    if (trimmedBase) {
      list.push({ unit: trimmedBase, isBase: true });
    }
    for (const c of conversions) {
      const u = (c.unit || "").trim();
      if (u && !list.some((item) => item.unit.toLowerCase() === u.toLowerCase())) {
        list.push({ unit: u, isBase: false });
      }
    }
    return list;
  }, [trimmedBase, conversions]);

  // Conversion များကို ပြင်ဆင်/ဖျက်လိုက်သည့်အခါ မရှိတော့သော unit များကို value ထဲမှ အလိုအလျောက် ဖယ်ထုတ်ခြင်း (Client-side pruning)
  useEffect(() => {
    if (!value || value.length === 0) return;
    const allowedMap = new Map<string, string>();
    for (const u of availableUnits) {
      allowedMap.set(u.unit.toLowerCase(), u.unit);
    }

    const pruned: string[] = [];
    const seen = new Set<string>();
    for (const v of value) {
      const key = v.trim().toLowerCase();
      if (allowedMap.has(key) && !seen.has(key)) {
        seen.add(key);
        pruned.push(allowedMap.get(key)!);
      }
    }

    if (pruned.length !== value.length || pruned.some((p, i) => p !== value[i])) {
      onChange(pruned);
    }
  }, [availableUnits, value, onChange]);

  // Checkbox အဖွင့်/အပိတ် ပြုလုပ်ခြင်း
  const handleToggle = (unitName: string) => {
    const key = unitName.toLowerCase();
    const isChecked = value.some((v) => v.toLowerCase() === key);

    if (isChecked) {
      onChange(value.filter((v) => v.toLowerCase() !== key));
    } else {
      onChange([...value, unitName]);
    }
  };

  // Ecommerce တွင် အမှန်တကယ် ပြသမည့် units များအား Live Preview ပြသရန် တွက်ချက်ခြင်း (D-2 Rule)
  const previewUnits = useMemo(() => {
    // ၁။ ရွေးချယ်ထားသော unit များ ရှိပါက ထို unit များကို ပြမည်
    const selected = availableUnits.filter((u) =>
      value.some((v) => v.toLowerCase() === u.unit.toLowerCase())
    );
    if (selected.length > 0) {
      return selected.map((s) => s.unit);
    }

    // ၂။ မရွေးထားပါက Default rule: Conversion များ ရှိပါက conversion များကိုသာ ပြမည် (base ဖျောက်မည်)
    const convOnly = availableUnits.filter((u) => !u.isBase);
    if (convOnly.length > 0) {
      return convOnly.map((c) => c.unit);
    }

    // ၃။ Conversion မရှိပါက base unit ကို ပြမည်
    return trimmedBase ? [trimmedBase] : [];
  }, [availableUnits, value, trimmedBase]);

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
      <div>
        <h4 className="font-semibold text-slate-800 text-sm">
          {t("inventory.ecommerceUnits")}
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">
          {t("inventory.ecommerceUnitsHelp")}
        </p>
      </div>

      {/* Checkboxes per unit */}
      <div className="flex flex-wrap items-center gap-4 pt-1">
        {availableUnits.map(({ unit, isBase }) => {
          const isChecked = value.some((v) => v.toLowerCase() === unit.toLowerCase());
          return (
            <label
              key={unit}
              className="inline-flex items-center gap-2 cursor-pointer text-sm text-slate-700 select-none hover:text-slate-900"
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleToggle(unit)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
              />
              <span className="font-medium">
                {unit} {isBase && <span className="text-xs text-slate-400 font-normal">{t("inventory.baseUnitTag")}</span>}
              </span>
            </label>
          );
        })}
      </div>

      {/* Live preview line */}
      <div className="text-xs text-slate-600 pt-2 border-t border-slate-200/80">
        <span className="font-medium">
          {t("inventory.ecommerceUnitsPreview", {
            units: previewUnits.length > 0 ? previewUnits.join(", ") : "-",
          })}
        </span>
      </div>
    </div>
  );
};
