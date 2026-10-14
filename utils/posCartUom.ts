import { StorefrontStockItem } from "../services/Storefront/fetchStorefrontStock";
import {
  buildOrderProductLine,
  cartLineKey,
  getAvailableQuantityInUnit,
  getDefaultSellingUnit,
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
    baseUnit: inv.unitOfMeasure?.trim() || "piece",
    conversions: inv.uomConversions,
  };
}

export function createCartLine(
  stockItem: StorefrontStockItem,
  qty = 1,
): UomCartItem {
  const { baseUnit, conversions } = getInventoryUomFromStock(stockItem);
  return {
    stockItem,
    qty,
    selectedUnit: getDefaultSellingUnit(baseUnit, conversions),
  };
}

export function getCartLineId(item: UomCartItem): string {
  return cartLineKey(item.stockItem._id, item.selectedUnit);
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
  const tiers =
    item.stockItem.inventoryId.wholesalePrices
      ?.filter((w) => w.unit === item.selectedUnit)
      .sort((a, b) => a.quantity - b.quantity) || [];
  const best = [...tiers].reverse().find((t) => item.qty >= t.quantity);
  return best ? best.price : unitPrice;
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
  if (item.scannedBatches && item.scannedBatches.length > 0) {
    (line as any).batches = item.scannedBatches;
  }
  return line;
}

export function cartLineSubtotal(item: UomCartItem): number {
  return getCartLineEffectivePrice(item) * item.qty;
}
