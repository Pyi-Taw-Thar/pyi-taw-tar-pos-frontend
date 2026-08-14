import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Phone,
  User,
  Loader2,
  X,
  Edit,
  Trash2,
  Ban,
  RotateCcw,
  Archive,
  Building,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Eye,
} from "lucide-react";
import { createSupplier, CreateSupplierPayload } from "../services/Supplier/createSupplier";
import { updateSupplier } from "../services/Supplier/updateSupplier";
import { softDeleteSupplier } from "../services/Supplier/softDeleteSupplier";
import { restoreSupplier } from "../services/Supplier/restoreSupplier";
import { deleteSupplier } from "../services/Supplier/deleteSupplier";
import { fetchSuppliers, PaginationMeta } from "../services/Supplier/fetchSuppliers";
import { fetchTownships } from "../services/Supplier/fetchTownships";
import { ConfirmModal } from "../components/Common/ConfirmModal";
import { toast } from "sonner";
import { Supplier } from "../types";
import { useLanguage } from "../context/LanguageContext";

interface SupplierFormData {
  supplierName: string;
  shortDesc: string;
  companyName: string;
  contactNumber: string;
  email: string;
  address: string;
  township: string;
  isCredit: boolean;
  dueInDays: number;
  isConsign: boolean;
}

export const Suppliers: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showDeleted, setShowDeleted] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);
  const [supplierToPermanentlyDelete, setSupplierToPermanentlyDelete] = useState<Supplier | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Filter States
  const [search, setSearch] = useState("");
  const [selectedTownship, setSelectedTownship] = useState("");
  const [isCreditFilter, setIsCreditFilter] = useState(""); // "", "true", "false"
  const [isConsignFilter, setIsConsignFilter] = useState(""); // "", "true", "false"
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [townships, setTownships] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const [formData, setFormData] = useState<SupplierFormData>({
    supplierName: "",
    shortDesc: "",
    companyName: "",
    contactNumber: "",
    email: "",
    address: "",
    township: "",
    isCredit: false,
    dueInDays: 30,
    isConsign: false,
  });

  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");
  const userRole = adminData.role;

  // Load Townships dropdown options on mount
  useEffect(() => {
    const loadTownships = async () => {
      try {
        const res = await fetchTownships();
        if (res.success && Array.isArray(res.data)) {
          setTownships(res.data);
        }
      } catch (err) {
        console.error("Failed to load townships:", err);
      }
    };
    loadTownships();
  }, []);

  // Load suppliers when filter state changes
  useEffect(() => {
    loadSuppliers();
  }, [showDeleted, search, selectedTownship, isCreditFilter, isConsignFilter, sortBy, sortOrder, page, limit]);

  const loadSuppliers = async () => {
    setIsLoading(true);
    try {
      const response = await fetchSuppliers({
        page,
        limit,
        search: search.trim() || undefined,
        township: selectedTownship || undefined,
        isCredit: isCreditFilter !== "" ? isCreditFilter : undefined,
        isConsign: isConsignFilter !== "" ? isConsignFilter : undefined,
        sortBy,
        sortOrder,
        isDeleted: showDeleted ? true : undefined,
      });

      if (response.success && response.data) {
        setSuppliers(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        } else {
          setPagination(null);
        }
      }
    } catch (error) {
      console.error("Failed to load suppliers:", error);
      toast.error(t("suppliers.failedToLoad"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedTownship("");
    setIsCreditFilter("");
    setIsConsignFilter("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const resetForm = () => {
    setFormData({
      supplierName: "",
      shortDesc: "",
      companyName: "",
      contactNumber: "",
      email: "",
      address: "",
      township: "",
      isCredit: false,
      dueInDays: 30,
      isConsign: false,
    });
    setEditingId(null);
  };

  const handleOpenEdit = (supplier: Supplier) => {
    setEditingId(supplier.id || supplier._id || "");
    setFormData({
      supplierName: supplier.supplierName || "",
      shortDesc: supplier.shortDesc || "",
      companyName: supplier.companyName || "",
      contactNumber: supplier.contactNumber || "",
      email: supplier.email || "",
      address: supplier.address || "",
      township: supplier.township || "",
      isCredit: supplier.isCredit ?? false,
      dueInDays: supplier.dueInDays ?? 30,
      isConsign: supplier.isConsign ?? false,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplierName || !formData.contactNumber) {
      toast.error(t("suppliers.fillRequiredFields"));
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateSupplierPayload = {
        supplierName: formData.supplierName,
        shortDesc: formData.shortDesc,
        companyName: formData.companyName,
        contactNumber: formData.contactNumber,
        email: formData.email,
        address: formData.address,
        township: formData.township,
        isCredit: formData.isCredit,
        dueInDays: Number(formData.dueInDays) || 0,
        isConsign: formData.isConsign,
      };

      if (editingId) {
        // Update existing supplier
        await updateSupplier(editingId, payload);
        toast.success(t("suppliers.supplierUpdated"));
      } else {
        // Create new supplier
        await createSupplier(payload);
        toast.success(t("suppliers.supplierCreated"));
      }

      handleCloseModal();
      // Reload list
      loadSuppliers();
    } catch (error: any) {
      toast.error(
        error.message ||
        (editingId
          ? t("suppliers.failedToUpdate")
          : t("suppliers.failedToCreate")),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeactivate = (supplier: Supplier) => {
    setSupplierToDelete(supplier);
  };

  const handleConfirmDeactivate = async () => {
    if (!supplierToDelete) return;

    const supplierId = supplierToDelete.id || supplierToDelete._id;
    if (!supplierId) return;

    setProcessingId(supplierId);
    try {
      await softDeleteSupplier(supplierId);
      toast.success(t("suppliers.supplierDeactivated"));
      setSupplierToDelete(null);
      loadSuppliers();
    } catch (error: any) {
      toast.error(error.message || t("suppliers.failedToDeactivate"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleRestore = async (supplier: Supplier) => {
    const supplierId = supplier.id || supplier._id;
    if (!supplierId) return;

    setProcessingId(supplierId);
    try {
      await restoreSupplier(supplierId);
      toast.success(t("suppliers.supplierRestored"));
      // If viewing deleted suppliers, reload the deleted list
      // Otherwise, reload active suppliers
      loadSuppliers();
    } catch (error: any) {
      toast.error(error.message || t("suppliers.failedToRestore"));
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenPermanentDelete = (supplier: Supplier) => {
    setSupplierToPermanentlyDelete(supplier);
  };

  const handleConfirmPermanentDelete = async () => {
    if (!supplierToPermanentlyDelete) return;

    const supplierId =
      supplierToPermanentlyDelete.id || supplierToPermanentlyDelete._id;
    if (!supplierId) return;

    setProcessingId(supplierId);
    try {
      await deleteSupplier(supplierId);
      toast.success(t("suppliers.supplierDeleted"));
      setSupplierToPermanentlyDelete(null);
      loadSuppliers();
    } catch (error: any) {
      toast.error(error.message || t("suppliers.failedToDelete"));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-row justify-between items-start gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
          {t("suppliers.title")}
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary/90 text-white px-3 py-2 sm:px-4 rounded-lg flex items-center gap-2 transition-colors text-sm sm:text-base"
        >
          <Plus className="w-4 h-4" />{" "}
          <span className="hidden sm:inline">{t("suppliers.addSupplier")}</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Suppliers List */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
          <h2 className="text-lg font-semibold">
            {showDeleted
              ? t("suppliers.deletedSuppliers")
              : t("suppliers.registeredSuppliers")}
          </h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => {
                  setShowDeleted(false);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${!showDeleted
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
                  }`}
              >
                {t("suppliers.active")}
              </button>
              <button
                onClick={() => {
                  setShowDeleted(true);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors flex items-center gap-1 ${showDeleted
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
                  }`}
              >
                <Archive className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {t("suppliers.inactive")}
                </span>
                <span className="sm:hidden">Inactive</span>
              </button>
            </div>
            <span className="hidden md:block bg-primary/20 text-primary-700 text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap">
              {t("suppliers.total")}: {pagination?.totalItems ?? suppliers.length}
            </span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-slate-50 p-3 sm:p-4 rounded-lg border mb-4 space-y-3">
          {/* Search Input & Reset Button */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="ရှာဖွေရန်... (အမည်၊ ကုမ္ပဏီ၊ ဖုန်း၊ မြို့နယ်)"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-9 pr-8 py-2 bg-white border rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white border rounded-lg hover:bg-slate-100 transition-colors"
                title="Filters ပြန်လည်ရှင်းလင်းရန်"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Township Filter */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                မြို့နယ် (Township)
              </label>
              <select
                value={selectedTownship}
                onChange={(e) => {
                  setSelectedTownship(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2 bg-white border rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">မြို့နယ်အားလုံး (All)</option>
                {townships.map((tName) => (
                  <option key={tName} value={tName}>
                    {tName}
                  </option>
                ))}
              </select>
            </div>

            {/* Is Credit Filter */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                အကြွေး ရောင်း/မရောင်း
              </label>
              <select
                value={isCreditFilter}
                onChange={(e) => {
                  setIsCreditFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2 bg-white border rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">အားလုံး (All)</option>
                <option value="true">အကြွေးရောင်းသော Supplier</option>
                <option value="false">အကြွေးမရောင်းသော Supplier</option>
              </select>
            </div>

            {/* Is Consign Filter */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Consign
              </label>
              <select
                value={isConsignFilter}
                onChange={(e) => {
                  setIsConsignFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full p-2 bg-white border rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">အားလုံး (All)</option>
                <option value="true">Consign Supplier</option>
                <option value="false">Consign မဟုတ်သော Supplier</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                စီရန် (Sort By)
              </label>
              <div className="flex items-center gap-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 bg-white border rounded-lg text-slate-700 outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="createdAt">ရက်စွဲ (Date)</option>
                  <option value="supplierName">အမည် (Name)</option>
                  <option value="township">မြို့နယ် (Township)</option>
                </select>
                <button
                  type="button"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                  className="p-2 bg-white border rounded-lg text-slate-600 hover:text-slate-900"
                  title={sortOrder === "asc" ? "Ascending" : "Descending"}
                >
                  {sortOrder === "asc" ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            {t("suppliers.loading")}
          </div>
        ) : suppliers.length === 0 ? (
          <div className="text-center py-12 text-slate-500 bg-slate-50 rounded-lg border border-dashed">
            <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>
              {showDeleted
                ? t("suppliers.noDeletedSuppliers")
                : t("suppliers.noSuppliers")}
            </p>
            {!showDeleted && (
              <p className="text-sm mt-1">{t("suppliers.addFirstSupplier")}</p>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map((supplier) => (
                <div
                  key={supplier.id || supplier._id}
                  className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                        <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-medium text-slate-900 text-sm sm:text-base truncate">
                            {supplier.supplierName}
                          </h3>
                          {supplier.shortDesc && (
                            <span className="bg-slate-100 text-slate-700 text-xs px-1.5 py-0.5 rounded font-mono">
                              {supplier.shortDesc}
                            </span>
                          )}
                          {supplier.isCredit && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                              Credit ({supplier.dueInDays || 0}d)
                            </span>
                          )}
                          {supplier.isConsign && (
                            <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                              Consign
                            </span>
                          )}
                        </div>
                        {supplier.companyName && (
                          <p className="text-xs text-slate-600 font-medium truncate mt-0.5">
                            {supplier.companyName}
                          </p>
                        )}
                        <div className="flex items-center text-xs text-slate-500 mt-1 flex-wrap gap-x-2 gap-y-1">
                          <span className="flex items-center">
                            <Phone className="w-3 h-3 mr-1 flex-shrink-0" />
                            {supplier.contactNumber}
                          </span>
                          {supplier.township && (
                            <span className="flex items-center text-slate-400">
                              <MapPin className="w-3 h-3 mr-0.5 flex-shrink-0" />
                              {supplier.township}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/suppliers/${supplier._id || supplier.id}`);
                          }}
                          className="p-1.5 text-slate-600 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                          title="View Supplier Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {userRole === "owner" && (
                          <>
                            {!supplier.isDeleted && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEdit(supplier);
                                }}
                                className="p-1.5 text-slate-600 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                                title={t("common.edit")}
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            {supplier.isDeleted ? (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRestore(supplier);
                                  }}
                                  disabled={
                                    processingId === (supplier.id || supplier._id)
                                  }
                                  className="p-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                                  title={t("suppliers.restore")}
                                >
                                  {processingId ===
                                    (supplier.id || supplier._id) ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <RotateCcw className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenPermanentDelete(supplier);
                                  }}
                                  disabled={
                                    processingId === (supplier.id || supplier._id)
                                  }
                                  className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                  title={t("suppliers.delete")}
                                >
                                  {processingId ===
                                    (supplier.id || supplier._id) ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-4 h-4" />
                                  )}
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDeactivate(supplier);
                                }}
                                disabled={
                                  processingId === (supplier.id || supplier._id)
                                }
                                className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                title={t("suppliers.deactivate")}
                              >
                                {processingId === (supplier.id || supplier._id) ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Ban className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`w-2 h-2 rounded-full mr-2 flex-shrink-0 ${supplier.isDeleted ? "bg-red-500" : "bg-green-500"
                            }`}
                        ></span>
                        <span className="text-xs text-slate-500">
                          {supplier.isDeleted
                            ? t("suppliers.inactive")
                            : t("suppliers.active")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t text-xs text-slate-400 space-y-1">
                    {supplier.createdAt && (
                      <div>
                        {t("suppliers.added")}:{" "}
                        {new Date(supplier.createdAt).toLocaleDateString()}
                      </div>
                    )}
                    {supplier.deletedAt && (
                      <div className="text-red-500">
                        {t("suppliers.deletedAt")}:{" "}
                        {new Date(supplier.deletedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-4 border-t text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span>တစ်မျက်နှာလျှင်:</span>
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    className="border rounded p-1 text-slate-700 bg-white"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>
                    | စုစုပေါင်း: {pagination.totalItems} ခု (စာမျက်နှာ {pagination.currentPage} / {pagination.totalPages})
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    disabled={pagination.currentPage <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="p-1.5 border rounded bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 font-medium bg-primary/10 text-primary rounded">
                    {pagination.currentPage}
                  </span>
                  <button
                    disabled={pagination.currentPage >= pagination.totalPages}
                    onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                    className="p-1.5 border rounded bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white font-medium"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                {editingId
                  ? t("suppliers.editSupplier")
                  : t("suppliers.addNewSupplier")}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {t("suppliers.name")} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    className="w-full border rounded-lg pl-10 p-2 focus:ring-2 focus:ring-primary outline-none"
                    placeholder={t("suppliers.namePlaceholder")}
                    value={formData.supplierName}
                    onChange={(e) =>
                      setFormData({ ...formData, supplierName: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      className="w-full border rounded-lg pl-10 p-2 focus:ring-2 focus:ring-primary outline-none text-sm"
                      placeholder="e.g. ABC Trading Co., Ltd"
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({ ...formData, companyName: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Short Code / Desc
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      className="w-full border rounded-lg pl-10 p-2 focus:ring-2 focus:ring-primary outline-none text-sm"
                      placeholder="e.g. ABC"
                      value={formData.shortDesc}
                      onChange={(e) =>
                        setFormData({ ...formData, shortDesc: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("suppliers.contact")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input
                      type="tel"
                      required
                      className="w-full border rounded-lg pl-10 p-2 focus:ring-2 focus:ring-primary outline-none text-sm"
                      placeholder={t("suppliers.contactPlaceholder")}
                      value={formData.contactNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactNumber: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input
                      type="email"
                      className="w-full border rounded-lg pl-10 p-2 focus:ring-2 focus:ring-primary outline-none text-sm"
                      placeholder="e.g. abc@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      className="w-full border rounded-lg pl-10 p-2 focus:ring-2 focus:ring-primary outline-none text-sm"
                      placeholder="No. 123, Main Road"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Township
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      className="w-full border rounded-lg pl-10 p-2 focus:ring-2 focus:ring-primary outline-none text-sm"
                      placeholder="မရမ်းကုန်း"
                      value={formData.township}
                      onChange={(e) =>
                        setFormData({ ...formData, township: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isCredit}
                      onChange={(e) =>
                        setFormData({ ...formData, isCredit: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    Is Credit Supplier
                  </label>

                  {formData.isCredit && (
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-slate-600">Due (Days):</label>
                      <input
                        type="number"
                        min="0"
                        className="w-20 border rounded-lg p-1.5 text-sm outline-none focus:ring-2 focus:ring-primary"
                        value={formData.dueInDays}
                        onChange={(e) =>
                          setFormData({ ...formData, dueInDays: Number(e.target.value) || 0 })
                        }
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isConsign}
                      onChange={(e) =>
                        setFormData({ ...formData, isConsign: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-primary focus:ring-primary"
                    />
                    Is Consign (ကွန်ဆိုင်း)
                  </label>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors order-2 sm:order-1"
                >
                  {t("common.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />{" "}
                      {editingId
                        ? t("suppliers.updating")
                        : t("suppliers.creating")}
                    </>
                  ) : editingId ? (
                    t("suppliers.updateSupplier")
                  ) : (
                    t("suppliers.createSupplier")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      <ConfirmModal
        isOpen={!!supplierToDelete}
        title={t("suppliers.deactivateSupplier")}
        message={
          supplierToDelete
            ? t("suppliers.confirmDeactivateMessage").replace(
              "{name}",
              supplierToDelete.supplierName,
            )
            : t("suppliers.confirmDeactivate")
        }
        confirmText={t("suppliers.deactivate")}
        cancelText={t("common.cancel")}
        confirmButtonColor="red"
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setSupplierToDelete(null)}
        isLoading={
          supplierToDelete
            ? processingId === (supplierToDelete.id || supplierToDelete._id)
            : false
        }
      />

      {/* Permanent Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!supplierToPermanentlyDelete}
        title={t("suppliers.deleteSupplier")}
        message={
          supplierToPermanentlyDelete
            ? t("suppliers.confirmDeleteMessage").replace(
              "{name}",
              supplierToPermanentlyDelete.supplierName,
            )
            : t("suppliers.confirmDelete")
        }
        confirmText={t("suppliers.delete")}
        cancelText={t("common.cancel")}
        confirmButtonColor="red"
        onConfirm={handleConfirmPermanentDelete}
        onCancel={() => setSupplierToPermanentlyDelete(null)}
        isLoading={
          supplierToPermanentlyDelete
            ? processingId ===
            (supplierToPermanentlyDelete.id ||
              supplierToPermanentlyDelete._id)
            : false
        }
      />
    </div>
  );
};
