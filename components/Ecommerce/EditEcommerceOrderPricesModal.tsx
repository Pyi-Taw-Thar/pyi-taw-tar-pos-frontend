import React, { useEffect, useMemo, useState } from "react";
import { X, Pencil, Loader2, Package, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../../context/LanguageContext";
import type { EcommerceOrder } from "../../services/Ecommerce/fetchEcommerceOrders";
import { updateEcommerceOrderPrices } from "../../services/Ecommerce/updateEcommerceOrderPrices";

type EditableOrderLine = {
  lineKey: string;
  lineId: string;
  inventoryId: string;
  productName: string;
  productCode: string;
  imageUrl?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  priceOverridden: boolean;
  originalUnitPrice: number | null;
  newPriceInput: string;
  badInput: boolean;
};

interface EditEcommerceOrderPricesModalProps {
  isOpen: boolean;
  order: EcommerceOrder | null;
  onClose: () => void;
  onSuccess?: () => void;
}

// အော်ဒါကို ဂိုဒေါင်မလွှဲမီ ပစ္စည်းတစ်လိုင်းချင်းစီ၏ ဈေးနှုန်းကို ပြင်ဆင်သည့် Modal
export const EditEcommerceOrderPricesModal: React.FC<
  EditEcommerceOrderPricesModalProps
> = ({ isOpen, order, onClose, onSuccess }) => {
  const { t } = useLanguage();
  const [lines, setLines] = useState<EditableOrderLine[]>([]);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !order) {
      setLines([]);
      setReason("");
      setSubmitting(false);
      setSubmitError(null);
      return;
    }

    // Order ထဲရှိ line များကို ပြင်ဆင်နိုင်သော form state အဖြစ် ပြောင်းလဲခြင်း
    const initial: EditableOrderLine[] =
      order.products?.map((p, idx) => {
        const inv: any =
          typeof p.inventoryId === "object" && p.inventoryId !== null
            ? p.inventoryId
            : null;
        const inventoryId =
          typeof p.inventoryId === "string"
            ? p.inventoryId
            : (inv?._id as string | undefined) || "";
        const lineId = p._id ? String(p._id) : "";
        const images = inv?.images as
          | Array<{ url: string; isPrimary?: boolean }>
          | undefined;
        const imageUrl =
          images?.find((img) => img.isPrimary)?.url || images?.[0]?.url;

        return {
          lineKey: lineId || `${inventoryId || "line"}-${idx}`,
          lineId,
          inventoryId,
          productName: inv?.productName || (p as any).productName || "Product",
          productCode: inv?.productCode || (p as any).productCode || "-",
          imageUrl,
          quantity: Number(p.quantity || 0),
          unit: p.unit || "",
          unitPrice: Number(p.unitPrice || 0),
          priceOverridden: Boolean(p.priceOverridden),
          originalUnitPrice:
            p.originalUnitPrice != null ? Number(p.originalUnitPrice) : null,
          newPriceInput: "",
          badInput: false,
        };
      }) || [];

    setLines(initial.filter((l) => !!l.inventoryId && l.quantity > 0));
    setReason("");
    setSubmitError(null);
  }, [isOpen, order]);

  const invalidPriceMessage =
    t("ecommerceOrders.invalidPrice");

  // Line တစ်ခုချင်းစီအတွက် validation၊ ဈေးအသစ်နှင့် live subtotal တွက်ချက်ခြင်း
  const evaluatedLines = useMemo(() => {
    return lines.map((l) => {
      const trimmed = l.newPriceInput.trim();
      if (l.badInput) {
        return {
          ...l,
          isInvalid: true,
          errorMessage: invalidPriceMessage,
          isChanged: false,
          effectiveUnitPrice: l.unitPrice,
          liveSubtotal: l.quantity * l.unitPrice,
        };
      }
      if (trimmed === "") {
        return {
          ...l,
          isInvalid: false,
          errorMessage: null as string | null,
          isChanged: false,
          effectiveUnitPrice: l.unitPrice,
          liveSubtotal: l.quantity * l.unitPrice,
        };
      }
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return {
          ...l,
          isInvalid: true,
          errorMessage: invalidPriceMessage,
          isChanged: false,
          effectiveUnitPrice: l.unitPrice,
          liveSubtotal: l.quantity * l.unitPrice,
        };
      }
      const isChanged = parsed !== l.unitPrice;
      return {
        ...l,
        isInvalid: false,
        errorMessage: null as string | null,
        isChanged,
        effectiveUnitPrice: parsed,
        liveSubtotal: l.quantity * parsed,
      };
    });
  }, [lines, invalidPriceMessage]);

  const oldTotal = useMemo(
    () =>
      order?.totalAmount ??
      lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0),
    [order, lines],
  );

  const newTotal = useMemo(
    () => evaluatedLines.reduce((sum, l) => sum + l.liveSubtotal, 0),
    [evaluatedLines],
  );

  const hasInvalidLine = useMemo(
    () => evaluatedLines.some((l) => l.isInvalid),
    [evaluatedLines],
  );

  const changedLines = useMemo(
    () => evaluatedLines.filter((l) => l.isChanged && !!l.lineId),
    [evaluatedLines],
  );

  const handlePriceInputChange = (
    lineKey: string,
    value: string,
    badInput: boolean,
  ) => {
    setSubmitError(null);
    setLines((prev) =>
      prev.map((l) =>
        l.lineKey === lineKey
          ? { ...l, newPriceInput: value, badInput }
          : l,
      ),
    );
  };

  // ပြောင်းလဲထားသော line များကိုသာ backend သို့ ပေးပို့သိမ်းဆည်းခြင်း
  const handleSave = async () => {
    if (!order) return;
    if (hasInvalidLine) {
      setSubmitError(invalidPriceMessage);
      return;
    }
    if (changedLines.length === 0) {
      const noChangesMsg =
        t("ecommerceOrders.noPriceChanges");
      setSubmitError(noChangesMsg);
      return;
    }

    const trimmedReason = reason.trim();
    if (trimmedReason.length > 200) {
      setSubmitError(t("ecommerceOrders.reasonTooLong"));
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const response = await updateEcommerceOrderPrices(order._id, {
        action: "price",
        ...(trimmedReason ? { reason: trimmedReason } : {}),
        products: changedLines.map((l) => ({
          lineId: l.lineId,
          inventoryId: l.inventoryId,
          unitPrice: l.effectiveUnitPrice,
        })),
      });

      if (response.success) {
        toast.success(t("ecommerceOrders.priceEditSuccess"));
        onClose();
        if (onSuccess) onSuccess();
      } else {
        const msg =
          response.message || t("ecommerceOrders.priceEditFailed");
        setSubmitError(msg);
        toast.error(msg);
      }
    } catch (error: any) {
      const msg =
        error?.message || t("ecommerceOrders.priceEditFailed");
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/10 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* ခေါင်းစဉ်ပိုင်း */}
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Pencil className="w-5 h-5 text-amber-600" />
            {t("ecommerceOrders.editPricesTitle")}
          </h3>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* အတွင်းပိုင်း ပစ္စည်းစာရင်းနှင့် အကြောင်းရင်း */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {submitError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          {evaluatedLines.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">
                {t("orders.noItemsInOrder")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {evaluatedLines.map((l) => {
                const showOriginal =
                  l.originalUnitPrice != null &&
                  l.originalUnitPrice !== l.unitPrice;
                return (
                  <div
                    key={l.lineKey}
                    className={`bg-slate-50 p-3.5 rounded-lg border transition-colors ${
                      l.isInvalid
                        ? "border-red-300 bg-red-50/40"
                        : l.isChanged
                          ? "border-amber-300 bg-amber-50/30"
                          : "border-slate-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* ပစ္စည်းပုံ၊ အမည် နှင့် အရေအတွက် */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {l.imageUrl ? (
                          <img
                            src={l.imageUrl}
                            alt={l.productName}
                            className="w-11 h-11 rounded object-cover border shrink-0 bg-white"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded border bg-white flex items-center justify-center text-[10px] text-slate-400 font-semibold shrink-0">
                            PTT
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium text-slate-800 text-sm truncate">
                              {l.productName}
                            </p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {l.quantity.toLocaleString()}{l.unit ? ` ${l.unit}` : ""}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">
                            {l.productCode}
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-xs">
                            <span className="text-slate-500">
                              {(t("orders.unitPrice") || "Price").replace(/:$/, "")}:
                            </span>
                            {showOriginal && (
                              <span className="text-slate-400 line-through">
                                {l.originalUnitPrice!.toLocaleString()} MMK
                              </span>
                            )}
                            <span className="font-semibold text-slate-700">
                              {l.unitPrice.toLocaleString()} MMK
                              {l.unit ? ` / ${l.unit}` : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* ဈေးနှုန်းအသစ် input နှင့် live subtotal */}
                      <div className="flex items-start sm:items-center gap-4 shrink-0">
                        <div className="w-40 sm:w-44">
                          <label className="block text-[11px] font-medium text-slate-500 mb-1">
                            {t("ecommerceOrders.newPrice")}
                          </label>
                          <input
                            type="number"
                            step="any"
                            placeholder={l.unitPrice.toString()}
                            value={l.newPriceInput}
                            onChange={(e) =>
                              handlePriceInputChange(
                                l.lineKey,
                                e.target.value,
                                e.target.validity?.badInput ?? false,
                              )
                            }
                            disabled={submitting}
                            className={`w-full border rounded-lg px-2.5 py-1.5 text-sm bg-white outline-none transition-colors ${
                              l.isInvalid
                                ? "border-red-400 focus:ring-2 focus:ring-red-200"
                                : "border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                            }`}
                          />
                          {l.isInvalid && l.errorMessage && (
                            <p className="text-[11px] text-red-600 font-medium mt-1">
                              {l.errorMessage}
                            </p>
                          )}
                        </div>

                        <div className="text-right min-w-[115px]">
                          <p className="text-[11px] text-slate-500 mb-1">
                            {t("common.subtotal")}
                          </p>
                          <p
                            className={`text-sm font-bold ${
                              l.isChanged
                                ? "text-amber-700"
                                : "text-slate-800"
                            }`}
                          >
                            {l.liveSubtotal.toLocaleString()} MMK
                          </p>
                          {l.isChanged && (
                            <p className="text-[11px] text-slate-400 line-through">
                              {(l.quantity * l.unitPrice).toLocaleString()} MMK
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* အကြောင်းရင်း (ချန်လှပ်နိုင်သည်) */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-600">
                {t("ecommerceOrders.priceReason")}
              </label>
              <span className="text-[11px] text-slate-400">
                {reason.length}/200
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={200}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={submitting}
              placeholder={t("ecommerceOrders.reasonPlaceholder")}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none resize-none"
            />
          </div>
        </div>

        {/* အောက်ခြေ စုစုပေါင်းနှင့် သိမ်းဆည်းမည့် ခလုတ်များ */}
        <div className="p-4 border-t bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-700">
            {t("common.total")}:{" "}
            <span className="text-slate-500">
              {oldTotal.toLocaleString()}
            </span>{" "}
            →{" "}
            <span
              className={
                newTotal !== oldTotal
                  ? "text-amber-700 font-bold"
                  : "text-slate-800 font-bold"
              }
            >
              {newTotal.toLocaleString()} MMK
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-slate-300 bg-white rounded-lg hover:bg-slate-50 transition-colors text-sm whitespace-nowrap disabled:opacity-50"
            >
              {t("common.cancel") || "Cancel"}
            </button>
            <button
              onClick={handleSave}
              disabled={
                submitting || hasInvalidLine || changedLines.length === 0
              }
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-semibold whitespace-nowrap"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("common.saving")}</span>
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4" />
                  <span>
                    {t("ecommerceOrders.savePrices")}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
