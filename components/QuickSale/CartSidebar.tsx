import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import {
  getCartLineId,
  getCartLineUnitPrice,
  getCartLineMaxQty,
} from "../../utils/posCartUom";
import type { UomCartItem } from "../../utils/posCartUom";
import { CartProductModal } from "./CartProductModal";

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
}) => {
  const { t } = useLanguage();
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const selectedItem = selectedLineId
    ? cart.find((item) => getCartLineId(item) === selectedLineId) ?? null
    : null;

  return (
    <div className="flex-1 bg-white flex flex-col border-r border-[#E9ECEF] shadow-xl h-[calc(100vh-60px)] sticky top-0">
      <div className="p-4 border-b">
        <h2 className="font-bold text-lg">{t("pos.currentSale")}</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            {t("pos.emptyCart")}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs text-gray-500 uppercase">
                <th className="px-4 py-2 w-10">Sr</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2 w-20 text-center">Qty</th>
                <th className="px-4 py-2 w-24 text-right">Amount</th>
                <th className="px-4 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item, index) => {
                const lineId = getCartLineId(item);
                const unitPrice = getCartLineUnitPrice(item);
                const maxQty = getCartLineMaxQty(item);
                return (
                  <tr
                    key={lineId}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedLineId(lineId)}
                  >
                    <td className="px-4 py-2 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-2 font-medium text-gray-800">
                      {item.stockItem.inventoryId.productName}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="number"
                        min="1"
                        max={maxQty}
                        value={item.qty}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          onSetQty(lineId, parseInt(e.target.value) || 1)
                        }
                        onBlur={(e) => {
                          const v = parseInt(e.target.value) || 1;
                          if (v < 1) onSetQty(lineId, 1);
                        }}
                        className="text-sm font-medium w-14 text-center border border-gray-300 rounded px-1 py-1 focus:ring-2 focus:ring-primary focus:border-primary outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>
                    <td className="px-4 py-2 text-right font-medium text-gray-800">
                      {(unitPrice * item.qty).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveFromCart(lineId);
                        }}
                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

      <CartProductModal
        isOpen={selectedLineId !== null}
        item={selectedItem}
        onClose={() => setSelectedLineId(null)}
        onUnitChange={onSetCartLineUnit}
        onSetQty={onSetQty}
        onUpdateQty={onUpdateQty}
        onRemoveFromCart={(lineId) => {
          onRemoveFromCart(lineId);
          setSelectedLineId(null);
        }}
      />
    </div>
  );
};
