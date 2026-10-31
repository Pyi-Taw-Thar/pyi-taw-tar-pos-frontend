import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  ShoppingBag,
  DollarSign,
  Eye,
  Loader2,
  Award,
  Layers,
  RefreshCw,
  CreditCard,
  X,
  History,
  Ban,
  ShieldCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Package,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { toast } from "sonner";
import {
  fetchCustomerSummary,
  CustomerSummaryData,
} from "../services/Customer/fetchCustomerSummary";
import {
  fetchCustomerOrders,
  CustomerOrderRow,
  CustomerOrdersPagination,
  CustomerOrderSource,
} from "../services/Customer/fetchCustomerOrders";
import {
  fetchCustomerProducts,
  CustomerProductsData,
  CustomerProductRow,
} from "../services/Customer/fetchCustomerProducts";
import { payCustomerCredit } from "../services/Customer/payCustomerCredit";
import {
  toggleCreditPerson,
  updateCustomerBlacklist,
} from "../services/Customer/toggleCreditPerson";
import { fetchEcommerceOrderById } from "../services/Ecommerce/fetchEcommerceOrderById";
import type { EcommerceOrder } from "../services/Ecommerce/fetchEcommerceOrders";
import { EcommerceOrderDetailModal } from "../components/Ecommerce/EcommerceOrderDetailModal";
import { fetchOrderById } from "../services/Order/fetchOrderById";
import type { Order } from "../services/Order/fetchOrders";
import { OrderDetailModal } from "../components/Orders/OrderDetailModal";

