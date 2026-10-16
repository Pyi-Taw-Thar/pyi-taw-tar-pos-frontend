import React from "react";
import { PrintShopBranding } from "../../utils/printShopBranding";
import {
  PrintPaperSize,
  ThermalLayout,
  getSavedThermalLayout,
} from "../../utils/printPaperSize";

export interface VoucherBatchItem {
  batchStockId?: string;
  batchNumber: string;
  batchBarcode?: string;
  expiryDate?: string | Date | null;
  quantity: number;
}

export interface VoucherReceiptItem {
  name: string;
  code?: string;
  qty: number;
  /** Unit of measure, e.g. ကျင်း, မူး */
  unit?: string;
  price: number;
  batches?: VoucherBatchItem[];
}

function formatReceiptQty(item: VoucherReceiptItem): string {
  return Number.isInteger(item.qty) ? String(item.qty) : String(item.qty);
}

function formatReceiptUnit(item: VoucherReceiptItem): string {
  return item.unit?.trim() || "—";
}

/** Item names longer than this get underline + 2-line wrap on 80mm thermal. */
const THERMAL_ITEM_LONG_CHARS = 12;

export type VoucherDocumentType = "invoice" | "quotation";

export interface VoucherReceiptData {
  invoiceNumber: string;
  storefrontName: string;
  date: string;
  items: VoucherReceiptItem[];
  subtotal: number;
  discountPercent: number;
  /** Fixed discount in MMK (quotations); shown when > 0 */
  discountAmount?: number;
  tax?: number;
  total: number;
  paymentMethod: string;
  paidAmount?: number;
  change?: number;
  note?: string;
  documentType?: VoucherDocumentType;
  /** Credit person info (for credit orders) */
  creditPersonName?: string;
  creditPersonOutstanding?: number;
  creditPersonAddress?: string;
  creditPersonTownship?: string;
}

interface VoucherContentProps {
  receiptData: VoucherReceiptData;
  shopBranding: PrintShopBranding;
  paperSize: PrintPaperSize;
  thermalLayout?: ThermalLayout;
  formatDate: (dateString: string) => string;
}

