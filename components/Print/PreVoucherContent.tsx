import React from "react";
import { PrintShopBranding } from "../../utils/printShopBranding";
import { PrintPaperSize } from "../../utils/printPaperSize";
import { VoucherReceiptData } from "./VoucherContent";

interface PreVoucherContentProps {
  receiptData: VoucherReceiptData;
  shopBranding: PrintShopBranding;
  paperSize: PrintPaperSize;
  formatDate: (dateString: string) => string;
}

/**
 * Ecommerce အော်ဒါများအတွက် ငွေပမာဏမပါသော ကြိုတင်ဘောက်ချာ (Pre-Voucher) Component
 * - စျေးနှုန်း၊ စုစုပေါင်းငွေ၊ ပေးချေငွေ၊ ကျန်ငွေ၊ အကြွေး၊ Note နှင့် Batches များကို လုံးဝ မပြသရပါ။
 * - ဆိုင် Logo ပုံ (img) လုံးဝ မပါဝင်ရပါ (Text သာ ပြသရမည်)။
 * - ဝယ်သူအချက်အလက်၊ ပစ္စည်းအမည် နှင့် အရေအတွက် (Qty + Unit) သာ ဖော်ပြရမည်။
 */
export const PreVoucherContent: React.FC<PreVoucherContentProps> = ({
  receiptData,
  shopBranding,
  paperSize,
  formatDate,
}) => {
  const isThermal =
    paperSize === "thermal-80mm" || (paperSize as any) === "thermal-72mm";
  const isA5 = paperSize === "A5";

  // ပစ္စည်းစာရင်း
  const items = receiptData.items || [];

  // ဝယ်သူ အချက်အလက်
  const customerName =
    receiptData.customerName || receiptData.storefrontName || "Customer";
  const customerPhone = receiptData.customerPhone;
  const customerAddress = receiptData.customerAddress;
  const customerTownship = receiptData.customerTownship;

  // ရက်စွဲ format
  const formattedDate = formatDate(receiptData.date);

  // -------------------------------------------------------------
  // Thermal Slip Layout (80mm / 72mm)
  // -------------------------------------------------------------
  if (isThermal) {
    return (
      <div className="voucher-container" data-paper={paperSize}>
        {/* Header (No Logo - Text Only) */}
        <div className="text-center pb-2 border-b border-black">
          <h2 className="voucher-shop-name text-base font-extrabold text-black leading-tight">
            {shopBranding.shopName}
          </h2>
          {shopBranding.phone && (
            <p className="text-[11px] text-black mt-0.5">
              ဖုန်း: {shopBranding.phone}
            </p>
          )}
          {shopBranding.address && (
            <p className="text-[10px] text-black leading-tight mt-0.5">
              {shopBranding.address}
            </p>
          )}
          <div className="mt-2 pt-1 border-t border-dashed border-black">
            <h3 className="text-sm font-bold text-black tracking-wide">
              ကြိုတင်ဘောက်ချာ (Pre-Voucher)
            </h3>
          </div>
        </div>

        {/* Order Meta & Customer Info */}
        <div className="py-2 text-[11px] leading-snug border-b border-black space-y-1">
          <div className="flex justify-between">
            <span className="font-semibold text-black">ဘောက်ချာနံပါတ်:</span>
            <span className="font-mono font-bold text-black">
              {receiptData.invoiceNumber}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-black">ရက်စွဲ:</span>
            <span className="text-black">{formattedDate}</span>
          </div>
          <div className="border-t border-dashed border-gray-400 pt-1 mt-1">
            <div className="flex">
              <span className="font-semibold text-black w-20 shrink-0">
                ဝယ်သူ:
              </span>
              <span className="font-bold text-black">{customerName}</span>
            </div>
            {customerPhone && (
              <div className="flex">
                <span className="text-black w-20 shrink-0">ဖုန်း:</span>
                <span className="text-black font-mono">{customerPhone}</span>
              </div>
            )}
            {customerAddress && (
              <div className="flex">
                <span className="text-black w-20 shrink-0">လိပ်စာ:</span>
                <span className="text-black break-words flex-1">
                  {customerAddress}
                </span>
              </div>
            )}
            {customerTownship && (
              <div className="flex">
                <span className="text-black w-20 shrink-0">မြို့နယ်:</span>
                <span className="text-black">{customerTownship}</span>
              </div>
            )}
          </div>
        </div>

        {/* Items Table (3 Columns: စဉ် | ပစ္စည်းအမည် | အရေအတွက်) */}
        <table className="w-full my-2 text-[11px] border-collapse">
          <thead>
            <tr className="border-b border-black text-black font-bold">
              <th className="py-1 text-left w-6">စဉ်</th>
              <th className="py-1 text-left">ပစ္စည်းအမည်</th>
              <th className="py-1 text-right w-16">အရေအတွက်</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-dashed border-gray-300">
                <td className="py-1.5 align-top text-left text-black font-mono">
                  {idx + 1}
                </td>
                <td className="py-1.5 align-top text-left text-black pr-1 break-words font-medium">
                  {item.name}
                </td>
                <td className="py-1.5 align-top text-right text-black font-semibold whitespace-nowrap">
                  {item.qty} {item.unit?.trim() || ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer (Item count only) */}
        <div className="pt-2 pb-1 border-t border-black text-center">
          <p className="text-xs font-bold text-black">
            ပစ္စည်း {items.length} မျိုး
          </p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // A4 / A5 Layout
  // -------------------------------------------------------------
  return (
    <div
      className={`voucher-container ${isA5 ? "max-w-[148mm] p-4 text-[11px]" : "max-w-[210mm] p-6 text-[12px]"}`}
      data-paper={paperSize}
      style={{
        fontFamily: 'Arial, "Myanmar Text", "Padauk", sans-serif',
        color: "#0f172a",
      }}
    >
      {/* Header Section (No Logo - Text Only) */}
      <div className="flex justify-between items-start gap-4 border-b-2 border-slate-800 pb-3 mb-4">
        <div className="min-w-0">
          <h2 className="text-xl font-black text-slate-900 tracking-tight leading-snug">
            {shopBranding.shopName}
          </h2>
          {shopBranding.address && (
            <p className="text-xs text-slate-600 mt-0.5">
              {shopBranding.address}
            </p>
          )}
          {shopBranding.phone && (
            <p className="text-xs text-slate-600 mt-0.5">
              ဖုန်း: {shopBranding.phone}
            </p>
          )}
        </div>
        {/* ခေါင်းစဉ် "(Pre-Voucher)" ကြားတွင် စာကြောင်း မကျိုးစေရန် shrink-0 + whitespace-nowrap */}
        <div className="text-right shrink-0">
          <h1 className="text-lg font-black text-slate-900 border border-slate-900 px-3 py-1 rounded inline-block bg-slate-50 whitespace-nowrap">
            ကြိုတင်ဘောက်ချာ (Pre-Voucher)
          </h1>
          <div className="mt-2 text-xs text-slate-700 space-y-0.5">
            <p>
              ဘောက်ချာနံပါတ်:{" "}
              <span className="font-mono font-bold text-slate-900">
                {receiptData.invoiceNumber}
              </span>
            </p>
            <p>
              ရက်စွဲ: <span className="font-medium">{formattedDate}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Customer Information Block */}
      <div className="bg-slate-50 border border-slate-300 rounded-md p-3 mb-4 text-xs">
        <h4 className="font-bold text-slate-800 mb-1.5 border-b border-slate-200 pb-1">
          ဝယ်ယူသူ အချက်အလက်
        </h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>
            <span className="font-semibold text-slate-700">အမည်: </span>
            <span className="font-bold text-slate-900">{customerName}</span>
          </div>
          {customerPhone && (
            <div>
              <span className="font-semibold text-slate-700">ဖုန်းနံပါတ်: </span>
              <span className="font-mono text-slate-900">{customerPhone}</span>
            </div>
          )}
          {customerAddress && (
            <div className="col-span-2">
              <span className="font-semibold text-slate-700">
                ပို့ဆောင်မည့် လိပ်စာ:{" "}
              </span>
              <span className="text-slate-900">{customerAddress}</span>
            </div>
          )}
          {customerTownship && (
            <div>
              <span className="font-semibold text-slate-700">မြို့နယ်: </span>
              <span className="text-slate-900">{customerTownship}</span>
            </div>
          )}
        </div>
      </div>

      {/* Items Table (3 Columns: စဉ် | ပစ္စည်းအမည် | အရေအတွက်) */}
      <table
        className="w-full border-collapse border border-slate-800 my-4"
        style={{ width: "100%" }}
      >
        <thead style={{ display: "table-header-group" }}>
          <tr className="bg-slate-100 border-b-2 border-slate-800 text-slate-900 font-bold text-center">
            <th className="border-r border-slate-400 py-2 px-2 w-12 text-center">
              စဉ်
            </th>
            <th className="border-r border-slate-400 py-2 px-3 text-left">
              ပစ္စည်းအမည်
            </th>
            <th className="py-2 px-3 w-28 text-right">အရေအတွက်</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={idx}
              className="border-b border-slate-300 hover:bg-slate-50/50"
              style={{ pageBreakInside: "avoid" }}
            >
              <td className="border-r border-slate-300 py-2 px-2 text-center font-mono align-top">
                {idx + 1}
              </td>
              <td className="border-r border-slate-300 py-2 px-3 text-left font-medium text-slate-900 break-words align-top">
                {item.name}
              </td>
              <td className="py-2 px-3 text-right font-bold text-slate-900 whitespace-nowrap align-top">
                {item.qty} {item.unit?.trim() || ""}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer (Item count only) */}
      <div className="flex justify-end items-center border-t-2 border-slate-800 pt-2.5 mt-2">
        <span className="text-sm font-bold text-slate-900">
          ပစ္စည်း {items.length} မျိုး
        </span>
      </div>
    </div>
  );
};
