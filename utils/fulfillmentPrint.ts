// Order Fulfillment အတွက် Print Voucher Data ပြင်ဆင်ပြီး print preview သို့ ပို့ပေးသော utility
import { Order } from "../services/Order/fetchOrders";
import { VoucherReceiptData } from "../components/Print/VoucherContent";
import { getSavedPrintPaperSize } from "./printPaperSize";

export interface FulfillmentPrintBatchItem {
  batchStockId?: string;
  batchNumber: string;
  batchBarcode?: string;
  expiryDate?: string | Date | null;
  quantity: number;
}

export interface FulfillmentPrintProductState {
  orderProductId?: string;
  inventoryId: string;
  productName: string;
  productCode: string;
  unit?: string;
  price: number;
  requiredQty: number;
  scannedQty: number;
  scannedBatches: FulfillmentPrintBatchItem[];
}

/**
 * Order Fulfillment စာမျက်နှာနှင့် Modal တို့မှ ကြိုက်သည့်အချိန် Print ထုတ်ရန် helper
 * သတိပြုရန်: Scan ပြီးသား (quantity > 0) ပစ္စည်း/batch များအတွက်သာ expiry date ကို ထည့်သွင်းပေးမည်။
 * Scan မပြီးသေးသော ပစ္စည်းများအတွက် batches: [] ဖြစ်စေပြီး Expiry Date မပြစေပါ။
 */
export const printFulfillmentReceipt = (
  order: Order,
  productStates?: FulfillmentPrintProductState[],
  navigateFn?: (url: string) => void
) => {
  if (!order) return;

  const creditPersonObj =
    typeof order.creditPersonId === "object" ? order.creditPersonId : null;

  let items = [];

  if (productStates && productStates.length > 0) {
    // Modal ထဲမှ လက်ရှိ scan ဖတ်ထားသော အခြေအနေအတိုင်း print ထုတ်ခြင်း
    items = productStates.map((p) => {
      // Scan ပြီးသား (quantity > 0) ဖြစ်ပြီး expiryDate ရှိသော batch များကိုသာ စစ်ထုတ်ခြင်း
      const validBatches = (p.scannedBatches || [])
        .filter((b) => (Number(b.quantity) || 0) > 0)
        .map((b) => ({
          batchNumber: b.batchNumber,
          batchBarcode: b.batchBarcode,
          expiryDate: b.expiryDate || null,
          quantity: Number(b.quantity) || 0,
        }));

      return {
        name: p.productName,
        code: p.productCode,
        qty: p.requiredQty,
        unit: p.unit,
        price: p.price,
        // Scan ပြီးသား ပစ္စည်းအတွက်သာ batches ပါမည် (scan မပြီးသေးပါက empty array သာဖြစ်၍ expiry မပေါ်ပါ)
        batches: validBatches,
      };
    });
  } else {
    // Table list မှ တိုက်ရိုက် print ထုတ်ခြင်း (order ထဲရှိ batches များအပေါ် အခြေခံသည်)
    items = (order.ordersProducts || []).map((op: any) => {
      const inv = op.inventoryId || {};
      const validBatches = (op.batches || [])
        .filter((b: any) => (Number(b.quantity) || 0) > 0)
        .map((b: any) => ({
          batchNumber: b.batchNumber,
          batchBarcode: b.batchBarcode,
          expiryDate: b.expiryDate || null,
          quantity: Number(b.quantity) || 0,
        }));

      return {
        name: inv.productName || "Unknown Product",
        code: inv.productCode,
        qty: op.baseQuantity || op.quantity || 0,
        unit: op.unit?.trim() || undefined,
        price: op.unitPrice || 0,
        // Scan ပြီးသား ပစ္စည်းအတွက်သာ batches ပါမည်
        batches: validBatches,
      };
    });
  }

  const receiptData: VoucherReceiptData = {
    date: order.orderDate || (order as any).createdAt || new Date().toISOString(),
    creditPersonName: creditPersonObj?.name,
    creditPersonAddress: creditPersonObj?.address,
    creditPersonTownship: creditPersonObj?.township,
    invoiceNumber: order.orderNumber,
    storefrontName:
      typeof order.storefrontId === "object"
        ? (order.storefrontId as any)?.storefrontName ||
          (order.storefrontId as any)?.locationName ||
          "HONGCHI Myanmar"
        : "HONGCHI Myanmar",
    items,
    subtotal: order.subTotal || 0,
    discountPercent:
      (order.subTotal || 0) > 0
        ? Math.round(((order.discount || 0) / order.subTotal) * 100)
        : 0,
    total: order.finalAmount || 0,
    paidAmount: order.paidAmount ?? order.finalAmount ?? 0,
    change: order.extraChange || 0,
    paymentMethod: order.paymentMethod || "CASH",
    note: order.note || undefined,
  };

  const receiptKey = `receipt_${order.orderNumber}`;
  localStorage.setItem(receiptKey, JSON.stringify(receiptData));

  const targetUrl = `/print-receipt/${order.orderNumber}?size=${getSavedPrintPaperSize()}&autoprint=1`;
  if (navigateFn) {
    navigateFn(targetUrl);
  } else if (typeof window !== "undefined") {
    window.location.href = targetUrl;
  }
};
