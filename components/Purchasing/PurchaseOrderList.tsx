import React, { useState, useEffect } from "react";
import {
  Plus,
  Eye,
  ChevronLeft,
  ChevronRight,
  PackageCheck,
  Trash2,
  RotateCcw,
  CreditCard,
  History,
} from "lucide-react";
import { ApiPurchaseOrder, Supplier } from "../../types";
import { updatePurchaseStatus } from "../../services/Purchase/updatePurchaseStatus";
import { softDeletePurchase } from "../../services/Purchase/softDeletePurchase";
import { restorePurchase } from "../../services/Purchase/restorePurchase";
import { toast } from "sonner";
import { ConfirmModal } from "../Common/ConfirmModal";
import { useLanguage } from "../../context/LanguageContext";
import { RecordPaymentModal } from "./RecordPaymentModal";
import { PaymentHistoryModal } from "./PaymentHistoryModal";

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface PurchaseOrderListProps {
  poList: ApiPurchaseOrder[];
  deletedPOList: ApiPurchaseOrder[];
  suppliers: Supplier[];
  setIsCreateModalOpen: (isOpen: boolean) => void;
  loadPurchases: (page?: number, limit?: number, filter?: string) => Promise<void>;
  loadDeletedPurchases: (page?: number, limit?: number) => Promise<void>;
  onViewPO?: (po: ApiPurchaseOrder) => void;
  pagination: PaginationData;
  deletedPagination: PaginationData;
  onCreateGRN?: (po: ApiPurchaseOrder) => void;
  poFilter: "pending" | "arrived" | "deleted";
  setPoFilter: (filter: "pending" | "arrived" | "deleted") => void;
}

