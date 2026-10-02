import React from "react";
import { Layers, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export interface WholesalePriceTier {
  quantity: number;
  price: number;
  unit?: string;
}

interface WholesalePriceEditorProps {
  tiers: WholesalePriceTier[];
  onChange: (tiers: WholesalePriceTier[]) => void;
}

export const WholesalePriceEditor: React.FC<WholesalePriceEditorProps> = ({
  tiers,
  onChange,
}) => {
  const { t } = useLanguage();

  const addTier = () => {
    onChange([...tiers, { quantity: 0, price: 0, unit: "" }]);
  };

  const updateTier = (
    index: number,
    field: "unit" | "quantity" | "price",
    value: string | number,
  ) => {
    const next = tiers.map((row, i) =>
      i === index ? { ...row, [field]: value } : row,
    );
    onChange(next);
  };

  const removeTier = (index: number) => {
    onChange(tiers.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">
            {t("inventory.wholesalePrices")}
          </h3>
        </div>
        <button
          type="button"
          onClick={addTier}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <Plus className="w-3.5 h-3.5" />
          {t("inventory.addTier")}
        </button>
      </div>

      {tiers.length === 0 ? (
        <div className="p-6 text-center">
          <p className="text-sm text-slate-400">
            {t("inventory.noWholesaleTiers")}
          </p>
          <button
            type="button"
            onClick={addTier}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/5 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <Plus className="w-4 h-4" />
            {t("inventory.addFirstTier")}
          </button>
        </div>
      ) : (
        <div className="p-4 space-y-2">
          <div className="hidden sm:grid sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 px-1 text-xs font-bold uppercase tracking-wider text-slate-400">
            <span>{t("inventory.tierUnitOptional")}</span>
            <span>{t("inventory.tierMinQuantity")}</span>
            <span>{t("inventory.tierPriceMMK")}</span>
            <span className="w-9" />
          </div>
          {tiers.map((wp, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center bg-white rounded-lg border border-slate-200 p-2.5 shadow-sm"
            >
              <div>
                <label
                  htmlFor={`wholesale-unit-${idx}`}
                  className="sm:hidden text-xs font-bold text-slate-500 uppercase block mb-1"
                >
                  {t("inventory.tierUnitOptional")}
                </label>
                <input
                  id={`wholesale-unit-${idx}`}
                  type="text"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={wp.unit || ""}
                  onChange={(e) => updateTier(idx, "unit", e.target.value)}
                  placeholder={t("inventory.wholesaleUnitPlaceholder")}
                />
              </div>
              <div>
                <label
                  htmlFor={`wholesale-qty-${idx}`}
                  className="sm:hidden text-xs font-bold text-slate-500 uppercase block mb-1"
                >
                  {t("inventory.tierMinQuantity")}
                </label>
                <input
                  id={`wholesale-qty-${idx}`}
                  type="number"
                  step="1"
                  min="0"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={wp.quantity || ""}
                  onChange={(e) =>
                    updateTier(idx, "quantity", Number(e.target.value) || 0)
                  }
                  placeholder="0"
                />
              </div>
              <div>
                <label
                  htmlFor={`wholesale-price-${idx}`}
                  className="sm:hidden text-xs font-bold text-slate-500 uppercase block mb-1"
                >
                  {t("inventory.tierPriceMMK")}
                </label>
                <input
                  id={`wholesale-price-${idx}`}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  value={wp.price || ""}
                  onChange={(e) =>
                    updateTier(idx, "price", Number(e.target.value) || 0)
                  }
                  placeholder="0"
                />
              </div>
              <button
                type="button"
                onClick={() => removeTier(idx)}
                className="flex items-center justify-center w-full sm:w-9 h-9 text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/20"
                aria-label={t("inventory.removeTier")}
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
