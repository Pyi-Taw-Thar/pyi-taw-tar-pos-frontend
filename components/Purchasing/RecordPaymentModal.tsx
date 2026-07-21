import React, { useState } from "react";
import { X, CreditCard, DollarSign, Calendar, FileText, Loader2 } from "lucide-react";
import { createCreditPayment } from "../../services/SupplierCreditPayment/createCreditPayment";
import { toast } from "sonner";
import { ApiPurchaseOrder } from "../../types";

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  po: ApiPurchaseOrder | null;
  onPaymentSuccess?: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  po,
  onPaymentSuccess,
}) => {
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !po) return null;

  const supplierName =
    typeof po.supplierId === "object" && po.supplierId
      ? po.supplierId.supplierName
      : "Supplier";

  const currentPaid = po.paidAmount ?? 0;
  const currentRemaining = po.remainingBalance ?? po.totalAmount - currentPaid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = Number(paidAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("ကျေးဇူးပြု၍ မှန်ကန်သော ငွေပမာဏ ရိုက်ထည့်ပါ");
      return;
    }

    if (amountNum > currentRemaining) {
      toast.error(
        `ပေးချေငွေသည် ကျန်ရှိသော အကြွေးပမာဏ (${currentRemaining.toLocaleString()} MMK) ထက် မပိုရပါ`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createCreditPayment({
        purchaseId: po._id,
        paidAmount: amountNum,
        paymentDate,
        paymentMethod,
        notes,
      });

      if (res.success) {
        toast.success("Supplier credit payment recorded successfully!");
        setPaidAmount("");
        setNotes("");
        onPaymentSuccess?.();
        onClose();
      }
    } catch (err: any) {
      console.error("Payment failed:", err);
      toast.error(err.message || "Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Record Supplier Credit Payment
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Details */}
        <div className="p-4 bg-slate-100 border-b space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">PO Number:</span>
            <span className="font-semibold text-slate-800">{po.poNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Supplier:</span>
            <span className="font-semibold text-slate-800">{supplierName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Amount:</span>
            <span className="font-semibold text-slate-800">
              {po.totalAmount.toLocaleString()} MMK
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Paid Amount:</span>
            <span className="font-semibold text-green-600">
              {currentPaid.toLocaleString()} MMK
            </span>
          </div>
          <div className="flex justify-between pt-1 border-t">
            <span className="text-slate-700 font-semibold">Remaining Balance:</span>
            <span className="font-bold text-red-600 text-sm">
              {currentRemaining.toLocaleString()} MMK
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Payment Amount (MMK) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="number"
                required
                min="1"
                max={currentRemaining}
                placeholder="e.g. 100000"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="flex gap-2 mt-1">
              <button
                type="button"
                onClick={() => setPaidAmount(String(currentRemaining))}
                className="text-[11px] text-primary hover:underline"
              >
                Pay Full Balance ({currentRemaining.toLocaleString()} MMK)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none bg-white text-xs"
              >
                <option value="cash">Cash (ငွေသား)</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_payment">KPay / WavePay</option>
                <option value="cheque">Cheque</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Payment Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Notes (မှတ်ချက်)
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Optional payment notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 text-xs bg-primary text-white font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Recording...
                </>
              ) : (
                "Record Payment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