export const PurchaseOrderList: React.FC<PurchaseOrderListProps> = ({
  poList,
  deletedPOList,
  suppliers,
  setIsCreateModalOpen,
  loadPurchases,
  loadDeletedPurchases,
  onViewPO,
  pagination,
  deletedPagination,
  onCreateGRN,
  poFilter,
  setPoFilter,
}) => {
  const { t } = useLanguage();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [poToDelete, setPoToDelete] = useState<ApiPurchaseOrder | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Credit payment modals state
  const [selectedPoForPayment, setSelectedPoForPayment] = useState<ApiPurchaseOrder | null>(null);
  const [selectedPoForHistory, setSelectedPoForHistory] = useState<string | null>(null);

  // Use the filtered data from API instead of client-side filtering
  const displayList = poFilter === "deleted" ? deletedPOList : poList;

  useEffect(() => {
    if (poFilter === "deleted") {
      loadDeletedPurchases(
        deletedPagination.currentPage,
        deletedPagination.itemsPerPage,
      );
    } else {
      // Load purchases with status filter
      loadPurchases(pagination.currentPage, pagination.itemsPerPage, poFilter);
    }
  }, [poFilter]);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await updatePurchaseStatus(id, status);
      if (res.success) {
        toast.success("Status updated successfully");
        // Reload with current filter status
        loadPurchases(
          pagination.currentPage,
          pagination.itemsPerPage,
          poFilter,
        );
      } else {
        toast.error(res.message || "Failed to update status");
      }
    } catch (error: any) {
      console.error("Failed to update status", error);
      toast.error(error.message || "Failed to update status");
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      loadPurchases(page, pagination.itemsPerPage, poFilter);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    loadPurchases(1, newLimit, poFilter);
  };

  const handleSoftDelete = async (po: ApiPurchaseOrder) => {
    setPoToDelete(po);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!poToDelete) return;

    setIsDeleting(true);
    try {
      const res = await softDeletePurchase(poToDelete._id);
      if (res.success) {
        toast.success("Purchase order deleted successfully");
        loadPurchases(pagination.currentPage, pagination.itemsPerPage, poFilter);
        setDeleteModalOpen(false);
        setPoToDelete(null);
      } else {
        toast.error(res.message || "Failed to delete purchase order");
      }
    } catch (error: any) {
      console.error("Failed to delete purchase order", error);
      toast.error(error.message || "Failed to delete purchase order");
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setPoToDelete(null);
  };

  const handleRestore = async (po: ApiPurchaseOrder) => {
    try {
      const res = await restorePurchase(po._id);
      if (res.success) {
        toast.success("Purchase order restored successfully");
        loadPurchases(pagination.currentPage, pagination.itemsPerPage, poFilter);
        loadDeletedPurchases(
          deletedPagination.currentPage,
          deletedPagination.itemsPerPage,
        );
      } else {
        toast.error(res.message || "Failed to restore purchase order");
      }
    } catch (error: any) {
      console.error("Failed to restore purchase order", error);
      toast.error(error.message || "Failed to restore purchase order");
    }
  };

  const handleDeletedPageChange = (page: number) => {
    if (page >= 1 && page <= deletedPagination.totalPages) {
      loadDeletedPurchases(page, deletedPagination.itemsPerPage);
    }
  };

  const handleDeletedLimitChange = (newLimit: number) => {
    loadDeletedPurchases(1, newLimit);
  };

  const renderPagination = () => {
    const currentPagination =
      poFilter === "deleted" ? deletedPagination : pagination;
    const { currentPage, totalPages, totalItems, itemsPerPage } =
      currentPagination;

    if (totalItems === 0) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
        <div className="flex items-center gap-4">
          <div className="text-sm text-slate-600">
            Showing {startItem} to {endItem} of {totalItems} results
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                const newLimit = Number(e.target.value);
                if (poFilter === "deleted") {
                  handleDeletedLimitChange(newLimit);
                } else {
                  handleLimitChange(newLimit);
                }
              }}
              className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-slate-600">entries</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (poFilter === "deleted") {
                handleDeletedPageChange(currentPage - 1);
              } else {
                handlePageChange(currentPage - 1);
              }
            }}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => {
                  if (poFilter === "deleted") {
                    handleDeletedPageChange(page);
                  } else {
                    handlePageChange(page);
                  }
                }}
                className={`px-3 py-1 rounded-lg text-sm font-medium ${page === currentPage
                  ? "bg-slate-800 text-white"
                  : "text-slate-600 hover:bg-slate-50 border"
                  }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (poFilter === "deleted") {
                handleDeletedPageChange(currentPage + 1);
              } else {
                handlePageChange(currentPage + 1);
              }
            }}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <h2 className="font-bold text-lg text-slate-800">
          Purchase Orders List
        </h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Create New PO
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setPoFilter("pending")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${poFilter === "pending"
            ? "bg-slate-800 text-white"
            : "bg-white text-slate-600 hover:bg-slate-50 border"
            }`}
        >
          {t("purchasing.pending")}
        </button>
        <button
          onClick={() => setPoFilter("arrived")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${poFilter === "arrived"
            ? "bg-primary text-white"
            : "bg-white text-slate-600 hover:bg-slate-50 border"
            }`}
        >
          {t("purchasing.arrived")}
        </button>
        <button
          onClick={() => setPoFilter("deleted")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${poFilter === "deleted"
            ? "bg-red-800 text-white"
            : "bg-white text-slate-600 hover:bg-slate-50 border"
            }`}
        >
          {t("purchasing.deleted")}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="h-[calc(100vh-510px)] overflow-y-auto">
          <table className="w-full text-xs sm:text-sm text-left">
            <thead className="bg-slate-50 border-b sticky top-0 z-10 text-xs">
              <tr>
                <th className="p-3 sm:p-4">PO ID</th>
                <th className="p-3 sm:p-4">Date</th>
                <th className="p-3 sm:p-4">Supplier</th>
                <th className="p-3 sm:p-4">Total Amount</th>
                <th className="p-3 sm:p-4">Paid Amount</th>
                <th className="p-3 sm:p-4">Remaining Balance</th>
                <th className="p-3 sm:p-4">Status</th>
                <th className="p-3 sm:p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {displayList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No {poFilter} purchase orders found
                  </td>
                </tr>
              ) : (
                displayList.map((po) => {
                  const supplierName =
                    typeof po.supplierId === "object" && po.supplierId
                      ? po.supplierId.supplierName
                      : "Unknown Supplier";

                  const paid = po.paidAmount ?? 0;
                  const remaining =
                    po.remainingBalance ?? Math.max(0, po.totalAmount - paid);

                  return (
                    <tr
                      key={po._id}
                      className={`hover:bg-slate-50 ${remaining > 0 ? "bg-amber-50/30" : ""
                        }`}
                    >
                      <td className="p-3 sm:p-4 font-semibold text-slate-800">
                        {po.poNumber}
                      </td>
                      <td className="p-3 sm:p-4 text-slate-600">
                        {new Date(po.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 sm:p-4 font-medium text-slate-800">
                        {supplierName}
                      </td>
                      <td className="p-3 sm:p-4 font-medium">
                        {po.totalAmount.toLocaleString()} MMK
                      </td>
                      <td className="p-3 sm:p-4 font-medium text-green-700">
                        {paid.toLocaleString()} MMK
                      </td>
                      <td className="p-3 sm:p-4 font-bold">
                        {remaining > 0 ? (
                          <span className="text-red-600">
                            {remaining.toLocaleString()} MMK
                          </span>
                        ) : (
                          <span className="text-slate-400">0 MMK</span>
                        )}
                      </td>
                      <td className="p-3 sm:p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-[10px] font-bold ${po.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : po.status === "arrived"
                              ? "bg-blue-100 text-blue-700"
                              : po.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                        >
                          {po.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => onViewPO?.(po)}
                            className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded hover:bg-slate-200 border font-medium transition-colors flex items-center gap-1"
                            title="View PO Details"
                          >
                            <Eye className="w-3 h-3" /> View
                          </button>

                          {/* Record Payment Button */}
                          {poFilter !== "deleted" && (
                            <button
                              onClick={() => setSelectedPoForPayment(po)}
                              className={`text-xs px-2.5 py-1 rounded font-medium transition-colors flex items-center gap-1 border ${remaining > 0
                                ? "bg-green-600 text-white hover:bg-green-700 border-green-600 shadow-sm"
                                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                                }`}
                              title="Record Credit Payment"
                            >
                              <CreditCard className="w-3 h-3" /> Pay
                            </button>
                          )}

                          {/* Payment History Button */}
                          {poFilter !== "deleted" && (
                            <button
                              onClick={() => setSelectedPoForHistory(po._id)}
                              className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded hover:bg-purple-100 border border-purple-200 font-medium transition-colors flex items-center gap-1"
                              title="View Credit Payment History"
                            >
                              <History className="w-3 h-3" />
                            </button>
                          )}

                          {poFilter === "deleted" ? (
                            <button
                              onClick={() => handleRestore(po)}
                              className="text-xs bg-green-50 text-green-600 px-2.5 py-1 rounded hover:bg-green-100 border border-green-200 font-medium transition-colors flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" /> Restore
                            </button>
                          ) : (
                            <>
                              {po.status === "pending" && (
                                <button
                                  onClick={() =>
                                    handleUpdateStatus(po._id, "arrived")
                                  }
                                  className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded hover:bg-blue-100 border border-blue-200 font-medium transition-colors"
                                >
                                  Arrived
                                </button>
                              )}
                              {(po.status === "arrived" ||
                                po.status === "received") &&
                                (po.totalRemainingQuantity ?? 0) > 0 && (
                                  <button
                                    onClick={() => onCreateGRN?.(po)}
                                    className="text-xs bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded hover:bg-indigo-100 border border-indigo-200 font-medium transition-colors flex items-center gap-1"
                                  >
                                    <PackageCheck className="w-3 h-3" /> GRN
                                  </button>
                                )}
                              {po.status === "pending" && (
                                <button
                                  onClick={() => handleSoftDelete(po)}
                                  className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded hover:bg-red-100 border border-red-200 font-medium transition-colors"
                                  title="Delete PO"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {renderPagination()}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Purchase Order"
        message={`Are you sure you want to delete PO ${poToDelete?.poNumber}? This action can be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonColor="red"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        isLoading={isDeleting}
      />

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={!!selectedPoForPayment}
        onClose={() => setSelectedPoForPayment(null)}
        po={selectedPoForPayment}
        onPaymentSuccess={() => {
          loadPurchases(pagination.currentPage, pagination.itemsPerPage, poFilter);
        }}
      />

      {/* Payment History Modal */}
      <PaymentHistoryModal
        isOpen={!!selectedPoForHistory}
        onClose={() => setSelectedPoForHistory(null)}
        purchaseId={selectedPoForHistory}
        onPaymentDeleted={() => {
          loadPurchases(pagination.currentPage, pagination.itemsPerPage, poFilter);
        }}
      />
    </div>
  );
};
