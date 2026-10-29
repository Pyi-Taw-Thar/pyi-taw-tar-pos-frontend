import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Barcode,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Package,
  Calendar,
  Layers,
  Trash2,
  Loader2,
  Printer,
  Sparkles,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Order } from "../../services/Order/fetchOrders";
import { scanBatchBarcode } from "../../services/Batch/scanBatchBarcode";
import {
  fulfillOrder,
  savePartialFulfillmentOrder,
  FulfillOrderPayload,
} from "../../services/Fulfillment/fulfillOrder";
import { getSavedPrintPaperSize } from "../../utils/printPaperSize";
import { VoucherReceiptData } from "../Print/VoucherContent";
import { printFulfillmentReceipt } from "../../utils/fulfillmentPrint";
import { useLanguage } from "../../context/LanguageContext";

interface ScannedBatchEntry {
  batchStockId?: string;
  batchNumber: string;
  batchBarcode: string;
  expiryDate?: string | null;
  quantity: number;
  locationName?: string | null;
  locationType?: string | null;
}

interface ProductFulfillmentState {
  inventoryId: string;
  productName: string;
  productCode: string;
  SKU: string;
  unit?: string;
  price: number;
  // price သည် unit တစ်ခု၏စျေး၊ scan qty သည် base unit ဖြစ်၍ factor ဖြင့် ပြန်တွက်ရန်
  factor: number;
  requiredQty: number;
  scannedBatches: ScannedBatchEntry[];
}

