import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  RefreshCw,
  TrendingUp,
  Package,
  PackageSearch,
  CheckCircle2,
  XCircle,
  CreditCard,
  Calendar,
  Eye,
  Loader2,
  DollarSign,
  Layers,
  Clock,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../context/LanguageContext";
import { DateRangePicker } from "../components/Reports/DateRangePicker";
import {
  fetchEcommerceReport,
  EcommerceReportData,
} from "../services/Reports/fetchEcommerceReport";
import { fetchEcommerceOrderById } from "../services/Ecommerce/fetchEcommerceOrderById";
import type { EcommerceOrder } from "../services/Ecommerce/fetchEcommerceOrders";
import { EcommerceOrderDetailModal } from "../components/Ecommerce/EcommerceOrderDetailModal";

// Helper function to get today's date
const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

// Format date helper
const formatDateForAPI = (date: Date | null): string | null => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (iso: string) => {
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

type ReportTabType = "overview" | "topProducts" | "recentOrders";

export const EcommerceReports: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Date filters
  const [startDate, setStartDate] = useState<Date | null>(getToday());
  const [endDate, setEndDate] = useState<Date | null>(getToday());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<ReportTabType>("overview");

  // Data states
  const [loading, setLoading] = useState<boolean>(true);
  const [reportData, setReportData] = useState<EcommerceReportData | null>(null);

  // Modal states for Order Detail
  const [selectedOrder, setSelectedOrder] = useState<EcommerceOrder | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState<boolean>(false);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await fetchEcommerceReport({
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
        status: statusFilter,
      });

      if (res.success && res.data) {
        setReportData(res.data);
      } else {
        toast.error("Failed to load ecommerce report");
      }
    } catch (err: any) {
      console.error("Error fetching ecommerce report:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [startDate, endDate, statusFilter]);

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
      console.error("Error loading order:", err);
      toast.error(err?.message || "Failed to load order");
      setOrderModalOpen(false);
    } finally {
      setLoadingOrderDetail(false);
    }
  };

  const summary = reportData?.summary || {};
  const totalRevenue = summary.totalRevenue ?? 0;
  const totalOrders = summary.totalOrders ?? 0;
  const totalOrderedQuantity = summary.totalOrderedQuantity ?? summary.totalItemsQuantity ?? 0;
  const pendingOrders = summary.pendingOrders ?? summary.pendingCount ?? 0;
  const confirmedOrders = summary.confirmedOrders ?? summary.confirmedCount ?? 0;
  const shippedOrders = summary.shippedOrders ?? summary.shippedCount ?? 0;
  const deliveredOrders = summary.deliveredOrders ?? summary.deliveredCount ?? 0;
  const cancelledOrders = summary.cancelledOrders ?? summary.cancelledCount ?? 0;
  const avgOrderValue = summary.avgOrderValue ?? 0;

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

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Ecommerce Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            အွန်လိုင်း အရောင်းဆိုင် အစီရင်ခံစာနှင့် စာရင်းအင်းများ
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-sm bg-white"
          >
            <option value="all">အော်ဒါအားလုံး (All Statuses)</option>
            <option value="pending">ဆိုင်းငံ့ထား (Pending)</option>
            <option value="confirmed">အတည်ပြုပြီး (Confirmed)</option>
            <option value="shipped">ပို့ဆောင်နေ (Shipped)</option>
            <option value="delivered">ပို့ဆောင်ပြီး (Delivered)</option>
            <option value="cancelled">ပယ်ဖျက် (Cancelled)</option>
          </select>

          {/* Date Range Picker */}
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(s, e) => {
              setStartDate(s);
              setEndDate(e);
            }}
          />

          {/* Product Orders Report shortcut */}
          <button
            onClick={() => navigate("/admin/ecommerce-product-orders")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs sm:text-sm font-semibold transition-colors"
            title="ဘယ်ပစ္စည်းက ဘယ်လောက် Order တင်ထားသည်ကို အသေးစိတ် ကြည့်ရှုရန်"
          >
            <PackageSearch className="w-4 h-4" />
            <span className="hidden sm:inline">ပစ္စည်းအလိုက် စာရင်း</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={loadReport}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              စုစုပေါင်း ရောင်းရငွေ
            </p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-2 truncate">
            {formatNumber(totalRevenue)} <span className="text-xs font-normal text-slate-500">MMK</span>
          </p>
          <div className="mt-2 text-xs text-emerald-600 font-medium truncate">
            ပယ်ဖျက်မှုမပါ ဝင်ငွေ
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              အော်ဒါ စုစုပေါင်း
            </p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-2">
            {formatNumber(totalOrders)} <span className="text-xs font-normal text-slate-500">ခု</span>
          </p>
          <div className="mt-2 text-xs text-slate-500">
            ကာလအတွင်း အော်ဒါအရေအတွက်
          </div>
        </div>

        {/* Total Ordered Quantity (Items Count) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 bg-gradient-to-br from-white to-purple-50/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-purple-700 uppercase tracking-wider font-semibold">
              မှာယူထားသော ပစ္စည်းပေါင်း
            </p>
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-purple-700 mt-2">
            {formatNumber(totalOrderedQuantity)} <span className="text-xs font-normal text-purple-600">ခု</span>
          </p>
          <div className="mt-2 text-xs text-purple-600 font-medium">
            ကုန်ပစ္စည်း စုစုပေါင်း အရေအတွက်
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
          <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-2">
            {formatNumber(deliveredOrders)} <span className="text-xs font-normal text-slate-500">ခု</span>
          </p>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            အောင်မြင်စွာ ပို့ပြီး
          </div>
        </div>

        {/* Cancelled Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              ပယ်ဖျက် အော်ဒါ
            </p>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-2">
            {formatNumber(cancelledOrders)} <span className="text-xs font-normal text-slate-500">ခု</span>
          </p>
          <div className="mt-2 text-xs text-rose-600 font-medium">
            ဖျက်သိမ်းခဲ့သော အော်ဒါ
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
          <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-2 truncate">
            {formatNumber(avgOrderValue)} <span className="text-xs font-normal text-slate-500">MMK</span>
          </p>
          <div className="mt-2 text-xs text-amber-600 font-medium truncate">
            တစ်အော်ဒါ ပျမ်းမျှ
          </div>
        </div>
      </div>

      {/* Order Status Breakdown Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" />
            အော်ဒါ အခြေအနေအလိုက် အရေအတွက်များ
          </h3>
          <span className="text-xs font-medium text-slate-500">
            စုစုပေါင်း မှာယူမှု: <strong className="text-slate-800">{formatNumber(totalOrders)} အော်ဒါ</strong> (ကုန်ပစ္စည်း <strong className="text-purple-700">{formatNumber(totalOrderedQuantity)} ခု</strong>)
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Pending */}
          <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-800">ဆိုင်းငံ့ / စစ်ဆေးဆဲ</p>
              <p className="text-lg font-bold text-amber-700 mt-0.5">{formatNumber(pendingOrders)}</p>
            </div>
            <Clock className="w-5 h-5 text-amber-500 opacity-80" />
          </div>

          {/* Confirmed */}
          <div className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-800">အတည်ပြုပြီး</p>
              <p className="text-lg font-bold text-blue-700 mt-0.5">{formatNumber(confirmedOrders)}</p>
            </div>
            <Package className="w-5 h-5 text-blue-500 opacity-80" />
          </div>

          {/* Shipped */}
          <div className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-indigo-800">ပို့ဆောင်ဆဲ</p>
              <p className="text-lg font-bold text-indigo-700 mt-0.5">{formatNumber(shippedOrders)}</p>
            </div>
            <Truck className="w-5 h-5 text-indigo-500 opacity-80" />
          </div>

          {/* Delivered */}
          <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-800">ပို့ဆောင်ပြီး</p>
              <p className="text-lg font-bold text-emerald-700 mt-0.5">{formatNumber(deliveredOrders)}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 opacity-80" />
          </div>

          {/* Cancelled */}
          <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/60 flex items-center justify-between col-span-2 sm:col-span-1">
            <div>
              <p className="text-xs font-medium text-rose-800">ပယ်ဖျက်</p>
              <p className="text-lg font-bold text-rose-700 mt-0.5">{formatNumber(cancelledOrders)}</p>
            </div>
            <XCircle className="w-5 h-5 text-rose-500 opacity-80" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === "overview"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            ရောင်းအား ခြုံငုံသုံးသပ်ချက် (Overview)
          </button>
          <button
            onClick={() => setActiveTab("topProducts")}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === "topProducts"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            အဝယ်များဆုံး ပစ္စည်းများ (Top Products)
          </button>
          <button
            onClick={() => setActiveTab("recentOrders")}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === "recentOrders"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            လတ်တလော အော်ဒါများ (Recent Orders)
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm">အစီရင်ခံစာ အချက်အလက်များ ဆွဲတင်နေပါသည်...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Sales Trend */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    နေ့အလိုက် ရောင်းအား မှတ်တမ်း (Daily Sales Trend)
                  </h3>
                  <span className="text-xs text-slate-500">
                    {reportData?.dailySales?.length || 0} ရက်
                  </span>
                </div>
                {reportData?.dailySales && reportData.dailySales.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600 text-xs">
                        <tr>
                          <th className="px-4 py-2.5 text-left">ရက်စွဲ</th>
                          <th className="px-4 py-2.5 text-center">အော်ဒါအရေအတွက်</th>
                          <th className="px-4 py-2.5 text-right">ရောင်းရငွေ (MMK)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reportData.dailySales.map((ds) => (
                          <tr key={ds.date} className="hover:bg-slate-50/70">
                            <td className="px-4 py-3 font-medium text-slate-800">
                              {formatDisplayDate(ds.date)}
                            </td>
                            <td className="px-4 py-3 text-center text-slate-600">
                              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                {formatNumber(ds.orderCount ?? ds.orders)} orders
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                              {formatNumber(ds.totalSales ?? ds.revenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 py-8 text-center">
                    ဤကာလအတွင်း ရောင်းအားမှတ်တမ်း မရှိပါ
                  </p>
                )}
              </div>

              {/* Payment Methods Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                  <CreditCard className="w-4 h-4 text-primary" />
                  ငွေပေးချေမှု နည်းလမ်းများ (Payment Methods)
                </h3>
                {reportData?.paymentMethods && reportData.paymentMethods.length > 0 ? (
                  <div className="space-y-3">
                    {reportData.paymentMethods.map((pm) => (
                      <div
                        key={pm.method}
                        className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-slate-800 capitalize text-sm">
                            {pm.method?.replace(/_/g, " ")}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {formatNumber(pm.count)} အော်ဒါ
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-800 text-sm">
                            {formatNumber(pm.totalAmount)} MMK
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 py-8 text-center">
                    ငွေပေးချေမှု မှတ်တမ်း မရှိပါ
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TOP PRODUCTS */}
          {activeTab === "topProducts" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  အဝယ်အများဆုံး ပစ္စည်းများ စာရင်း
                </h3>
                <span className="text-xs text-slate-500">
                  စုစုပေါင်း {reportData?.topProducts?.length || 0} မျိုး (မှာယူထားသော စုစုပေါင်း: {formatNumber(totalOrderedQuantity)} ခု)
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
                      <th className="px-4 py-3 text-center">ရောင်းရ အရေအတွက်</th>
                      <th className="px-4 py-3 text-center">အော်ဒါ အကြိမ်ရေ</th>
                      <th className="px-4 py-3 text-right">ရောင်းရငွေ (MMK)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData?.topProducts && reportData.topProducts.length > 0 ? (
                      reportData.topProducts.map((p, idx) => (
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
                          <td className="px-4 py-3 text-right font-bold text-emerald-600">
                            {formatNumber(p.totalRevenue)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          ဤကာလအတွင်း အဝယ်များသော ပစ္စည်းမှတ်တမ်း မရှိပါ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: RECENT ORDERS */}
          {activeTab === "recentOrders" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  လတ်တလော အော်ဒါများ
                </h3>
                <span className="text-xs text-slate-500">
                  နောက်ဆုံး {reportData?.recentOrders?.length || 0} ခု
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs">
                    <tr>
                      <th className="px-4 py-3 text-left">အော်ဒါနံပါတ်</th>
                      <th className="px-4 py-3 text-left">ဝယ်ယူသူ</th>
                      <th className="px-4 py-3 text-left">ရက်စွဲ</th>
                      <th className="px-4 py-3 text-center">အခြေအနေ</th>
                      <th className="px-4 py-3 text-left">ငွေပေးချေမှု</th>
                      <th className="px-4 py-3 text-right">ကျသင့်ငွေ (MMK)</th>
                      <th className="px-4 py-3 text-right">အသေးစိတ်</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reportData?.recentOrders && reportData.recentOrders.length > 0 ? (
                      reportData.recentOrders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-primary">
                            {ord.orderNumber}
                          </td>
                          <td className="px-4 py-3 text-slate-800">
                            {ord.customerId?.name || "-"}
                            {ord.customerId?.phone && (
                              <div className="text-xs text-slate-400">
                                {ord.customerId.phone}
                              </div>
                            )}
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
                          ဤကာလအတွင်း အော်ဒါမှတ်တမ်း မရှိပါ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
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
          onOrderUpdate={loadReport}
        />
      )}
    </div>
  );
};
