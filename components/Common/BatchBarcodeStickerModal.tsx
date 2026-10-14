import React, { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { Printer, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface BatchStickerProps {
  isOpen: boolean;
  onClose: () => void;
  batchData: {
    productName: string;
    productCode?: string;
    batchNumber: string;
    batchBarcode: string;
    expiryDate?: string | Date | null;
    sellingPrice?: number;
    quantity?: number;
  } | null;
}

export const BatchBarcodeStickerModal: React.FC<BatchStickerProps> = ({
  isOpen,
  onClose,
  batchData,
}) => {
  const { t } = useLanguage();
  const [copies, setCopies] = useState<number>(1);
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (batchData && batchData.quantity) {
      setCopies(Math.min(batchData.quantity, 100));
    } else {
      setCopies(1);
    }
  }, [batchData]);

  useEffect(() => {
    if (isOpen && batchData?.batchBarcode && svgRef.current) {
      try {
        JsBarcode(svgRef.current, batchData.batchBarcode, {
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
  }, [isOpen, batchData]);

  if (!isOpen || !batchData) return null;

  const formattedExpiry = batchData.expiryDate
    ? new Date(batchData.expiryDate).toLocaleDateString("en-GB") // DD/MM/YYYY
    : "-";

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups to print stickers");
      return;
    }

    // Generate HTML for all copies
    let stickersHtml = "";
    for (let i = 0; i < copies; i++) {
      stickersHtml += `
        <div class="sticker">
          <div class="product-name">${batchData.productName}</div>
          <div class="barcode-container">
            <svg id="barcode-${i}"></svg>
            <div class="barcode-text">${batchData.batchBarcode}</div>
          </div>
          <div class="meta-row">
            <span><strong>${t("inventory.stickerModal.batchLabel")}</strong> ${batchData.batchNumber}</span>
            <span><strong>${t("inventory.stickerModal.expiryLabel")}</strong> ${formattedExpiry}</span>
          </div>
          ${
            batchData.sellingPrice
              ? `<div class="price-row"><strong>${t("inventory.stickerModal.priceLabel")}</strong> ${batchData.sellingPrice.toLocaleString()} Ks</div>`
              : ""
          }
        </div>
      `;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Batch Barcode Sticker - ${batchData.batchBarcode}</title>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <style>
            @page {
              size: 50mm 30mm;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              font-size: 8px;
              color: #000;
              background: #fff;
            }
            .sticker {
              width: 48mm;
              height: 28mm;
              margin: 1mm auto;
              padding: 1.5mm;
              box-sizing: border-box;
              page-break-after: always;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              text-align: center;
              border: 1px dashed #ccc;
            }
            @media print {
              .sticker {
                border: none;
              }
            }
            .product-name {
              font-size: 8.5px;
              font-weight: bold;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              line-height: 1.2;
            }
            .barcode-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              margin: 1px 0;
            }
            .barcode-container svg {
              width: 36mm;
              height: 11mm;
            }
            .barcode-text {
              font-size: 7.5px;
              letter-spacing: 1px;
              font-family: monospace;
              font-weight: bold;
            }
            .meta-row {
              display: flex;
              justify-content: space-between;
              font-size: 7px;
              margin-top: 1px;
            }
            .price-row {
              font-size: 7.5px;
              font-weight: bold;
              text-align: right;
            }
          </style>
        </head>
        <body>
          ${stickersHtml}
          <script>
            window.onload = function() {
              for (var i = 0; i < ${copies}; i++) {
                try {
                  JsBarcode("#barcode-" + i, "${batchData.batchBarcode}", {
                    format: "CODE128",
                    width: 1.5,
                    height: 38,
                    displayValue: false,
                    margin: 0
                  });
                } catch(e) {}
              }
              setTimeout(function() {
                window.print();
                window.close();
              }, 250);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-800">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>

        <h3 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">
          🏷️ {t("inventory.stickerModal.title")}
        </h3>

        {/* Live Sticker Preview Box */}
        <div className="mb-6 flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-900/50">
          <div className="w-[200px] rounded border bg-white p-2.5 shadow-sm dark:bg-gray-800">
            <div className="truncate text-center text-xs font-bold text-gray-900 dark:text-white">
              {batchData.productName}
            </div>

            <div className="my-1.5 flex flex-col items-center">
              <svg ref={svgRef} className="h-9 w-40"></svg>
              <span className="font-mono text-[10px] font-bold tracking-wider text-gray-700 dark:text-gray-300">
                {batchData.batchBarcode}
              </span>
            </div>

            <div className="flex justify-between text-[9px] text-gray-600 dark:text-gray-400">
              <span>{t("inventory.stickerModal.batchLabel")} <strong>{batchData.batchNumber}</strong></span>
              <span>{t("inventory.stickerModal.expiryLabel")} <strong>{formattedExpiry}</strong></span>
            </div>

            {batchData.sellingPrice && (
              <div className="mt-1 text-right text-[10px] font-bold text-primary">
                {batchData.sellingPrice.toLocaleString()} Ks
              </div>
            )}
          </div>
          <span className="mt-2 text-xs text-gray-500">
            {t("inventory.stickerModal.previewText")}
          </span>
        </div>

        {/* Print Copies Controller */}
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("inventory.stickerModal.copiesLabel")}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="500"
              value={copies}
              onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-center font-bold text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t("inventory.stickerModal.copiesHelp")}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 cursor-pointer"
          >
            {t("inventory.stickerModal.close")}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            {t("inventory.stickerModal.printBtn")}
          </button>
        </div>
      </div>
    </div>
  );
};