interface OrderFulfillmentModalProps {
  show: boolean;
  order: Order | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const OrderFulfillmentModal: React.FC<OrderFulfillmentModalProps> = ({
  show,
  order,
  onClose,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isFulfilling, setIsFulfilling] = useState(false);
  const [isSavingPartial, setIsSavingPartial] = useState(false);
  const [showShortShipConfirmModal, setShowShortShipConfirmModal] = useState(false);
  const [productStates, setProductStates] = useState<ProductFulfillmentState[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Play audio tones for physical scanner feedback
  const playAudioCue = (isSuccess: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (isSuccess) {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch (A5)
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.15);
      } else {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // Low buzz (A3)
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start(audioCtx.currentTime);
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch {
      // AudioContext might be blocked or unsupported; ignore silently
    }
  };

  const focusScannerInput = () => {
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 50);
  };

  // Re-focus scanner input whenever scanning completes or modal opens
  useEffect(() => {
    if (!isScanning && show) {
      focusScannerInput();
    }
  }, [isScanning, show]);

  // Initialize product states from order
  useEffect(() => {
    if (order && show) {
      const initial: ProductFulfillmentState[] = (order.ordersProducts || []).map((op) => {
        const inv = op.inventoryId;
        const requiredQty = op.baseQuantity || op.quantity;
        const existingBatches: ScannedBatchEntry[] = (op.batches || []).map((b: any) => ({
          batchStockId: b.batchStockId?._id || b.batchStockId,
          batchNumber: b.batchNumber,
          batchBarcode: b.batchBarcode || "",
          expiryDate: b.expiryDate,
          quantity: b.quantity || 1,
          locationName: b.locationName || null,
          locationType: b.locationType || null,
        }));
        return {
          inventoryId: inv._id || (inv as any).id,
          productName: inv.productName || "Unknown Product",
          productCode: inv.productCode || "",
          SKU: inv.SKU || "",
          unit: op.unit || "",
          price: op.unitPrice || 0,
          factor: op.factor || 1,
          requiredQty,
          scannedBatches: existingBatches,
        };
      });
      setProductStates(initial);
      setBarcodeInput("");
      focusScannerInput();
    }
  }, [order, show]);

  if (!show || !order) return null;

  // Calculate totals
  const totalRequired = productStates.reduce((acc, p) => acc + p.requiredQty, 0);
  const totalScanned = productStates.reduce(
    (acc, p) => acc + p.scannedBatches.reduce((bAcc, b) => bAcc + b.quantity, 0),
    0
  );

  const packedProducts = productStates
    .map((p) => {
      const scanned = p.scannedBatches.reduce((sum, b) => sum + b.quantity, 0);
      return { ...p, scannedQty: scanned };
    })
    .filter((p) => p.scannedQty > 0);

  const missingProducts = productStates
    .map((p) => {
      const scanned = p.scannedBatches.reduce((sum, b) => sum + b.quantity, 0);
      const missing = p.requiredQty - scanned;
      return { ...p, missingQty: missing, scannedQty: scanned };
    })
    .filter((p) => p.missingQty > 0);

  // Backend (rescaleLineToBaseQty) နှင့် တူညီ — scan qty ကို factor ဖြင့် ပြတ်ပြတ်စား၍ရလျှင် unit အလိုက်၊ မရလျှင် base unit စျေးဖြင့်
  // (scanned × price / factor နှင့် ရလဒ်တူ၍ တစ်ကြောင်းတည်းဖြင့် တွက်)
  const estimatedNewSubtotal = packedProducts.reduce(
    (sum, p) => sum + (p.scannedQty * p.price) / (p.factor || 1),
    0
  );
  const estimatedNewFinal = Math.max(
    0,
    estimatedNewSubtotal + (order?.tax || 0) - (order?.discount || 0)
  );
  const isAllComplete =
    totalRequired > 0 &&
    productStates.every((p) => {
      const scanned = p.scannedBatches.reduce((sum, b) => sum + b.quantity, 0);
      return scanned === p.requiredQty;
    });

  const handleScanSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const barcode = barcodeInput.trim();
    if (!barcode || isScanning) return;

    setIsScanning(true);
    try {
      const storefrontId =
        typeof order.storefrontId === "object" && order.storefrontId
          ? order.storefrontId._id
          : (order.storefrontId as string | undefined);

      const res = await scanBatchBarcode(barcode, storefrontId);

      if (!res.success || !res.data) {
        playAudioCue(false);
        toast.error(res.message || t("fulfillment.batchNotFound"));
        setBarcodeInput("");
        return;
      }

      const scannedBatch = res.data;
      const batchInvId =
        typeof scannedBatch.inventoryId === "object"
          ? scannedBatch.inventoryId._id
          : scannedBatch.inventoryId;

      // Find matching product in order
      const prodIndex = productStates.findIndex(
        (p) => String(p.inventoryId) === String(batchInvId)
      );

      if (prodIndex === -1) {
        playAudioCue(false);
        toast.error(t("fulfillment.itemNotInOrder"));
        setBarcodeInput("");
        return;
      }

      const targetProd = productStates[prodIndex];
      const currentScannedQty = targetProd.scannedBatches.reduce(
        (acc, b) => acc + b.quantity,
        0
      );

      if (currentScannedQty >= targetProd.requiredQty) {
        playAudioCue(false);
        toast.warning(
          t("fulfillment.qtyExceeded", {
            name: targetProd.productName,
            qty: targetProd.requiredQty,
          })
        );
        setBarcodeInput("");
        return;
      }

      // Unit barcode (ပုံး/ဖာ) ဆိုလျှင် scan တစ်ကြိမ်ဖြင့် base unit အများ ဝင်သည်
      const scanFactor = scannedBatch.scanFactor || 1;
      const baseUnitLabel = scannedBatch.baseUnit || "";
      if (currentScannedQty + scanFactor > targetProd.requiredQty) {
        playAudioCue(false);
        toast.warning(
          `${scannedBatch.scannedUnit || ""} barcode (${scanFactor} ${baseUnitLabel}) သည် ကျန်ရှိသော လိုအပ်ချက် (${
            targetProd.requiredQty - currentScannedQty
          } ${baseUnitLabel}) ထက် ကျော်နေပါသည်`
        );
        setBarcodeInput("");
        return;
      }

      // Check if batch is expired and warn
      if (scannedBatch.isExpired) {
        toast.warning(
          t("fulfillment.expiredWarning", { batch: scannedBatch.batchNumber })
        );
      }

      // Update state
      setProductStates((prev) => {
        const next = [...prev];
        const prod = { ...next[prodIndex] };
        const batches = [...prod.scannedBatches];

        const existingBatchIdx = batches.findIndex(
          (b) => b.batchBarcode === scannedBatch.batchBarcode
        );

        if (existingBatchIdx > -1) {
          batches[existingBatchIdx] = {
            ...batches[existingBatchIdx],
            quantity: batches[existingBatchIdx].quantity + scanFactor,
          };
        } else {
          const locName =
            scannedBatch.locationId?.locationName ||
            scannedBatch.locationId?.name ||
            scannedBatch.locationName ||
            null;
          batches.push({
            batchStockId: scannedBatch._id,
            batchNumber: scannedBatch.batchNumber,
            batchBarcode: scannedBatch.batchBarcode,
            expiryDate: scannedBatch.expiryDate,
            quantity: scanFactor,
            locationName: locName,
            locationType: scannedBatch.locationType || null,
          });
        }

        prod.scannedBatches = batches;
        next[prodIndex] = prod;
        return next;
      });

      playAudioCue(true);
      toast.success(
        t("fulfillment.batchAdded", {
          batch: scannedBatch.batchNumber,
          scanned: currentScannedQty + scanFactor,
          required: targetProd.requiredQty,
        })
      );
    } catch (err: any) {
      playAudioCue(false);
      toast.error(err?.response?.data?.message || err?.message || t("fulfillment.scanError"));
    } finally {
      setIsScanning(false);
      setBarcodeInput("");
      focusScannerInput();
    }
  };

