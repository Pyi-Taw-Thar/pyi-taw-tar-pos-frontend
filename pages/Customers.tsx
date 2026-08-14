import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  RefreshCw,
  UserPlus,
  X,
  Loader2,
  Edit2,
  Plus,
  Trash2,
  FileUp,
} from "lucide-react";
import { useRef } from "react";
import { importCustomersExcel } from "../services/Customer/importCustomersExcel";
import { toast } from "sonner";
import { useLanguage } from "../context/LanguageContext";
import {
  Customer,
  CustomerAddress,
  CustomerPagination,
  fetchCustomers,
} from "../services/Customer/fetchCustomers";
import { registerCustomer } from "../services/Customer/registerCustomer";
import { updateCustomer } from "../services/Customer/updateCustomer";
import { updateCustomerTier, CustomerTier } from "../services/Customer/updateCustomerTier";
import { toggleCreditPerson } from "../services/Customer/toggleCreditPerson";
import { CustomerDetailModal } from "../components/Customer/CustomerDetailModal";
import { fetchTownships } from "../services/Customer/fetchTownships";

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const TIER_OPTIONS: { value: CustomerTier | null; label: string; color: string; multiplier: string; factor: number }[] = [
  { value: null, label: "Regular", color: "bg-slate-100 text-slate-700", multiplier: "1x", factor: 10 },
  { value: "silver", label: "Silver", color: "bg-gray-100 text-gray-700", multiplier: "1.5x", factor: 15 },
  { value: "gold", label: "Gold", color: "bg-yellow-100 text-yellow-700", multiplier: "2x", factor: 20 },
  { value: "platinum", label: "Platinum", color: "bg-purple-100 text-purple-700", multiplier: "3x", factor: 30 },
];

const getTierDisplay = (tier?: string) => {
  const found = TIER_OPTIONS.find((t) => t.value === tier);
  return found || TIER_OPTIONS[0];
};

