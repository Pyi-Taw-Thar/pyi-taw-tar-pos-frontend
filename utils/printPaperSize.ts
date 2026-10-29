export type PrintPaperSize = "A4" | "A5" | "thermal-80mm" | "thermal-72mm";

export const PRINT_PAPER_SIZE_KEY = "voucherPrintPaperSize";

export interface PrintPaperOption {
  id: PrintPaperSize;
  label: string;
  description: string;
}

export const PRINT_PAPER_OPTIONS: PrintPaperOption[] = [
  { id: "A4", label: "A4", description: "Standard invoice (210 × 297 mm)" },
  { id: "A5", label: "A5", description: "Compact invoice (148 × 210 mm)" },
  {
    id: "thermal-80mm",
    label: "Thermal 72mm",
    description: "Receipt printer roll (72 mm wide)",
  },
];

export type ThermalLayout = "list" | "table";

export const THERMAL_LAYOUT_KEY = "voucherThermalLayout";

export interface ThermalLayoutOption {
  id: ThermalLayout;
  label: string;
  description: string;
}

export const THERMAL_LAYOUT_OPTIONS: ThermalLayoutOption[] = [
  {
    id: "list",
    label: "POS စာရင်းပုံစံ (List)",
    description: "စာလုံးကြီးပြီး သန့်ရှင်းသော POS ပြေစာပုံစံ",
  },
  {
    id: "table",
    label: "ဇယားကွက်ပုံစံ (Table)",
    description: "ကုန်ပစ္စည်း၊ အရေအတွက်၊ ဈေးနှုန်း ဇယားကွက်ပုံစံ (၄ ကော်လံ)",
  },
];

export const getSavedThermalLayout = (): ThermalLayout => {
  const saved = localStorage.getItem(THERMAL_LAYOUT_KEY);
  if (saved === "table" || saved === "list") {
    return saved;
  }
  return "list";
};

export const saveThermalLayout = (layout: ThermalLayout) => {
  localStorage.setItem(THERMAL_LAYOUT_KEY, layout);
};

export const getSavedPrintPaperSize = (): PrintPaperSize => {
  const saved = localStorage.getItem(PRINT_PAPER_SIZE_KEY);
  if (saved === "thermal-88mm" || saved === "thermal-72mm") {
    localStorage.setItem(PRINT_PAPER_SIZE_KEY, "thermal-80mm");
    return "thermal-80mm";
  }
  if (saved === "A4" || saved === "A5" || saved === "thermal-80mm") {
    return saved;
  }
  return "A4";
};

export const savePrintPaperSize = (size: PrintPaperSize) => {
  localStorage.setItem(PRINT_PAPER_SIZE_KEY, size);
};

export const parsePrintPaperSize = (
  value: string | null,
): PrintPaperSize | null => {
  if (value === "thermal-88mm" || value === "thermal-72mm" || value === "thermal-80mm") {
    return "thermal-80mm";
  }
  if (value === "A4" || value === "A5") {
    return value;
  }
  return null;
};

