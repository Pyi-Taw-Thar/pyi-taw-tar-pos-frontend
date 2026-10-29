import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  RefreshCw,
  Receipt,
  Calendar,
  User,
  Package,
  CreditCard,
  Plus,
  Minus,
  Truck,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import type { EcommerceOrder } from "../../services/Ecommerce/fetchEcommerceOrders";
import { sendOrderToFulfillment } from "../../services/Ecommerce/sendOrderToFulfillment";
import { useLanguage } from "../../context/LanguageContext";
import { getSavedPrintPaperSize } from "../../utils/printPaperSize";
import type { VoucherReceiptData } from "../Print/VoucherContent";
import { AddItemsToEcommerceOrderModal } from "./AddItemsToEcommerceOrderModal";
import { RemoveItemsFromEcommerceOrderModal } from "./RemoveItemsFromEcommerceOrderModal";

interface EcommerceOrderDetailModalProps {
  isOpen: boolean;
  loading: boolean;
  order: EcommerceOrder | null;
  onClose: () => void;
  onOrderUpdate?: () => void;
}

export const EcommerceOrderDetailModal: React.FC<
  EcommerceOrderDetailModalProps
> = ({ isOpen, loading, order, onClose, onOrderUpdate }) => {
  console.log("order", order);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);
  const [showRemoveItemsModal, setShowRemoveItemsModal] = useState(false);
  const [isSendingFulfillment, setIsSendingFulfillment] = useState(false);

  if (!isOpen) return null;

  const handleSendToFulfillment = async () => {
    if (!order) return;
    setIsSendingFulfillment(true);
    try {
      const res = await sendOrderToFulfillment(order._id);
      if (res.success) {
        toast.success(
          t("ecommerceOrders.sendToFulfillmentSuccess") ||
            "အော်ဒါကို ဂိုဒေါင်သို့ အောင်မြင်စွာ လွှဲပြောင်းပေးပို့လိုက်ပါပြီ",
        );
        if (onOrderUpdate) onOrderUpdate();
      } else {
        toast.error(
          res.message ||
            t("ecommerceOrders.sendToFulfillmentFailed") ||
            "ဂိုဒေါင်သို့ လွှဲပြောင်းရာတွင် မအောင်မြင်ပါ",
        );
      }
    } catch (err: any) {
      toast.error(
        t("ecommerceOrders.sendToFulfillmentFailed") ||
          "ဂိုဒေါင်သို့ လွှဲပြောင်းရာတွင် မအောင်မြင်ပါ",
      );
    } finally {
      setIsSendingFulfillment(false);
    }
  };

  const handlePrint = () => {
    if (!order) return;
    const customer = typeof order.customerId === "object" ? order.customerId : null;
    const customerAddress = order.shippingAddress
      ? [order.shippingAddress.addressLine, order.shippingAddress.city]
          .filter(Boolean)
          .join(", ")
      : customer?.address || "";

    const receiptData: VoucherReceiptData = {
      documentType: "invoice",
      invoiceNumber: order.orderNumber,
      storefrontName: customer?.name || "Ecommerce Order",
      customerPhone: customer?.phone || "",
      customerAddress: customerAddress || undefined,
      date: order.createdAt || new Date().toISOString(),
      items: (order.products || []).map((p) => {
        let batches = p.batches;
        if (
          (!batches || batches.length === 0) &&
          typeof order.fulfillmentOrderId === "object" &&
          order.fulfillmentOrderId
        ) {
          const fulfillmentOp = (
            order.fulfillmentOrderId as any
          ).ordersProducts?.find(
            (fop: any) =>
              (fop.inventoryId?._id || fop.inventoryId)?.toString() ===
              (p.inventoryId?._id || (p as any)._id || (p.inventoryId as any))?.toString()
          );
          if (fulfillmentOp?.batches?.length) {
            batches = fulfillmentOp.batches;
          }
        }

        return {
          name: p.inventoryId?.productName || (p as any).productName || "Product",
          code: p.inventoryId?.productCode || (p as any).productCode || "",
          qty: p.quantity,
          unit: p.unit || "ခု",
          price: p.unitPrice,
          batches: batches && batches.length > 0 ? batches : undefined,
        };
      }),
      subtotal: order.totalAmount,
      discountPercent: 0,
      total: order.totalAmount,
      paymentMethod:
        t(`ecommerceOrders.paymentMethods.${order.paymentMethod}`) ||
        order.paymentMethod ||
        "cash_on_delivery",
      note: order.note || undefined,
    };

    localStorage.setItem(
      `receipt_${order.orderNumber}`,
      JSON.stringify(receiptData)
    );

    // New tab မဖွင့်ဘဲ လက်ရှိ tab တွင်ပင် print receipt စာမျက်နှာသို့ navigate လုပ်ခြင်း
    navigate(
      `/print-receipt/${encodeURIComponent(order.orderNumber)}?size=${getSavedPrintPaperSize()}&autoprint=1`
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusKey = order?.status ?? "pending";
  const statusLabelMm =
    t(`ecommerceOrders.statusLabelsMm.${statusKey}`) ||
    t(`ecommerceOrders.statusLabels.${statusKey}`);

  const paymentLabel =
    t(`ecommerceOrders.paymentMethods.${order?.paymentMethod}`) ||
    order?.paymentMethod;

  const primaryProductImage =
    order?.products[0]?.inventoryId?.images?.find((img) => img.isPrimary)
      ?.url || order?.products[0]?.inventoryId?.images?.[0]?.url;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 p-3.5 sm:p-4 border-b bg-slate-50 shrink-0">
          <h3 className="font-bold text-base sm:text-lg text-slate-800 flex items-center gap-1.5 sm:gap-2 shrink-0 truncate">
            <Receipt className="w-5 h-5 text-primary shrink-0" />
            <span className="truncate">{t("ecommerceOrders.title")}</span>
          </h3>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {order && (
              <>
                {/* Print Button */}
                <button
                  onClick={handlePrint}
                  className="h-9 px-2.5 sm:px-3 bg-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  title={t("common.print") === "common.print" ? "ပရင့်ထုတ်မည်" : t("common.print")}
                >
                  <Printer className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">
                    {t("common.print") === "common.print" ? "ပရင့်ထုတ်မည်" : t("common.print")}
                  </span>
                </button>

                {!order.isSentToFulfillment && order.status !== "cancelled" ? (
                  <button
                    onClick={handleSendToFulfillment}
                    disabled={isSendingFulfillment}
                    className="h-9 px-2.5 sm:px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-semibold disabled:opacity-50 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                    title={t("ecommerceOrders.sendToFulfillment") || "ဂိုဒေါင်သို့ လွှဲမည်"}
                  >
                    {isSendingFulfillment ? (
                      <RefreshCw className="w-4 h-4 animate-spin shrink-0" />
                    ) : (
                      <Truck className="w-4 h-4 shrink-0" />
                    )}
                    <span className="hidden sm:inline">
                      {t("ecommerceOrders.sendToFulfillment") || "ဂိုဒေါင်သို့ လွှဲမည်"}
                    </span>
                  </button>
                ) : order.isSentToFulfillment ? (
                  <span
                    className="h-9 px-2.5 sm:px-3 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 inline-flex items-center justify-center gap-1.5 shadow-sm"
                    title={t("ecommerceOrders.inFulfillment") || "ဂိုဒေါင်သို့ လွှဲပြီး"}
                  >
                    <Truck className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">
                      {t("ecommerceOrders.inFulfillment") || "ဂိုဒေါင်သို့ လွှဲပြီး"}
                    </span>
                  </span>
                ) : null}

                <button
                  onClick={() => setShowRemoveItemsModal(true)}
                  className="h-9 px-2.5 sm:px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  title={t("orders.removeItems") || "ပစ္စည်းများ ဖယ်ရှားမည်"}
                >
                  <Minus className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">
                    {t("orders.removeItems") || "ပစ္စည်းများ ဖယ်ရှားမည်"}
                  </span>
                </button>
                <button
                  onClick={() => setShowAddItemsModal(true)}
                  className="h-9 px-2.5 sm:px-3 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                  title={t("orders.addItems") || "ပစ္စည်းများ ထည့်မည်"}
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">
                    {t("orders.addItems") || "ပစ္စည်းများ ထည့်မည်"}
                  </span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="h-9 w-9 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center text-slate-500 hover:text-slate-800"
              title={t("common.close")}
            >
              <X className="w-5 h-5 shrink-0" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading || !order ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-slate-500">{t("common.loading")}...</p>
            </div>
          ) : (
            <>
              {/* Fulfillment Status Banner */}
              {order.isSentToFulfillment && (
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3.5 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-5 h-5 text-indigo-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-indigo-900">
                        ဂိုဒေါင်မှ ပစ္စည်းစစ်ဆေးထုတ်ပိုးရန် လွှဲပြောင်းပေးပို့ထားပါသည် (In Fulfillment)
                      </p>
                      {typeof order.fulfillmentOrderId === "object" && order.fulfillmentOrderId?.orderNumber && (
                        <p className="text-[11px] text-indigo-700 font-mono mt-0.5">
                          Fulfillment Order No: {order.fulfillmentOrderId.orderNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium mb-1">
                    {t("ecommerceOrders.orderNumber")}
                  </p>
                  <p className="font-bold text-blue-800">{order.orderNumber}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-xs text-green-600 font-medium mb-1">
                    {t("ecommerceOrders.status")}
                  </p>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${
                      order.status === "pending"
                        ? "bg-amber-100 text-amber-800"
                        : order.status === "confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "shipped"
                            ? "bg-purple-100 text-purple-800"
                            : order.status === "delivered"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {statusLabelMm}
                  </span>
                </div>
              </div>

              {/* Date */}
              <div className="mb-6 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-6">
                <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-teal-600" />
                    <p className="text-xs text-teal-600 font-medium">
                      {t("ecommerceOrders.detail.customerInfo")}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-teal-800">
                    {order.customerId?.name || "-"}
                  </p>
                  <p className="text-xs text-teal-700 mt-1">
                    {order.customerId?.phone || "-"}
                  </p>
                </div>
              </div>

              {/* Products */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  {t("ecommerceOrders.detail.products")}
                </h4>
                <div className="border rounded-lg overflow-x-auto">
                  <table className="w-full text-sm min-w-[550px]">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-3 text-left font-medium text-slate-600">
                          Image
                        </th>
                        <th className="p-3 text-left font-medium text-slate-600">
                          {t("inventory.productName")}
                        </th>
                        <th className="p-3 text-left font-medium text-slate-600">
                          {t("inventory.productCode")}
                        </th>
                        <th className="p-3 text-center font-medium text-slate-600">
                          {t("common.quantity")}
                        </th>
                        <th className="p-3 text-center font-medium text-slate-600">
                          Unit
                        </th>
                        <th className="p-3 text-right font-medium text-slate-600">
                          {t("common.price")}
                        </th>
                        <th className="p-3 text-right font-medium text-slate-600">
                          {t("common.subtotal")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {order.products.map((p, idx) => (
                        <tr key={idx} className="bg-white">
                          <td className="p-3">
                            {p.inventoryId.images?.[0]?.url ? (
                              <img
                                src={
                                  p.inventoryId.images.find(
                                    (img) => img.isPrimary,
                                  )?.url || p.inventoryId.images[0].url
                                }
                                alt={p.inventoryId.productName}
                                className="w-10 h-10 rounded object-cover border"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded border bg-slate-100" />
                            )}
                          </td>
                          <td className="p-3 font-medium text-slate-800">
                            <div>{p.inventoryId.productName}</div>
                            {(() => {
                              let batches = p.batches;
                              if (
                                (!batches || batches.length === 0) &&
                                typeof order.fulfillmentOrderId === "object" &&
                                order.fulfillmentOrderId
                              ) {
                                const fulfillmentOp = (
                                  order.fulfillmentOrderId as any
                                ).ordersProducts?.find(
                                  (fop: any) =>
                                    (fop.inventoryId?._id || fop.inventoryId)?.toString() ===
                                    (p.inventoryId?._id || (p as any)._id || (p.inventoryId as any))?.toString()
                                );
                                if (fulfillmentOp?.batches?.length) {
                                  batches = fulfillmentOp.batches;
                                }
                              }
                              const expBatches = (batches || []).filter((b: any) => b.expiryDate);
                              if (expBatches.length === 0) return null;

                              const formattedDates = Array.from(
                                new Set(
                                  expBatches.map((b: any) => {
                                    const d = new Date(b.expiryDate);
                                    const day = String(d.getDate()).padStart(2, "0");
                                    const month = String(d.getMonth() + 1).padStart(2, "0");
                                    return `${day}/${month}/${d.getFullYear()}`;
                                  })
                                )
                              );

                              return (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {formattedDates.map((exp, expIdx) => (
                                    <span
                                      key={expIdx}
                                      className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 font-mono"
                                    >
                                      Exp: {exp}
                                    </span>
                                  ))}
                                </div>
                              );
                            })()}
                          </td>
                          <td className="p-3 text-slate-600">
                            {p.inventoryId.productCode}
                          </td>
                          <td className="p-3 text-center font-medium">
                            <div>{p.quantity.toLocaleString()}</div>
                            {(p as any).originalQuantity != null &&
                              ((p as any).originalQuantity !== p.quantity ||
                                ((p as any).originalUnit || p.unit) !== p.unit) && (
                                <span className="text-amber-600 text-xs block font-normal">
                                  {/* မူလ မှာယူခဲ့သော unit ပါ ပြ (fulfillment တွင် base unit သို့ ပြောင်းနိုင်၍) */}
                                  (မူလ: {(p as any).originalQuantity}{" "}
                                  {(p as any).originalUnit || p.unit})
                                </span>
                              )}
                          </td>
                          <td className="p-3 text-center text-slate-600">
                            {p.unit}
                          </td>
                          <td className="p-3 text-right text-slate-600">
                            {p.unitPrice.toLocaleString()} MMK
                          </td>
                          <td className="p-3 text-right font-medium text-slate-800">
                            {p.subtotal.toLocaleString()} MMK
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-slate-50 p-4 rounded-lg border mb-6">
                <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {t("ecommerceOrders.payment")}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">
                      {t("ecommerceOrders.total")}
                    </span>
                    <span className="font-semibold">
                      {order.totalAmount.toLocaleString()} MMK
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("common.method")}</span>
                    <span>{paymentLabel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("orders.paymentStatus")}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        order.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {order.paymentStatus === "paid"
                        ? t("common.paid")
                        : t("common.remaining")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Note */}
              {order.note && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1">
                    {t("ecommerceOrders.detail.note")}
                  </p>
                  <p className="text-sm text-amber-900 whitespace-pre-wrap">
                    {order.note}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AddItemsToEcommerceOrderModal
        isOpen={showAddItemsModal}
        order={order}
        onClose={() => setShowAddItemsModal(false)}
        onSuccess={() => {
          setShowAddItemsModal(false);
          if (onOrderUpdate) onOrderUpdate();
        }}
      />

      <RemoveItemsFromEcommerceOrderModal
        isOpen={showRemoveItemsModal}
        order={order}
        onClose={() => setShowRemoveItemsModal(false)}
        onSuccess={() => {
          setShowRemoveItemsModal(false);
          if (onOrderUpdate) onOrderUpdate();
        }}
      />
    </div>
  );
};
