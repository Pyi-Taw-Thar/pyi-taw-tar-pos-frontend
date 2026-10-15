export type PrintPaperSize = "A4" | "A5" | "thermal-80mm";

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
    label: "Thermal 80mm",
    description: "Receipt printer roll (80 mm wide)",
  },
];

export const getSavedPrintPaperSize = (): PrintPaperSize => {
  const saved = localStorage.getItem(PRINT_PAPER_SIZE_KEY);
  if (saved === "thermal-88mm") {
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
  if (value === "thermal-88mm") return "thermal-80mm";
  if (value === "A4" || value === "A5" || value === "thermal-80mm") {
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
    .no-print {
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
        @media print {
          @page { size: A5; margin: 0; }
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
        .voucher-container { font-size: 11px; }
        .voucher-logo { width: 80px !important; height: 80px !important; }
        .voucher-shop-name { font-size: 1rem !important; }
        .voucher-table th { padding: 8px; font-size: 9px; }
        .voucher-table td { padding: 8px; font-size: 10px; }
        .voucher-total-bar { font-size: 13px !important; padding: 8px 12px !important; }
        .voucher-footer-title { font-size: 1rem !important; }
        .voucher-summary-grid { gap: 1rem !important; }
      `;
    case "thermal-80mm":
      return `
        ${base}
        @media print {
          @page { size: 80mm auto; margin: 2mm; }
          .voucher-container {
            width: 76mm !important;
            max-width: 76mm !important;
            padding: 1.5mm !important;
            margin: 0 auto !important;
          }
        }
        @media screen {
          .voucher-container {
            width: 80mm !important;
            min-width: 80mm !important;
            max-width: 80mm !important;
            padding: 3mm !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.12);
          }
        }
        .voucher-container {
          font-family: Arial, "Myanmar Text", "Padauk", sans-serif;
          font-size: 10px;
          line-height: 1.35;
          overflow-x: hidden;
          color: #000;
        }
        .voucher-logo { width: 44px !important; height: 44px !important; }
        .voucher-shop-name { font-size: 13px !important; font-weight: 800 !important; }
        .voucher-address { font-size: 9px !important; }
        .voucher-table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 6px 0 !important;
          border: 1px solid #000 !important;
        }
        .voucher-table th,
        .voucher-table td {
          border: 1px solid #000 !important;
          padding: 3px 2px !important;
          font-size: 8.5px !important;
          line-height: 1.25 !important;
          word-break: break-word !important;
          color: #000 !important;
        }
        .voucher-table th {
          background-color: transparent !important;
          color: #000 !important;
          text-align: center !important;
          font-weight: 700 !important;
        }
        .voucher-container[data-paper="thermal-80mm"] .voucher-table td:nth-child(1) { text-align: center !important; width: 8% !important; }
        .voucher-container[data-paper="thermal-80mm"] .voucher-table td:nth-child(2) { text-align: left !important; width: 42% !important; }
        .voucher-container[data-paper="thermal-80mm"] .voucher-table td:nth-child(3) { text-align: center !important; width: 11% !important; }
        .voucher-container[data-paper="thermal-80mm"] .voucher-table td:nth-child(4) { text-align: center !important; width: 11% !important; }
        .voucher-container[data-paper="thermal-80mm"] .voucher-table td:nth-child(5) { text-align: right !important; width: 14% !important; }
        .voucher-container[data-paper="thermal-80mm"] .voucher-table td:nth-child(6) { text-align: right !important; width: 14% !important; font-weight: 600 !important; }
        .voucher-checklist-table {
          width: 100% !important;
          border-collapse: collapse !important;
          margin: 5px 0 !important;
          border: 1px solid #000 !important;
        }
        .voucher-checklist-table th,
        .voucher-checklist-table td {
          border: 1px solid #000 !important;
          padding: 2px !important;
          font-size: 8px !important;
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
      padding: 10mm;
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
      padding: 10mm !important;
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