export const Customers: React.FC = () => {
  const { t } = useLanguage();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pagination, setPagination] = useState<CustomerPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [townships, setTownships] = useState<string[]>([]);
  const [selectedTownship, setSelectedTownship] = useState<string>("");

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    address: "",
    township: "",
  });

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(
    null,
  );
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editFormData, setEditFormData] = useState<{
    name: string;
    phone: string;
    address: string;
    township: string;
  }>({
    name: "",
    phone: "",
    address: "",
    township: "",
  });

  const [updatingTierCustomerId, setUpdatingTierCustomerId] = useState<string | null>(null);

  const totalItems = pagination?.totalItems ?? customers.length;

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    loadTownships();
  }, []);

  useEffect(() => {
    loadCustomers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch, selectedTownship]);

  const loadTownships = async () => {
    try {
      const response = await fetchTownships();
      if (response.success) {
        setTownships(response.data);
      }
    } catch (error) {
      console.error("Error loading townships:", error);
    }
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetchCustomers({
        page,
        limit,
        search: debouncedSearch.trim() || undefined,
        township: selectedTownship || undefined,
      });

      if (response.success) {
        setCustomers(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        } else {
          setPagination({
            currentPage: page,
            totalPages: 1,
            totalItems: response.data.length,
            itemsPerPage: response.data.length,
          });
        }
      } else {
        setCustomers([]);
        setPagination(null);
        toast.error(response.message || t("customers.failedToLoad"));
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error(t("customers.failedToLoad"));
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers;

  const handleOpenDetail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailOpen(true);
  };

  const handleTierChange = async (customerId: string, newTier: CustomerTier | null) => {
    setUpdatingTierCustomerId(customerId);
    try {
      const result = await updateCustomerTier(customerId, newTier);
      if (result.success) {
        toast.success("Customer tier updated");
        if (selectedCustomer && selectedCustomer._id === customerId) {
          setSelectedCustomer(result.data || { ...selectedCustomer, tier: newTier });
        }
        loadCustomers();
      } else {
        toast.error(result.message || "Failed to update tier");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to update tier");
    } finally {
      setUpdatingTierCustomerId(null);
    }
  };

  const handleToggleCredit = async (customerId: string) => {
    try {
      const result = await toggleCreditPerson(customerId);
      if (result.success) {
        toast.success(
          result.data?.isCreditPerson
            ? "Credit person status enabled"
            : "Credit person status removed"
        );
        loadCustomers();
      } else {
        toast.error(result.message || "Failed to toggle credit status");
      }
    } catch (error: any) {
      toast.error(error?.message || "Failed to toggle credit status");
    }
  };

  const handlePageChange = (nextPage: number) => {
    if (!pagination) return;
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
  };

  const getDefaultAddressPreview = (customer: Customer) => {
    const line = customer.address && customer.address !== "-" ? customer.address : "";
    const township = customer.township || "";
    if (line && township) return `${line}, ${township}`;
    return line || township || "-";
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const response = await importCustomersExcel(file);
      if (response.success) {
        toast.success(
          `${response.message} (Created: ${response.data.created}, Skipped: ${response.data.skipped}, Failed: ${response.data.failed})`
        );
        loadCustomers();
      } else {
        toast.error(response.message);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to import customers");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleOpenRegisterModal = () => {
    setFormData({ name: "", phone: "", password: "", address: "", township: "" });
    setIsRegisterModalOpen(true);
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
    setFormData({ name: "", phone: "", password: "", address: "", township: "" });
  };

  const handleRegisterCustomer = async () => {
    if (!formData.name.trim()) {
      toast.error(t("customers.nameRequired"));
      return;
    }
    if (!formData.phone.trim()) {
      toast.error(t("customers.phoneRequired"));
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await registerCustomer({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        password: "password123",
        address: formData.address.trim(),
        township: formData.township.trim(),
      });

      if (response.success) {
        toast.success(response.message || t("customers.registerSuccess"));
        handleCloseRegisterModal();
        setPage(1);
        loadCustomers();
      } else {
        toast.error(response.message || t("customers.registerFailed"));
      }
    } catch (error: any) {
      console.error("Error registering customer:", error);
      toast.error(error?.message || t("customers.registerFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const normalizeAddresses = (addresses: CustomerAddress[]) => {
    const hasDefault = addresses.some((a) => a.isDefault);
    if (!addresses.length) return [];
    if (hasDefault) return addresses;
    return addresses.map((a, idx) => ({ ...a, isDefault: idx === 0 }));
  };

  const handleOpenEditModal = (customer: Customer) => {
    setEditingCustomerId(customer._id);
    setEditFormData({
      name: customer.name || "",
      phone: customer.phone || "",
      address: customer.address || "",
      township: customer.township || "",
    });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCustomerId(null);
    setEditSubmitting(false);
    setEditFormData({ name: "", phone: "", address: "", township: "" });
  };

  const handleEditCustomer = async () => {
    if (!editingCustomerId) return;

    if (!editFormData.name.trim()) {
      toast.error(t("customers.nameRequired"));
      return;
    }
    if (!editFormData.phone.trim()) {
      toast.error(t("customers.phoneRequired"));
      return;
    }

    setEditSubmitting(true);
    try {
      const response = await updateCustomer(editingCustomerId, {
        name: editFormData.name.trim(),
        phone: editFormData.phone.trim(),
        address: editFormData.address.trim(),
        township: editFormData.township.trim(),
      });

      if (response.success) {
        toast.success(response.message || t("customers.updateSuccess"));
        handleCloseEditModal();
        loadCustomers();
      } else {
        toast.error(response.message || t("customers.updateFailed"));
      }
    } catch (error: any) {
      console.error("Error updating customer:", error);
      toast.error(error?.message || t("customers.updateFailed"));
    } finally {
      setEditSubmitting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
            {t("customers.title")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t("customers.subtitle")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <button
            onClick={loadCustomers}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 sm:px-4 rounded-lg disabled:opacity-50 text-sm sm:text-base"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>{t("common.refresh")}</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportExcel}
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 sm:px-4 rounded-lg disabled:opacity-50 text-sm sm:text-base font-medium transition-colors"
          >
            {isImporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileUp className="w-4 h-4" />
            )}
            <span>Import Excel</span>
          </button>
          <button
            onClick={handleOpenRegisterModal}
            className="inline-flex items-center gap-2 bg-primary text-white px-3 py-2 sm:px-4 rounded-lg hover:bg-primary/90 text-sm sm:text-base font-medium"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t("customers.addCustomer")}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            {t("common.search")}
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("customers.searchPlaceholder")}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">
            Township Filter
          </label>
          <select
            value={selectedTownship}
            onChange={(e) => {
              setSelectedTownship(e.target.value);
              setPage(1);
            }}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary"
          >
            <option value="">All Townships</option>
            {townships.map((ts) => (
              <option key={ts} value={ts}>
                {ts}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center mb-2 text-xs text-slate-500">
        <span>
          {t("customers.totalItemsLabel").replace(
            "{count}",
            totalItems.toString(),
          )}
        </span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                #
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                {t("common.name")}
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                {t("common.phone")}
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                {t("common.address")}
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                {t("customers.city")}
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                {t("common.status")}
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-slate-500">
                Credit
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">
                {t("common.date")}
              </th>
              <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">
                {t("common.actions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-500">
                  {t("common.loading")}
                </td>
              </tr>
            ) : filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-500">
                  {t("customers.noCustomers")}
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer, index) => {
                const displayIndex =
                  ((pagination?.currentPage ?? 1) - 1) *
                    (pagination?.itemsPerPage ?? limit) +
                  index +
                  1;

                return (
                  <tr key={customer._id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 text-xs text-slate-500">
                      {displayIndex}
                    </td>
                    <td className="px-3 py-2 font-medium text-slate-800">
                      {customer.name}
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {customer.phone}
                    </td>
                    <td className="px-3 py-2 text-slate-600 max-w-[200px] truncate">
                      {customer.address || "-"}
                    </td>
                    <td className="px-3 py-2 text-slate-600 max-w-[150px] truncate">
                      {customer.township || "-"}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                          customer.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {customer.isActive
                          ? t("customers.active")
                          : t("customers.inactive")}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleToggleCredit(customer._id)}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border transition-colors ${
                          customer.isCreditPerson
                            ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                            : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                        }`}
                        title={
                          customer.isCreditPerson
                            ? "Disable credit person"
                            : "Enable credit person"
                        }
                      >
                        {customer.isCreditPerson ? "✓ Credit" : "+ Credit"}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-slate-700">
                      {formatDate(customer.createdAt)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleOpenDetail(customer)}
                          className="px-2 py-1 text-xs rounded border border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          {t("common.view")}
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(customer)}
                          className="px-2 py-1 text-xs rounded border border-slate-200 text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1"
                          title={t("common.edit")}
                        >
                          <Edit2 className="w-3 h-3" />
                          <span className="hidden sm:inline">
                            {t("common.edit")}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-2 text-xs text-slate-600">
          <div>
            {t("orders.paginationSummary")
              .replace("{page}", pagination.currentPage.toString())
              .replace("{totalPages}", pagination.totalPages.toString())
              .replace("{totalItems}", pagination.totalItems.toString())}
          </div>
          <div className="inline-flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1 rounded border border-slate-200 bg-white text-xs disabled:opacity-50"
            >
              {t("common.previous")}
            </button>
            <span>
              {t("orders.page")} {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= pagination.totalPages}
              className="px-3 py-1 rounded border border-slate-200 bg-white text-xs disabled:opacity-50"
            >
              {t("common.next")}
            </button>
          </div>
        </div>
      )}

      <CustomerDetailModal
        isOpen={detailOpen}
        loading={false}
        customer={selectedCustomer}
        onClose={() => {
          setDetailOpen(false);
          setSelectedCustomer(null);
        }}
        onTierChange={handleTierChange}
        isUpdatingTier={updatingTierCustomerId === selectedCustomer?._id}
      />

      {isRegisterModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                {t("customers.registerTitle")}
              </h2>
              <button
                onClick={handleCloseRegisterModal}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("common.name")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder={t("customers.namePlaceholder")}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("common.phone")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder={t("customers.phonePlaceholder")}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("customers.city")} (Township)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Enter township"
                    value={formData.township}
                    onChange={(e) =>
                      setFormData({ ...formData, township: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("customers.addressLine")} (Address)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder="Enter address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50 rounded-b-xl flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={handleCloseRegisterModal}
                className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors order-2 sm:order-1"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleRegisterCustomer}
                disabled={isSubmitting}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium order-1 sm:order-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("customers.registering")}
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    {t("customers.addCustomer")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-primary" />
                {t("customers.editTitle")}
              </h2>
              <button
                onClick={handleCloseEditModal}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("common.name")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder={t("customers.namePlaceholder")}
                    value={editFormData.name}
                    onChange={(e) =>
                      setEditFormData((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {t("common.phone")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                    placeholder={t("customers.phonePlaceholder")}
                    value={editFormData.phone}
                    onChange={(e) =>
                      setEditFormData((p) => ({ ...p, phone: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    {t("customers.city")} (Township)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary"
                    value={editFormData.township}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        township: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    {t("customers.addressLine")} (Address)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-primary"
                    value={editFormData.address}
                    onChange={(e) =>
                      setEditFormData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-slate-50 rounded-b-xl flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={handleCloseEditModal}
                className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors order-2 sm:order-1"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={handleEditCustomer}
                disabled={editSubmitting}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium order-1 sm:order-2"
              >
                {editSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("customers.updating")}
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    {t("customers.updateCustomer")}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
