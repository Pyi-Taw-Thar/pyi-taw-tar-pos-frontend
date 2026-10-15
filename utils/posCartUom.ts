import { StorefrontStockItem } from "../services/Storefront/fetchStorefrontStock";
import {
  buildOrderProductLine,
  cartLineKey,
  getAvailableQuantityInUnit,
  getDefaultSellingUnit,
  getUnitOptions,
  getUnitPrice,
} from "./uom";

export interface ScannedBatchAllocation {
  batchStockId: string;
  batchNumber: string;
  batchBarcode?: string;
  expiryDate?: string | Date | null;
  quantity: number;
}

export interface UomCartItem {
  stockItem: StorefrontStockItem;
  qty: number;
  selectedUnit: string;
  scannedBatches?: ScannedBatchAllocation[];
}

export function getInventoryUomFromStock(stockItem: StorefrontStockItem) {
  const inv = stockItem.inventoryId;
  return {
    baseUnit: inv?.unitOfMeasure?.trim() || "piece",
    conversions: inv?.uomConversions,
  };
}

export function getInitialCartUnit(stockItem: StorefrontStockItem): string {
  const { baseUnit, conversions } = getInventoryUomFromStock(stockItem);
  const defaultUnit = getDefaultSellingUnit(baseUnit, conversions);

  if (stockItem.availableQuantity !== undefined) {
    const defaultQty = getAvailableQuantityInUnit(
      baseUnit,
      defaultUnit,
      conversions,
      stockItem.availableQuantity,
      stockItem.quantityByUnit,
    );
    if (defaultQty >= 1) {
      return defaultUnit;
    }
    const options = getUnitOptions(baseUnit, conversions);
    for (const opt of options) {
      const qty = getAvailableQuantityInUnit(
        baseUnit,
        opt.value,
        conversions,
        stockItem.availableQuantity,
        stockItem.quantityByUnit,
      );
      if (qty >= 1) {
        return opt.value;
      }
    }
  }
  return defaultUnit;
}

export function createCartLine(
  stockItem: StorefrontStockItem,
  qty = 1,
): UomCartItem {
  return {
    stockItem,
    qty,
    selectedUnit: getInitialCartUnit(stockItem),
  };
}

export function getCartLineStockId(stockItem: StorefrontStockItem): string {
  return (
    (typeof stockItem?.inventoryId === "object" &&
      stockItem.inventoryId?._id) ||
    stockItem?._id ||
    ""
  );
}

export function getCartLineId(item: UomCartItem): string {
  const stockId = getCartLineStockId(item.stockItem);
  return cartLineKey(stockId, item.selectedUnit);
}

export function getMatchingWholesaleTiers(item: UomCartItem) {
  const inv = item.stockItem?.inventoryId;
  if (!inv?.wholesalePrices?.length) return [];

  const { baseUnit } = getInventoryUomFromStock(item.stockItem);
  const selectedUnitNorm = (item.selectedUnit || "").trim().toLowerCase();
  const baseUnitNorm = (baseUnit || "").trim().toLowerCase();

  return [...inv.wholesalePrices]
    .filter((w) => {
      const tierUnitNorm = (w.unit || "").trim().toLowerCase();
      // 1. If tier unit is specified, match with selected unit
      if (tierUnitNorm) {
        return tierUnitNorm === selectedUnitNorm;
      }
      // 2. If tier unit is empty/unspecified, it matches base unit or when no conversions exist
      return (
        !selectedUnitNorm ||
        selectedUnitNorm === baseUnitNorm ||
        !baseUnitNorm ||
        !inv.uomConversions?.length
      );
    })
    .sort((a, b) => a.quantity - b.quantity);
}

export function getCartLineUnitPrice(item: UomCartItem): number {
  const { baseUnit, conversions } = getInventoryUomFromStock(item.stockItem);
  return getUnitPrice(
    item.stockItem.inventoryId.sellingPrice || 0,
    baseUnit,
    item.selectedUnit,
    conversions,
  );
}

export function getCartLineEffectivePrice(item: UomCartItem): number {
  const unitPrice = getCartLineUnitPrice(item);
  const tiers = getMatchingWholesaleTiers(item);
  const best = [...tiers].reverse().find((t) => item.qty >= t.quantity);
  return best && best.price > 0 ? best.price : unitPrice;
}

export function getCartLineMaxQty(item: UomCartItem): number {
  const { baseUnit, conversions } = getInventoryUomFromStock(item.stockItem);
  return getAvailableQuantityInUnit(
    baseUnit,
    item.selectedUnit,
    conversions,
    item.stockItem.availableQuantity,
    item.stockItem.quantityByUnit,
  );
}

export function cartLineToOrderProduct(item: UomCartItem) {
  const { baseUnit } = getInventoryUomFromStock(item.stockItem);
  const line = buildOrderProductLine(
    item.stockItem.inventoryId._id,
    item.qty,
    baseUnit,
    item.selectedUnit,
  );
  const effectivePrice = getCartLineEffectivePrice(item);
  const res: any = {
    ...line,
    unitPrice: effectivePrice,
  };
  if (item.scannedBatches && item.scannedBatches.length > 0) {
    res.batches = item.scannedBatches;
  }
  return res;
}

export function cartLineSubtotal(item: UomCartItem): number {
  return getCartLineEffectivePrice(item) * item.qty;
}
