import React, { useEffect, useMemo, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { Barcode, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import type { UomConversion } from "../../types/uom";
import { getConversionFactor, getUnitOptions, getUnitPrice } from "../../utils/uom";

interface BatchStickerProps {
  isOpen: boolean;
  onClose: () => void;
  batchData: {
    productName: string;
    productCode?: string;
    batchNumber: string;
    batchBarcode: string;
    expiryDate?: string | Date | null;
    // base unit စျေး
    sellingPrice?: number;
    // base unit အရေအတွက်
    quantity?: number;
    baseUnit?: string;
    uomConversions?: UomConversion[];
    // GRN ဆိုလျှင် PO unit
    defaultUnit?: string;
  } | null;
}

// Unit barcode — base unit မဟုတ်လျှင် batch barcode နောက်တွင် factor ထည့် (backend unitBarcode.utils.js နှင့် တူ)
const buildUnitBarcode = (batchBarcode: string, factor: number) =>
  factor > 1 ? `${batchBarcode}-${factor}` : batchBarcode;

export const BatchBarcodeStickerModal: React.FC<BatchStickerProps> = ({
  isOpen,
  onClose,
  batchData,
}) => {
  const { t } = useLanguage();
  const [selectedUnit, setSelectedUnit] = useState<string>("");
  const svgRef = useRef<SVGSVGElement | null>(null);

  const baseUnit = batchData?.baseUnit || "";
  const conversions = useMemo(() => batchData?.uomConversions || [], [batchData]);
  const unitOptions = useMemo(
    () => (baseUnit ? getUnitOptions(baseUnit, conversions) : []),
    [baseUnit, conversions],
  );
  const factor = baseUnit && selectedUnit
    ? getConversionFactor(baseUnit, selectedUnit, conversions)
    : 1;
  const barcodeValue = batchData ? buildUnitBarcode(batchData.batchBarcode, factor) : "";
  const unitLabel = selectedUnit
    ? factor > 1
      ? `${selectedUnit} (${factor} ${baseUnit})`
      : selectedUnit
    : "";
  const unitPrice =
    batchData?.sellingPrice && baseUnit && selectedUnit
      ? getUnitPrice(batchData.sellingPrice, baseUnit, selectedUnit, conversions)
      : batchData?.sellingPrice;

  // Modal ဖွင့်တိုင်း default unit (GRN = PO unit, အခြား = base unit) သို့ ပြန်ထား
  useEffect(() => {
    if (!batchData) return;
    const isValid = unitOptions.some((o) => o.value === batchData.defaultUnit);
    setSelectedUnit(isValid ? batchData.defaultUnit! : baseUnit);
  }, [batchData, unitOptions, baseUnit]);

  useEffect(() => {
    if (isOpen && barcodeValue && svgRef.current) {
      try {
        JsBarcode(svgRef.current, barcodeValue, {
          format: "CODE128",
          width: 1.5,
          height: 38,
          displayValue: false, // We render custom text below
          margin: 0,
        });
      } catch (e) {
        console.error("Barcode render error:", e);
      }
    }
  }, [isOpen, barcodeValue]);

  if (!isOpen || !batchData) return null;

  const formattedExpiry = batchData.expiryDate
    ? new Date(batchData.expiryDate).toLocaleDateString("en-GB") // DD/MM/YYYY
    : "-";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
            <Barcode className="w-5 h-5 text-primary" />
            {t("inventory.stickerModal.title")}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Sticker Preview */}
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4">
            <div className="w-[220px] rounded-md border border-slate-200 bg-white p-2.5 shadow-sm">
              <div className="truncate text-center text-xs font-bold text-slate-800">
                {batchData.productName}
                {unitLabel ? ` · ${unitLabel}` : ""}
              </div>

              <div className="my-1.5 flex flex-col items-center">
                <svg ref={svgRef} className="h-9 w-40"></svg>
                <span className="font-mono text-[10px] font-bold tracking-wider text-slate-700">
                  {barcodeValue}
                </span>
              </div>

              <div className="flex justify-between text-[9px] text-slate-600">
                <span>
                  {t("inventory.stickerModal.batchLabel")} <strong>{batchData.batchNumber}</strong>
                </span>
                <span>
                  {t("inventory.stickerModal.expiryLabel")} <strong>{formattedExpiry}</strong>
                </span>
              </div>

              {unitPrice ? (
                <div className="mt-1 text-right text-[10px] font-bold text-primary">
                  {unitPrice.toLocaleString()} Ks
                </div>
              ) : null}
            </div>
            <span className="mt-2 text-xs text-slate-500">
              {t("inventory.stickerModal.previewText")}
            </span>
          </div>

          {/* Unit — ပုံး/ဖာ ပေါ် ကပ်မည့် sticker ဆိုလျှင် scan တစ်ကြိမ်ဖြင့် unit တစ်ခုလုံး ဝင်မည် */}
          {unitOptions.length > 1 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Unit
              </label>
              <select
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-primary focus:ring-2 focus:ring-primary"
              >
                {unitOptions.map((opt) => {
                  const f = getConversionFactor(baseUnit, opt.value, conversions);
                  return (
                    <option key={opt.value} value={opt.value}>
                      {f > 1 ? `${opt.value} (${f} ${baseUnit})` : opt.value}
                    </option>
                  );
                })}
              </select>
              <p className="mt-1 text-xs text-slate-500">
                Scan တစ်ကြိမ် = {factor} {baseUnit}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium text-slate-700"
          >
            {t("inventory.stickerModal.close")}
          </button>
        </div>
      </div>
    </div>
  );
};