export const getPrintPaperStyles = (paperSize: PrintPaperSize): string => {
  const base = `
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      background: white !important;
      margin: 0;
      padding: 0;
    }
    .no-print,
    [data-sonner-toaster],
    [data-sonner-toast],
    .toaster {
      display: none !important;
    }
    .voucher-container {
      margin: 0 auto !important;
      background: white !important;
      box-sizing: border-box;
    }
  `;

  switch (paperSize) {
    case "A5":
      return `
        ${base}
        @page {
          size: A5 portrait;
          margin: 0;
        }
        @media print {
          @page {
            size: A5 portrait;
            margin: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
          }
          .voucher-container {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
        @media screen {
          .voucher-container {
            max-width: 148mm;
          }
        }
        .voucher-container {
          font-family: Arial, "Myanmar Text", "Padauk", sans-serif;
          font-size: 11px;
          color: #0f172a;
        }
        .voucher-a5-table {
          width: 100%;
          border-collapse: collapse;
          border: 1.5px solid #0f172a;
        }
        .voucher-a5-table th {
          background-color: #f1f5f9 !important;
          border-bottom: 1.5px solid #0f172a;
          border-right: 1px solid #94a3b8;
          padding: 5px 6px;
          font-size: 10.5px;
          font-weight: 700;
          color: #0f172a;
        }
        .voucher-a5-table th:last-child,
        .voucher-a5-table td:last-child {
          border-right: none;
        }
        .voucher-a5-table td {
          border-bottom: 1px solid #cbd5e1;
          border-right: 1px solid #cbd5e1;
          padding: 5px 6px;
          font-size: 10.5px;
          color: #0f172a;
          vertical-align: top;
        }
        .voucher-a5-table tbody tr:last-child td {
          border-bottom: none;
        }
        .voucher-a5-checklist {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #0f172a;
        }
        .voucher-a5-checklist th {
          background-color: #f8fafc !important;
          border-bottom: 1px solid #0f172a;
          border-right: 1px solid #94a3b8;
          padding: 3.5px 4px;
          font-size: 9.5px;
          font-weight: 700;
          color: #0f172a;
          text-align: center;
        }
        .voucher-a5-checklist td {
          border-right: 1px solid #94a3b8;
          padding: 4px;
          font-size: 9.5px;
          text-align: center;
        }
        .voucher-a5-checklist th:last-child,
        .voucher-a5-checklist td:last-child {
          border-right: none;
        }
      `;
    case "thermal-80mm":
    case "thermal-72mm":
      return `
        ${base}
        @page {
          size: 72mm auto;
          margin: 0;
          margin-top: 0;
          margin-bottom: 0;
        }
        @media print {
          @page {
            size: 72mm auto;
            margin: 0;
            margin-top: 0;
            margin-bottom: 0;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            padding-top: 0 !important;
            width: 72mm !important;
          }
          body {
            padding-top: 0 !important;
            margin-top: 0 !important;
          }
          .voucher-container {
            width: 72mm !important;
            max-width: 72mm !important;
            padding: 0 2mm 1.5mm 2mm !important;
            padding-top: 0 !important;
            margin: 0 auto !important;
            box-sizing: border-box !important;
          }
        }
        @media screen {
          .voucher-container {
            width: 72mm !important;
            min-width: 72mm !important;
            max-width: 72mm !important;
            padding: 0 3mm 3mm 3mm !important;
            padding-top: 0 !important;
            margin-top: 0 !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.12);
            box-sizing: border-box !important;
          }
        }
        .voucher-container {
          font-family: Arial, "Myanmar Text", "Padauk", sans-serif;
          font-size: 12px;
          line-height: 1.35;
          overflow-x: hidden;
          color: #000;
        }
        .voucher-logo { width: 48px !important; height: 48px !important; margin-top: 0 !important; }
        .voucher-shop-name { font-size: 17px !important; font-weight: 800 !important; }
        .voucher-address { font-size: 11px !important; }
        .voucher-fame-table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 8px 0 !important;
          border: 1px solid #000 !important;
          letter-spacing: 0.35px !important;
        }
        .voucher-fame-table th,
        .voucher-fame-table td {
          border: 1px solid #000 !important;
          padding: 6px 3.5px !important;
          font-size: 10.5px !important;
          line-height: 1.4 !important;
          color: #000 !important;
          word-break: break-word !important;
          letter-spacing: 0.35px !important;
        }
        .voucher-fame-table th {
          background-color: transparent !important;
          font-weight: 700 !important;
          color: #000 !important;
          padding: 6px 3.5px !important;
          letter-spacing: 0.5px !important;
        }
        .voucher-checklist-table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 6px 0 !important;
          border: 1px solid #000 !important;
        }
        .voucher-checklist-table th,
        .voucher-checklist-table td {
          border: 1px solid #000 !important;
          padding: 3px 2px !important;
          font-size: 10px !important;
          color: #000 !important;
          text-align: center !important;
        }
        .voucher-checklist-table th {
          background-color: transparent !important;
          font-weight: 700 !important;
        }
      `;
    case "A4":
    default:
      return `
        ${base}
        @media print {
          @page { size: A4; margin: 0; }
          .voucher-container {
            width: 100% !important;
            max-width: 100% !important;
          }
        }
        @media screen {
          .voucher-container {
            max-width: 210mm;
          }
        }
        .voucher-container { font-size: 13px; }
        .voucher-logo { width: 120px !important; height: 120px !important; }
        .voucher-shop-name { font-size: 1.25rem !important; }
        .voucher-table th { padding: 12px; font-size: 12px; }
        .voucher-table td { padding: 12px; font-size: 13px; }
        .voucher-total-bar { font-size: 1rem !important; }
        .voucher-footer-title { font-size: 1.125rem !important; }
      `;
  }
};

export const getSharedTableStyles = (): string => `
  .voucher-page {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
    page-break-after: always;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .voucher-page:last-child {
    page-break-after: auto;
  }
  @media screen {
    .voucher-page {
      background: white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      margin: 20px auto;
    }
    .voucher-container[data-paper="A4"] .voucher-page {
      width: 210mm;
      min-height: 297mm;
      padding: 15mm;
    }
    .voucher-container[data-paper="A5"] .voucher-page {
      width: 148mm;
      min-height: 210mm;
      padding: 6mm 8mm;
      margin: 12px auto;
    }
  }
  @media print {
    .voucher-page {
      width: 100% !important;
      min-height: 100vh !important;
      height: 100vh !important;
      margin: 0 !important;
      box-shadow: none !important;
    }
    .voucher-container[data-paper="A4"] .voucher-page {
      padding: 15mm !important;
    }
    .voucher-container[data-paper="A5"] .voucher-page {
      width: 148mm !important;
      min-height: 206mm !important;
      height: auto !important;
      padding: 6mm 8mm !important;
      margin: 0 auto !important;
    }
  }

  .voucher-table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    border: 1px solid #000;
  }
  .voucher-table th,
  .voucher-table td {
    border: 1px solid #000;
    padding: 6px 8px;
    color: #000;
    font-size: 12px;
  }
  .voucher-table th {
    background-color: transparent;
    text-align: center;
    font-weight: 700;
  }
  .voucher-container:not([data-paper="thermal-80mm"]) .voucher-table td:nth-child(1) { text-align: center; width: 6%; }
  .voucher-container:not([data-paper="thermal-80mm"]) .voucher-table td:nth-child(2) { text-align: left; width: 38%; }
  .voucher-container:not([data-paper="thermal-80mm"]) .voucher-table td:nth-child(3) { text-align: center; width: 10%; }
  .voucher-container:not([data-paper="thermal-80mm"]) .voucher-table td:nth-child(4) { text-align: center; width: 10%; }
  .voucher-container:not([data-paper="thermal-80mm"]) .voucher-table td:nth-child(5) { text-align: center; width: 8%; }
  .voucher-container:not([data-paper="thermal-80mm"]) .voucher-table td:nth-child(6) { text-align: right; width: 14%; }
  .voucher-container:not([data-paper="thermal-80mm"]) .voucher-table td:nth-child(7) { text-align: right; width: 14%; font-weight: 600; }

  .voucher-checklist-table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    border: 1px solid #000;
  }
  .voucher-checklist-table th,
  .voucher-checklist-table td {
    border: 1px solid #000;
    padding: 6px;
    color: #000;
    font-size: 11px;
    text-align: center;
  }
  .voucher-checklist-table th {
    background-color: transparent;
    font-weight: 700;
  }
`;