export const VoucherContent: React.FC<VoucherContentProps> = ({
  receiptData,
  shopBranding,
  paperSize,
  thermalLayout,
  formatDate,
}) => {
  console.log("receiptData:", receiptData);
  const isThermal = paperSize === "thermal-80mm" || (paperSize as any) === "thermal-72mm";
  const activeThermalLayout = thermalLayout || getSavedThermalLayout();
  const isQuotation = receiptData.documentType === "quotation";
  const contactParts = [
    shopBranding.phone && `Tel: ${shopBranding.phone}`,
    shopBranding.website,
  ].filter(Boolean);

  // Get logged-in user for printed-by
  const adminData = typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("adminData") || "{}")
    : {};
  const printedByName = adminData.name || "";
  const printedByRole = adminData.role || "";

  const formatToImageDate = (dateString?: string | Date | null) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Keep items as single rows with total quantity (do not split by batch)
  const displayItems = React.useMemo(() => {
    return receiptData.items || [];
  }, [receiptData.items]);

  const totalQty = React.useMemo(() => {
    return displayItems.reduce((acc, it) => acc + (it.qty || 0), 0);
  }, [displayItems]);

  if (isThermal) {
    if (activeThermalLayout === "table") {
      // 4-Column Table Format matching user's reference voucher image
      return (
        <div className="voucher-container" data-paper={paperSize}>
          {/* Header Section */}
          <div className="text-center mb-2 pb-1.5 border-b border-black">
            {shopBranding.logo ? (
              <img
                src={shopBranding.logo}
                alt={shopBranding.shopName}
                className="voucher-logo mx-auto object-contain mb-1"
              />
            ) : (
              <div className="voucher-logo mx-auto flex items-center justify-center rounded-lg bg-slate-100 text-slate-800 font-bold mb-1">
                {shopBranding.shopName.charAt(0)}
              </div>
            )}
            <p className="text-[10.5px] text-gray-700 font-medium italic mb-1 leading-snug">
              လုပ်ရပ်တိုင်းသည်၊ ရည်စူးချက် ရည်ရွယ်ချက်ပေါ် မူတည်၏။
            </p>
            <h2 className="voucher-shop-name font-black text-black leading-tight text-center">
              {shopBranding.shopName}
            </h2>
            {shopBranding.address && (
              <p className="voucher-address text-black font-medium mt-0.5 leading-snug text-center">
                {shopBranding.address}
              </p>
            )}
            <div className="text-[10.5px] text-black font-medium mt-0.5 space-y-0.5 text-center">
              {shopBranding.phone && <p>Phone : {shopBranding.phone}</p>}
              <p>Viber Phone : {shopBranding.website || "09-960889290, 09-973989877"}</p>
            </div>
          </div>

          {/* Customer & Invoice Details (Boxed style like Fame reference image) */}
          <div className="border border-black p-1.5 mb-2 text-[11px] text-black space-y-1">
            <div className="flex justify-between items-center font-bold">
              <span>Order No: {receiptData.invoiceNumber}</span>
              <span>Salesman: {printedByName || "Sale 1"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Date: {formatToImageDate(receiptData.date)}</span>
              <span>Payment: {receiptData.paymentMethod}</span>
            </div>
            <div className="pt-0.5">
              <span className="font-semibold">Customer: </span>
              <span className="font-bold">
                {receiptData.creditPersonName || receiptData.storefrontName || "—"}
              </span>
            </div>
            {(receiptData.creditPersonAddress || receiptData.creditPersonTownship) && (
              <div>
                <span className="font-semibold">Address: </span>
                <span>
                  {[receiptData.creditPersonAddress, receiptData.creditPersonTownship]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>
            )}
            {receiptData.note && (
              <div className="italic pt-0.5">
                <span className="font-semibold not-italic">Note: </span>
                {receiptData.note}
              </div>
            )}
          </div>

          {/* 4-Column Table matching reference voucher */}
          <div className="mb-2">
            <table className="voucher-fame-table">
              <thead>
                <tr className="tracking-wide">
                  <th style={{ width: "48%" }} className="text-left"># Product</th>
                  <th style={{ width: "16%" }} className="text-center">Qty</th>
                  <th style={{ width: "18%" }} className="text-right">Price</th>
                  <th style={{ width: "18%" }} className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {displayItems.map((item, index) => (
                  <tr key={index} className="tracking-wide">
                    <td className="text-left font-medium">
                      <div className="leading-snug">
                        {index + 1} {item.name}
                      </div>
                      {item.batches && item.batches.length > 0 && item.batches.some((b) => b.expiryDate) && (
                        <div className="text-[9.5px] font-mono text-gray-700 mt-1 space-y-0.5 tracking-normal">
                          {Array.from(
                            new Set(
                              item.batches
                                .filter((b) => b.expiryDate)
                                .map((b) => formatToImageDate(b.expiryDate))
                            )
                          ).map((exp, expIdx) => (
                            <div key={expIdx}>↳ Exp: {exp}</div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="text-center font-medium whitespace-nowrap">
                      {formatReceiptQty(item)} {formatReceiptUnit(item)}
                    </td>
                    <td className="text-right whitespace-nowrap">{item.price.toLocaleString()}</td>
                    <td className="text-right font-bold whitespace-nowrap">
                      {(item.price * item.qty).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Summary (Table style matching reference) */}
          <div className="border-t border-black pt-1 space-y-1 text-[11.5px] text-black mb-2">
            <div className="flex justify-between font-semibold">
              <span style={{ width: "45%" }}>Subtotal</span>
              <span style={{ width: "20%" }} className="text-center">{totalQty}</span>
              <span style={{ width: "35%" }} className="text-right">{receiptData.subtotal.toLocaleString()}</span>
            </div>
            {((receiptData.discountAmount ?? 0) > 0 || receiptData.discountPercent > 0) && (
              <div className="flex justify-between text-red-600 font-semibold">
                <span style={{ width: "45%" }}>Discount</span>
                <span style={{ width: "20%" }}></span>
                <span style={{ width: "35%" }} className="text-right">
                  -
                  {((receiptData.discountAmount ?? 0) +
                    (receiptData.subtotal * (receiptData.discountPercent ?? 0)) / 100).toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex justify-between font-black text-[13px] border-t border-black pt-1">
              <span>Total</span>
              <span>{receiptData.total.toLocaleString()} MMK</span>
            </div>
            {receiptData.creditPersonName && (
              <div className="pt-1 border-t border-dashed border-gray-400 space-y-0.5 text-[11px]">
                <div className="flex justify-between">
                  <span>ပေးငွေ (Paid):</span>
                  <span>{(receiptData.paidAmount ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>ကျန်ငွေ (Remaining):</span>
                  <span>{(receiptData.total - (receiptData.paidAmount ?? 0)).toLocaleString()} MMK</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>ယခင်ကျန်ငွေ (Previous):</span>
                  <span>
                    {((receiptData.creditPersonOutstanding ?? 0) - (receiptData.total - (receiptData.paidAmount ?? 0))).toLocaleString()} MMK
                  </span>
                </div>
                <div className="flex justify-between font-bold text-red-700 border-t border-black pt-0.5">
                  <span>စုစုပေါင်းကျန်ငွေ:</span>
                  <span>{(receiptData.creditPersonOutstanding ?? 0).toLocaleString()} MMK</span>
                </div>
              </div>
            )}
          </div>

          {/* Warehouse Checklist Table */}
          <div className="mb-2 text-left">
            <p className="text-[10px] font-semibold text-black mb-1 leading-tight">
              စာရင်းဇယား၊ ပစ္စည်းအစုံ၊ အလိုများရှိပါက (7)ရက်အတွင်း ကျေးဇူးပြု၍ အကြောင်းကြားပေးပါရန်။
            </p>
            <table className="voucher-checklist-table">
              <thead>
                <tr>
                  <th style={{ width: "16%" }}>ပုံး</th>
                  <th style={{ width: "16%" }}>အိတ်</th>
                  <th style={{ width: "16%" }}>ဆွဲ</th>
                  <th style={{ width: "26%" }}>CCTV Time</th>
                  <th style={{ width: "26%" }}>စစ်ဆေးသူ</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ height: "30px" }}>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer Section */}
          <div className="pt-2 border-t border-black text-center">
            <p className="text-[11px] font-bold text-black">
              အဆင်မပြေမှုများရှိပါက 09-955255972 သို့ တိုင်ကြားနိုင်ပါသည်။
            </p>
            <p className="text-[11px] font-bold text-black mt-0.5">
              ဝယ်ယူအားပေးမှုကို ကျေးဇူးတင်ပါသည်။
            </p>
            <div className="flex justify-between items-center text-[10px] text-gray-700 mt-1 border-t border-dashed border-gray-400 pt-1">
              <span>Vr.No - {receiptData.invoiceNumber}</span>
              {printedByName && (
                <span>
                  Printed by: {printedByName} ({printedByRole})
                </span>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Default: POS List Layout (activeThermalLayout === "list")
    return (
      <div className="voucher-container" data-paper={paperSize}>
        {/* Header Section */}
        <div className="text-center mb-2 pb-2 border-b border-black">
          {shopBranding.logo ? (
            <img
              src={shopBranding.logo}
              alt={shopBranding.shopName}
              className="voucher-logo mx-auto object-contain mb-1"
            />
          ) : (
            <div className="voucher-logo mx-auto flex items-center justify-center rounded-lg bg-slate-100 text-slate-800 font-bold mb-1">
              {shopBranding.shopName.charAt(0)}
            </div>
          )}
          <p className="text-[11px] text-gray-700 font-medium italic mb-1 leading-snug">
            လုပ်ရပ်တိုင်းသည်၊ ရည်စူးချက် ရည်ရွယ်ချက်ပေါ် မူတည်၏။
          </p>
          <h2 className="voucher-shop-name font-black text-black leading-tight">
            {shopBranding.shopName}
          </h2>
          {shopBranding.address && (
            <p className="voucher-address text-black font-medium mt-0.5 leading-snug">
              {shopBranding.address}
            </p>
          )}
          {shopBranding.phone && (
            <p className="text-[11.5px] text-black font-medium mt-0.5">
              Phone : {shopBranding.phone}
            </p>
          )}
          <p className="text-[11.5px] text-black font-medium mt-0.5">
            Viber Phone : {shopBranding.website || "09-960889290, 09-973989877"}
          </p>
        </div>

        {/* Customer & Invoice Details */}
        <div className="text-[12px] text-black mb-2 space-y-1 border-b border-black pb-2">
          <div className="flex justify-between items-center">
            <span className="font-bold">Vr.No :</span>
            <span className="font-black text-[13px]">{receiptData.invoiceNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">မြို့နယ် :</span>
            <span>{receiptData.creditPersonTownship || "—"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">အမည် :</span>
            <span className="font-bold text-[13px]">
              {receiptData.creditPersonName || receiptData.storefrontName || "—"}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">ရက်စွဲ :</span>
            <span>{formatToImageDate(receiptData.date)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">ငွေချေပုံ :</span>
            <span>{receiptData.paymentMethod}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Printed Date :</span>
            <span>{formatToImageDate(new Date().toISOString())}</span>
          </div>
          {receiptData.note && (
            <div className="flex justify-between items-start pt-0.5">
              <span className="font-semibold flex-shrink-0">မှတ်ချက် :</span>
              <span className="italic text-right break-words pl-2">{receiptData.note}</span>
            </div>
          )}
          {isQuotation && (
            <p className="text-[10px] text-gray-600 italic text-center pt-1">
              Prices are estimates. Not a final invoice.
            </p>
          )}
        </div>

        {/* Product List Section (Clean POS Style - No cramped table) */}
        <div className="mb-2">
          <div className="flex justify-between items-center text-[12px] font-bold text-black border-y border-black py-1 mb-1">
            <span>အမျိုးအမည် (Items)</span>
            <span>သင့်ငွေ (Total)</span>
          </div>

          <div className="divide-y divide-dashed divide-gray-400">
            {displayItems.map((item, index) => (
              <div key={index} className="py-1.5">
                {/* Item Name */}
                <div className="text-[13px] font-bold text-black leading-snug">
                  {index + 1}. {item.name}
                </div>

                {/* Expiry Date (Batch number removed) */}
                {item.batches && item.batches.length > 0 && item.batches.some((b) => b.expiryDate) && (
                  <div className="text-[11px] font-semibold text-gray-800 font-mono mt-0.5 pl-3 space-y-0.5">
                    {Array.from(
                      new Set(
                        item.batches
                          .filter((b) => b.expiryDate)
                          .map((b) => formatToImageDate(b.expiryDate))
                      )
                    ).map((exp, expIdx) => (
                      <div key={expIdx}>
                        ↳ Exp: {exp}
                      </div>
                    ))}
                  </div>
                )}

                {/* Quantity, Unit, Price & Total Line */}
                <div className="flex justify-between items-center text-[12px] text-black pl-3 pt-0.5 font-medium">
                  <span>
                    {formatReceiptQty(item)} {formatReceiptUnit(item)} × {item.price.toLocaleString()}
                  </span>
                  <span className="font-bold text-[13px]">
                    {(item.price * item.qty).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary (Myanmar) */}
        <div className="w-full space-y-1 text-[12.5px] text-black mb-2 border-y border-black py-2">
          <div className="flex justify-between">
            <span className="font-semibold">ကျသင့်ငွေ:</span>
            <span className="font-bold">{receiptData.subtotal.toLocaleString()}</span>
          </div>
          {((receiptData.discountAmount ?? 0) > 0 || receiptData.discountPercent > 0) && (
            <div className="flex justify-between text-red-600">
              <span className="font-semibold">လျှော့ပေးငွေ:</span>
              <span className="font-bold">
                -
                {((receiptData.discountAmount ?? 0) +
                  (receiptData.subtotal * (receiptData.discountPercent ?? 0)) / 100).toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="font-semibold">ပေးငွေ:</span>
            <span className="font-bold">{(receiptData.paidAmount ?? 0).toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-dashed border-gray-400 pt-1 font-bold text-[13.5px]">
            <span>ကျန်ငွေ:</span>
            <span>
              {(receiptData.total - (receiptData.paidAmount ?? 0)).toLocaleString()} {shopBranding.currency}
            </span>
          </div>
          {receiptData.creditPersonName && (
            <>
              <div className="flex justify-between text-gray-800 pt-0.5">
                <span className="font-semibold">ယခင်ကျန်ငွေ:</span>
                <span>
                  {((receiptData.creditPersonOutstanding ?? 0) - (receiptData.total - (receiptData.paidAmount ?? 0))).toLocaleString()} {shopBranding.currency}
                </span>
              </div>
              <div className="flex justify-between border-t border-black pt-1 font-black text-[14.5px] text-red-700">
                <span>စုစုပေါင်းကျန်ငွေ:</span>
                <span>
                  {(receiptData.creditPersonOutstanding ?? 0).toLocaleString()} {shopBranding.currency}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Warehouse Checklist Table */}
        <div className="mb-2 text-left">
          <p className="text-[11px] font-semibold text-black mb-1 leading-tight">
            စာရင်းဇယား၊ ပစ္စည်းအစုံ၊ အလိုများရှိပါက (7)ရက်အတွင်း ကျေးဇူးပြု၍ အကြောင်းကြားပေးပါရန်။
          </p>
          <table className="voucher-checklist-table">
            <thead>
              <tr>
                <th style={{ width: "16%" }}>ပုံး</th>
                <th style={{ width: "16%" }}>အိတ်</th>
                <th style={{ width: "16%" }}>ဆွဲ</th>
                <th style={{ width: "26%" }}>CCTV Time</th>
                <th style={{ width: "26%" }}>စစ်ဆေးသူ</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ height: "34px" }}>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Section */}
        <div className="pt-2 border-t border-black text-center">
          <p className="text-[11.5px] font-bold text-black">
            အဆင်မပြေမှုများရှိပါက 09-955255972 သို့ တိုင်ကြားနိုင်ပါသည်။
          </p>
          <p className="text-[11.5px] font-bold text-black mt-0.5">
            ဝယ်ယူအားပေးမှုကို ကျေးဇူးတင်ပါသည်။
          </p>
          <div className="flex justify-between items-center text-[10.5px] text-gray-700 mt-2 border-t border-dashed border-gray-400 pt-1">
            <span>Vr.No - {receiptData.invoiceNumber}</span>
            {printedByName && (
              <span>
                Printed by: {printedByName} ({printedByRole})
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // A4 / A5 Layout matching the image with React pagination
  const items = displayItems;

  const getPages = (): VoucherReceiptItem[][] => {
    const maxSinglePage = paperSize === "A5" ? 5 : 10;
    if (items.length <= maxSinglePage) {
      return [items];
    }

    const pagesList: VoucherReceiptItem[][] = [];
    const firstPageLimit = paperSize === "A5" ? 8 : 14;
    const regularPageLimit = paperSize === "A5" ? 5 : 10;

    let tempItems = [...items];

    if (tempItems.length <= firstPageLimit) {
      // Force split so the last page has enough space for summary & checklist
      pagesList.push(tempItems.splice(0, maxSinglePage));
      pagesList.push(tempItems);
      return pagesList;
    }

    pagesList.push(tempItems.splice(0, firstPageLimit));
    while (tempItems.length > 0) {
      pagesList.push(tempItems.splice(0, regularPageLimit));
    }
    return pagesList;
  };

  const pages = getPages();

  return (
    <div className="voucher-container" data-paper={paperSize}>
      {pages.map((pageItems, pageIdx) => {
        const isFirstPage = pageIdx === 0;
        const isLastPage = pageIdx === pages.length - 1;
        const currentPageNum = pageIdx + 1;

        return (
          <div
            key={pageIdx}
            className="voucher-page"
          >
            <div>
              {/* Header Section */}
              {isFirstPage ? (
                <div className="flex justify-between items-center mb-6 border-b border-slate-300 pb-4">
                  <div className="w-[30%] text-left">
                    {shopBranding.logo ? (
                      <img
                        src={shopBranding.logo}
                        alt={shopBranding.shopName}
                        className="h-12 w-auto object-contain mb-1"
                      />
                    ) : (
                      <div className="h-12 w-12 flex items-center justify-center rounded-lg bg-slate-100 text-slate-800 font-bold mb-1">
                        {shopBranding.shopName.charAt(0)}
                      </div>
                    )}
                    <p className="text-[9px] text-slate-600 font-medium leading-normal italic">
                      လုပ်ရပ်တိုင်းသည်၊ ရည်စူးချက် ရည်ရွယ်ချက်ပေါ် မူတည်၏။
                    </p>
                  </div>
                  <div className="w-[50%] text-center">
                    <h2 className="text-xl font-bold text-slate-800">
                      {shopBranding.shopName}
                    </h2>
                    {shopBranding.address && (
                      <p className="text-xs text-slate-700 font-medium mt-1">
                        {shopBranding.address}
                      </p>
                    )}
                    {shopBranding.phone && (
                      <p className="text-xs text-slate-700 font-medium mt-0.5">
                        Phone : {shopBranding.phone}
                      </p>
                    )}
                    <p className="text-xs text-slate-700 font-medium mt-0.5">
                      Viber Phone : {shopBranding.website || "09-960889290, 09-973989877"}
                    </p>
                  </div>
                  <div className="w-[20%]"></div>
                </div>
              ) : (
                <div className="flex justify-between items-center mb-4 border-b border-slate-200 pb-2">
                  <h2 className="text-sm font-bold text-slate-800">
                    {shopBranding.shopName} (Page {currentPageNum})
                  </h2>
                  <span className="text-xs text-slate-500">Vr.No - {receiptData.invoiceNumber}</span>
                </div>
              )}

              {/* Customer and Invoice Details Section */}
              {isFirstPage && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm text-slate-800 mb-6 pb-2">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="w-20 font-semibold">မြို့နယ်</span>
                      <span className="mr-2">:</span>
                      <span className="flex-1 border-b border-slate-300 min-h-[20px]">
                        {receiptData.creditPersonTownship || ""}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 font-semibold">အမည်</span>
                      <span className="mr-2">:</span>
                      <span className="flex-1 border-b border-slate-300 min-h-[20px] font-bold">
                        {receiptData.creditPersonName || receiptData.storefrontName || ""}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-20 font-semibold">မှတ်ချက်</span>
                      <span className="mr-2">:</span>
                      <span className="flex-1 border-b border-slate-300 min-h-[20px] italic">
                        {receiptData.note || ""}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="w-28 font-semibold">ရက်စွဲ</span>
                      <span className="mr-2">:</span>
                      <span className="flex-1 border-b border-slate-300 min-h-[20px]">
                        {formatToImageDate(receiptData.date)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 font-semibold">ငွေချေပုံ</span>
                      <span className="mr-2">:</span>
                      <span className="flex-1 border-b border-slate-300 min-h-[20px]">
                        {receiptData.paymentMethod}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-28 font-semibold">Printed Date</span>
                      <span className="mr-2">:</span>
                      <span className="flex-1 border-b border-slate-300 min-h-[20px]">
                        {formatToImageDate(new Date().toISOString())}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Table */}
              <div className="mb-4">
                <table className="voucher-table">
                  <thead>
                    <tr>
                      <th style={{ width: "6%" }}>စဉ်</th>
                      <th style={{ width: "38%" }}>အမျိုးအမည်</th>
                      <th style={{ width: "10%" }}>ခုရေ</th>
                      <th style={{ width: "10%" }}>ယူနစ်</th>
                      <th style={{ width: "8%" }}></th>
                      <th style={{ width: "14%" }}>ဈေးနှုန်း</th>
                      <th style={{ width: "14%" }}>သင့်ငွေ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((item, idx) => {
                      let prevItemsCount = 0;
                      for (let p = 0; p < pageIdx; p++) {
                        prevItemsCount += pages[p].length;
                      }
                      const absoluteIndex = prevItemsCount + idx + 1;
                      return (
                        <tr key={idx}>
                          <td>{absoluteIndex}</td>
                          <td>
                            <div className="font-medium">{item.name}</div>
                            {item.batches && item.batches.length > 0 && item.batches.some(b => b.expiryDate) && (
                              <div className="text-xs text-slate-500 font-mono mt-0.5 space-y-0.5">
                                {Array.from(new Set(item.batches.filter(b => b.expiryDate).map(b => formatToImageDate(b.expiryDate)))).map((exp, expIdx) => (
                                  <div key={expIdx}>
                                    ↳ Exp: {exp}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td>{formatReceiptQty(item)}</td>
                          <td>{formatReceiptUnit(item)}</td>
                          <td></td>
                          <td>{item.price.toLocaleString()}</td>
                          <td>{(item.price * item.qty).toLocaleString()}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary Box & Checklist (Only on last page) */}
              {isLastPage && (
                <>
                  {/* Summary Box */}
                  <div className="flex justify-end mb-4">
                    <div className="w-64 space-y-2 text-sm text-slate-800">
                      <div className="flex justify-between">
                        <span className="font-semibold">ကျသင့်ငွေ:</span>
                        <span>{receiptData.subtotal.toLocaleString()}</span>
                      </div>
                      {((receiptData.discountAmount ?? 0) > 0 || receiptData.discountPercent > 0) && (
                        <div className="flex justify-between text-red-600">
                          <span className="font-semibold">လျှော့ပေးငွေ:</span>
                          <span>
                            -
                            {((receiptData.discountAmount ?? 0) +
                              (receiptData.subtotal * (receiptData.discountPercent ?? 0)) / 100).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-semibold">ပေးငွေ:</span>
                        <span>{(receiptData.paidAmount ?? 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-400 pt-2">
                        <span>ကျန်ငွေ:</span>
                        <span>
                          {(receiptData.total - (receiptData.paidAmount ?? 0)).toLocaleString()} {shopBranding.currency}
                        </span>
                      </div>
                      {receiptData.creditPersonName && (
                        <>
                          <div className="flex justify-between text-slate-700 pt-1">
                            <span className="font-semibold">ယခင်ကျန်ငွေ:</span>
                            <span>
                              {((receiptData.creditPersonOutstanding ?? 0) - (receiptData.total - (receiptData.paidAmount ?? 0))).toLocaleString()} {shopBranding.currency}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-slate-400 pt-2 font-bold text-base text-red-700">
                            <span>စုစုပေါင်းကျန်ငွေ:</span>
                            <span>
                              {(receiptData.creditPersonOutstanding ?? 0).toLocaleString()} {shopBranding.currency}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Checklist / Packaging Table */}
                  <div className="mt-6 mb-4 text-left">
                    <p className="text-xs font-semibold text-slate-700 mb-2">
                      စာရင်းဇယား၊ ပစ္စည်းအစုံ၊ အလိုများရှိပါက (7)ရက်အတွင်း ကျေးဇူးပြု၍ အကြောင်းကြားပေးပါရန်။
                    </p>
                    <table className="voucher-checklist-table">
                      <thead>
                        <tr>
                          <th style={{ width: "12%" }}>ပုံး</th>
                          <th style={{ width: "12%" }}>အိတ်</th>
                          <th style={{ width: "12%" }}>ဆွဲ</th>
                          <th style={{ width: "20%" }}>CCTV Time</th>
                          <th style={{ width: "22%" }}>ပစ္စည်းစစ်သူ</th>
                          <th style={{ width: "22%" }}>စာရင်းစစ်သူ</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ height: "45px" }}>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            {/* Footer Details (Repeats at bottom of every page) */}
            <div className="mt-auto border-t border-slate-200 pt-4">
              <div className="text-center mb-4">
                <p className="text-sm font-bold text-slate-800">
                  အဆင်မပြေမှုများရှိပါက 09-955255972 သို့ တိုင်ကြားနိုင်ပါသည်။
                </p>
                <p className="text-sm font-bold text-slate-800 mt-1">
                  ဝယ်ယူအားပေးမှုကို ကျေးဇူးတင်ပါသည်။
                </p>
              </div>
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Vr.No - {receiptData.invoiceNumber}</span>
                {printedByName && (
                  <span>
                    Printed by: {printedByName} ({printedByRole})
                  </span>
                )}
                <span>Page {currentPageNum} / {pages.length}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
