import React, { useMemo } from "react";
import { Layers } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { UomConversion } from "../../types/uom";
import { getConversionFactor, normalizeUnit } from "../../utils/uom";

export interface UnitPriceStockRow {
  unit: string;
  isBase: boolean;
  factor: number;
  capacity: string;
  sellingPrice: number;
  buyingPrice?: number;
  quantity: number;
  formattedQty: string;
}

export interface UnitPriceStockTableProps {
  baseUnit: string;
  uomConversions?: UomConversion[];
  sellingPrice: number;
  buyingPrice?: number;
  quantityByUnit?: Record<string, number>;
  baseQuantity: number;
  showBuyingPrice?: boolean;
}

export const UnitPriceStockTable: React.FC<UnitPriceStockTableProps> = ({
  baseUnit,
  uomConversions,
  sellingPrice,
  buyingPrice,
  quantityByUnit,
  baseQuantity,
  showBuyingPrice = false,
}) => {
  const { t } = useLanguage();

  const rows = useMemo<UnitPriceStockRow[]>(() => {
    const base = normalizeUnit(baseUnit) || "piece";
    const result: UnitPriceStockRow[] = [];

    // Format quantity: integer -> toLocaleString(), decimal -> 1 decimal place
    const formatQty = (qty: number): string => {
      if (Number.isInteger(qty)) return qty.toLocaleString();
      return Number(qty.toFixed(1)).toLocaleString();
    };

    // 1. Base unit row
    const baseQty =
      quantityByUnit && base in quantityByUnit
        ? quantityByUnit[base]
        : baseQuantity;

    result.push({
      unit: base,
      isBase: true,
      factor: 1,
      capacity: `1 ${base}`,
      sellingPrice: sellingPrice || 0,
      buyingPrice: typeof buyingPrice === "number" ? buyingPrice : undefined,
      quantity: baseQty,
      formattedQty: formatQty(baseQty),
    });

    // 2. Conversion units (sorted by factor ascending)
    const validConversions = (uomConversions || []).filter(
      (c) => c && c.unit && normalizeUnit(c.unit) !== base,
    );

    const sortedConversions = [...validConversions].map((c) => {
      const u = normalizeUnit(c.unit);
      const factor = getConversionFactor(base, u, uomConversions);
      return { ...c, unit: u, calculatedFactor: factor };
    });

    sortedConversions.sort((a, b) => a.calculatedFactor - b.calculatedFactor);

    for (const c of sortedConversions) {
      const factor = c.calculatedFactor;
      const unitQty =
        quantityByUnit && c.unit in quantityByUnit
          ? quantityByUnit[c.unit]
          : factor > 0
            ? baseQuantity / factor
            : 0;

      result.push({
        unit: c.unit,
        isBase: false,
        factor,
        capacity: `${factor} ${base}`,
        sellingPrice: (sellingPrice || 0) * factor,
        buyingPrice:
          typeof buyingPrice === "number" ? buyingPrice * factor : undefined,
        quantity: unitQty,
        formattedQty: formatQty(unitQty),
      });
    }

    return result;
  }, [
    baseUnit,
    uomConversions,
    sellingPrice,
    buyingPrice,
    quantityByUnit,
    baseQuantity,
  ]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Table Header / Title */}
      <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            {t("storefrontProduct.unitTableTitle")}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t("storefrontProduct.unitTableSubtitle")}
          </p>
        </div>
      </div>

      {/* Desktop Table (md and up) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">
                {t("storefrontProduct.unit")}
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider">
                {t("storefrontProduct.capacity")}
              </th>
              <th className="px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider text-right">
                {t("storefrontProduct.sellingPrice")}
              </th>
              {showBuyingPrice && (
                <th className="px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider text-right">
                  {t("storefrontProduct.buyingPrice")}
                </th>
              )}
              <th className="px-4 py-3 font-semibold text-slate-700 text-xs uppercase tracking-wider text-right">
                {t("storefrontProduct.stock")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr
                key={row.unit}
                className="hover:bg-slate-50/60 transition-colors"
              >
                <td className="px-4 py-3.5 font-medium text-slate-800">
                  <div className="inline-flex items-center gap-2">
                    <span>{row.unit}</span>
                    {row.isBase && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                        {t("storefrontProduct.baseUnitBadge")}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-slate-600 text-sm">
                  {row.capacity}
                </td>
                <td className="px-4 py-3.5 text-right font-bold text-slate-900 tabular-nums">
                  {row.sellingPrice.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    MMK
                  </span>
                </td>
                {showBuyingPrice && (
                  <td className="px-4 py-3.5 text-right font-medium text-slate-600 tabular-nums">
                    {typeof row.buyingPrice === "number" ? (
                      <>
                        {row.buyingPrice.toLocaleString()}{" "}
                        <span className="text-xs font-normal text-slate-400">
                          MMK
                        </span>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                )}
                <td className="px-4 py-3.5 text-right font-bold text-slate-800 tabular-nums text-base">
                  {row.formattedQty}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Row Cards (< md) */}
      <div className="md:hidden divide-y divide-slate-100">
        {rows.map((row) => (
          <div key={row.unit} className="p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-800 text-sm">
                  {row.unit}
                </span>
                {row.isBase && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                    {t("storefrontProduct.baseUnitBadge")}
                  </span>
                )}
              </div>
              <span className="font-bold text-slate-900 text-sm tabular-nums">
                {row.sellingPrice.toLocaleString()} MMK
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{row.capacity}</span>
              <span className="font-semibold text-slate-700 tabular-nums">
                {t("storefrontProduct.stock")}:{" "}
                <span className="text-slate-900 font-bold text-sm">
                  {row.formattedQty}
                </span>
              </span>
            </div>
            {showBuyingPrice && typeof row.buyingPrice === "number" && (
              <div className="text-right text-xs text-slate-500 tabular-nums pt-0.5">
                {t("storefrontProduct.buyingPrice")}:{" "}
                {row.buyingPrice.toLocaleString()} MMK
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
