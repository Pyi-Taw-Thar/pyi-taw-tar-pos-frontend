import React, { useState } from "react";
import {
  X,
  RefreshCw,
  Receipt,
  Store,
  Calendar,
  CreditCard,
  Package,
  UserCircle,
  User,
  Plus,
  Minus,
  Printer,
} from "lucide-react";
import { Order } from "../../services/Order/fetchOrders";
import {
  getStatusColor,
  getPaymentTypeLabel,
  getPaymentMethodLabel,
  getPaymentTypeColor,
  formatDate,
} from "./orderUtils";
import { useLanguage } from "../../context/LanguageContext";
import { getSavedPrintPaperSize } from "../../utils/printPaperSize";
import { detectDevice } from "../../utils/deviceDetect";
import { useNavigate } from "react-router-dom";
import { AddItemsToOrderModal } from "./AddItemsToOrderModal";
import { RemoveItemsFromOrderModal } from "./RemoveItemsFromOrderModal";
import { fetchCreditPersonaRecords } from "../../services/Credit/fetchCreditPersonaRecords";

interface OrderDetailModalProps {
  isOpen: boolean;
  loading: boolean;
  order: Order | null;
  onClose: () => void;
  onOrderUpdate?: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  isOpen,
  loading,
  order,
  onClose,
  onOrderUpdate,
}) => {
  // console.log("orderdetail", order);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");
  const userRole = adminData.role;
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);
  const [showRemoveItemsModal, setShowRemoveItemsModal] = useState(false);

  const handlePrintOrder = async () => {
    if (!order) return;

    let creditPersonOutstanding = undefined;
    let creditPersonName = undefined;
    let creditPersonAddress = undefined;
    let creditPersonTownship = undefined;

    if (order.creditPersonId && typeof order.creditPersonId === "object") {
      creditPersonName = order.creditPersonId.name;
      creditPersonAddress = order.creditPersonId.address;
      creditPersonTownship = order.creditPersonId.township;
      // Use outstanding from order response (backend calculated)
      if (order.creditPersonTotalOutstanding != null) {
        creditPersonOutstanding = order.creditPersonTotalOutstanding;
      }
    }

    // Transform order data to receipt format
    const receiptData = {
      invoiceNumber: order.orderNumber,
      storefrontName: "HONGCHI Myanmar",
      date: order.createdAt,
      items:
        order.ordersProducts?.map((item: any) => ({
          name: item.inventoryId?.productName || "Unknown Product",
          code: item.inventoryId?.productCode,
          qty: item.quantity,
          unit: item.unit?.trim() || undefined,
          price: item.unitPrice || 0,
          batches: item.batches?.map((b: any) => ({
            batchNumber: b.batchNumber,
            batchBarcode: b.batchBarcode,
            expiryDate: b.expiryDate,
            quantity: b.quantity,
          })) || [],
        })) || [],
      subtotal: order.subTotal || 0,
      discountPercent: order.discount
        ? (order.discount / (order.subTotal || 1)) * 100
        : 0,
      total: order.finalAmount || 0,
      paymentMethod: getPaymentMethodLabel(order.paymentMethod),
      paidAmount: order.paidAmount,
      change: order.extraChange,
      note: order.note || undefined,
      creditPersonName,
      creditPersonOutstanding,
      creditPersonAddress,
      creditPersonTownship,
    };

    // Save receipt data to localStorage for A4 printing
    const receiptId = `receipt_${receiptData.invoiceNumber}`;
    localStorage.setItem(receiptId, JSON.stringify(receiptData));

    // Navigate to A4 print page for all devices
    navigate(
      `/print-receipt/${receiptData.invoiceNumber}?size=${getSavedPrintPaperSize()}&autoprint=1`,
    );
  };

  if (!isOpen) return null;

  const isDirectSale =
    order?.saleType === "direct-sale" || order?.storefrontId == null;
  const customerName = order?.customerName?.trim();
  const customerPhone = order?.customerPhone?.trim();
  const hasCustomer = !!(customerName || customerPhone);
  const storefrontLabel =
    order?.storefrontId?.locationName ||
    order?.storefrontId?.storefrontName ||
    (isDirectSale ? t("quotation.saleTypeDirectSale") : "-");
  const storefrontCode =
    order?.storefrontId?.locationCode ||
    order?.storefrontId?.storefrontCode ||
    null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex flex-row justify-between items-start gap-4 p-4 border-b bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            {t("orders.orderDetails")}
          </h3>
          <div className="flex flex-row items-center gap-2">
            {order && (
              <button
                onClick={handlePrintOrder}
                className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                title={t("orders.printOrder")}
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">{t("common.print")}</span>
              </button>
            )}
            {order && userRole === "owner" && (
              <>
                <button
                  onClick={() => setShowRemoveItemsModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <Minus className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {t("orders.removeItems") || "Remove Items"}
                  </span>
                </button>
                <button
                  onClick={() => setShowAddItemsModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">
                    {t("orders.addItems") || "Add Items"}
                  </span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-slate-500">{t("orders.loadingDetails")}</p>
            </div>
          ) : order ? (
            <>
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-xs text-blue-600 font-medium mb-1">
                    {t("orders.orderNumber")}
                  </p>
                  <p className="font-bold text-blue-800">{order.orderNumber}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-xs text-green-600 font-medium mb-1">
                    {t("common.status")}
                  </p>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(
                      order.orderStatus,
                    )}`}
                  >
                    {order.orderStatus?.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Store & Date Info */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Store className="w-4 h-4 shrink-0" />
                  <span>{storefrontLabel}</span>
                  {storefrontCode && (
                    <span className="text-xs text-slate-400">
                      ({storefrontCode})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </div>

              {/* Customer (direct sale) */}
              {hasCustomer && (
                <div className="mb-6 bg-teal-50 p-4 rounded-lg border border-teal-200">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-teal-600" />
                    <p className="text-xs text-teal-600 font-medium">
                      {t("orders.customer") || "Customer"}
                    </p>
                  </div>
                  {customerName && (
                    <p className="font-bold text-teal-800">{customerName}</p>
                  )}
                  {customerPhone && (
                    <p className="text-sm text-teal-700 mt-1">{customerPhone}</p>
                  )}
                </div>
              )}

              {order.note?.trim() && (
                <div className="mb-6 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  <span className="font-medium text-slate-700">
                    {t("pos.note")}:{" "}
                  </span>
                  <span>{order.note}</span>
                </div>
              )}

              {/* Sold By & Credit Person Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {order.soldBy && (
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCircle className="w-4 h-4 text-purple-600" />
                      <p className="text-xs text-purple-600 font-medium">
                        {t("orders.soldBy")}
                      </p>
                    </div>
                    <p className="font-bold text-purple-800">
                      {order.soldBy.name}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">
                      {order.soldBy.role}
                    </p>
                  </div>
                )}
                {order.creditPersonId &&
                  typeof order.creditPersonId === "object" && (
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-orange-600" />
                        <p className="text-xs text-orange-600 font-medium">
                          {t("orders.creditPerson")}
                        </p>
                      </div>
                      <p className="font-bold text-orange-800">
                        {order.creditPersonId.name}
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        {order.creditPersonId.phone}
                      </p>
                    </div>
                  )}
              </div>

              {/* Products */}
              <div className="mb-6">
                <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  {t("orders.orderItems")}
                </h4>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-3 text-left font-medium text-slate-600">
                          {t("common.product")}
                        </th>
                        <th className="p-3 text-center font-medium text-slate-600">
                          {t("orders.qty")}
                        </th>
                        <th className="p-3 text-center font-medium text-slate-600">
                          {t("inventory.unit") || "Unit"}
                        </th>
                        <th className="p-3 text-right font-medium text-slate-600">
                          {t("orders.unitPrice")}
                        </th>
                        <th className="p-3 text-right font-medium text-slate-600">
                          {t("common.subtotal")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {order.ordersProducts?.map((item, index) => (
                        <tr key={item._id || index}>
                          <td className="p-3">
                            <div>
                              <p className="font-medium text-slate-800">
                                {item.inventoryId?.productName || "Unknown"}
                              </p>
                              <p className="text-xs text-slate-400">
                                {item.inventoryId?.productCode}
                              </p>
                            </div>
                          </td>
                          <td className="p-3 text-center font-medium">
                            {item.quantity}
                          </td>
                          <td className="p-3 text-center text-slate-600 text-sm">
                            {item.unit || "—"}
                          </td>
                          <td className="p-3 text-right text-slate-600">
                            {item.unitPrice?.toLocaleString()} MMK
                          </td>
                          <td className="p-3 text-right font-medium text-slate-800">
                            {(
                              item.quantity * (item.unitPrice || 0)
                            ).toLocaleString()}{" "}
                            MMK
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-slate-50 p-4 rounded-lg border">
                <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  {t("orders.paymentSummary")}
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("common.subtotal")}</span>
                    <span>{order.subTotal?.toLocaleString()} MMK</span>
                  </div>
                  {order.tax > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t("common.tax")}</span>
                      <span>{order.tax?.toLocaleString()} MMK</span>
                    </div>
                  )}
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>{t("common.discount")}</span>
                      <span>-{order.discount?.toLocaleString()} MMK</span>
                    </div>
                  )}
                  {order.discount === 0 &&
                    order.finalAmount > order.subTotal && (
                      <div className="flex justify-between text-green-600">
                        <span>{t("pos.markup")}</span>
                        <span>
                          {(
                            order.finalAmount - order.subTotal
                          ).toLocaleString()}{" "}
                          MMK
                        </span>
                      </div>
                    )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>{t("orders.finalAmount")}</span>
                    <span>{order.finalAmount?.toLocaleString()} MMK</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>{t("orders.paidAmount")}</span>
                    <span>{order.paidAmount?.toLocaleString()} MMK</span>
                  </div>
                  {order.extraChange > 0 && (
                    <div className="flex justify-between text-blue-600 font-medium">
                      <span>{t("common.change")}</span>
                      <span>{order.extraChange?.toLocaleString()} MMK</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t">
                    <span className="text-slate-500">{t("orders.type")}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${getPaymentTypeColor(
                        order.paymentType,
                      )}`}
                    >
                      {getPaymentTypeLabel(order.paymentType)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t("orders.method")}</span>
                    <span className="font-medium">
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </span>
                  </div>
                  {order.remainingBalance !== undefined &&
                    order.remainingBalance > 0 && (
                      <div className="flex justify-between text-orange-600 font-medium">
                        <span>{t("orders.remainingBalance")}</span>
                        <span>
                          {order.remainingBalance?.toLocaleString()} MMK
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Add Items Modal */}
      <AddItemsToOrderModal
        isOpen={showAddItemsModal}
        order={order}
        onClose={() => setShowAddItemsModal(false)}
        onSuccess={() => {
          setShowAddItemsModal(false);
          if (onOrderUpdate) {
            onOrderUpdate();
          }
        }}
      />

      {/* Remove Items Modal */}
      <RemoveItemsFromOrderModal
        isOpen={showRemoveItemsModal}
        order={order}
        onClose={() => setShowRemoveItemsModal(false)}
        onSuccess={() => {
          setShowRemoveItemsModal(false);
          if (onOrderUpdate) {
            onOrderUpdate();
          }
        }}
      />
    </div>
  );
};
