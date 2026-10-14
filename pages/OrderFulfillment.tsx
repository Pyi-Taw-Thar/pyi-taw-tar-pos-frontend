import React, { useState, useEffect, useCallback } from "react";
import {
  PackageCheck,
  Search,
  RefreshCw,
  Clock,
  Store,
  User,
  Barcode,
  Layers,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchPendingFulfillmentOrders,
} from "../services/Fulfillment/fetchPendingFulfillmentOrders";
import { Order } from "../services/Order/fetchOrders";
import {
  fetchStorefrontProfiles,
  StorefrontProfile,
} from "../services/Storefront/fetchStorefrontProfiles";
import { OrderFulfillmentModal } from "../components/Orders/OrderFulfillmentModal";
import { useLanguage } from "../context/LanguageContext";

export const OrderFulfillment: React.FC = () => {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStorefrontId, setSelectedStorefrontId] = useState<string>("all");
  const [storefronts, setStorefronts] = useState<StorefrontProfile[]>([]);
  const [selectedOrderForFulfill, setSelectedOrderForFulfill] = useState<Order | null>(null);

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [ordersRes, sfRes] = await Promise.all([
        fetchPendingFulfillmentOrders({
          search: search.trim() || undefined,
          storefrontId: selectedStorefrontId !== "all" ? selectedStorefrontId : undefined,
        }),
        storefronts.length === 0 ? fetchStorefrontProfiles() : Promise.resolve(null),
      ]);

      if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data);
      } else {
        setOrders([]);
      }

      if (sfRes && sfRes.success && sfRes.data) {
        setStorefronts(sfRes.data.filter((sf) => sf.status === "active"));
      }
    } catch (err: any) {
      if (!isSilent) {
        toast.error(err?.message || "Failed to load pending orders");
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [search, selectedStorefrontId, storefronts.length]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Auto-refresh every 20 seconds to catch incoming orders from cashiers
  useEffect(() => {
    const timer = setInterval(() => {
      loadData(true);
    }, 20000);
    return () => clearInterval(timer);
  }, [loadData]);

  const totalPendingOrders = orders.length;
  const totalItemsToPack = orders.reduce((sum, ord) => {
    return (
      sum +
      (ord.ordersProducts || []).reduce(
        (pSum, p) => pSum + (p.baseQuantity || p.quantity || 0),
        0
      )
    );
  }, 0);

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {t("fulfillment.title")}
              </h1>
              <p className="text-sm text-slate-500 mt-0.5">
                {t("fulfillment.subtitle")}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => loadData()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {t("fulfillment.refresh")}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-lg">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t("fulfillment.pendingOrdersCount")}
            </span>
            <h3 className="text-2xl font-extrabold text-slate-800">
              {totalPendingOrders}{" "}
              <span className="text-sm font-normal text-slate-500">
                {t("fulfillment.ordersUnit")}
              </span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold text-lg">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t("fulfillment.totalItemsToPack")}
            </span>
            <h3 className="text-2xl font-extrabold text-slate-800">
              {totalItemsToPack}{" "}
              <span className="text-sm font-normal text-slate-500">
                {t("fulfillment.itemsUnit")}
              </span>
            </h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-lg">
            <Barcode className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t("fulfillment.scanStatus")}
            </span>
            <h3 className="text-sm font-semibold text-emerald-700">
              {t("fulfillment.scanStatusDesc")}
            </h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("fulfillment.searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedStorefrontId}
            onChange={(e) => setSelectedStorefrontId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
          >
            <option value="all">{t("fulfillment.allLocations")}</option>
            {storefronts.map((sf) => (
              <option key={sf._id} value={sf._id}>
                {sf.storefrontName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-sm">{t("fulfillment.loadingPending")}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {t("fulfillment.noPendingOrders")}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {t("fulfillment.noPendingOrdersDesc")}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3.5 px-4">{t("fulfillment.colOrderNo")}</th>
                  <th className="py-3.5 px-4">{t("fulfillment.colDateTime")}</th>
                  <th className="py-3.5 px-4">{t("fulfillment.colStorefront")}</th>
                  <th className="py-3.5 px-4">{t("fulfillment.colCustomer")}</th>
                  <th className="py-3.5 px-4">{t("fulfillment.colItems")}</th>
                  <th className="py-3.5 px-4 text-right">{t("fulfillment.colTotal")}</th>
                  <th className="py-3.5 px-4 text-center">{t("fulfillment.colAction")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((ord) => {
                  const itemCount = (ord.ordersProducts || []).reduce(
                    (sum, p) => sum + (p.baseQuantity || p.quantity || 0),
                    0
                  );
                  const speciesCount = ord.ordersProducts?.length || 0;
                  const creditPersonObj =
                    typeof ord.creditPersonId === "object" ? ord.creditPersonId : null;

                  return (
                    <tr
                      key={ord._id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-4 px-4 font-mono font-bold text-primary">
                        {ord.orderNumber}
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-600 whitespace-nowrap">
                        {formatDateTime(ord.orderDate || (ord as any).createdAt)}
                      </td>
                      <td className="py-4 px-4 text-xs font-medium text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {typeof ord.storefrontId === "object"
                              ? ord.storefrontId?.storefrontName
                              : "Warehouse"}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold">
                            {creditPersonObj?.name || ord.customerName || t("fulfillment.retailCustomer")}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs space-y-0.5">
                          <span className="inline-block font-semibold text-slate-800">
                            {t("fulfillment.itemsSpeciesCount", {
                              count: itemCount,
                              species: speciesCount,
                            })}
                          </span>
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {ord.ordersProducts
                              ?.map((p) => `${p.inventoryId?.productName} x ${p.baseQuantity || p.quantity}`)
                              .join(", ")}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right font-bold text-slate-900 whitespace-nowrap">
                        {ord.finalAmount?.toLocaleString()} MMK
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => setSelectedOrderForFulfill(ord)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                        >
                          <Barcode className="w-3.5 h-3.5" />
                          {t("fulfillment.btnFulfillPack")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Fulfillment Scanner Modal */}
      <OrderFulfillmentModal
        show={!!selectedOrderForFulfill}
        order={selectedOrderForFulfill}
        onClose={() => setSelectedOrderForFulfill(null)}
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
};
