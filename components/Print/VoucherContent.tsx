import React from "react";
import { PrintShopBranding } from "../../utils/printShopBranding";
import { PrintPaperSize } from "../../utils/printPaperSize";

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
  formatDate: (dateString: string) => string;
}

export const VoucherContent: React.FC<VoucherContentProps> = ({
  receiptData,
  shopBranding,
  paperSize,
  formatDate,
}) => {
  console.log("receiptData:", receiptData);
  const isThermal = paperSize === "thermal-80mm";
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

  // Expand items: If a product has multiple batches, display each as a distinct row on the voucher
  const displayItems = React.useMemo(() => {
    const raw = receiptData.items || [];
    const list: VoucherReceiptItem[] = [];
    for (const it of raw) {
      if (it.batches && it.batches.length > 1) {
        for (const b of it.batches) {
          list.push({
            ...it,
            qty: b.quantity,
            batches: [b],
          });
        }
      } else {
        list.push(it);
      }
    }
    return list;
  }, [receiptData.items]);

  if (isThermal) {
    return (
      <div className="voucher-container" data-paper={paperSize}>
        {/* Header Section */}
        <div className="text-center mb-2 pb-2 border-b border-slate-300">
          {shopBranding.logo ? (
            <img
              src={shopBranding.logo}
              alt={shopBranding.shopName}
              className="voucher-logo mx-auto object-contain mb-1"
            />
          ) : (
            <div className="voucher-logo mx-auto flex items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-bold mb-1">
              {shopBranding.shopName.charAt(0)}
            </div>
          )}
          <p className="text-[8.5px] text-slate-600 font-medium italic mb-1 leading-tight">
            လုပ်ရပ်တိုင်းသည်၊ ရည်စူးချက် ရည်ရွယ်ချက်ပေါ် မူတည်၏။
          </p>
          <h2 className="voucher-shop-name font-bold text-slate-800 leading-tight">
            {shopBranding.shopName}
          </h2>
          {shopBranding.address && (
            <p className="voucher-address text-slate-700 font-medium mt-0.5 leading-snug">
              {shopBranding.address}
            </p>
          )}
          {shopBranding.phone && (
            <p className="text-[8.5px] text-slate-700 font-medium mt-0.5">
              Phone : {shopBranding.phone}
            </p>
          )}
          <p className="text-[8.5px] text-slate-700 font-medium mt-0.5">
            Viber Phone : {shopBranding.website || "09-960889290, 09-973989877"}
          </p>
        </div>

        {/* Customer & Invoice Details */}
        <div className="text-[9.5px] text-slate-800 mb-2 space-y-1 border-b border-slate-300 pb-2">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Vr.No :</span>
            <span className="font-bold">{receiptData.invoiceNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">မြို့နယ် :</span>
            <span>{receiptData.creditPersonTownship || "—"}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold">အမည် :</span>
            <span className="font-bold">
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
            <p className="text-[8.5px] text-slate-500 italic text-center pt-1">
              Prices are estimates. Not a final invoice.
            </p>
          )}
        </div>

        {/* Product Table with Batches and Expiry Date */}
        <div className="mb-2">
          <table className="voucher-table">
            <thead>
              <tr>
                <th style={{ width: "8%" }}>စဉ်</th>
                <th style={{ width: "42%" }}>အမျိုးအမည်</th>
                <th style={{ width: "11%" }}>ခုရေ</th>
                <th style={{ width: "11%" }}>ယူနစ်</th>
                <th style={{ width: "14%" }}>ဈေးနှုန်း</th>
                <th style={{ width: "14%" }}>သင့်ငွေ</th>
              </tr>
            </thead>
            <tbody>
              {displayItems.map((item, index) => (
                <tr key={index}>
                  <td className="text-center">{index + 1}</td>
                  <td className="text-left">
                    <div className="font-semibold text-slate-900 leading-tight">
                      {item.name}
                    </div>
                    {item.batches && item.batches.length > 0 && (
                      <div className="text-[8.5px] text-slate-600 font-mono mt-0.5 space-y-0.5 leading-snug">
                        {item.batches.map((b, bIdx) => (
                          <div key={bIdx}>
                            ↳ Batch: {b.batchNumber}
                            {b.expiryDate ? ` (Exp: ${formatToImageDate(b.expiryDate)})` : ""}
                            {item.batches!.length > 1 ? ` x ${b.quantity}` : ""}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="text-center">{formatReceiptQty(item)}</td>
                  <td className="text-center">{formatReceiptUnit(item)}</td>
                  <td className="text-right">{item.price.toLocaleString()}</td>
                  <td className="text-right font-semibold">
                    {(item.price * item.qty).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial Summary (Myanmar) */}
        <div className="w-full space-y-1 text-[9.5px] text-slate-800 mb-2 border-b border-slate-300 pb-2">
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
          <div className="flex justify-between border-t border-slate-300 pt-1 font-semibold">
            <span>ကျန်ငွေ:</span>
            <span>
              {(receiptData.total - (receiptData.paidAmount ?? 0)).toLocaleString()} {shopBranding.currency}
            </span>
          </div>
          {receiptData.creditPersonName && (
            <>
              <div className="flex justify-between text-slate-700 pt-0.5">
                <span className="font-semibold">ယခင်ကျန်ငွေ:</span>
                <span>
                  {((receiptData.creditPersonOutstanding ?? 0) - (receiptData.total - (receiptData.paidAmount ?? 0))).toLocaleString()} {shopBranding.currency}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-400 pt-1 font-bold text-[10.5px] text-red-700">
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
          <p className="text-[8.5px] font-semibold text-slate-700 mb-1 leading-tight">
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
        <div className="pt-2 border-t border-slate-300 text-center">
          <p className="text-[9.5px] font-bold text-slate-800">
            အဆင်မပြေမှုများရှိပါက 09-955255972 သို့ တိုင်ကြားနိုင်ပါသည်။
          </p>
          <p className="text-[9.5px] font-bold text-slate-800 mt-0.5">
            ဝယ်ယူအားပေးမှုကို ကျေးဇူးတင်ပါသည်။
          </p>
          <div className="flex justify-between items-center text-[8.5px] text-slate-500 mt-2 border-t border-dashed border-slate-300 pt-1">
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
                            {item.batches && item.batches.length > 0 && (
                              <div className="text-xs text-slate-500 font-mono mt-0.5 space-y-0.5">
                                {item.batches.map((b, bIdx) => (
                                  <div key={bIdx}>
                                    ↳ Batch: {b.batchNumber}
                                    {b.expiryDate ? ` (Exp: ${formatToImageDate(b.expiryDate)})` : ""}
                                    {item.batches!.length > 1 ? ` x ${b.quantity}` : ""}
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
