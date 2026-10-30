import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PackageSearch,
  RefreshCw,
  Search,
  Calendar,
  Layers,
  DollarSign,
  TrendingUp,
  Eye,
  Loader2,
  ArrowUpDown,
  X,
  Package,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../context/LanguageContext";
import { DateRangePicker } from "../components/Reports/DateRangePicker";
import {
  fetchEcommerceProductOrdersReport,
  EcommerceProductSalesItem,
  EcommerceProductOrderItem,
  EcommerceProductReportTotals,
} from "../services/Reports/fetchEcommerceProductOrdersReport";
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

type SortKey = "totalQuantity" | "totalRevenue" | "orderCount" | "productName";

export const EcommerceProductOrdersReport: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Filters
  const [startDate, setStartDate] = useState<Date | null>(getToday());
  const [endDate, setEndDate] = useState<Date | null>(getToday());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<SortKey>("totalQuantity");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  // Data states
  const [loading, setLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<EcommerceProductSalesItem[]>([]);
  const [totals, setTotals] = useState<EcommerceProductReportTotals>({
    uniqueProductsCount: 0,
    totalQuantity: 0,
    totalRevenue: 0,
  });

  // Modal for viewing orders of a specific product
  const [selectedProduct, setSelectedProduct] = useState<EcommerceProductSalesItem | null>(null);
  const [productOrders, setProductOrders] = useState<EcommerceProductOrderItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(false);
  const [showProductOrdersModal, setShowProductOrdersModal] = useState<boolean>(false);

  // Modal for viewing full ecommerce order detail
  const [selectedOrder, setSelectedOrder] = useState<EcommerceOrder | null>(null);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [loadingOrderDetail, setLoadingOrderDetail] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchEcommerceProductOrdersReport({
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
        status: statusFilter,
        search: searchTerm.trim() || undefined,
      });

      if (res.success && res.data) {
        setProducts(res.data.products || []);
        if (res.data.totals) {
          setTotals(res.data.totals);
        }
      } else {
        toast.error("Failed to load product orders report");
      }
    } catch (err: any) {
      console.error("Error fetching product orders report:", err);
      toast.error(err?.response?.data?.message || err?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [startDate, endDate, statusFilter]);

  // Handle open orders modal for a product
  const handleOpenProductOrders = async (product: EcommerceProductSalesItem) => {
    setSelectedProduct(product);
    setShowProductOrdersModal(true);
    setLoadingOrders(true);
    try {
      const res = await fetchEcommerceProductOrdersReport({
        startDate: formatDateForAPI(startDate),
        endDate: formatDateForAPI(endDate),
        status: statusFilter,
        inventoryId: product._id,
      });

      if (res.success && res.data?.orders) {
        setProductOrders(res.data.orders);
      } else {
        setProductOrders([]);
      }
    } catch (err: any) {
      console.error("Error fetching product orders:", err);
      toast.error("Failed to load orders for this product");
      setProductOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Handle open full order modal
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

  // Client-side sorting & search filtering
  const filteredAndSortedProducts = [...products]
    .filter((p) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        p.productName.toLowerCase().includes(term) ||
        (p.productCode && p.productCode.toLowerCase().includes(term))
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "totalQuantity") {
        comparison = (b.totalQuantity || 0) - (a.totalQuantity || 0);
      } else if (sortBy === "totalRevenue") {
        comparison = (b.totalRevenue || 0) - (a.totalRevenue || 0);
      } else if (sortBy === "orderCount") {
        comparison = (b.orderCount || 0) - (a.orderCount || 0);
      } else if (sortBy === "productName") {
        comparison = a.productName.localeCompare(b.productName);
      }
      return sortOrder === "desc" ? comparison : -comparison;
    });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <PackageSearch className="w-6 h-6 text-primary" />
            Ecommerce Product Orders Report
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ဘယ်ကုန်ပစ္စည်းက အရေအတွက် ဘယ်လောက် အော်ဒါတင်ထားသည်ကို ရက်စွဲအလိုက် စစ်ထုတ်ကြည့်ရှုနိုင်ခြင်း
          </p>
        </div>

        {/* Quick Links & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate("/admin/ecommerce-reports")}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-slate-500" />
            Ecommerce Reports သို့
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 bg-primary text-white hover:bg-primary/90 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI Cards (3 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Unique Products */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              မှာယူခံရသော ကုန်ပစ္စည်းအမျိုးအစား
            </p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">
            {formatNumber(totals.uniqueProductsCount)} <span className="text-sm font-normal text-slate-500">မျိုး</span>
          </p>
          <div className="mt-2 text-xs text-slate-500">
            ရွေးချယ်ထားသော ကာလအတွင်း
          </div>
        </div>

        {/* Total Quantity Ordered */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-4 bg-gradient-to-br from-white to-purple-50/40">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-purple-700 uppercase tracking-wider font-semibold">
              မှာယူထားသော စုစုပေါင်း အရေအတွက်
            </p>
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-700 mt-2">
            {formatNumber(totals.totalQuantity)} <span className="text-sm font-normal text-purple-600">ခု (Units)</span>
          </p>
          <div className="mt-2 text-xs text-purple-600 font-medium">
            ပစ္စည်းအားလုံး၏ မှာယူမှု အရေအတွက် ပေါင်းလဒ်
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              စုစုပေါင်း ရောင်းရငွေ
            </p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">
            {formatNumber(totals.totalRevenue)} <span className="text-sm font-normal text-slate-500">MMK</span>
          </p>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            ပယ်ဖျက်မှုမပါ ဝင်ငွေ
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ပစ္စည်းအမည် သို့မဟုတ် ကုဒ် ဖြင့် ရှာဖွေပါ..."
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/60"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status, DatePicker, Sorting */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none text-xs sm:text-sm bg-white"
          >
            <option value="all">အော်ဒါအားလုံး (All)</option>
            <option value="pending">ဆိုင်းငံ့ထား (Pending)</option>
            <option value="confirmed">အတည်ပြုပြီး (Confirmed)</option>
            <option value="shipped">ပို့ဆောင်နေ (Shipped)</option>
            <option value="delivered">ပို့ဆောင်ပြီး (Delivered)</option>
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

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1 bg-slate-50 border rounded-lg px-2 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              className="bg-transparent text-xs outline-none text-slate-700 font-medium cursor-pointer"
            >
              <option value="totalQuantity">မှာယူမှု အများဆုံး</option>
              <option value="totalRevenue">ရောင်းရငွေ အများဆုံး</option>
              <option value="orderCount">အော်ဒါ အကြိမ်ရေ အများဆုံး</option>
              <option value="productName">ပစ္စည်း အမည်</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2 text-sm sm:text-base">
            <Layers className="w-4 h-4 text-primary" />
            မှာယူထားသော ကုန်ပစ္စည်းများနှင့် အရေအတွက် စာရင်း
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            ပြသထားမှု: <strong className="text-slate-800">{filteredAndSortedProducts.length}</strong> မျိုး (စုစုပေါင်း <strong className="text-purple-700">{formatNumber(totals.totalQuantity)} ခု</strong>)
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-sm">ပစ္စည်းအလိုက် အချက်အလက်များ ဆွဲတင်နေပါသည်...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">ကုန်ပစ္စည်း</th>
                  <th className="px-4 py-3 text-left">ကုဒ်</th>
                  <th className="px-4 py-3 text-center">ယူနစ်</th>
                  <th className="px-4 py-3 text-center bg-purple-50/60 text-purple-900 font-bold">
                    မှာယူထားသော အရေအတွက်
                  </th>
                  <th className="px-4 py-3 text-center">အော်ဒါ အကြိမ်ရေ</th>
                  <th className="px-4 py-3 text-right">ပျမ်းမျှ စျေးနှုန်း</th>
                  <th className="px-4 py-3 text-right">ရောင်းရငွေ (MMK)</th>
                  <th className="px-4 py-3 text-right">အော်ဒါများ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedProducts.length > 0 ? (
                  filteredAndSortedProducts.map((p, idx) => (
                    <tr key={p._id || idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-xs font-semibold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.productName}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold flex-shrink-0">
                              PTT
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-slate-800 hover:text-primary transition-colors cursor-pointer" onClick={() => handleOpenProductOrders(p)}>
                              {p.productName}
                            </p>
                            {p.category && (
                              <p className="text-xs text-slate-400 mt-0.5">{p.category}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs font-mono">
                        {p.productCode || "-"}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600 text-xs">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-100">
                          {p.unit || "-"}
                        </span>
                      </td>

                      {/* Total Ordered Quantity - Prominent */}
                      <td className="px-4 py-3 text-center bg-purple-50/30">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-base font-extrabold text-purple-700">
                            {formatNumber(p.totalQuantity)}
                          </span>
                          {/* Mini breakdown of statuses */}
                          <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500">
                            {p.pendingQuantity > 0 && (
                              <span className="text-amber-700 font-medium" title="ဆိုင်းငံ့/စစ်ဆေးဆဲ">
                                P:{p.pendingQuantity}
                              </span>
                            )}
                            {p.confirmedQuantity > 0 && (
                              <span className="text-blue-700 font-medium" title="အတည်ပြုပြီး">
                                C:{p.confirmedQuantity}
                              </span>
                            )}
                            {p.deliveredQuantity > 0 && (
                              <span className="text-emerald-700 font-medium" title="ပို့ဆောင်ပြီး">
                                D:{p.deliveredQuantity}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-center text-slate-700 font-medium text-xs">
                        {p.orderCount} ကြိမ်
                      </td>
                      <td className="px-4 py-3 text-right text-slate-600 text-xs">
                        {formatNumber(p.averageUnitPrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">
                        {formatNumber(p.totalRevenue)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleOpenProductOrders(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-primary/30 text-primary hover:bg-primary/5 transition-colors"
                          title="ဤပစ္စည်း ပါဝင်သော အော်ဒါများကို ကြည့်မည်"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          အော်ဒါများ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      ရွေးချယ်ထားသော ရက်စွဲအတွင်း မှာယူထားသည့် ကုန်ပစ္စည်းမှတ်တမ်း မရှိပါ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Orders containing this product */}
      {showProductOrdersModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-3">
                {selectedProduct.image ? (
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.productName}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    PTT
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-800 text-base">
                    {selectedProduct.productName}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                    <span>ကုဒ်: <strong className="text-slate-700 font-mono">{selectedProduct.productCode || "-"}</strong></span>
                    <span>•</span>
                    <span>မှာယူထားသော စုစုပေါင်း: <strong className="text-purple-700 font-bold">{formatNumber(selectedProduct.totalQuantity)} {selectedProduct.unit}</strong></span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowProductOrdersModal(false);
                  setSelectedProduct(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content - Table of Orders */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {loadingOrders ? (
                <div className="py-16 text-center text-slate-500">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm">အော်ဒါများ ဆွဲတင်နေပါသည်...</p>
                </div>
              ) : productOrders.length > 0 ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600 text-xs">
                      <tr>
                        <th className="px-4 py-2.5 text-left">အော်ဒါနံပါတ်</th>
                        <th className="px-4 py-2.5 text-left">ရက်စွဲ</th>
                        <th className="px-4 py-2.5 text-left">ဝယ်ယူသူ</th>
                        <th className="px-4 py-2.5 text-center font-bold text-purple-900 bg-purple-50/50">
                          မှာယူအရေအတွက်
                        </th>
                        <th className="px-4 py-2.5 text-right">စျေးနှုန်း</th>
                        <th className="px-4 py-2.5 text-right">ကျသင့်ငွေ</th>
                        <th className="px-4 py-2.5 text-center">အခြေအနေ</th>
                        <th className="px-4 py-2.5 text-right">အသေးစိတ်</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {productOrders.map((ord) => (
                        <tr key={ord._id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-primary">
                            {ord.orderNumber}
                          </td>
                          <td className="px-4 py-3 text-slate-600 text-xs">
                            {formatDisplayDate(ord.createdAt)}
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-slate-800 text-xs sm:text-sm">
                              {ord.customerName}
                            </p>
                            {ord.customerPhone && (
                              <p className="text-xs text-slate-400">{ord.customerPhone}</p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center bg-purple-50/20 font-bold text-purple-700 text-sm">
                            {ord.quantity} {ord.unit}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-600 text-xs">
                            {formatNumber(ord.unitPrice)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-slate-800 text-xs sm:text-sm">
                            {formatNumber(ord.subtotal)}
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
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => handleOpenOrderDetail(ord._id)}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              ကြည့်မည်
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400">
                  ဤပစ္စည်းအတွက် အော်ဒါမှတ်တမ်း မရှိပါ
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => {
                  setShowProductOrdersModal(false);
                  setSelectedProduct(null);
                }}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-xl transition-colors"
              >
                ပိတ်မည်
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Order Detail Modal */}
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