const formatDisplayDate = (iso?: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDisplayDateTime = (iso?: string | null) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatNumber = (num?: number | null) => {
  return Math.round(num ?? 0).toLocaleString();
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

const STATUS_LABELS_MM: Record<string, string> = {
  pending: "စောင့်ဆိုင်းဆဲ",
  confirmed: "ထုပ်ပိုးဆဲ",
  shipped: "ပို့ဆောင်ဆဲ",
  delivered: "ရောက်ရှိပြီး",
  completed: "ပြီးစီး",
  partially_fulfilled: "တစ်စိတ်တစ်ပိုင်း",
  cancelled: "ပယ်ဖျက်ပြီး",
};

const formatStatusBadge = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-amber-100 text-amber-800";
    case "confirmed":
    case "partially_fulfilled":
      return "bg-blue-100 text-blue-800";
    case "shipped":
      return "bg-indigo-100 text-indigo-800";
    case "delivered":
    case "completed":
      return "bg-emerald-100 text-emerald-800";
    case "cancelled":
      return "bg-rose-100 text-rose-800";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

type ProductSortKey =
  | "productName"
  | "productCode"
  | "totalBaseQty"
  | "totalAmount"
  | "orderCount"
  | "lastPurchaseDate";

const SOURCE_CHIPS: { key: CustomerOrderSource; label: string }[] = [
  { key: "all", label: "အားလုံး" },
  { key: "ecommerce", label: "E-commerce" },
  { key: "pos", label: "POS" },
];

export const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Summary state
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);
  const [summaryData, setSummaryData] = useState<CustomerSummaryData | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "creditPayments">("orders");

  // Header action states (Credit toggle & Blacklist)
  const [togglingCredit, setTogglingCredit] = useState<boolean>(false);
  const [updatingBlacklist, setUpdatingBlacklist] = useState<boolean>(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState<boolean>(false);
  const [blacklistReasonInput, setBlacklistReasonInput] = useState<string>("");

  // Tab 1: Orders filter & data states
  const [orderSource, setOrderSource] = useState<CustomerOrderSource>("all");
  const [orderStatus, setOrderStatus] = useState<string>("all");
  const [orderFrom, setOrderFrom] = useState<string>("");
  const [orderTo, setOrderTo] = useState<string>("");
  const [orderPage, setOrderPage] = useState<number>(1);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [orders, setOrders] = useState<CustomerOrderRow[]>([]);
  const [ordersPagination, setOrdersPagination] = useState<CustomerOrdersPagination | null>(null);

  // Tab 2: Products filter, data & sort states
  const [productSource, setProductSource] = useState<CustomerOrderSource>("all");
  const [productFrom, setProductFrom] = useState<string>("");
  const [productTo, setProductTo] = useState<string>("");
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [productsData, setProductsData] = useState<CustomerProductsData | null>(null);
  const [sortKey, setSortKey] = useState<ProductSortKey>("totalAmount");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Order Detail Modals (Ecommerce & POS)
  const [selectedEcomOrder, setSelectedEcomOrder] = useState<EcommerceOrder | null>(null);
  const [ecomModalOpen, setEcomModalOpen] = useState<boolean>(false);
  const [loadingEcomDetail, setLoadingEcomDetail] = useState<boolean>(false);

  const [selectedPosOrder, setSelectedPosOrder] = useState<Order | null>(null);
  const [posModalOpen, setPosModalOpen] = useState<boolean>(false);
  const [loadingPosDetail, setLoadingPosDetail] = useState<boolean>(false);

  // Pay Credit Modal states
  const [showPayCreditModal, setShowPayCreditModal] = useState<boolean>(false);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState<boolean>(false);
  const [payAmountInput, setPayAmountInput] = useState<string>("");
  const [payMethod, setPayMethod] = useState<string>("cash");
  const [payNotes, setPayNotes] = useState<string>("");

  const loadSummary = useCallback(async () => {
    if (!id) return;
    setSummaryLoading(true);
    try {
      const res = await fetchCustomerSummary(id);
      if (res.success && res.data) {
        setSummaryData(res.data);
      } else {
        toast.error(res.message || "Customer အချက်အလက် ဆွဲတင်၍ မရပါ");
      }
    } catch (err: any) {
      console.error("Error loading customer summary:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "Customer အချက်အလက် ဆွဲတင်၍ မရပါ"
      );
    } finally {
      setSummaryLoading(false);
    }
  }, [id]);

  const loadOrders = useCallback(async () => {
    if (!id) return;
    setOrdersLoading(true);
    try {
      const res = await fetchCustomerOrders(id, {
        source: orderSource,
        status: orderStatus !== "all" ? orderStatus : undefined,
        from: orderFrom || undefined,
        to: orderTo || undefined,
        page: orderPage,
        limit: 20,
      });
      if (res.success) {
        setOrders(res.data || []);
        setOrdersPagination(res.pagination || null);
      }
    } catch (err: any) {
      console.error("Error loading customer orders:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "အော်ဒါစာရင်း ဆွဲတင်၍ မရပါ"
      );
    } finally {
      setOrdersLoading(false);
    }
  }, [id, orderSource, orderStatus, orderFrom, orderTo, orderPage]);

  const loadProducts = useCallback(async () => {
    if (!id) return;
    setProductsLoading(true);
    try {
      const res = await fetchCustomerProducts(id, {
        source: productSource,
        from: productFrom || undefined,
        to: productTo || undefined,
      });
      if (res.success && res.data) {
        setProductsData(res.data);
      }
    } catch (err: any) {
      console.error("Error loading customer products:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "ပစ္စည်းစာရင်း ဆွဲတင်၍ မရပါ"
      );
    } finally {
      setProductsLoading(false);
    }
  }, [id, productSource, productFrom, productTo]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const refreshAll = async () => {
    await Promise.all([loadSummary(), loadOrders(), loadProducts()]);
  };

  // Creditဝယ်ခွင့် ဖွင့်/ပိတ် toggle
  const handleToggleCredit = async () => {
    if (!id || togglingCredit) return;
    setTogglingCredit(true);
    try {
      const res = await toggleCreditPerson(id);
      if (res.success) {
        toast.success(
          res.data?.isCreditPerson
            ? "အကြွေးဝယ်ခွင့် ဖွင့်ပေးလိုက်ပါပြီ"
            : "အကြွေးဝယ်ခွင့် ပိတ်လိုက်ပါပြီ"
        );
        await loadSummary();
      } else {
        toast.error(res.message || "အကြွေးဝယ်ခွင့် ပြောင်း၍ မရပါ");
      }
    } finally {
      setTogglingCredit(false);
    }
  };

  // Blacklist သွင်းခြင်း / ပယ်ဖျက်ခြင်း
  const handleBlacklistClick = async () => {
    if (!id || !summaryData || updatingBlacklist) return;
    const isCurrentlyBlacklisted = Boolean(summaryData.customer.blacklist);

    if (isCurrentlyBlacklisted) {
      setUpdatingBlacklist(true);
      try {
        const res = await updateCustomerBlacklist(id, false);
        if (res.success) {
          toast.success("Blacklist မှ ပယ်ဖျက်ပြီးပါပြီ");
          await loadSummary();
        } else {
          toast.error(res.message || "Blacklist ပယ်ဖျက်၍ မရပါ");
        }
      } finally {
        setUpdatingBlacklist(false);
      }
    } else {
      setBlacklistReasonInput("");
      setShowBlacklistModal(true);
    }
  };

  const handleConfirmBlacklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setUpdatingBlacklist(true);
    try {
      const res = await updateCustomerBlacklist(
        id,
        true,
        blacklistReasonInput.trim() || undefined
      );
      if (res.success) {
        toast.success("Customer ကို Blacklist သွင်းပြီးပါပြီ");
        setShowBlacklistModal(false);
        await loadSummary();
      } else {
        toast.error(res.message || "Blacklist သွင်း၍ မရပါ");
      }
    } finally {
      setUpdatingBlacklist(false);
    }
  };

  // Order Row နှိပ်လျှင် E-commerce သို့မဟုတ် POS Detail Modal ဖွင့်ခြင်း
  const handleOpenOrderRow = async (row: CustomerOrderRow) => {
    if (row.source === "ecommerce") {
      setLoadingEcomDetail(true);
      setEcomModalOpen(true);
      try {
        const res = await fetchEcommerceOrderById(row._id);
        if (res.success && res.data) {
          setSelectedEcomOrder(res.data);
        } else {
          toast.error(res.message || "အော်ဒါ အသေးစိတ် ဖွင့်၍ မရပါ");
          setEcomModalOpen(false);
        }
      } catch (err: any) {
        toast.error(err?.message || "အော်ဒါ အသေးစိတ် ဖွင့်၍ မရပါ");
        setEcomModalOpen(false);
      } finally {
        setLoadingEcomDetail(false);
      }
    } else {
      setLoadingPosDetail(true);
      setPosModalOpen(true);
      try {
        const res = await fetchOrderById(row._id);
        if (res.success && res.data) {
          setSelectedPosOrder(res.data);
        } else {
          toast.error(res.message || "POS အော်ဒါ အသေးစိတ် ဖွင့်၍ မရပါ");
          setPosModalOpen(false);
        }
      } catch (err: any) {
        toast.error(err?.message || "POS အော်ဒါ အသေးစိတ် ဖွင့်၍ မရပါ");
        setPosModalOpen(false);
      } finally {
        setLoadingPosDetail(false);
      }
    }
  };

  // အကြွေးဆပ်မည် Modal ဖွင့်ခြင်း (default/max = payableRemaining)
  const handleOpenPayCredit = () => {
    const payable = summaryData?.payableRemaining ?? 0;
    if (payable <= 0) return;
    setPayAmountInput(String(payable));
    setPayMethod("cash");
    setPayNotes("");
    setShowPayCreditModal(true);
  };

  const handleSubmitPayCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const amount = Number(payAmountInput);
    if (!amount || amount <= 0) {
      toast.error("ကျေးဇူးပြု၍ ပေးဆပ်မည့် ငွေပမာဏကို မှန်ကန်စွာ ထည့်သွင်းပါ");
      return;
    }

    const payable = summaryData?.payableRemaining ?? 0;
    if (amount > payable) {
      toast.error(
        `ဆပ်ငွေသည် ယခု ဆပ်နိုင်သော ကျန်ငွေ (${formatNumber(payable)} MMK) ထက် များနေပါသည်`
      );
      return;
    }

    setIsSubmittingPayment(true);
    try {
      const res = await payCustomerCredit(id, {
        paidAmount: amount,
        paymentMethod: payMethod,
        notes: payNotes.trim() || undefined,
      });

      if (res.success) {
        toast.success(`အကြွေး ${formatNumber(amount)} MMK အောင်မြင်စွာ ဆပ်ပြီးပါပြီ`);
        setShowPayCreditModal(false);
        await refreshAll();
      } else {
        toast.error(res.message || "အကြွေးဆပ်ခြင်း မအောင်မြင်ပါ");
      }
    } catch (err: any) {
      console.error("Error submitting credit payment:", err);
      toast.error(
        err?.response?.data?.message || err?.message || "အကြွေးဆပ်ခြင်း မအောင်မြင်ပါ"
      );
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // ပစ္စည်းဇယား ခေါင်းစဉ်နှိပ်၍ စီပြောင်းခြင်း
  const handleSortProducts = (key: ProductSortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortKey(key);
      setSortDir(key === "productName" || key === "productCode" ? "asc" : "desc");
    }
  };

  const sortedProducts = useMemo((): CustomerProductRow[] => {
    const list = [...(productsData?.products || [])];
    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      switch (sortKey) {
        case "productName":
          return a.productName.localeCompare(b.productName) * dir;
        case "productCode":
          return (a.productCode || "").localeCompare(b.productCode || "") * dir;
        case "totalBaseQty":
          return (a.totalBaseQty - b.totalBaseQty) * dir;
        case "orderCount":
          return (a.orderCount - b.orderCount) * dir;
        case "lastPurchaseDate": {
          const da = a.lastPurchaseDate ? new Date(a.lastPurchaseDate).getTime() : 0;
          const db = b.lastPurchaseDate ? new Date(b.lastPurchaseDate).getTime() : 0;
          return (da - db) * dir;
        }
        case "totalAmount":
        default:
          return (a.totalAmount - b.totalAmount) * dir;
      }
    });
    return list;
  }, [productsData?.products, sortKey, sortDir]);

  const renderSortIcon = (key: ProductSortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />;
    return sortDir === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-primary" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-primary" />
    );
  };

  if (summaryLoading && !summaryData) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-slate-500 text-sm">Customer အချက်အလက်များ ဆွဲတင်နေပါသည်...</p>
      </div>
    );
  }

  if (!summaryData) {
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

  const {
    customer,
    totalPurchase,
    creditRemaining,
    payableRemaining,
    creditPaid,
    orderCount,
    lastOrderDate,
    creditPayments = [],
  } = summaryData;

  const isPayDisabled = payableRemaining <= 0;
  const payDisabledTooltip = "ပို့ပြီးသော အော်ဒါ မရှိသေး၍ ဆပ်၍ မရသေးပါ";

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => navigate("/customers")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ဖောက်သည်များ စာရင်း</span>
        </button>

        <div className="flex items-center gap-2">
          <span
            title={isPayDisabled ? payDisabledTooltip : undefined}
            className="inline-block"
          >
            <button
              onClick={handleOpenPayCredit}
              disabled={isPayDisabled}
              title={isPayDisabled ? payDisabledTooltip : "အကြွေးဆပ်မည်"}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
            >
              <CreditCard className="w-3.5 h-3.5" />
              အကြွေးဆပ်မည်
            </button>
          </span>

          <button
            onClick={refreshAll}
            disabled={summaryLoading}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${summaryLoading ? "animate-spin" : ""}`} />
            ပြန်တင်မည်
          </button>
        </div>
      </div>

      {/* Header: Customer Profile + Credit Toggle + Blacklist */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl flex-shrink-0">
              {customer?.name?.charAt(0)?.toUpperCase() || "C"}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800">{customer?.name}</h1>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${getTierColor(
                    customer?.tier
                  )}`}
                >
                  <Award className="w-3 h-3" />
                  {customer?.tier || "standard"}
                </span>
                {customer?.isCreditPerson ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    အကြွေးဝယ်ခွင့် ရှိ
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    အကြွေးဝယ်ခွင့် ပိတ်ထား
                  </span>
                )}
                {customer?.blacklist && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                    <Ban className="w-3 h-3" />
                    Blacklist
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
                  {[customer?.address, customer?.township].filter(Boolean).join(", ") || "-"}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  စတင်ချိတ်ဆက်: {formatDisplayDate(customer?.createdAt)}
                </span>
                {lastOrderDate && (
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5 text-slate-400" />
                    နောက်ဆုံးအော်ဒါ: {formatDisplayDate(lastOrderDate)}
                  </span>
                )}
              </div>

              {customer?.blacklist && customer?.blacklistReason && (
                <p className="mt-2 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-2.5 py-1 inline-block">
                  ပိတ်ပင်ရသည့် အကြောင်းရင်း: {customer.blacklistReason}
                </p>
              )}
            </div>
          </div>

          {/* Credit Toggle & Blacklist Controls */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <button
              type="button"
              onClick={handleToggleCredit}
              disabled={togglingCredit}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                customer?.isCreditPerson
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
              }`}
            >
              <span
                className={`w-7 h-4 rounded-full relative transition-colors ${
                  customer?.isCreditPerson ? "bg-emerald-600" : "bg-slate-400"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${
                    customer?.isCreditPerson ? "left-3.5" : "left-0.5"
                  }`}
                />
              </span>
              <span>အကြွေးဝယ်ခွင့်</span>
            </button>

            <button
              type="button"
              onClick={handleBlacklistClick}
              disabled={updatingBlacklist}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                customer?.blacklist
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                  : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
              }`}
            >
              {customer?.blacklist ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Blacklist မှ ပယ်ဖျက်မည်
                </>
              ) : (
                <>
                  <Ban className="w-3.5 h-3.5" />
                  Blacklist သွင်းမည်
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards (3 Cards per Plan §2.10) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: စုစုပေါင်း ဝယ်ယူငွေ */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">စုစုပေါင်း ဝယ်ယူငွေ</p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-800 mt-2">
            {formatNumber(totalPurchase)}{" "}
            <span className="text-sm font-normal text-slate-500">MMK</span>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            စုစုပေါင်း {formatNumber(orderCount?.total)} အော်ဒါ (E-commerce:{" "}
            {formatNumber(orderCount?.ecommerce)}, POS: {formatNumber(orderCount?.pos)})
          </p>
        </div>

        {/* Card 2: အကြွေး လက်ကျန် */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">အကြွေး လက်ကျန်</p>
            <div
              className={`p-2 rounded-lg ${
                creditRemaining > 0
                  ? "bg-rose-50 text-rose-600"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p
            className={`text-2xl font-bold mt-2 ${
              creditRemaining > 0 ? "text-rose-600" : "text-slate-800"
            }`}
          >
            {formatNumber(creditRemaining)}{" "}
            <span className="text-sm font-normal text-slate-500">MMK</span>
          </p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-slate-600">
              ယခုဆပ်နိုင်: <strong className="text-emerald-700">{formatNumber(payableRemaining)} MMK</strong>
            </span>
            {creditRemaining > 0 && isPayDisabled && (
              <span className="text-[11px] text-amber-700">
                {payDisabledTooltip}
              </span>
            )}
          </div>
        </div>

        {/* Card 3: အကြွေး ဆပ်ပြီးငွေ */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-slate-500">အကြွေး ဆပ်ပြီးငွေ</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <History className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {formatNumber(creditPaid)}{" "}
            <span className="text-sm font-normal text-slate-500">MMK</span>
          </p>
          <p className="mt-2 text-xs text-slate-500">
            ဆပ်ပြီးအကြိမ်ရေ {formatNumber(creditPayments.length)} ကြိမ်
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex flex-wrap gap-6">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === "orders"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            အော်ဒါများ ({formatNumber(ordersPagination?.totalItems ?? orderCount?.total)})
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === "products"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            ဝယ်ထားသော ပစ္စည်းများ ({formatNumber(productsData?.totals.uniqueProducts ?? 0)})
          </button>
          <button
            onClick={() => setActiveTab("creditPayments")}
            className={`pb-3 text-sm font-semibold transition-colors relative ${
              activeTab === "creditPayments"
                ? "text-primary border-b-2 border-primary"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            အကြွေးဆပ် မှတ်တမ်း ({formatNumber(creditPayments.length)})
          </button>
        </nav>
      </div>

      {/* TAB 1: အော်ဒါများ */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 gap-1">
              {SOURCE_CHIPS.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => {
                    setOrderSource(chip.key);
                    setOrderPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    orderSource === chip.key
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={orderStatus}
                onChange={(e) => {
                  setOrderStatus(e.target.value);
                  setOrderPage(1);
                }}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="all">အခြေအနေ အားလုံး</option>
                <option value="pending">စောင့်ဆိုင်းဆဲ (pending)</option>
                <option value="confirmed">ထုပ်ပိုးဆဲ (confirmed)</option>
                <option value="shipped">ပို့ဆောင်ဆဲ (shipped)</option>
                <option value="delivered">ရောက်ရှိပြီး (delivered)</option>
                <option value="completed">ပြီးစီး (completed)</option>
                <option value="partially_fulfilled">တစ်စိတ်တစ်ပိုင်း (partially_fulfilled)</option>
                <option value="cancelled">ပယ်ဖျက်ပြီး (cancelled)</option>
              </select>

              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <span>မှ</span>
                <input
                  type="date"
                  value={orderFrom}
                  onChange={(e) => {
                    setOrderFrom(e.target.value);
                    setOrderPage(1);
                  }}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                />
                <span>ထိ</span>
                <input
                  type="date"
                  value={orderTo}
                  onChange={(e) => {
                    setOrderTo(e.target.value);
                    setOrderPage(1);
                  }}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                />
              </div>

              {(orderSource !== "all" || orderStatus !== "all" || orderFrom || orderTo) && (
                <button
                  type="button"
                  onClick={() => {
                    setOrderSource("all");
                    setOrderStatus("all");
                    setOrderFrom("");
                    setOrderTo("");
                    setOrderPage(1);
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Filter ရှင်းမည်
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">အော်ဒါနံပါတ်</th>
                  <th className="px-4 py-3 text-left">ရက်စွဲ</th>
                  <th className="px-4 py-3 text-center">Source</th>
                  <th className="px-4 py-3 text-center">အခြေအနေ</th>
                  <th className="px-4 py-3 text-center">ပစ္စည်း</th>
                  <th className="px-4 py-3 text-right">ကျသင့်ငွေ</th>
                  <th className="px-4 py-3 text-right">ပေးပြီး</th>
                  <th className="px-4 py-3 text-right">ကျန်ငွေ</th>
                  <th className="px-4 py-3 text-right">အသေးစိတ်</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ordersLoading ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-1 text-primary" />
                      အော်ဒါစာရင်း ဆွဲတင်နေပါသည်...
                    </td>
                  </tr>
                ) : orders.length > 0 ? (
                  orders.map((ord) => (
                    <tr
                      key={`${ord.source}-${ord._id}`}
                      onClick={() => handleOpenOrderRow(ord)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-primary">
                        {ord.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {formatDisplayDateTime(ord.date)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            ord.source === "ecommerce"
                              ? "bg-sky-100 text-sky-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {ord.source === "ecommerce" ? "E-commerce" : "POS"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${formatStatusBadge(
                            ord.status
                          )}`}
                        >
                          {STATUS_LABELS_MM[ord.status] || ord.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600 text-xs">
                        {formatNumber(ord.itemCount)} မျိုး
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">
                        {formatNumber(ord.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-emerald-600">
                        {formatNumber(ord.paidAmount)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-bold ${
                          ord.remaining > 0 ? "text-rose-600" : "text-slate-400"
                        }`}
                      >
                        {formatNumber(ord.remaining)}
                      </td>
                      <td
                        className="px-4 py-3 text-right"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenOrderRow(ord);
                        }}
                      >
                        <button
                          type="button"
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
                    <td colSpan={9} className="py-10 text-center text-slate-400">
                      မှာယူထားသော အော်ဒါ မရှိသေးပါ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {ordersPagination && ordersPagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 bg-slate-50/50">
              <span>
                စုစုပေါင်း {formatNumber(ordersPagination.totalItems)} အော်ဒါ (စာမျက်နှာ{" "}
                {ordersPagination.currentPage} / {ordersPagination.totalPages})
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={orderPage <= 1}
                  onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  ယခင်
                </button>
                <button
                  type="button"
                  disabled={orderPage >= ordersPagination.totalPages}
                  onClick={() =>
                    setOrderPage((p) => Math.min(ordersPagination.totalPages, p + 1))
                  }
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
                >
                  နောက်သို့
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ဝယ်ထားသော ပစ္စည်းများ */}
      {activeTab === "products" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 gap-1">
              {SOURCE_CHIPS.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => setProductSource(chip.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                    productSource === chip.key
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-600 hover:bg-white"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span>မှ</span>
              <input
                type="date"
                value={productFrom}
                onChange={(e) => setProductFrom(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
              />
              <span>ထိ</span>
              <input
                type="date"
                value={productTo}
                onChange={(e) => setProductTo(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
              />
              {(productSource !== "all" || productFrom || productTo) && (
                <button
                  type="button"
                  onClick={() => {
                    setProductSource("all");
                    setProductFrom("");
                    setProductTo("");
                  }}
                  className="px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  Filter ရှင်းမည်
                </button>
              )}
            </div>
          </div>

          {/* Product Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">ပစ္စည်း အမျိုးအရေအတွက်</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {formatNumber(productsData?.totals.uniqueProducts ?? 0)} မျိုး
                </p>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <Package className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 font-medium">စုစုပေါင်း ငွေ</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {formatNumber(productsData?.totals.totalAmount ?? 0)}{" "}
                  <span className="text-xs font-normal text-slate-500">MMK</span>
                </p>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <p className="text-xs text-slate-500 font-medium">အများဆုံး ဝယ်သော ပစ္စည်း</p>
                <p className="text-base font-bold text-slate-800 mt-1 truncate">
                  {productsData?.totals.topProduct?.productName || "-"}
                </p>
                {productsData?.totals.topProduct && (
                  <p className="text-xs text-slate-500 mt-0.5">
                    {productsData.totals.topProduct.displayQty} •{" "}
                    {formatNumber(productsData.totals.topProduct.totalAmount)} MMK
                  </p>
                )}
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Monthly Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-800 text-sm mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              လအလိုက် ဝယ်ယူငွေ (နောက်ဆုံး ၁၂ လ)
            </h3>
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productsData?.monthly || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickFormatter={(val: number) =>
                      val >= 1000 ? `${Math.round(val / 1000)}k` : String(val)
                    }
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `${formatNumber(value)} MMK`,
                      "ဝယ်ယူငွေ",
                    ]}
                  />
                  <Bar dataKey="amount" fill="#0284c7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sortable Products Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs">
                  <tr>
                    <th
                      onClick={() => handleSortProducts("productName")}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-slate-100 select-none"
                    >
                      <span className="inline-flex items-center gap-1">
                        ပစ္စည်း {renderSortIcon("productName")}
                      </span>
                    </th>
                    <th
                      onClick={() => handleSortProducts("productCode")}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-slate-100 select-none"
                    >
                      <span className="inline-flex items-center gap-1">
                        ကုဒ် {renderSortIcon("productCode")}
                      </span>
                    </th>
                    <th
                      onClick={() => handleSortProducts("totalBaseQty")}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-slate-100 select-none"
                    >
                      <span className="inline-flex items-center gap-1">
                        အရေအတွက် {renderSortIcon("totalBaseQty")}
                      </span>
                    </th>
                    <th
                      onClick={() => handleSortProducts("totalAmount")}
                      className="px-4 py-3 text-right cursor-pointer hover:bg-slate-100 select-none"
                    >
                      <span className="inline-flex items-center justify-end gap-1">
                        ငွေ (MMK) {renderSortIcon("totalAmount")}
                      </span>
                    </th>
                    <th
                      onClick={() => handleSortProducts("orderCount")}
                      className="px-4 py-3 text-center cursor-pointer hover:bg-slate-100 select-none"
                    >
                      <span className="inline-flex items-center gap-1">
                        အကြိမ် {renderSortIcon("orderCount")}
                      </span>
                    </th>
                    <th
                      onClick={() => handleSortProducts("lastPurchaseDate")}
                      className="px-4 py-3 text-left cursor-pointer hover:bg-slate-100 select-none"
                    >
                      <span className="inline-flex items-center gap-1">
                        နောက်ဆုံးဝယ်ရက် {renderSortIcon("lastPurchaseDate")}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productsLoading ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-1 text-primary" />
                        ပစ္စည်းစာရင်း ဆွဲတင်နေပါသည်...
                      </td>
                    </tr>
                  ) : sortedProducts.length > 0 ? (
                    sortedProducts.map((p) => (
                      <tr key={p.inventoryId} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {p.productName}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {p.productCode || "-"}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {p.displayQty}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600">
                          {formatNumber(p.totalAmount)}
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600 text-xs">
                          {formatNumber(p.orderCount)} ကြိမ်
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">
                          {formatDisplayDate(p.lastPurchaseDate)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        ဝယ်ယူထားသော ပစ္စည်းမှတ်တမ်း မရှိသေးပါ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: အကြွေးဆပ် မှတ်တမ်း */}
      {activeTab === "creditPayments" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              အကြွေးဆပ် မှတ်တမ်းများ
            </h3>
            <span className="text-xs text-slate-500">
              စုစုပေါင်း {formatNumber(creditPayments.length)} ကြိမ်
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">ရက်စွဲ နှင့် အချိန်</th>
                  <th className="px-4 py-3 text-right">ဆပ်ငွေ (MMK)</th>
                  <th className="px-4 py-3 text-center">ပေးချေမှု နည်းလမ်း</th>
                  <th className="px-4 py-3 text-left">သက်ဆိုင်သည့် အော်ဒါ</th>
                  <th className="px-4 py-3 text-left">မှတ်ချက်</th>
                  <th className="px-4 py-3 text-left">မှတ်တမ်းတင်သူ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {creditPayments.length > 0 ? (
                  creditPayments.map((record, idx) => {
                    const ecomNo = record.ecommerceOrderId?.orderNumber;
                    const posNo = record.orderId?.orderNumber;
                    return (
                      <tr key={record._id || idx} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-xs font-semibold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 text-slate-700 text-xs">
                          {formatDisplayDateTime(record.paymentDate)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600">
                          +{formatNumber(record.paidAmount)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                            {record.paymentMethod}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium text-primary text-xs">
                          {ecomNo ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span>{ecomNo}</span>
                              <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-semibold">
                                E-commerce
                              </span>
                            </span>
                          ) : posNo ? (
                            <span className="inline-flex items-center gap-1.5">
                              <span>{posNo}</span>
                              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-semibold">
                                POS
                              </span>
                            </span>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs max-w-[240px] truncate">
                          {record.notes || "-"}
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-xs">
                          {record.addedBy?.name || "-"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400">
                      အကြွေးဆပ် မှတ်တမ်း မရှိသေးပါ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pay Credit Modal */}
      {showPayCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">အကြွေးဆပ်မည်</h3>
                  <p className="text-xs text-slate-500">
                    {customer?.name} ({customer?.phone || "-"})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPayCreditModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayCredit} className="p-6 space-y-4">
              <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-emerald-700 font-medium">
                    ယခု ဆပ်နိုင်သော ပမာဏ (ပို့ပြီး အော်ဒါများ + POS)
                  </p>
                  <p className="text-lg font-bold text-emerald-800 mt-0.5">
                    {formatNumber(payableRemaining)} MMK
                  </p>
                  {creditRemaining > payableRemaining && (
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      စုစုပေါင်း အကြွေးလက်ကျန်: {formatNumber(creditRemaining)} MMK
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setPayAmountInput(String(payableRemaining))}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors shadow-sm"
                >
                  အပြည့်ဆပ်မည်
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ပေးဆပ်မည့် ငွေပမာဏ (MMK) *
                </label>
                <input
                  type="number"
                  min="1"
                  max={payableRemaining}
                  value={payAmountInput}
                  onChange={(e) => setPayAmountInput(e.target.value)}
                  placeholder="ဥပမာ - 30000"
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ငွေပေးချေမှု နည်းလမ်း *
                </label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 bg-white"
                >
                  <option value="cash">လက်ငင်းငွေ (Cash)</option>
                  <option value="kpay">KBZ Pay</option>
                  <option value="wavepay">Wave Pay</option>
                  <option value="ayapay">AYA Pay</option>
                  <option value="uabpay">UAB Pay</option>
                  <option value="bank_transfer">ဘဏ်လွှဲ (Bank Transfer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  မှတ်ချက် (အပိုဆောင်း)
                </label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  placeholder="မှတ်ချက် ရေးရန် (ဥပမာ - KPay Txn ID)"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowPayCreditModal(false)}
                  disabled={isSubmittingPayment}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  {isSubmittingPayment && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  အကြွေးဆပ်မည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blacklist Modal */}
      {showBlacklistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-rose-600" />
                <h3 className="font-bold text-slate-800 text-base">
                  Customer ကို Blacklist သွင်းမည်
                </h3>
              </div>
              <button
                onClick={() => setShowBlacklistModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleConfirmBlacklist} className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Blacklist သွင်းလိုက်ပါက ဤ Customer သည် E-commerce မှ အော်ဒါတင်ခွင့် ပိတ်သွားပါမည်။
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  ပိတ်ပင်ရသည့် အကြောင်းရင်း (အပိုဆောင်း)
                </label>
                <input
                  type="text"
                  value={blacklistReasonInput}
                  onChange={(e) => setBlacklistReasonInput(e.target.value)}
                  placeholder="ဥပမာ - အကြွေး ကာလရှည် မဆပ်ပါ"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBlacklistModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  မလုပ်တော့ပါ
                </button>
                <button
                  type="submit"
                  disabled={updatingBlacklist}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                >
                  Blacklist သွင်းမည်
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* E-commerce Order Detail Modal */}
      <EcommerceOrderDetailModal
        isOpen={ecomModalOpen}
        order={selectedEcomOrder}
        loading={loadingEcomDetail}
        onClose={() => {
          setEcomModalOpen(false);
          setSelectedEcomOrder(null);
        }}
        onOrderUpdate={async () => {
          await refreshAll();
          if (selectedEcomOrder?._id) {
            const updated = await fetchEcommerceOrderById(selectedEcomOrder._id);
            if (updated.success && updated.data) setSelectedEcomOrder(updated.data);
          }
        }}
      />

      {/* POS Order Detail Modal */}
      <OrderDetailModal
        isOpen={posModalOpen}
        loading={loadingPosDetail}
        order={selectedPosOrder}
        onClose={() => {
          setPosModalOpen(false);
          setSelectedPosOrder(null);
        }}
        onOrderUpdate={refreshAll}
      />
    </div>
  );
};
