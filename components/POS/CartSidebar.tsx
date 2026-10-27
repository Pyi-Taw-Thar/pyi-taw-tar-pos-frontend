import React from "react";
import { Plus, Minus, Trash2, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { CartUnitSelector } from "../UOM/CartUnitSelector";
import {
  getCartLineId,
  getCartLineUnitPrice,
  getCartLineEffectivePrice,
  getMatchingWholesaleTiers,
  getCartLineMaxQty,
  getInventoryUomFromStock,
} from "../../utils/posCartUom";
import type { UomCartItem } from "../../utils/posCartUom";
import { getConversionFactor } from "../../utils/uom";

interface CartSidebarProps {
  cart: UomCartItem[];
  subtotal: number;
  total: number;
  paymentMethod: string;
  paymentType: "paid" | "credit";
  onUpdateQty: (lineId: string, delta: number) => void;
  onSetQty: (lineId: string, qty: number) => void;
  onSetCartLineUnit: (lineId: string, unit: string) => void;
  onRemoveFromCart: (lineId: string) => void;
  onOpenCheckout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const CartSidebar: React.FC<CartSidebarProps> = ({
  cart,
  subtotal,
  total,
  paymentMethod,
  paymentType,
  onUpdateQty,
  onSetQty,
  onSetCartLineUnit,
  onRemoveFromCart,
  onOpenCheckout,
  isOpen = false,
  onClose,
}) => {
  const { t } = useLanguage();
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <div
        className={`bg-white flex flex-col border-l border-[#E9ECEF] shadow-xl transition-transform duration-300 ease-in-out
          lg:static lg:w-80 xl:w-96 lg:h-[calc(100vh-60px)] lg:sticky lg:top-0 lg:translate-y-0 lg:z-auto
          fixed inset-x-0 bottom-0 z-50 h-[85vh] rounded-t-2xl lg:rounded-none
          ${isOpen ? "translate-y-0" : "translate-y-full lg:translate-y-0"}`}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-lg">{t("pos.currentSale")}</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {cart.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            {t("pos.emptyCart")}
          </div>
        ) : (
          cart.map((item) => {
            const lineId = getCartLineId(item);
            const { baseUnit, conversions } = getInventoryUomFromStock(
              item.stockItem,
            );
            const regularUnitPrice = getCartLineUnitPrice(item);
            const effectivePrice = getCartLineEffectivePrice(item);
            const isWholesale = effectivePrice < regularUnitPrice;
            const lineSubtotal = effectivePrice * item.qty;
            const matchingTiers = getMatchingWholesaleTiers(item);
            const nextTier =
              !isWholesale && matchingTiers.length > 0
                ? matchingTiers.find((t) => item.qty < t.quantity)
                : null;
            const maxQty = getCartLineMaxQty(item);
            return (
              <div
                key={lineId}
                className="flex flex-col gap-2 border-b border-gray-200 pb-4"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-medium text-gray-800">
                        {item.stockItem.inventoryId.productName}
                      </p>
                      {isWholesale && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {t("pos.wholesale") || "လက်ကား"}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {isWholesale ? (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="line-through text-gray-400">
                            {regularUnitPrice.toLocaleString()} MMK
                          </span>
                          <span className="font-bold text-emerald-600">
                            {effectivePrice.toLocaleString()} MMK
                          </span>
                          <span>/ {item.selectedUnit}</span>
                          <span>·</span>
                          <span className="font-bold text-gray-800">
                            {lineSubtotal.toLocaleString()} MMK
                          </span>
                        </div>
                      ) : (
                        <p>
                          {regularUnitPrice.toLocaleString()} MMK / {item.selectedUnit} ·{" "}
                          {lineSubtotal.toLocaleString()} MMK
                        </p>
                      )}
                    </div>
                    {nextTier && (
                      <p className="text-[11px] text-amber-600 mt-1">
                        💡 {nextTier.quantity} {item.selectedUnit} ပြည့်ပါက လက်ကားဈေး {nextTier.price.toLocaleString()} MMK
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onRemoveFromCart(lineId)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <CartUnitSelector
                    baseUnit={baseUnit}
                    conversions={conversions}
                    selectedUnit={item.selectedUnit}
                    onUnitChange={(unit) => onSetCartLineUnit(lineId, unit)}
                    availableQuantity={item.stockItem.availableQuantity}
                    quantityByUnit={item.stockItem.quantityByUnit}
                  />
                  <div className="cart-item-controls flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => onUpdateQty(lineId, -1)}
                      className="p-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={maxQty}
                      value={item.qty}
                      onChange={(e) =>
                        onSetQty(lineId, parseInt(e.target.value) || 1)
                      }
                      onBlur={(e) => {
                        const v = parseInt(e.target.value) || 1;
                        if (v < 1) onSetQty(lineId, 1);
                      }}
                      className="text-sm font-medium w-12 text-center border border-gray-300 rounded px-1 py-1 focus:ring-2 focus:ring-primary focus:border-primary outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-xs text-gray-500">
                      {item.selectedUnit}
                    </span>
                    <button
                      onClick={() => onUpdateQty(lineId, 1)}
                      className="p-1 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Scanned Batches / Multi-batch indicator */}
                {item.scannedBatches && item.scannedBatches.length > 0 && (
                  <div className="mt-1 flex flex-col gap-1 rounded bg-slate-50 p-1.5 border border-slate-200 text-[11px]">
                    <div className="flex items-center justify-between text-slate-500 font-semibold text-[10px]">
                      <span>စကင်ဖတ်ထားသော အသုတ်များ:</span>
                      {/* Batch qty သည် base unit ဖြစ်၍ line qty ကို base unit သို့ ပြောင်းပြီး နှိုင်း (ပုံး 1 = 10 ဘူး) */}
                      <span className="text-blue-600 font-bold">
                        {(() => {
                          const { baseUnit, conversions } = getInventoryUomFromStock(item.stockItem);
                          const factor = getConversionFactor(baseUnit, item.selectedUnit, conversions);
                          const scanned = item.scannedBatches.reduce((s, b) => s + b.quantity, 0);
                          return `${scanned}/${item.qty * factor}${factor > 1 ? ` ${baseUnit}` : ""}`;
                        })()}
                      </span>
                    </div>
                    {item.scannedBatches.map((b, bIdx) => (
                      <div
                        key={bIdx}
                        className="flex items-center justify-between font-mono text-[10px] text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-100"
                      >
                        <span className="font-semibold text-primary">{b.batchNumber}</span>
                        {b.expiryDate && (
                          <span className="text-slate-400">
                            Exp: {new Date(b.expiryDate).toLocaleDateString("en-GB")}
                          </span>
                        )}
                        <span className="font-bold text-slate-900">x{b.quantity}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="p-4 border-t border-[#E9ECEF] bg-[#F8F9FA] space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{t("pos.items")}</span>
            <span>
              {cart.reduce((sum, i) => sum + i.qty, 0)} {t("pos.itemsLower")}
            </span>
          </div>
          <div className="flex justify-between text-xl font-bold text-gray-900">
            <span>{t("common.total")}</span>
            <span>{subtotal.toLocaleString()} MMK</span>
          </div>
        </div>
        <button
          onClick={onOpenCheckout}
          disabled={cart.length === 0}
          className="start-btn w-full bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-bold transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {t("pos.proceedToCheckout")}
        </button>
      </div>
    </div>
    </>
  );
};
