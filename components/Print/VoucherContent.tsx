import React from "react";
import { PrintShopBranding } from "../../utils/printShopBranding";
import { PrintPaperSize } from "../../utils/printPaperSize";

export interface VoucherReceiptItem {
  name: string;
  code?: string;
  qty: number;
  /** Unit of measure, e.g. ကျင်း, မူး */
  unit?: string;
  price: number;
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

  const formatToImageDate = (dateString: string) => {
    if (!dateString) return "";
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (isThermal) {
    return (
      <div className="voucher-container" data-paper={paperSize}>
        <div className="text-center mb-4 sm:mb-8">
          {shopBranding.logo ? (
            <img
              src={shopBranding.logo}
              alt={shopBranding.shopName}
              className="voucher-logo mx-auto object-contain"
            />
          ) : (
            <div className="voucher-logo mx-auto flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 font-bold">
              {shopBranding.shopName.charAt(0)}
            </div>
          )}
          <h2 className="voucher-shop-name font-bold text-slate-800 mt-3">
            {shopBranding.shopName}
          </h2>
          {shopBranding.address && (
            <p className="voucher-address text-slate-600 mt-1">
              {shopBranding.address}
            </p>
          )}
        </div>

        <div
          className={`flex justify-between items-start mb-4 sm:mb-6 voucher-invoice-row flex-col gap-1`}
        >
          <div>
            <p className="font-bold mb-0.5">
              {isQuotation ? "QUOTATION NO" : "INVOICE NO"} :{" "}
              {receiptData.invoiceNumber}
            </p>
            <p className="font-bold">DATE: {formatDate(receiptData.date)}</p>
          </div>
        </div>

        <div className="mb-4 voucher-thermal-table">
          <div className="voucher-thermal-header">
            <div>NO</div>
            <div>ITEM</div>
            <div className="voucher-thermal-col-price">PRICE</div>
            <div className="voucher-thermal-col-qty">QTY</div>
            <div>UNIT</div>
            <div className="voucher-thermal-col-total">TOTAL</div>
          </div>
          {receiptData.items.map((item, index) => (
            <div key={index} className="voucher-thermal-item">
              <div>{index + 1}</div>
              <div
                className={`voucher-thermal-col-item ${item.name.length > THERMAL_ITEM_LONG_CHARS ? "is-long" : ""
                  }`}
                title={item.name}
              >
                {item.name}
              </div>
              <div className="voucher-thermal-col-price">
                {item.price.toLocaleString()}
              </div>
              <div className="voucher-thermal-col-qty">
                {formatReceiptQty(item)}
              </div>
              <div className="break-words">{formatReceiptUnit(item)}</div>
              <div className="voucher-thermal-col-total">
                {(item.price * item.qty).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        <div
          className={`voucher-summary-grid`}
        >
          <div>
            <div className="mb-3">
              {isQuotation ? (
                <>
                  <p className="font-bold mb-1">Document:</p>
                  <p>{receiptData.paymentMethod}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    Prices are estimates. Not a final invoice.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-bold mb-1">Payment Info:</p>
                  <p>Method: {receiptData.paymentMethod}</p>
                  {receiptData.creditPersonName && (
                    <>
                      <p className="mt-1 font-medium text-orange-700">
                        Credit Person: {receiptData.creditPersonName}
                      </p>
                      {receiptData.creditPersonOutstanding != null && receiptData.creditPersonOutstanding > 0 && (
                        <p className="text-orange-600 text-sm">
                          Total Outstanding: {receiptData.creditPersonOutstanding.toLocaleString()} MMK
                        </p>
                      )}
                    </>
                  )}
                  {receiptData.paidAmount != null && (
                    <p>
                      Paid: {receiptData.paidAmount.toLocaleString()}{" "}
                      {shopBranding.currency}
                    </p>
                  )}
                  {receiptData.change != null && receiptData.change > 0 && (
                    <p>
                      Change: {receiptData.change.toLocaleString()}{" "}
                      {shopBranding.currency}
                    </p>
                  )}
                </>
              )}
            </div>
            {receiptData.note && (
              <p className="italic">Note: {receiptData.note}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>SUB TOTAL:</span>
              <span>{receiptData.subtotal.toLocaleString()}</span>
            </div>
            {(receiptData.tax ?? 0) > 0 && (
              <div className="flex justify-between mb-1">
                <span>TAX:</span>
                <span>+{(receiptData.tax ?? 0).toLocaleString()}</span>
              </div>
            )}
            {(receiptData.discountAmount ?? 0) > 0 && (
              <div className="flex justify-between mb-1">
                <span>DISCOUNT:</span>
                <span>-{(receiptData.discountAmount ?? 0).toLocaleString()}</span>
              </div>
            )}
            {receiptData.discountPercent > 0 && (
              <div className="flex justify-between mb-1">
                <span>DISCOUNT ({receiptData.discountPercent}%):</span>
                <span>
                  -
                  {(
                    (receiptData.subtotal * receiptData.discountPercent) /
                    100
                  ).toLocaleString()}
                </span>
              </div>
            )}
            <div
              className="voucher-total-bar flex justify-between font-bold text-white p-2"
              style={{ backgroundColor: "#4CAF50" }}
            >
              <span>TOTAL:</span>
              <span>
                {receiptData.total.toLocaleString()} {shopBranding.currency}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="voucher-footer-title font-bold italic mb-1 text-xs">
            {isQuotation
              ? "Thank you — please confirm before ordering."
              : "Thank you for your business!"}
          </p>
        </div>

        <div
          className="voucher-contact-bar mt-4 py-2 px-3 flex flex-col gap-1 text-white text-xs text-center"
          style={{ backgroundColor: "#000" }}
        >
          <span>
            {contactParts.length > 0
              ? `Contact: ${contactParts.join(" | ")}`
              : shopBranding.address || ""}
          </span>
          <span>{shopBranding.shopName}</span>
        </div>
      </div>
    );
  }

  // A4 / A5 Layout matching the image with React pagination
  const items = receiptData.items || [];

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
                        {/* Township value is empty line to fill manually as in picture */}
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
                          <td>{item.name}</td>
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
                      <div className="flex justify-between border-t border-slate-400 pt-2 font-bold">
                        <span>စုစုပေါင်းကျသင့်ငွေ:</span>
                        <span>
                          {receiptData.total.toLocaleString()} {shopBranding.currency}
                        </span>
                      </div>
                      {receiptData.creditPersonName && (
                        <>
                          <div className="flex justify-between text-slate-700 pt-1">
                            <span className="font-semibold">ယခင်ကျန်ငွေ:</span>
                            <span>
                              {(receiptData.creditPersonOutstanding ?? 0).toLocaleString()} {shopBranding.currency}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-slate-400 pt-2 font-bold text-base text-red-700">
                            <span>စုစုပေါင်းကျန်ငွေ:</span>
                            <span>
                              {((receiptData.creditPersonOutstanding ?? 0) + receiptData.total).toLocaleString()} {shopBranding.currency}
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
