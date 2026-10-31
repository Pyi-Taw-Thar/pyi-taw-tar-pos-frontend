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
import { ProductThumb } from "../components/Common/ProductThumb";

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
            {t("ecommerceReports.subtitle")}
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
            <option value="all">{t("ecommerceReports.allStatuses")}</option>
            <option value="pending">{t("ecommerceReports.pending")}</option>
            <option value="confirmed">{t("ecommerceReports.confirmed")}</option>
            <option value="shipped">{t("ecommerceReports.shipped")}</option>
            <option value="delivered">{t("ecommerceReports.delivered")}</option>
            <option value="cancelled">{t("ecommerceReports.cancelled")}</option>
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
            title={t("ecommerceReports.productOrdersReportTooltip")}
          >
            <PackageSearch className="w-4 h-4" />
            <span className="hidden sm:inline">{t("ecommerceReports.productOrdersReportBtn")}</span>
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
              {t("ecommerceReports.totalRevenue")}
            </p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-2 truncate">
            {formatNumber(totalRevenue)} <span className="text-xs font-normal text-slate-500">MMK</span>
          </p>
          <div className="mt-2 text-xs text-emerald-600 font-medium truncate">
            {t("ecommerceReports.revenueExclCancelled")}
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {t("ecommerceReports.totalOrders")}
            </p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-2">
            {formatNumber(totalOrders)}
          </p>
          <div className="mt-2 text-xs text-slate-500">
            {t("ecommerceReports.ordersInPeriod")}
          </div>
        </div>

        {/* Total Ordered Quantity (Items Count) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 bg-gradient-to-br from-white to-purple-50/30">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-purple-700 uppercase tracking-wider font-semibold">
              {t("ecommerceReports.totalOrderedQuantity")}
            </p>
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-purple-700 mt-2">
            {formatNumber(totalOrderedQuantity)}
          </p>
          <div className="mt-2 text-xs text-purple-600 font-medium">
            {t("ecommerceReports.totalOrderedQuantityDesc")}
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {t("ecommerceReports.deliveredOrders")}
            </p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-2">
            {formatNumber(deliveredOrders)}
          </p>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            {t("ecommerceReports.successfullyDelivered")}
          </div>
        </div>

        {/* Cancelled Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {t("ecommerceReports.cancelledOrders")}
            </p>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-2">
            {formatNumber(cancelledOrders)}
          </p>
          <div className="mt-2 text-xs text-rose-600 font-medium">
            {t("ecommerceReports.cancelledOrdersDesc")}
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {t("ecommerceReports.avgOrderValue")}
            </p>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-2 truncate">
            {formatNumber(avgOrderValue)} <span className="text-xs font-normal text-slate-500">MMK</span>
          </p>
          <div className="mt-2 text-xs text-amber-600 font-medium truncate">
            {t("ecommerceReports.perOrderAverage")}
          </div>
        </div>
      </div>

      {/* Order Status Breakdown Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h3 className="text-xs font-semibold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-primary" />
            {t("ecommerceReports.statusBreakdown")}
          </h3>
          <span className="text-xs font-medium text-slate-500">
            {t("ecommerceReports.totalOrdersCountSummary", { orders: formatNumber(totalOrders), items: formatNumber(totalOrderedQuantity) })}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Pending */}
          <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-amber-800">{t("ecommerceReports.pendingStatus")}</p>
              <p className="text-lg font-bold text-amber-700 mt-0.5">{formatNumber(pendingOrders)}</p>
            </div>
            <Clock className="w-5 h-5 text-amber-500 opacity-80" />
          </div>

          {/* Confirmed */}
          <div className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-800">{t("ecommerceReports.confirmedStatus")}</p>
              <p className="text-lg font-bold text-blue-700 mt-0.5">{formatNumber(confirmedOrders)}</p>
            </div>
            <Package className="w-5 h-5 text-blue-500 opacity-80" />
          </div>

          {/* Shipped */}
          <div className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-indigo-800">{t("ecommerceReports.shippedStatus")}</p>
              <p className="text-lg font-bold text-indigo-700 mt-0.5">{formatNumber(shippedOrders)}</p>
            </div>
            <Truck className="w-5 h-5 text-indigo-500 opacity-80" />
          </div>

          {/* Delivered */}
          <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-800">{t("ecommerceReports.deliveredStatus")}</p>
              <p className="text-lg font-bold text-emerald-700 mt-0.5">{formatNumber(deliveredOrders)}</p>
            </div>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 opacity-80" />
          </div>

          {/* Cancelled */}
          <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/60 flex items-center justify-between col-span-2 sm:col-span-1">
            <div>
              <p className="text-xs font-medium text-rose-800">{t("ecommerceReports.cancelledStatus")}</p>
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
            {t("ecommerceReports.tabOverview")}
          </button>
          <button
            onClick={() => setActiveTab("topProducts")}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === "topProducts"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t("ecommerceReports.tabTopProducts")}
          </button>
          <button
            onClick={() => setActiveTab("recentOrders")}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === "recentOrders"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t("ecommerceReports.tabRecentOrders")}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm">{t("ecommerceReports.loadingReports")}</p>
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
                    {t("ecommerceReports.dailySalesTrend")}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {t("ecommerceReports.daysCount", { count: reportData?.dailySales?.length || 0 })}
                  </span>
                </div>
                {reportData?.dailySales && reportData.dailySales.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600 text-xs">
                        <tr>
                          <th className="px-4 py-2.5 text-left">{t("ecommerceReports.date")}</th>
                          <th className="px-4 py-2.5 text-center">{t("ecommerceReports.orderCount")}</th>
                          <th className="px-4 py-2.5 text-right">{t("ecommerceReports.revenueMmk")}</th>
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
                    {t("ecommerceReports.noSalesInPeriod")}
                  </p>
                )}
              </div>

              {/* Payment Methods Breakdown */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2 mb-4">
                  <CreditCard className="w-4 h-4 text-primary" />
                  {t("ecommerceReports.paymentMethods")}
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
                            {t("ecommerceReports.ordersLabel", { count: formatNumber(pm.count) })}
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
                    {t("ecommerceReports.noPayments")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: TOP PRODUCTS */}
          {activeTab === "topProducts" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm sm:text-base">
                  <Layers className="w-4 h-4 text-primary" />
                  {t("ecommerceReports.topProductsList")}
                </h3>
                <span className="text-xs text-slate-500">
                  {t("ecommerceReports.topProductsCountSummary", { count: reportData?.topProducts?.length || 0, qty: formatNumber(totalOrderedQuantity) })}
                </span>
              </div>

              {reportData?.topProducts && reportData.topProducts.length > 0 ? (
                <>
                  {/* မိုဘိုင်းအတွက် Card Layout (md:hidden) */}
                  <div className="md:hidden divide-y divide-slate-100">
                    {reportData.topProducts.map((p, idx) => (
                      <div key={p.rowKey || `${p._id}-${p.unit}` || idx} className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <span className="text-xs font-semibold text-slate-400 mt-1 flex-shrink-0">
                            #{idx + 1}
                          </span>
                          <ProductThumb src={p.image} size="sm" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-800 break-words text-sm">
                              {p.productName}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-500 font-mono">
                              {p.productCode && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100">
                                  {p.productCode}
                                </span>
                              )}
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 font-sans">
                                {p.unit || "-"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-50 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px]">{t("ecommerceReports.quantitySold")}</span>
                            <span className="font-bold text-slate-800">{formatNumber(p.totalQuantity)} {p.unit}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">{t("ecommerceReports.orderFrequency")}</span>
                            <span className="font-semibold text-slate-700">{t("ecommerceReports.orderTimes", { count: formatNumber(p.orderCount) })}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-slate-400 block text-[10px]">{t("ecommerceReports.revenueMmk")}</span>
                            <span className="font-bold text-emerald-600">{formatNumber(p.totalRevenue)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop အတွက် Table Layout (hidden md:block) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 text-slate-600 text-xs">
                        <tr>
                          <th className="px-4 py-3 text-left whitespace-nowrap">#</th>
                          <th className="px-4 py-3 text-left min-w-[200px]">{t("ecommerceReports.product")}</th>
                          <th className="px-4 py-3 text-left whitespace-nowrap">{t("ecommerceReports.code")}</th>
                          <th className="px-4 py-3 text-center whitespace-nowrap">{t("ecommerceReports.unit")}</th>
                          <th className="px-4 py-3 text-center whitespace-nowrap">{t("ecommerceReports.quantitySold")}</th>
                          <th className="px-4 py-3 text-center whitespace-nowrap">{t("ecommerceReports.orderFrequency")}</th>
                          <th className="px-4 py-3 text-right whitespace-nowrap">{t("ecommerceReports.revenueMmk")}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {reportData.topProducts.map((p, idx) => (
                          <tr key={p.rowKey || `${p._id}-${p.unit}` || idx} className="hover:bg-slate-50">
                            <td className="px-4 py-3 text-xs font-semibold text-slate-400 whitespace-nowrap">
                              {idx + 1}
                            </td>
                            <td className="px-4 py-3 min-w-[200px]">
                              <div className="flex items-center gap-3">
                                <ProductThumb src={p.image} size="sm" />
                                <span className="font-medium text-slate-800 break-words">
                                  {p.productName}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                              {p.productCode || "-"}
                            </td>
                            <td className="px-4 py-3 text-center text-slate-600 whitespace-nowrap">
                              {p.unit || "-"}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-slate-800 whitespace-nowrap">
                              {formatNumber(p.totalQuantity)}
                            </td>
                            <td className="px-4 py-3 text-center text-slate-600 text-xs whitespace-nowrap">
                              {t("ecommerceReports.orderTimes", { count: formatNumber(p.orderCount) })}
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                              {formatNumber(p.totalRevenue)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-slate-400">
                  {t("ecommerceReports.noTopProducts")}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: RECENT ORDERS */}
          {activeTab === "recentOrders" && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  {t("ecommerceReports.recentOrders")}
                </h3>
                <span className="text-xs text-slate-500">
                  {t("ecommerceReports.latestCount", { count: reportData?.recentOrders?.length || 0 })}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-600 text-xs">
                    <tr>
                      <th className="px-4 py-3 text-left">{t("customers.detail.orderNumber")}</th>
                      <th className="px-4 py-3 text-left">{t("ecommerceReports.customer")}</th>
                      <th className="px-4 py-3 text-left">{t("ecommerceReports.date")}</th>
                      <th className="px-4 py-3 text-center">{t("ecommerceReports.status")}</th>
                      <th className="px-4 py-3 text-left">{t("ecommerceReports.payment")}</th>
                      <th className="px-4 py-3 text-right">{t("ecommerceReports.totalMmk")}</th>
                      <th className="px-4 py-3 text-right">{t("ecommerceReports.detail")}</th>
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
                              {t("ecommerceReports.view")}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          {t("ecommerceReports.noRecentOrders")}
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
