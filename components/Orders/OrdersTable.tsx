import React, { useState } from "react";
import {
  RefreshCw,
  Eye,
  ShoppingBag,
  Store,
  CreditCard,
  UserPlus,
  User,
  UserCircle,
  Trash2,
  Loader2,
} from "lucide-react";
import { Order, OrderPagination } from "../../services/Order/fetchOrders";
import { OrdersPagination as OrdersPaginationBar } from "./OrdersPagination";
import { deleteOrder } from "../../services/Order/deleteOrder";
import {
  getStatusColor,
  getPaymentTypeLabel,
  getPaymentMethodLabel,
  getPaymentTypeColor,
  formatDate,
} from "./orderUtils";
import { toast } from "sonner";
import { useApp } from "../../context/AppContext";
import { useLanguage } from "../../context/LanguageContext";

interface OrdersTableProps {
  loading: boolean;
  orders: Order[];
  onViewOrder: (orderId: string) => void;
  onOpenCreditPersonModal: (order: Order) => void;
  onOrderDeleted?: () => void; // Callback to refresh orders after deletion
  pagination?: OrderPagination | null;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({
  loading,
  orders,
  onViewOrder,
  onOpenCreditPersonModal,
  onOrderDeleted,
  pagination,
  onPageChange,
  onLimitChange,
}) => {
  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");
  const userRole = adminData.role;
  console.log(userRole);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  // Check if user can delete orders (admin or owner only)
  const { t } = useLanguage();
  const canDeleteOrder = userRole.role === "owner";

  const handleDeleteOrder = async (orderId: string, orderNumber: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete order ${orderNumber}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setDeletingOrderId(orderId);
    try {
      const response = await deleteOrder(orderId);

      if (response.success) {
        toast.success(t("orders.deleteSuccess").replace("{order}", orderNumber));
        if (onOrderDeleted) {
          onOrderDeleted();
        }
      } else {
        toast.error(response.message || t("orders.deleteFailed"));
      }
    } catch (error: any) {
      console.error("Error deleting order:", error);
      toast.error(error.message || "Failed to delete order");
    } finally {
      setDeletingOrderId(null);
    }
  };
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
        <RefreshCw className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
        <p className="text-slate-500">{t("orders.loadingOrders")}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-12 text-center">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">{t("orders.noOrders")}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      {/* Mobile scroll indicator */}
      <div className="sm:hidden px-4 py-2 bg-slate-50 text-xs text-slate-500 text-center">
        {t("common.swipeMore")}
      </div>

      {/* Table container with horizontal scroll on mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left min-w-[800px]">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-2 sm:px-4 py-3 font-semibold text-slate-600">
                <span className="hidden sm:inline">{t("orders.orderNumber")}</span>
                <span className="sm:hidden">{t("orders.orderNumber")}</span>
              </th>
              {/* <th className="p-4 font-semibold text-slate-600">Storefront</th> */}
              <th className="px-2 sm:px-4 py-3 font-semibold text-slate-600">
                <span className="hidden sm:inline">{t("orders.items")}</span>
                <span className="sm:hidden">{t("orders.items")}</span>
              </th>
              <th className="px-2 sm:px-4 py-3 font-semibold text-slate-600">
                <span className="hidden sm:inline">{t("orders.finalAmount")}</span>
                <span className="sm:hidden">{t("common.total")}</span>
              </th>
              <th className="px-2 sm:px-4 py-3 font-semibold text-slate-600">
                <span className="hidden sm:inline">{t("common.paid")}</span>
                <span className="sm:hidden">{t("common.paid")}</span>
              </th>
              <th className="px-2 sm:px-4 py-3 font-semibold text-slate-600">
                <span className="hidden sm:inline">{t("orders.method")}</span>
                <span className="sm:hidden">{t("orders.method")}</span>
              </th>
              {/* <th className="p-4 font-semibold text-slate-600">Sold By</th> */}
              {/* <th className="p-4 font-semibold text-slate-600">Credit Person</th> */}
              {/* <th className="p-4 font-semibold text-slate-600">Status</th> */}
              {/* <th className="p-4 font-semibold text-slate-600">Date</th> */}
              <th className="px-2 sm:px-4 py-3 font-semibold text-slate-600">
                <span className="hidden sm:inline">{t("common.actions")}</span>
                <span className="sm:hidden">{t("common.actions")}</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-slate-50">
                <td className="px-2 sm:px-4 py-3 font-medium text-blue-600 text-xs sm:text-sm">
                  {order.orderNumber}
                </td>
                {/* <td className="p-4">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-slate-400" />
                  <span>
                    {order.storefrontId?.locationName ||
                      order.storefrontId?.storefrontName ||
                      "-"}
                  </span>
                </div>
              </td> */}
                <td className="px-2 sm:px-4 py-3">
                  <span className="bg-slate-100 px-2 py-1 rounded text-xs font-medium">
                    {order.ordersProducts?.length || 0} {t("pos.itemsLower") || "item(s)"}
                  </span>
                </td>
                <td className="px-2 sm:px-4 py-3 font-bold text-slate-800 text-xs sm:text-sm">
                  {order.finalAmount?.toLocaleString()}{" "}
                  <span className="hidden sm:inline">MMK</span>
                </td>
                <td className="px-2 sm:px-4 py-3 font-bold text-green-600 text-xs sm:text-sm">
                  {order.paidAmount?.toLocaleString()}{" "}
                  <span className="hidden sm:inline">MMK</span>
                </td>

                <td className="px-2 sm:px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm">
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </span>
                  </div>
                </td>
                {/* <td className="p-4">
                {order.soldBy ? (
                  <div className="flex items-center gap-2">
                    <UserCircle className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs font-medium text-slate-800">
                        {order.soldBy.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.soldBy.role}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">-</span>
                )}
              </td> */}
                {/* <td className="p-4">
                {order.creditPersonId &&
                typeof order.creditPersonId === "object" ? (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <div>
                      <p className="text-xs font-medium text-slate-800">
                        {order.creditPersonId.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {order.creditPersonId.phone}
                      </p>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-400 text-xs">-</span>
                )}
              </td> */}
                {/* <td className="p-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(
                    order.orderStatus
                  )}`}
                >
                  {order.orderStatus?.toUpperCase()}
                </span>
              </td>
              <td className="p-4 text-slate-500 text-xs">
                {formatDate(order.createdAt)}
              </td> */}
                <td className="px-2 sm:px-4 py-3">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      onClick={() => onViewOrder(order._id)}
                      className="text-xs bg-primary/20 text-yellow-800 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded hover:bg-primary/30 border border-primary/30 font-medium transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />{" "}
                      <span className="hidden xl:inline">{t("common.view")}</span>
                      <span className="xl:hidden sm:hidden">V</span>
                    </button>
                    {canDeleteOrder && (
                      <button
                        onClick={() =>
                          handleDeleteOrder(order._id, order.orderNumber)
                        }
                        disabled={deletingOrderId === order._id}
                        className="text-xs bg-red-100 text-red-700 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded hover:bg-red-200 border border-red-300 font-medium transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingOrderId === order._id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />
                            <span className="hidden xl:inline">{t("common.deleting")}</span>
                            <span className="xl:hidden sm:hidden">...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3 h-3" />
                            <span className="hidden xl:inline">{t("common.delete")}</span>
                            <span className="xl:hidden sm:hidden">D</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && onPageChange && pagination.totalPages > 1 && (
        <OrdersPaginationBar
          pagination={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
        />
      )}
    </div>
  );
};
