import React, { useState, useEffect } from "react";
import { X, History, Loader2, Trash2 } from "lucide-react";
import { fetchPaymentsByPO } from "../../services/SupplierCreditPayment/fetchPaymentsByPO";
import { deleteCreditPayment } from "../../services/SupplierCreditPayment/deleteCreditPayment";
import { CreditPaymentRecord } from "../../services/SupplierCreditPayment/createCreditPayment";
import { toast } from "sonner";
import { ConfirmModal } from "../Common/ConfirmModal";

interface PaymentHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseId: string | null;
  onPaymentDeleted?: () => void;
}

export const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({
  isOpen,
  onClose,
  purchaseId,
  onPaymentDeleted,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseData, setPurchaseData] = useState<any>(null);
  const [payments, setPayments] = useState<CreditPaymentRecord[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [paymentToDelete, setPaymentToDelete] = useState<CreditPaymentRecord | null>(null);

  useEffect(() => {
    if (isOpen && purchaseId) {
      loadPayments();
    }
  }, [isOpen, purchaseId]);

  const loadPayments = async () => {
    if (!purchaseId) return;
    setIsLoading(true);
    try {
      const res = await fetchPaymentsByPO(purchaseId);
      if (res.success && res.data) {
        setPurchaseData(res.data.purchase);
        setPayments(res.data.payments?.records || []);
      }
    } catch (err: any) {
      console.error("Failed to fetch payment history:", err);
      toast.error(err.message || "Failed to load payment history");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return;
    setDeletingId(paymentToDelete._id);
    try {
      const res = await deleteCreditPayment(paymentToDelete._id);
      if (res.success) {
        toast.success("Payment record deleted successfully");
        setPayments((prev) => prev.filter((p) => p._id !== paymentToDelete._id));
        if (purchaseData) {
          setPurchaseData({
            ...purchaseData,
            paidAmount: res.data.purchase.newPaidAmount,
            remainingBalance: res.data.purchase.newRemainingBalance,
          });
        }
        setPaymentToDelete(null);
        onPaymentDeleted?.();
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete payment record");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen || !purchaseId) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              PO Payment History
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading payment history...
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {purchaseData && (
                <div className="bg-slate-50 p-3 rounded-lg border grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">PO Number</span>
                    <span className="font-bold text-slate-800">{purchaseData.poNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Total Amount</span>
                    <span className="font-bold text-slate-800">
                      {purchaseData.totalAmount?.toLocaleString()} MMK
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Paid / Remaining</span>
                    <span className="font-semibold text-green-600">
                      {purchaseData.paidAmount?.toLocaleString()}
                    </span>{" "}
                    /{" "}
                    <span className="font-bold text-red-600">
                      {purchaseData.remainingBalance?.toLocaleString()} MMK
                    </span>
                  </div>
                </div>
              )}

              {payments.length === 0 ? (
                <div className="text-center py-8 text-slate-400 border rounded-lg border-dashed">
                  No payment records found for this purchase order.
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 border-b font-medium text-slate-700">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Amount</th>
                        <th className="p-2.5">Method</th>
                        <th className="p-2.5">Notes</th>
                        <th className="p-2.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {payments.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50">
                          <td className="p-2.5 text-slate-600">
                            {new Date(p.paymentDate || p.createdAt || "").toLocaleDateString()}
                          </td>
                          <td className="p-2.5 font-semibold text-green-700">
                            {p.paidAmount?.toLocaleString()} MMK
                          </td>
                          <td className="p-2.5 capitalize text-slate-600">
                            {p.paymentMethod?.replace("_", " ")}
                          </td>
                          <td className="p-2.5 text-slate-500 truncate max-w-[120px]">
                            {p.notes || "-"}
                          </td>
                          <td className="p-2.5 text-right">
                            <button
                              onClick={() => setPaymentToDelete(p)}
                              disabled={deletingId === p._id}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              title="Delete Payment"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!paymentToDelete}
        title="Delete Payment Record"
        message={`Are you sure you want to delete the payment of ${paymentToDelete?.paidAmount?.toLocaleString()} MMK? The PO remaining balance will be restored.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor="red"
        onConfirm={confirmDeletePayment}
        onCancel={() => setPaymentToDelete(null)}
        isLoading={!!deletingId}
      />
    </>
  );
};
