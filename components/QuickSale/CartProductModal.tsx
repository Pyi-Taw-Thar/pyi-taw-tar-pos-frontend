import React from "react";
import { X, Minus, Plus } from "lucide-react";
import { CartUnitSelector } from "../UOM/CartUnitSelector";
import {
  getCartLineId,
  getCartLineUnitPrice,
  getCartLineMaxQty,
  getInventoryUomFromStock,
} from "../../utils/posCartUom";
import type { UomCartItem } from "../../utils/posCartUom";

interface CartProductModalProps {
  isOpen: boolean;
  item: UomCartItem | null;
  onClose: () => void;
  onUnitChange: (lineId: string, unit: string) => void;
  onSetQty: (lineId: string, qty: number) => void;
  onUpdateQty: (lineId: string, delta: number) => void;
  onRemoveFromCart: (lineId: string) => void;
}

export const CartProductModal: React.FC<CartProductModalProps> = ({
  isOpen,
  item,
  onClose,
  onUnitChange,
  onSetQty,
  onUpdateQty,
  onRemoveFromCart,
}) => {
  if (!isOpen || !item) return null;

  const lineId = getCartLineId(item);
  const { baseUnit, conversions } = getInventoryUomFromStock(item.stockItem);
  const unitPrice = getCartLineUnitPrice(item);
  const maxQty = getCartLineMaxQty(item);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-bold text-base text-gray-900 truncate pr-4">
            {item.stockItem.inventoryId.productName}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="px-5 py-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase">Qty</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onUpdateQty(lineId, -1)}
                  disabled={item.qty <= 1}
                  className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Minus className="w-4 h-4" />
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
                  className="text-sm font-medium flex-1 text-center border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-primary focus:border-primary outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  onClick={() => onUpdateQty(lineId, 1)}
                  disabled={item.qty >= maxQty}
                  className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase">Unit</label>
              <CartUnitSelector
                baseUnit={baseUnit}
                conversions={conversions}
                selectedUnit={item.selectedUnit}
                onUnitChange={(unit) => onUnitChange(lineId, unit)}
                availableQuantity={item.stockItem.availableQuantity}
                quantityByUnit={item.stockItem.quantityByUnit}
                className="w-full text-sm py-1.5"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase">
                Sale Price
              </label>
              <div className="border border-gray-300 rounded px-3 py-1.5 text-sm font-medium text-gray-800 bg-gray-50">
                {unitPrice.toLocaleString()}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-gray-500 uppercase">Amount</label>
              <div className="border border-gray-300 rounded px-3 py-1.5 text-sm font-bold text-gray-900 bg-gray-50">
                {(unitPrice * item.qty).toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t bg-gray-50 flex items-center gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onRemoveFromCart(lineId);
              onClose();
            }}
            className="px-5 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
