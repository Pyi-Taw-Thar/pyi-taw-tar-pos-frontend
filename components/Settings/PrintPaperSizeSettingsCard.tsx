import React, { useState, useEffect } from "react";
import { Printer, Check, LayoutGrid, List } from "lucide-react";
import { toast } from "sonner";
import { PrintPaperSizeSelector } from "../Print/PrintPaperSizeSelector";
import {
  getSavedPrintPaperSize,
  savePrintPaperSize,
  PrintPaperSize,
  PRINT_PAPER_OPTIONS,
  ThermalLayout,
  getSavedThermalLayout,
  saveThermalLayout,
  THERMAL_LAYOUT_OPTIONS,
} from "../../utils/printPaperSize";

export const PrintPaperSizeSettingsCard: React.FC = () => {
  const [paperSize, setPaperSize] = useState<PrintPaperSize>(() =>
    getSavedPrintPaperSize(),
  );
  const [thermalLayout, setThermalLayout] = useState<ThermalLayout>(() =>
    getSavedThermalLayout(),
  );

  useEffect(() => {
    setPaperSize(getSavedPrintPaperSize());
    setThermalLayout(getSavedThermalLayout());
  }, []);

  const handleChange = (size: PrintPaperSize) => {
    setPaperSize(size);
    savePrintPaperSize(size);
    const label =
      PRINT_PAPER_OPTIONS.find((o) => o.id === size)?.label ?? size;
    toast.success(`Default print size set to ${label}`);
  };

  const handleLayoutChange = (layout: ThermalLayout) => {
    setThermalLayout(layout);
    saveThermalLayout(layout);
    const label =
      THERMAL_LAYOUT_OPTIONS.find((o) => o.id === layout)?.label ?? layout;
    toast.success(`Thermal layout set to ${label}`);
  };

  const selectedOption = PRINT_PAPER_OPTIONS.find((o) => o.id === paperSize);
  const selectedLayout = THERMAL_LAYOUT_OPTIONS.find((o) => o.id === thermalLayout);

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 sm:p-6">
      <h3 className="text-base font-semibold text-slate-800 mb-1 flex items-center gap-2">
        <Printer className="w-5 h-5 text-blue-600" />
        Voucher Print Size
      </h3>
      <p className="text-sm text-slate-500 mb-4">
        Choose the default paper size for sales vouchers. Saved on this device
        and used when printing from POS.
      </p>

      <PrintPaperSizeSelector value={paperSize} onChange={handleChange} />

      {selectedOption && (
        <p className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
          <Check className="w-3.5 h-3.5 text-green-600" />
          {selectedOption.description}
        </p>
      )}

      {/* Thermal Layout Format Selection */}
      <div className="mt-6 pt-5 border-t border-slate-200">
        <h4 className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-blue-600" />
          Thermal Voucher Format (Thermal ဘောက်ချာပုံစံ)
        </h4>
        <p className="text-xs text-slate-500 mb-3">
          Thermal (72mm/80mm) ပရင့်ထုတ်ရာတွင် အသုံးပြုမည့် ပုံစံဒီဇိုင်းကို စိတ်ကြိုက်ရွေးချယ်ပါ
        </p>

        <div className="flex flex-wrap gap-2.5">
          {THERMAL_LAYOUT_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleLayoutChange(opt.id)}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium border flex items-center gap-2 transition-all ${
                thermalLayout === opt.id
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-300 hover:border-blue-400 hover:bg-blue-50"
              }`}
            >
              {opt.id === "list" ? (
                <List className="w-4 h-4" />
              ) : (
                <LayoutGrid className="w-4 h-4" />
              )}
              {opt.label}
            </button>
          ))}
        </div>

        {selectedLayout && (
          <p className="mt-2.5 text-xs text-slate-500 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-green-600" />
            {selectedLayout.description}
          </p>
        )}
      </div>
    </div>
  );
};
