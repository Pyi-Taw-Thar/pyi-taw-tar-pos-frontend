import React, { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
import { X, Barcode } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export interface BatchBarcodeModalData {
  productName: string;
  productCode?: string;
  batchNumber: string;
  batchBarcode: string;
  expiryDate?: string | Date | null;
  quantity?: number;
  unitOfMeasure?: string;
}

interface BatchBarcodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchData: BatchBarcodeModalData | null;
}

export const BatchBarcodeModal: React.FC<BatchBarcodeModalProps> = ({
  isOpen,
  onClose,
  batchData,
}) => {
  const { t } = useLanguage();
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (isOpen && batchData?.batchBarcode && svgRef.current) {
      try {
        JsBarcode(svgRef.current, batchData.batchBarcode, {
          format: "CODE128",
          width: 2,
          height: 64,
          displayValue: false,
          margin: 0,
          background: "#ffffff",
          lineColor: "#0f172a",
        });
      } catch (e) {
        console.error("Barcode render error:", e);
      }
    }
  }, [isOpen, batchData]);

  if (!isOpen || !batchData) return null;

  const formattedExpiry = batchData.expiryDate
    ? new Date(batchData.expiryDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col border border-slate-100">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <h3 className="font-bold text-base text-slate-800 flex items-center gap-2">
            <Barcode className="w-5 h-5 text-emerald-600" />
            {t("inventory.batchBarcodeModalTitle")}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-lg transition-colors text-slate-500 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Barcode Display Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center">
            <div className="bg-white px-6 py-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center max-w-full">
              <svg ref={svgRef} className="max-w-full" />
              <span className="font-mono text-lg font-bold text-slate-900 tracking-widest mt-2">
                {batchData.batchBarcode}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
              {t("inventory.batchBarcodeHelpText")}
            </p>
          </div>

          {/* Batch Information */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-sm">
            <div className="px-4 py-2.5 flex justify-between items-center">
              <span className="text-slate-500 text-xs">{t("inventory.productName")}</span>
              <span
                className="font-semibold text-slate-800 text-right text-xs truncate max-w-[220px]"
                title={batchData.productName}
              >
                {batchData.productName}
              </span>
            </div>
            {batchData.productCode && (
              <div className="px-4 py-2.5 flex justify-between items-center">
                <span className="text-slate-500 text-xs">{t("inventory.productCode")}</span>
                <span className="font-mono text-slate-700 text-xs">
                  {batchData.productCode}
                </span>
              </div>
            )}
            <div className="px-4 py-2.5 flex justify-between items-center">
              <span className="text-slate-500 text-xs">{t("inventory.batchNumber")}</span>
              <span className="font-semibold text-slate-800 text-xs">
                {batchData.batchNumber}
              </span>
            </div>
            {batchData.quantity != null && (
              <div className="px-4 py-2.5 flex justify-between items-center">
                <span className="text-slate-500 text-xs">{t("inventory.totalBatchQuantity")}</span>
                <span className="font-bold text-slate-900 text-xs">
                  {batchData.quantity.toLocaleString()} {batchData.unitOfMeasure || ""}
                </span>
              </div>
            )}
            <div className="px-4 py-2.5 flex justify-between items-center">
              <span className="text-slate-500 text-xs">{t("inventory.expiryDate")}</span>
              <span className="font-medium text-slate-800 text-xs">
                {formattedExpiry}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
          >
            {t("common.close")}
          </button>
        </div>
      </div>
    </div>
  );
};
