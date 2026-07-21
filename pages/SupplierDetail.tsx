import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  FileText,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  History,
  Archive,
  RefreshCw,
} from "lucide-react";
import { fetchSupplierById } from "../services/Supplier/fetchSupplierById";
import { fetchPaymentsBySupplier, SupplierCreditSummary } from "../services/SupplierCreditPayment/fetchPaymentsBySupplier";
import { fetchPurchases } from "../services/Purchase/fetchPurchases";
import { CreditPaymentRecord } from "../services/SupplierCreditPayment/createCreditPayment";
import { Supplier, ApiPurchaseOrder } from "../types";
import { toast } from "sonner";
import { RecordPaymentModal } from "../components/Purchasing/RecordPaymentModal";
import { PaymentHistoryModal } from "../components/Purchasing/PaymentHistoryModal";

export const SupplierDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [creditSummary, setCreditSummary] = useState<SupplierCreditSummary | null>(null);
  const [payments, setPayments] = useState<CreditPaymentRecord[]>([]);
  const [poList, setPoList] = useState<ApiPurchaseOrder[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentPage, setPaymentPage] = useState(1);
  const [paymentTotalPages, setPaymentTotalPages] = useState(1);

  // Modals
  const [selectedPoForPayment, setSelectedPoForPayment] = useState<ApiPurchaseOrder | null>(null);
  const [selectedPoForHistory, setSelectedPoForHistory] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadAllData();
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadCreditPayments(paymentPage);
    }
  }, [id, paymentPage]);

  const loadAllData = async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      // 1. Fetch Supplier profile
      const supRes = await fetchSupplierById(id);
      if (supRes.success && supRes.data) {
        setSupplier(supRes.data);
      }

      // 2. Fetch Supplier POs
      const poRes = await fetchPurchases(1, 50);
      if (poRes.success && Array.isArray(poRes.data)) {
        // Filter POs for this supplier
        const filteredPOs = poRes.data.filter((po: ApiPurchaseOrder) => {
          const supId = typeof po.supplierId === "object" ? po.supplierId?._id : po.supplierId;
          return supId === id;
        });
        setPoList(filteredPOs);
      }
    } catch (err: any) {
      console.error("Error loading supplier details:", err);
      toast.error(err.message || "Failed to load supplier details");
    } finally {
      setIsLoading(false);
    }
  };

  const loadCreditPayments = async (page: number = 1) => {
    if (!id) return;
    setPaymentsLoading(true);
    try {
      const payRes = await fetchPaymentsBySupplier(id, page, 10);
      if (payRes.success && payRes.data) {
        setCreditSummary(payRes.data.summary);
        setPayments(payRes.data.payments?.records || []);
        if (payRes.pagination) {
          setPaymentTotalPages(payRes.pagination.totalPages || 1);
        }
      }
    } catch (err: any) {
      console.error("Error loading credit payments:", err);
    } finally {
      setPaymentsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin mr-2 text-primary" />
        <span>Supplier အချက်အလက်များ ခေါ်ယူနေပါသည်...</span>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Supplier မတွေ့ရှိပါ</h2>
        <button
          onClick={() => navigate("/suppliers")}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm"
        >
          Supplier စာရင်းသို့ ပြန်သွားမည်
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/suppliers")}
            className="p-2 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
            title="Back to Suppliers"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {supplier.supplierName}
              </h1>
              {supplier.shortDesc && (
                <span className="bg-slate-200 text-slate-800 text-xs px-2 py-0.5 rounded font-mono font-bold">
                  {supplier.shortDesc}
                </span>
              )}
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  supplier.isDeleted
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {supplier.isDeleted ? "Inactive" : "Active"}
              </span>
            </div>
            {supplier.companyName && (
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {supplier.companyName}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAllData}
            className="p-2 border rounded-lg hover:bg-slate-50 text-slate-600"
            title="Reload Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Supplier Profile Info Card */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Contact Info */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            ဆက်သွယ်ရန် အချက်အလက်
          </h3>
          <div className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="font-semibold">{supplier.contactNumber}</span>
            </div>
            {supplier.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{supplier.email}</span>
              </div>
            )}
            {supplier.address && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                <span>
                  {supplier.address}
                  {supplier.township && `, ${supplier.township}`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* System & Type Badges */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            အမျိုးအစား နှင့် စည်းကမ်းများ
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Credit Supplier:</span>
              {supplier.isCredit ? (
                <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Yes (Due: {supplier.dueInDays || 0} Days)
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded">No</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Consign (အပ်စရင်):</span>
              {supplier.isConsign ? (
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-0.5 rounded font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Yes
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded">No</span>
              )}
            </div>
          </div>
        </div>

        {/* Joined Info */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            စနစ်သွင်း စာရင်း
          </h3>
          <div className="space-y-1 text-xs text-slate-600">
            {supplier.createdAt && (
              <div>
                <span className="text-slate-400">စတင်ထည့်သွင်းသည့်ရက်: </span>
                <span className="font-medium">
                  {new Date(supplier.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}
            {supplier.updatedAt && (
              <div>
                <span className="text-slate-400">နောက်ဆုံးပြင်ဆင်သည့်ရက်: </span>
                <span className="font-medium">
                  {new Date(supplier.updatedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Credit Summary Statistics Cards */}
      {creditSummary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <span className="text-xs font-medium text-slate-500">စုစုပေါင်း PO အရေအတွက်</span>
            <div className="text-2xl font-extrabold text-slate-800 mt-1">
              {creditSummary.totalPOs} <span className="text-xs font-normal">ခု</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <span className="text-xs font-medium text-slate-500">စုစုပေါင်း ဝယ်ယူငွေ (Total Amount)</span>
            <div className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-1">
              {creditSummary.totalPOAmount.toLocaleString()} <span className="text-xs font-normal">MMK</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-green-200 bg-green-50/20">
            <span className="text-xs font-medium text-green-700">ပေးချေပြီး ငွေပမာဏ (Total Paid)</span>
            <div className="text-xl sm:text-2xl font-extrabold text-green-700 mt-1">
              {creditSummary.totalPaid.toLocaleString()} <span className="text-xs font-normal">MMK</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-red-200 bg-red-50/20">
            <span className="text-xs font-medium text-red-700">ကျန်ရှိသော အကြွေး (Outstanding Balance)</span>
            <div className="text-xl sm:text-2xl font-extrabold text-red-600 mt-1">
              {creditSummary.totalOutstanding.toLocaleString()} <span className="text-xs font-normal">MMK</span>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Credit Payment History Section */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-base sm:text-lg text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-primary" />
            Supplier Credit ငွေပေးချေမှု မှတ်တမ်းများ
          </h2>
        </div>

        {paymentsLoading ? (
          <div className="flex justify-center items-center py-8 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> ခေါ်ယူနေပါသည်...
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border rounded-lg border-dashed">
            ငွေပေးချေမှု မှတ်တမ်း မရှိသေးပါ။
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-slate-50 border-b font-semibold text-slate-700">
                <tr>
                  <th className="p-3">ရက်စွဲ</th>
                  <th className="p-3">PO နံပါတ်</th>
                  <th className="p-3">ပေးချေငွေပမာဏ</th>
                  <th className="p-3">ပေးချေနည်း</th>
                  <th className="p-3">မှတ်ချက်</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((pay) => (
                  <tr key={pay._id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-600">
                      {new Date(pay.paymentDate || pay.createdAt || "").toLocaleDateString()}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">
                      {typeof pay.purchaseId === "object"
                        ? pay.purchaseId?.poNumber
                        : pay.purchaseId || "-"}
                    </td>
                    <td className="p-3 font-bold text-green-700">
                      {pay.paidAmount.toLocaleString()} MMK
                    </td>
                    <td className="p-3 capitalize text-slate-600">
                      {pay.paymentMethod?.replace("_", " ")}
                    </td>
                    <td className="p-3 text-slate-500">{pay.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Associated Purchase Orders Table */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border space-y-4">
        <h2 className="font-bold text-base sm:text-lg text-slate-800 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          ဤ Supplier ၏ Purchase Order (PO) စာရင်းများ
        </h2>

        {poList.length === 0 ? (
          <div className="text-center py-8 text-slate-400 border rounded-lg border-dashed">
            ဤ Supplier အတွက် ဝယ်ယူထားသော PO စာရင်း မရှိသေးပါ။
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-xs sm:text-sm text-left">
              <thead className="bg-slate-50 border-b font-semibold text-slate-700">
                <tr>
                  <th className="p-3">PO ID</th>
                  <th className="p-3">ရက်စွဲ</th>
                  <th className="p-3">စုစုပေါင်း (Total)</th>
                  <th className="p-3">ပေးပြီး (Paid)</th>
                  <th className="p-3">ကျန်ငွေ (Balance)</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {poList.map((po) => {
                  const paid = po.paidAmount ?? 0;
                  const remaining = po.remainingBalance ?? Math.max(0, po.totalAmount - paid);

                  return (
                    <tr key={po._id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-800">{po.poNumber}</td>
                      <td className="p-3 text-slate-600">
                        {new Date(po.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 font-medium">{po.totalAmount.toLocaleString()} MMK</td>
                      <td className="p-3 font-medium text-green-700">
                        {paid.toLocaleString()} MMK
                      </td>
                      <td className="p-3 font-bold">
                        {remaining > 0 ? (
                          <span className="text-red-600">{remaining.toLocaleString()} MMK</span>
                        ) : (
                          <span className="text-slate-400">0 MMK</span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                          {po.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedPoForPayment(po)}
                            className={`px-2.5 py-1 text-xs rounded font-semibold transition-colors border ${
                              remaining > 0
                                ? "bg-green-600 text-white hover:bg-green-700 border-green-600"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-300"
                            }`}
                          >
                            Pay
                          </button>
                          <button
                            onClick={() => setSelectedPoForHistory(po._id)}
                            className="p-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded border border-purple-200 text-xs"
                            title="Payment History"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={!!selectedPoForPayment}
        onClose={() => setSelectedPoForPayment(null)}
        po={selectedPoForPayment}
        onPaymentSuccess={() => {
          loadAllData();
          loadCreditPayments(paymentPage);
        }}
      />

      {/* Payment History Modal */}
      <PaymentHistoryModal
        isOpen={!!selectedPoForHistory}
        onClose={() => setSelectedPoForHistory(null)}
        purchaseId={selectedPoForHistory}
        onPaymentDeleted={() => {
          loadAllData();
          loadCreditPayments(paymentPage);
        }}
      />
    </div>
  );
};