  const handleRemoveBatch = (prodIndex: number, batchIdx: number) => {
    setProductStates((prev) => {
      const next = [...prev];
      const prod = { ...next[prodIndex] };
      const batches = [...prod.scannedBatches];
      if (batches[batchIdx].quantity > 1) {
        batches[batchIdx] = {
          ...batches[batchIdx],
          quantity: batches[batchIdx].quantity - 1,
        };
      } else {
        batches.splice(batchIdx, 1);
      }
      prod.scannedBatches = batches;
      next[prodIndex] = prod;
      return next;
    });
    inputRef.current?.focus();
  };

  const handleSavePartialOrder = async () => {
    if (isSavingPartial || isFulfilling || totalScanned === 0) return;

    setIsSavingPartial(true);
    try {
      const productPayload = productStates.map((p) => ({
        inventoryId: p.inventoryId,
        batches: p.scannedBatches.map((b) => ({
          batchStockId: b.batchStockId,
          batchNumber: b.batchNumber,
          batchBarcode: b.batchBarcode,
          expiryDate: b.expiryDate,
          quantity: b.quantity,
        })),
      }));

      const payload: FulfillOrderPayload = {
        fulfilledProducts: productPayload,
        items: productPayload,
      };

      const res = await savePartialFulfillmentOrder(order._id, payload);

      if (!res.success) {
        toast.error(res.message || t("fulfillment.savePartialFailed") || "Failed to save partial progress");
        return;
      }

      toast.success(
        t("fulfillment.savePartialSuccess") ||
          `Order ${order.orderNumber} partial progress saved (${totalScanned}/${totalRequired} packed)`
      );

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || t("fulfillment.savePartialFailed") || "Failed to save partial progress");
    } finally {
      setIsSavingPartial(false);
    }
  };

  const handleFulfillOrder = async (autoAdjust = false) => {
    if (isFulfilling || totalScanned === 0) return;

    // If incomplete and user hasn't explicitly confirmed autoAdjust, show confirmation dialog
    if (!isAllComplete && !autoAdjust) {
      setShowShortShipConfirmModal(true);
      return;
    }

    setIsFulfilling(true);
    try {
      const productPayload = productStates.map((p) => ({
        inventoryId: p.inventoryId,
        batches: p.scannedBatches.map((b) => ({
          batchStockId: b.batchStockId,
          batchNumber: b.batchNumber,
          batchBarcode: b.batchBarcode,
          expiryDate: b.expiryDate,
          quantity: b.quantity,
        })),
      }));

      const payload: FulfillOrderPayload = {
        fulfilledProducts: productPayload,
        items: productPayload,
        autoAdjust,
      };

      const res = await fulfillOrder(order._id, payload);

      if (!res.success) {
        toast.error(res.message || t("fulfillment.fulfillmentFailed"));
        return;
      }

      toast.dismiss();
      toast.success(
        autoAdjust
          ? t("fulfillment.shortShipSuccess") || "Order adjusted and completed successfully!"
          : t("fulfillment.fulfillmentSuccess")
      );

      // Prepare voucher print data with the updated/fulfilled items and amounts
      const creditPersonObj =
        typeof order.creditPersonId === "object" ? order.creditPersonId : null;

      const finalOrder = res.data || order;

      const receiptData: VoucherReceiptData = {
        date: finalOrder.orderDate || new Date().toISOString(),
        creditPersonName: creditPersonObj?.name,
        creditPersonAddress: creditPersonObj?.address,
        creditPersonTownship: creditPersonObj?.township,
        invoiceNumber: finalOrder.orderNumber,
        storefrontName:
          typeof finalOrder.storefrontId === "object"
            ? (finalOrder.storefrontId as any)?.storefrontName || (finalOrder.storefrontId as any)?.locationName || "HONGCHI Myanmar"
            : "HONGCHI Myanmar",
        items: (autoAdjust ? packedProducts : productStates).map((p) => ({
          name: p.productName,
          code: p.productCode,
          qty: autoAdjust ? (p as any).scannedQty : p.requiredQty,
          unit: p.unit,
          price: p.price,
          batches: (p.scannedBatches || [])
            .filter((b) => (Number(b.quantity) || 0) > 0)
            .map((b) => ({
              batchNumber: b.batchNumber,
              batchBarcode: b.batchBarcode,
              expiryDate: b.expiryDate || null,
              quantity: Number(b.quantity) || 0,
            })),
        })),
        subtotal: finalOrder.subTotal ?? (autoAdjust ? estimatedNewSubtotal : (order.subTotal || 0)),
        discountPercent:
          (order.subTotal || 0) > 0
            ? Math.round(((order.discount || 0) / order.subTotal) * 100)
            : 0,
        total: finalOrder.finalAmount ?? (autoAdjust ? estimatedNewFinal : (order.finalAmount || 0)),
        paidAmount: finalOrder.paidAmount ?? (autoAdjust ? estimatedNewFinal : (order.paidAmount || 0)),
        change: finalOrder.extraChange || 0,
        paymentMethod: finalOrder.paymentMethod || "CASH",
        note: finalOrder.note || undefined,
      };

      const receiptKey = `receipt_${finalOrder.orderNumber}`;
      localStorage.setItem(receiptKey, JSON.stringify(receiptData));

      setShowShortShipConfirmModal(false);
      onSuccess();
      onClose();

      // Open Voucher Print Preview
      navigate(
        `/print-receipt/${finalOrder.orderNumber}?size=${getSavedPrintPaperSize()}&autoprint=1`
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || t("fulfillment.fulfillmentFailed"));
    } finally {
      setIsFulfilling(false);
    }
  };

  // Scan ဖတ်ထားပြီးသော အခြေအနေအတိုင်း ကြိုက်သည့်အချိန် Print ထုတ်ရန် (Scan ပြီးသော batch များအတွက်သာ expiry ပြမည်)
  const handleDirectPrint = () => {
    if (!order) return;
    printFulfillmentReceipt(order, productStates, navigate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
              <Barcode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{t("fulfillment.modalTitle")}</h2>
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {order.orderNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t("fulfillment.modalSubtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDirectPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
              title={t("fulfillment.printSlip") || "ဘောက်ချာ ပုံနှိပ်မည်"}
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">{t("fulfillment.printSlip") || "ဘောက်ချာ ပုံနှိပ်မည်"}</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info & Scanner Bar */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-4">
          {/* Order metadata summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-slate-500 block">{t("fulfillment.locBranch")}</span>
              <span className="font-semibold text-slate-800">
                {typeof order.storefrontId === "object"
                  ? (order.storefrontId as any)?.locationName || (order.storefrontId as any)?.storefrontName || "Store"
                  : "Warehouse"}
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-slate-500 block">{t("fulfillment.customer")}</span>
              <span className="font-semibold text-slate-800">
                {typeof order.creditPersonId === "object"
                  ? order.creditPersonId?.name
                  : order.customerName || t("fulfillment.retailCustomer")}
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-slate-500 block">{t("fulfillment.totalAmount")}</span>
              <span className="font-semibold text-slate-800">
                {order.finalAmount?.toLocaleString()} MMK
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-slate-500 block">{t("fulfillment.totalItems")}</span>
              <span className="font-bold text-slate-800">
                <span className={isAllComplete ? "text-emerald-600" : "text-primary"}>
                  {totalScanned}
                </span>{" "}
                / {totalRequired} {t("fulfillment.itemsUnit")}
              </span>
            </div>
          </div>

          {/* Rapid Scanner Input */}
          <form
            onSubmit={handleScanSubmit}
            className="flex items-center gap-2 bg-white p-2 rounded-xl border-2 border-primary/50 shadow-sm focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all"
          >
            <div className="pl-2 text-primary">
              <Barcode className="w-6 h-6 animate-pulse" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleScanSubmit();
                }
              }}
              placeholder={t("fulfillment.scanInputPlaceholder")}
              className="flex-1 bg-transparent px-2 py-1.5 text-sm font-medium outline-none text-slate-800 placeholder:text-slate-400 font-mono"
              autoFocus
            />
            <button
              type="submit"
              disabled={!barcodeInput.trim() || isScanning}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t("fulfillment.checking")}
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> {t("fulfillment.scanBatchBtn")}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Product Checklist */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
            <span>{t("fulfillment.itemsToPack")}</span>
            <span>
              {t("fulfillment.progress")}:{" "}
              <span className={isAllComplete ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                {Math.round((totalScanned / (totalRequired || 1)) * 100)}%
              </span>
            </span>
          </div>

          {productStates.map((prod, prodIdx) => {
            const scannedCount = prod.scannedBatches.reduce(
              (acc, b) => acc + b.quantity,
              0
            );
            const isProdComplete = scannedCount === prod.requiredQty;

            return (
              <div
                key={prod.inventoryId}
                className={`p-4 rounded-xl border transition-all ${
                  isProdComplete
                    ? "bg-emerald-50/50 border-emerald-300"
                    : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isProdComplete
                          ? "bg-emerald-100 text-emerald-700 font-bold"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isProdComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Package className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">
                        {prod.productName}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        {prod.productCode && (
                          <span>
                            {t("fulfillment.batchCode")}: {prod.productCode}
                          </span>
                        )}
                        {prod.unit && (
                          <span>
                            • {t("fulfillment.unit")}: {prod.unit}
                          </span>
                        )}
                        <span>
                          • {t("fulfillment.price")}: {prod.price.toLocaleString()} MMK
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Badge */}
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        isProdComplete
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : scannedCount > 0
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-slate-100 text-slate-700 border border-slate-300"
                      }`}
                    >
                      {isProdComplete && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {scannedCount} / {prod.requiredQty} {t("fulfillment.itemsUnit")}
                    </span>
                    {/* scan qty သည် base unit ဖြစ်၍ order line unit ဖြင့်ပါ ပြ (ဥပမာ 20 = ပုံး 2) */}
                    {prod.factor > 1 && prod.unit && (
                      <p className="text-[11px] text-slate-500 mt-1">
                        = {prod.unit} {Math.floor(scannedCount / prod.factor)} /{" "}
                        {Math.floor(prod.requiredQty / prod.factor)}
                        {scannedCount % prod.factor > 0
                          ? ` + ${scannedCount % prod.factor}`
                          : ""}
                      </p>
                    )}
                  </div>
                </div>

                {/* Scanned batches under this product */}
                {prod.scannedBatches.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Layers className="w-3 h-3" /> {t("fulfillment.scannedBatches")}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {prod.scannedBatches.map((batch, bIdx) => {
                        const expFormatted = batch.expiryDate
                          ? new Date(batch.expiryDate).toLocaleDateString()
                          : "N/A";

                        return (
                          <div
                            key={bIdx}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-slate-800">
                                  {batch.batchNumber}
                                </span>
                                {batch.locationName && (
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    ({t("fulfillment.batchFromLocation", { location: batch.locationName })})
                                  </span>
                                )}
                                <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary font-semibold text-[10px]">
                                  {t("fulfillment.qty")}: {batch.quantity}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>Exp: {expFormatted}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveBatch(prodIdx, bIdx)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title={t("fulfillment.remove")}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            {isAllComplete && (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <CheckCircle2 className="w-4 h-4" />
                {t("fulfillment.allCompleteCheck")}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onClose}
              disabled={isFulfilling || isSavingPartial}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 hover:bg-slate-100 transition-colors font-medium disabled:opacity-50"
            >
              {t("fulfillment.close")}
            </button>
            {/* Complete မဖြစ်သေးလည်း ကြိုက်သည့်အချိန် Print ထုတ်နိုင်သော ခလုတ် */}
            <button
              type="button"
              onClick={handleDirectPrint}
              disabled={isFulfilling || isSavingPartial}
              className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all shadow-sm bg-slate-700 hover:bg-slate-800 text-white disabled:opacity-50"
              title={t("fulfillment.printSlip") || "ဘောက်ချာ ထုတ်မည်"}
            >
              <Printer className="w-4 h-4" />
              <span>{t("fulfillment.printSlip") || "ဘောက်ချာ ထုတ်မည်"}</span>
            </button>
            <button
              onClick={handleSavePartialOrder}
              disabled={isFulfilling || isSavingPartial || totalScanned === 0 || isAllComplete}
              className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-all shadow-sm bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              title={isAllComplete ? "All items packed - complete fulfillment" : "Save current scanned batches"}
            >
              {isSavingPartial ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("fulfillment.saving") || "သိမ်းဆည်းနေသည်..."}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {t("fulfillment.saveProgress") || "Save Progress"}
                </>
              )}
            </button>
            <button
              onClick={() => handleFulfillOrder(false)}
              disabled={totalScanned === 0 || isFulfilling || isSavingPartial}
              className={`px-5 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-md text-white disabled:opacity-50 disabled:cursor-not-allowed ${
                isAllComplete
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              title={
                isAllComplete
                  ? "Complete & Print Voucher"
                  : "Complete with available scanned items (Auto-adjust order)"
              }
            >
              {isFulfilling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("fulfillment.completing")}
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  {isAllComplete
                    ? t("fulfillment.completeAndPrint")
                    : (t("fulfillment.confirmShortShipBtn") || "ရရှိသလောက်ဖြင့် အပြီးသတ်မည်")}
                </>
              )}
            </button>
          </div>
        </div>
        {/* Short-Ship / Auto-Adjust Confirmation Dialog */}
        {showShortShipConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {t("fulfillment.confirmShortShipTitle") || "ရရှိထားသော ပစ္စည်းများဖြင့်သာ အပြီးသတ်မည်လား?"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Order #{order.orderNumber}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {t("fulfillment.confirmShortShipDesc") ||
                  "အချို့ပစ္စည်းများ မစုံသေးပါ။ ယခုအတိုင်း အပြီးသတ်ပါက မရရှိသော ပစ္စည်းများကို Order မှ အလိုအလျောက် ပယ်ဖျက်ပြီး ထည့်ပေးလိုက်သော ပစ္စည်းများအတိုင်း စုစုပေါင်းငွေပမာဏကို ပြန်လည်တွက်ချက်ပေးပါမည်။"}
              </p>

              {/* Adjust Summary */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-emerald-50 text-emerald-800 font-medium">
                  <span>{t("fulfillment.packedItems") || "ထုတ်ပိုးပြီး ပစ္စည်းများ"}:</span>
                  <span className="font-bold">{packedProducts.length} မျိုး ({totalScanned} ခု)</span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-rose-50 text-rose-800 font-medium">
                  <span>{t("fulfillment.missingItems") || "မရရှိနိုင်သော ပစ္စည်းများ"}:</span>
                  <span className="font-bold">{missingProducts.length} မျိုး ({totalRequired - totalScanned} ခု)</span>
                </div>
                <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                  <span>{t("fulfillment.newTotal") || "ပြင်ဆင်ပြီး ကျသင့်ငွေ"}:</span>
                  <span className="text-sm font-bold text-primary font-mono">
                    {estimatedNewFinal.toLocaleString()} MMK
                  </span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isFulfilling}
                  onClick={() => setShowShortShipConfirmModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {t("fulfillment.close") || "မလုပ်တော့ပါ"}
                </button>
                <button
                  type="button"
                  disabled={isFulfilling}
                  onClick={() => handleFulfillOrder(true)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  {isFulfilling ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      {t("fulfillment.completing") || "လုပ်ဆောင်နေသည်..."}
                    </>
                  ) : (
                    <>
                      <Printer className="w-3.5 h-3.5" />
                      {t("fulfillment.confirmShortShipBtn") || "အတည်ပြုပြီး အပြီးသတ်မည်"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
