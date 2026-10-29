import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Eye,
  Loader2,
  Award,
  Layers,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../context/LanguageContext";
import {
  fetchCustomerAnalytics,
  CustomerAnalyticsData,
} from "../services/Customer/fetchCustomerAnalytics";
import { fetchEcommerceOrderById } from "../services/Ecommerce/fetchEcommerceOrderById";
import type { EcommerceOrder } from "../services/Ecommerce/fetchEcommerceOrders";
import { EcommerceOrderDetailModal } from "../components/Ecommerce/EcommerceOrderDetailModal";

const formatDisplayDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatNumber = (num?: number | null) => {
  return (num ?? 0).toLocaleString();
};

const getTierColor = (tier?: string) => {
  switch (tier?.toLowerCase()) {
    case "platinum":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "gold":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "silver":
      return "bg-slate-200 text-slate-700 border-slate-300";
    default:
      return "bg-blue-50 text-blue-700 border-blue-200";
  }
};

const formatStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "confirmed":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-indigo-100 text-indigo-800";
    case "delivered":
      return "bg-emerald-100 text-emerald-800";
    case "cancelled":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<CustomerAnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "topProducts">("orders");

  // Modal states for Order Detail
  const [selectedOrder, setSelectedOrder] = useState<EcommerceOrder | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState<boolean>(false);

  const loadData = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetchCustomerAnalytics(id);
      if (res.success && res.data) {
        setData(res.data);
      } else {
        toast.error("Failed to load customer analytics");
      }
    } catch (err: any) {
      console.error("Error loading customer analytics:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to load customer");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleOpenOrderDetail = async (orderId: string) => {
    setLoadingOrderDetail(true);
    setOrderModalOpen(true);
    try {
      const res = await fetchEcommerceOrderById(orderId);
      if (res.success && res.data) {
        setSelectedOrder(res.data);
      } else {
        toast.error(res.message || "Failed to load order detail");
        setOrderModalOpen(false);
      }
    } catch (err: any) {
      console.error("Error loading order detail:", err);
      toast.error(err?.message || "Failed to load order detail");
      setOrderModalOpen(false);
    } finally {
      setLoadingOrderDetail(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-slate-500 text-sm">Customer အချက်အလက်များ ဆွဲတင်နေပါသည်...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <button
          onClick={() => navigate("/customers")}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          ဖောက်သည်များ စာရင်းသို့ ပြန်သွားမည်
        </button>
        <div className="bg-white rounded-xl p-12 text-center text-slate-500 border border-slate-200">
          ဖောက်သည် အချက်အလက် ရှာမတွေ့ပါ
        </div>
      </div>
    );
  }

  const { customer, metrics, orders = [], topProducts = [] } = data;

  const totalSpent = metrics?.totalSpent ?? 0;
  const totalOrders = metrics?.totalOrders ?? 0;
  const deliveredOrders = metrics?.deliveredOrders ?? metrics?.deliveredCount ?? 0;
  const avgOrderValue = metrics?.avgOrderValue ?? 0;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation & Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/customers")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ဖောက်သည်များ စာရင်း (Customers)</span>
        </button>
        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Customer Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl flex-shrink-0">
              {customer?.name?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800">
                  {customer?.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getTierColor(
                    customer?.tier
                  )}`}
                >
                  <Award className="w-3 h-3" />
                  {customer?.tier || "Regular"} Member
                </span>
                {customer?.isCreditPerson && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Credit Customer
                  </span>
                )}
                {customer?.blacklist && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    Blacklisted
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {customer?.phone || "-"}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {customer?.township ? `${customer.township}, ` : ""}
                  {customer?.address || "-"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  စတင်ချိတ်ဆက်: {formatDisplayDate(customer?.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spent */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              စုစုပေါင်း ဝယ်ယူငွေ
            </p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">
            {formatNumber(totalSpent)}{" "}
            <span className="text-sm font-normal text-slate-500">MMK</span>
          </p>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            ပယ်ဖျက်မှုမပါ ဝယ်ယူငွေ စုစုပေါင်း
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              အော်ဒါ အကြိမ်ရေ
            </p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">
            {formatNumber(totalOrders)}{" "}
            <span className="text-sm font-normal text-slate-500">ခု</span>
          </p>
          <div className="mt-2 text-xs text-slate-500">
            အွန်လိုင်းမှ မှာယူမှု အားလုံး
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              ပို့ဆောင်ပြီး အော်ဒါ
            </p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">
            {formatNumber(deliveredOrders)}{" "}
            <span className="text-sm font-normal text-slate-500">ခု</span>
          </p>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            အောင်မြင်စွာ ပို့ဆောင်ပြီးစီး
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              ပျမ်းမျှ အော်ဒါတန်ဖိုး
            </p>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">
            {formatNumber(avgOrderValue)}{" "}
            <span className="text-sm font-normal text-slate-500">MMK</span>
          </p>
          <div className="mt-2 text-xs text-amber-600 font-medium">
            တစ်အော်ဒါ ပျမ်းမျှ သုံးစွဲငွေ
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === "orders"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            မှာယူထားသော အော်ဒါများ ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("topProducts")}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === "topProducts"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            အဝယ်များဆုံး ပစ္စည်းများ ({topProducts.length})
          </button>
        </nav>
      </div>

      {/* TAB 1: ORDERS LIST */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              အော်ဒါမှတ်တမ်း အပြည့်အစုံ
            </h3>
            <span className="text-xs text-slate-500">
              စုစုပေါင်း {orders.length} ခု
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">အော်ဒါနံပါတ်</th>
                  <th className="px-4 py-3 text-left">ရက်စွဲ</th>
                  <th className="px-4 py-3 text-center">အခြေအနေ</th>
                  <th className="px-4 py-3 text-left">ပစ္စည်း အရေအတွက်</th>
                  <th className="px-4 py-3 text-left">ငွေပေးချေမှု</th>
                  <th className="px-4 py-3 text-right">ကျသင့်ငွေ (MMK)</th>
                  <th className="px-4 py-3 text-right">အသေးစိတ်</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders && orders.length > 0 ? (
                  orders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-primary">
                        {ord.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {formatDisplayDate(ord.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${formatStatusBadge(
                            ord.status
                          )}`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {ord.products?.length || 0} မျိုး
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs capitalize">
                        {ord.paymentMethod?.replace(/_/g, " ")}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-800">
                        {formatNumber(ord.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleOpenOrderDetail(ord._id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          ကြည့်မည်
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      မှာယူထားသော အော်ဒါ မရှိသေးပါ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TOP PURCHASED PRODUCTS */}
      {activeTab === "topProducts" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              ဤဝယ်ယူသူ အဝယ်များဆုံး ပစ္စည်းများ
            </h3>
            <span className="text-xs text-slate-500">
              စုစုပေါင်း {topProducts.length} မျိုး
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">ပစ္စည်း</th>
                  <th className="px-4 py-3 text-left">ကုဒ်</th>
                  <th className="px-4 py-3 text-center">ယူနစ်</th>
                  <th className="px-4 py-3 text-center">ဝယ်ယူ အရေအတွက်</th>
                  <th className="px-4 py-3 text-center">မှာယူ အကြိမ်ရေ</th>
                  <th className="px-4 py-3 text-left">နောက်ဆုံး ဝယ်သည့်ရက်</th>
                  <th className="px-4 py-3 text-right">သုံးစွဲငွေ စုစုပေါင်း (MMK)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topProducts && topProducts.length > 0 ? (
                  topProducts.map((p, idx) => (
                    <tr key={p._id || idx} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.productName}
                              className="w-9 h-9 rounded object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold">
                              PTT
                            </div>
                          )}
                          <span className="font-medium text-slate-800">
                            {p.productName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-xs">
                        {p.productCode || "-"}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">
                        {p.unit || "-"}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-800">
                        {formatNumber(p.totalQuantity)}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600 text-xs">
                        {formatNumber(p.orderCount)} ကြိမ်
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {formatDisplayDate(p.lastPurchasedAt)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">
                        {formatNumber(p.totalSpent)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      ဝယ်ယူထားသော ပစ္စည်း မှတ်တမ်း မရှိသေးပါ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {orderModalOpen && (
        <EcommerceOrderDetailModal
          isOpen={orderModalOpen}
          loading={loadingOrderDetail}
          order={selectedOrder}
          onClose={() => {
            setOrderModalOpen(false);
            setSelectedOrder(null);
          }}
          onOrderUpdate={loadData}
        />
      )}
    </div>
  );
};
