import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Supplier, Product, ApiPurchaseOrder } from "../types";
import { fetchSuppliers } from "../services/Supplier/fetchSuppliers";
import { fetchProducts } from "../services/Inventory/fetchProducts";
import { fetchPurchases } from "../services/Purchase/fetchPurchases";
import { fetchGRNs, GRNData } from "../services/Purchase/fetchGRNs";
import { toast } from "sonner";
import { useLanguage } from "../context/LanguageContext";

export type TabType = "po" | "grn";

export function usePurchasing() {
  const { t } = useLanguage();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>("po");

  // Shared State
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // PO State
  const [poList, setPOList] = useState<ApiPurchaseOrder[]>([]);
  const [deletedPOList, setDeletedPOList] = useState<ApiPurchaseOrder[]>([]);
  const [poFilter, setPoFilter] = useState<"pending" | "arrived" | "deleted">("pending");
  const [poPagination, setPoPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [deletedPoPagination, setDeletedPoPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPOId, setSelectedPOId] = useState<string | null>(null);
  const [isPODetailModalOpen, setIsPODetailModalOpen] = useState(false);

  // GRN State
  const [grnList, setGRNList] = useState<GRNData[]>([]);
  const [grnFilter, setGrnFilter] = useState<"pending" | "completed">("pending");
  const [grnPagination, setGrnPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [isCreateGRNModalOpen, setIsCreateGRNModalOpen] = useState(false);
  const [selectedGRNId, setSelectedGRNId] = useState<string | null>(null);
  const [isGRNDetailModalOpen, setIsGRNDetailModalOpen] = useState(false);
  const [transferModalType, setTransferModalType] = useState<
    "warehouse" | "storefront" | null
  >(null);
  const [transferGRNId, setTransferGRNId] = useState<string | null>(null);

  // Fetch Suppliers and Products
  useEffect(() => {
    const state = location.state as { viewPoId?: string } | null;
    if (state?.viewPoId) {
      setSelectedPOId(state.viewPoId);
      setIsPODetailModalOpen(true);
      setActiveTab("po");
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch Purchase Orders
        loadPurchases();

        // Fetch Deleted Purchase Orders
        loadDeletedPurchases();

        // Fetch GRNs
        loadGRNs();
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };
    loadData();
  }, []);

  // Fetch Suppliers and Products only when creating a new PO (lazy load)
  useEffect(() => {
    if (!isCreateModalOpen) return;

    const loadModalData = async () => {
      try {
        const supplierRes = await fetchSuppliers();
        if (supplierRes.success) {
          setSuppliers(supplierRes.data);
        }

        const productRes = await fetchProducts();
        if (productRes.success && Array.isArray(productRes.data)) {
          setProducts(productRes.data);
        } else if (Array.isArray(productRes)) {
          setProducts(productRes);
        } else if (productRes.data && Array.isArray(productRes.data)) {
          setProducts(productRes.data);
        }
      } catch (error) {
        console.error("Failed to load modal data", error);
      }
    };

    loadModalData();
  }, [isCreateModalOpen]);

  const loadPurchases = async (
    page: number = 1,
    limit: number = 10,
    status: "pending" | "arrived" = "pending",
  ) => {
    try {
      const res = await fetchPurchases({ page, limit, status });
      if (res.success) {
        setPOList(res.data);
        setPoPagination(res.pagination);
      }
    } catch (error) {
      console.error("Failed to load POs", error);
      toast.error(t("purchasing.failedToLoadPO"));
    }
  };

  const loadDeletedPurchases = async (page: number = 1, limit: number = 10) => {
    try {
      const res = await fetchPurchases({ page, limit, isDeleted: true });
      if (res.success) {
        setDeletedPOList(res.data);
        setDeletedPoPagination(res.pagination);
      }
    } catch (error) {
      console.error("Failed to load deleted POs", error);
      toast.error("Failed to load deleted POs");
    }
  };

  const loadGRNs = async (page: number = 1, limit: number = 10) => {
    try {
      const res = await fetchGRNs({ page, limit });
      if (res.success) {
        setGRNList(res.data);
        setGrnPagination(res.pagination);
      }
    } catch (error) {
      console.error("Failed to load GRNs", error);
      toast.error(t("purchasing.failedToLoadGRN"));
    }
  };

  const handleGRNSuccess = () => {
    loadGRNs(grnPagination.currentPage);
    loadPurchases(poPagination.currentPage);
    setActiveTab("grn");
  };

  const handleCreateGRNFromPO = (po: ApiPurchaseOrder) => {
    setSelectedPOId(po._id);
    setIsCreateGRNModalOpen(true);
  };

  const handleViewPO = (po: ApiPurchaseOrder) => {
    setSelectedPOId(po._id);
    setIsPODetailModalOpen(true);
  };

  const handleViewGRN = (grn: GRNData) => {
    setSelectedGRNId(grn._id);
    setIsGRNDetailModalOpen(true);
  };

  const getGRNId = (grn: GRNData) => grn._id || grn.id;

  const handleTransferGRN = (grn: GRNData) => {
    setTransferGRNId(getGRNId(grn));
    setTransferModalType("warehouse");
  };

  const handleTransferGRNToStorefront = (grn: GRNData) => {
    setTransferGRNId(getGRNId(grn));
    setTransferModalType("storefront");
  };

  const handleCloseTransferModal = () => {
    setTransferModalType(null);
    setTransferGRNId(null);
  };

  return {
    t,
    activeTab,
    setActiveTab,
    suppliers,
    products,
    poList,
    deletedPOList,
    poFilter,
    setPoFilter,
    poPagination,
    deletedPoPagination,
    isCreateModalOpen,
    setIsCreateModalOpen,
    selectedPOId,
    isPODetailModalOpen,
    setIsPODetailModalOpen,
    grnList,
    grnFilter,
    setGrnFilter,
    grnPagination,
    isCreateGRNModalOpen,
    setIsCreateGRNModalOpen,
    selectedGRNId,
    isGRNDetailModalOpen,
    setIsGRNDetailModalOpen,
    transferModalType,
    transferGRNId,
    loadPurchases,
    loadDeletedPurchases,
    loadGRNs,
    handleGRNSuccess,
    handleCreateGRNFromPO,
    handleViewPO,
    handleViewGRN,
    handleTransferGRN,
    handleTransferGRNToStorefront,
    handleCloseTransferModal,
  };
}
