import { useLanguage } from "../context/LanguageContext";
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  TrendingUp,
  TrendingDown,
  X,
  Loader2,
  Shield,
  ArrowRightLeft,
  RefreshCw,
  Info,
  Layers,
  Clock,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  fetchProductById,
  ProductDetail,
} from "../services/Inventory/fetchProductById";
import {
  fetchStorefrontStock,
  StorefrontStockItem,
} from "../services/Storefront/fetchStorefrontStock";
import { updateStorefrontStockQuantity } from "../services/Storefront/updateStorefrontStockQuantity";
import {
  updateInventoryEcommerceLimit,
  removeEcommerceLimit,
  EcommercePurchaseResetMode,
} from "../services/Inventory/updateInventoryEcommerceLimit";
import { getUnitOptions, breakdownQuantity } from "../utils/uom";
import { UnitPriceStockTable } from "../components/Storefront/UnitPriceStockTable";

export const StorefrontProductDetail: React.FC = () => {
  const { t } = useLanguage();
  const { storeId, productId } = useParams<{
    storeId: string;
    productId: string;
  }>();
  const navigate = useNavigate();

  const adminData = JSON.parse(localStorage.getItem("adminData") || "{}");
  const userRole = adminData.role;
  const isOwner = userRole === "owner";

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [stockItem, setStockItem] = useState<StorefrontStockItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Stock adjustment modal state
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [adjustmentType, setAdjustmentType] = useState<"increase" | "decrease">(
    "increase",
  );
  const [adjustmentQuantity, setAdjustmentQuantity] = useState(0);
  const [adjustmentUnit, setAdjustmentUnit] = useState("");
  const [adjustmentReason, setAdjustmentReason] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);

  // Ecommerce limit modal state
  const [isEcommerceLimitModalOpen, setIsEcommerceLimitModalOpen] =
    useState(false);
  const [ecommerceMaxPerUser, setEcommerceMaxPerUser] = useState(1);
  const [resetMode, setResetMode] =
    useState<EcommercePurchaseResetMode>("manual");
  const [resetDays, setResetDays] = useState(7);
  const [limitUnit, setLimitUnit] = useState("");
  const [isSavingEcommerceLimit, setIsSavingEcommerceLimit] = useState(false);

  useEffect(() => {
    loadData();
  }, [storeId, productId]);

  const loadData = async () => {
    if (!storeId || !productId) return;
    setLoading(true);
    try {
      // Fetch product details
      const productRes = await fetchProductById(productId);
      if (productRes.success && productRes.data) {
        setProduct(productRes.data);
        setAdjustmentUnit(productRes.data.unitOfMeasure || "");
      }

      // Fetch stock item for this product in this storefront
      const stockRes = await fetchStorefrontStock(
        storeId,
        1,
        100,
        undefined,
        productRes.data?.productCode,
      );

      // Fix bug: Select strictly by matching inventoryId._id === productId
      if (stockRes.success && Array.isArray(stockRes.data)) {
        const found = stockRes.data.find(
          (s) => s.inventoryId?._id === productId,
        );
        setStockItem(found || null);
      } else {
        setStockItem(null);
      }
    } catch (error) {
      console.error("Failed to load product data", error);
      setStockItem(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadData();
  };

  // Stock adjustment handlers
  const openAdjustmentModal = (type: "increase" | "decrease") => {
    setAdjustmentType(type);
    setAdjustmentQuantity(0);
    setAdjustmentReason("");
    setAdjustmentUnit(product?.unitOfMeasure || "piece");
    setIsAdjustmentModalOpen(true);
  };

  const handleSubmitAdjustment = async () => {
    if (!stockItem || adjustmentQuantity <= 0) return;

    setIsAdjusting(true);
    try {
      const payload = {
        quantityChange:
          adjustmentType === "increase"
            ? adjustmentQuantity
            : -adjustmentQuantity,
        unit: adjustmentUnit || product?.unitOfMeasure,
        reason: adjustmentReason,
      };
      const result = await updateStorefrontStockQuantity(
        stockItem._id,
        payload,
      );
      if (result.success) {
        toast.success(
          adjustmentType === "increase"
            ? t("storefrontProduct.increaseSuccess")
            : t("storefrontProduct.decreaseSuccess"),
        );
        setIsAdjustmentModalOpen(false);
        loadData();
      } else {
        toast.error(
          result.message || t("storefrontProduct.updateFailed"),
        );
      }
    } catch (error: any) {
      toast.error(error.message || t("storefrontProduct.updateFailed"));
    } finally {
      setIsAdjusting(false);
    }
  };

  // Ecommerce limit handlers
  const openEcommerceLimitModal = () => {
    if (!product) return;
    setEcommerceMaxPerUser(product.ecommerceMaxPerUser || 1);
    setResetMode(product.ecommercePurchaseResetMode || "manual");
    setResetDays(product.ecommercePurchaseResetDays || 7);
    setLimitUnit(product.limitUnit || "");
    setIsEcommerceLimitModalOpen(true);
  };

  const handleSaveEcommerceLimit = async () => {
    if (!productId) return;

    setIsSavingEcommerceLimit(true);
    try {
      const payload = {
        ecommerceMaxPerUser,
        ecommercePurchaseResetMode: resetMode,
        ...(resetMode === "timeline" ? { ecommercePurchaseResetDays: resetDays } : {}),
        limitUnit: limitUnit || undefined,
      };

      const result = await updateInventoryEcommerceLimit(productId, payload);
      if (result.success) {
        toast.success(t("storefrontProduct.saveLimitSuccess"));
        setIsEcommerceLimitModalOpen(false);
        loadData();
      } else {
        toast.error(
          result.message || t("storefrontProduct.saveLimitFailed"),
        );
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("storefrontProduct.saveLimitFailed");
      toast.error(message);
    } finally {
      setIsSavingEcommerceLimit(false);
    }
  };

  const handleRemoveEcommerceLimit = async () => {
    if (!productId) return;
    if (!window.confirm(t("storefrontProduct.removeLimitConfirm"))) return;

    try {
      const result = await removeEcommerceLimit(productId);
      if (result.success) {
        toast.success(t("storefrontProduct.limitRemovedSuccess"));
        loadData();
      } else {
        toast.error(result.message || t("storefrontProduct.saveLimitFailed"));
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t("storefrontProduct.saveLimitFailed");
      toast.error(message);
    }
  };

  // Transfer handler
  const handleTransfer = () => {
    navigate(`/storefront/${storeId}`, {
      state: { openTransfer: true, productId },
    });
  };

  // Format date helper: "16 Oct 2026, 1:20 pm"
  const formatDate = (dateString?: string): string => {
    if (!dateString) return "—";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "—";
      return d.toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateString;
    }
  };

  // Get unit options for adjustment
  const getAdjustmentUnitOptions = () => {
    if (!product) return [{ value: "piece", label: "piece", isBase: true }];
    const baseUnit = product.unitOfMeasure || "piece";
    return getUnitOptions(baseUnit, product.uomConversions);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-slate-500 font-medium">
            {t("storefrontProduct.loading")}
          </span>
        </div>
      </div>
    );
  }

  if (!product || !stockItem) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/storefront/${storeId}`)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title={t("storefrontProduct.backToStorefront")}
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">
            {t("storefrontProduct.notFoundTitle")}
          </h1>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 text-center py-16 px-4 shadow-sm max-w-lg mx-auto">
          <Package className="w-14 h-14 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-600 font-medium">
            {t("storefrontProduct.notFoundDesc")}
          </p>
          <button
            onClick={() => navigate(`/storefront/${storeId}`)}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium text-sm transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("storefrontProduct.backToStorefront")}</span>
          </button>
        </div>
      </div>
    );
  }

  const isLowStock = stockItem.isLowStock;
  const isOutOfStock = stockItem.quantity === 0;

  // Breakdown of quantity into composite units
  const breakdown = breakdownQuantity(
    stockItem.quantity,
    product.unitOfMeasure || "piece",
    product.uomConversions,
  );

  // Profit and markup calculations
  const sellingPrice = product.sellingPrice || 0;
  const buyingPrice = product.buyingPrice || 0;
  const profitAmount = sellingPrice - buyingPrice;
  const markupPercent =
    buyingPrice > 0 ? ((sellingPrice - buyingPrice) / buyingPrice) * 100 : 0;
  const marginPercent =
    sellingPrice > 0 ? ((sellingPrice - buyingPrice) / sellingPrice) * 100 : 0;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-5">
      {/* 1. Header with Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(`/storefront/${storeId}`)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors shrink-0 mt-0.5 cursor-pointer"
            title={t("storefrontProduct.backToStorefront")}
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                {product.productName}
              </h1>
              {product.productCode && (
                <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md font-mono font-semibold">
                  {product.productCode}
                </span>
              )}
              {/* Status Badge right next to the title */}
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                  {t("storefrontProduct.outOfStock")}
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                  {t("storefrontProduct.lowStock")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  {t("storefrontProduct.inStock")}
                </span>
              )}
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              {[
                product.brand || product.category,
                stockItem.storefrontId?.locationName ||
                  stockItem.storefrontId?.storefrontName ||
                  "Storefront",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white text-slate-600 cursor-pointer shadow-sm"
            title={t("common.refresh")}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Stock Summary Card & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Current Stock & Breakdown */}
        <div
          className={`bg-white rounded-xl shadow-sm border border-slate-200 p-5 ${
            isOwner ? "lg:col-span-2" : "lg:col-span-3"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t("storefrontProduct.currentStock")}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {t("storefrontProduct.lastUpdated")}: {formatDate(stockItem.lastUpdated)}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mt-1">
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tabular-nums">
              {stockItem.quantity.toLocaleString()}{" "}
              <span className="text-base sm:text-lg font-semibold text-slate-500">
                {product.unitOfMeasure || "piece"}
              </span>
            </div>
            {breakdown && (
              <div className="text-sm sm:text-base font-semibold text-primary bg-primary/10 px-3 py-1 rounded-lg self-start sm:self-auto">
                = {breakdown}
              </div>
            )}
          </div>

          {/* Quick Actions inside mobile view */}
          {isOwner && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2 sm:hidden">
              <button
                onClick={() => openAdjustmentModal("increase")}
                className="py-2 px-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t("storefrontProduct.addStock")}</span>
              </button>
              <button
                onClick={() => openAdjustmentModal("decrease")}
                disabled={stockItem.quantity === 0}
                className="py-2 px-2 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>{t("storefrontProduct.reduceStock")}</span>
              </button>
              <button
                onClick={handleTransfer}
                disabled={stockItem.quantity === 0}
                className="py-2 px-2 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[44px]"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>{t("storefrontProduct.transferToWarehouse")}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions Card (Desktop owner only) */}
        {isOwner && (
          <div className="hidden sm:flex flex-col justify-between bg-white rounded-xl shadow-sm border border-slate-200 p-5 lg:col-span-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              {t("storefrontProduct.actions")}
            </span>
            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={() => openAdjustmentModal("increase")}
                className="w-full py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[40px]"
              >
                <Plus className="w-4 h-4" />
                <span>{t("storefrontProduct.addStock")}</span>
              </button>
              <button
                onClick={() => openAdjustmentModal("decrease")}
                disabled={stockItem.quantity === 0}
                className="w-full py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[40px]"
              >
                <Minus className="w-4 h-4" />
                <span>{t("storefrontProduct.reduceStock")}</span>
              </button>
              <button
                onClick={handleTransfer}
                disabled={stockItem.quantity === 0}
                className="w-full py-2.5 px-3 text-xs sm:text-sm font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer min-h-[40px]"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>{t("storefrontProduct.transferToWarehouse")}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Centerpiece: Unit Price and Stock Table */}
      <UnitPriceStockTable
        baseUnit={product.unitOfMeasure || "piece"}
        uomConversions={product.uomConversions}
        sellingPrice={sellingPrice}
        buyingPrice={buyingPrice}
        quantityByUnit={stockItem.quantityByUnit}
        baseQuantity={stockItem.quantity}
        showBuyingPrice={isOwner}
      />

      {/* 4. Bottom Cards: Product Info & Ecommerce Limit */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Product Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              {t("storefrontProduct.productInfo")}
            </h3>
          </div>
          <div className="p-4 space-y-3.5">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">
                  {t("storefrontProduct.productCode")}
                </p>
                <p className="font-mono font-semibold text-slate-800">
                  {product.productCode || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">
                  {t("storefrontProduct.sku")}
                </p>
                <p className="font-medium text-slate-800">
                  {product.SKU || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">
                  {t("storefrontProduct.brand")}
                </p>
                <p className="font-medium text-slate-800">
                  {product.brand || product.category || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">
                  {t("storefrontProduct.profitPerBaseUnit", {
                    unit: product.unitOfMeasure || "piece",
                  })}
                </p>
                <div>
                  <p className="font-bold text-slate-800 tabular-nums">
                    {profitAmount.toLocaleString()} MMK
                  </p>
                  {buyingPrice > 0 && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t("storefrontProduct.profitMarkupMargin", {
                        markup: markupPercent.toFixed(1),
                        margin: marginPercent.toFixed(1),
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Description only if present */}
            {product.description && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400 mb-1">
                  {t("storefrontProduct.description")}
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Online Purchase Limit Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
            <h3 className="font-semibold text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              {t("storefrontProduct.ecommerceLimitTitle")}
            </h3>
          </div>
          <div className="p-4 flex flex-col justify-between h-[calc(100%-49px)]">
            <div className="space-y-2">
              {product.ecommerceMaxPerUser != null &&
              product.ecommerceMaxPerUser > 0 ? (
                <>
                  <div className="text-xl font-bold text-slate-800">
                    {t("storefrontProduct.limitPerUser", {
                      max: product.ecommerceMaxPerUser,
                      unit:
                        product.limitUnit || product.unitOfMeasure || "piece",
                    })}
                  </div>
                  <p className="text-xs text-slate-500">
                    {product.ecommercePurchaseResetMode === "timeline" &&
                    product.ecommercePurchaseResetDays
                      ? t("storefrontProduct.timelineReset", {
                          days: product.ecommercePurchaseResetDays,
                        })
                      : t("storefrontProduct.manualReset")}
                  </p>
                </>
              ) : (
                <div className="text-sm font-medium text-slate-500 py-1">
                  {t("storefrontProduct.noLimitSet")}
                </div>
              )}
            </div>

            {/* Owner Actions for Limit */}
            {isOwner && (
              <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2 mt-4">
                <button
                  onClick={openEcommerceLimitModal}
                  className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px]"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>
                    {product.ecommerceMaxPerUser != null &&
                    product.ecommerceMaxPerUser > 0
                      ? t("storefrontProduct.editLimit")
                      : t("storefrontProduct.setLimit")}
                  </span>
                </button>
                {product.ecommerceMaxPerUser != null &&
                  product.ecommerceMaxPerUser > 0 && (
                    <button
                      onClick={handleRemoveEcommerceLimit}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer min-h-[38px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t("storefrontProduct.removeLimit")}</span>
                    </button>
                  )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {isAdjustmentModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                {adjustmentType === "increase" ? (
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-rose-600" />
                )}
                {adjustmentType === "increase"
                  ? t("storefrontProduct.increaseStockTitle")
                  : t("storefrontProduct.decreaseStockTitle")}
              </h2>
              <button
                onClick={() => setIsAdjustmentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 mb-0.5">
                  {t("storefrontProduct.productLabel")}
                </p>
                <p className="font-bold text-slate-800 text-sm">
                  {product.productName}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {product.productCode} ·{" "}
                  {t("storefrontProduct.currentQtyLabel", {
                    qty: stockItem.quantity,
                  })}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {adjustmentType === "increase"
                    ? t("storefrontProduct.quantityToAdd")
                    : t("storefrontProduct.quantityToRemove")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={
                    adjustmentType === "decrease"
                      ? stockItem.quantity
                      : undefined
                  }
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder={t(
                    "storefrontProduct.enterQuantityPlaceholder",
                  )}
                  value={adjustmentQuantity || ""}
                  onChange={(e) =>
                    setAdjustmentQuantity(Number(e.target.value) || 0)
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t("storefrontProduct.unitSelectLabel")}
                </label>
                {(() => {
                  const unitOptions = getAdjustmentUnitOptions();
                  if (unitOptions.length <= 1) {
                    return (
                      <div className="w-full border border-slate-200 rounded-xl p-2.5 text-sm bg-slate-50 text-slate-700">
                        {product.unitOfMeasure || "piece"}
                      </div>
                    );
                  }
                  return (
                    <select
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
                      value={adjustmentUnit}
                      onChange={(e) => setAdjustmentUnit(e.target.value)}
                    >
                      {unitOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  );
                })()}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t("storefrontProduct.reasonLabel")}
                </label>
                <textarea
                  rows={3}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder={t("storefrontProduct.reasonPlaceholder")}
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setIsAdjustmentModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer min-h-[40px]"
                >
                  {t("common.close")}
                </button>
                <button
                  onClick={handleSubmitAdjustment}
                  disabled={isAdjusting || adjustmentQuantity <= 0}
                  className={`px-4 py-2 text-xs sm:text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer min-h-[40px] ${
                    adjustmentType === "increase"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {isAdjusting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />{" "}
                      {t("storefrontProduct.updating")}
                    </>
                  ) : (
                    <>
                      {adjustmentType === "increase" ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}{" "}
                      {adjustmentType === "increase"
                        ? t("storefrontProduct.increaseStockTitle")
                        : t("storefrontProduct.decreaseStockTitle")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ecommerce Limit Modal */}
      {isEcommerceLimitModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                {t("storefrontProduct.ecommerceLimitModalTitle")}
              </h2>
              <button
                onClick={() => setIsEcommerceLimitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 mb-0.5">
                  {t("storefrontProduct.productLabel")}
                </p>
                <p className="font-bold text-slate-800 text-sm">
                  {product.productName}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {product.productCode} ·{" "}
                  {t("storefrontProduct.currentQtyLabel", {
                    qty: stockItem.quantity,
                  })}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t("storefrontProduct.maxPerUserLabel")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={ecommerceMaxPerUser || ""}
                  onChange={(e) =>
                    setEcommerceMaxPerUser(Number(e.target.value) || 0)
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t("storefrontProduct.limitUnitLabel")}
                </label>
                {(() => {
                  const unitOptions = getAdjustmentUnitOptions();
                  if (unitOptions.length <= 1) {
                    return (
                      <div className="w-full border border-slate-200 rounded-xl p-2.5 text-xs bg-slate-50 text-slate-500">
                        {t("storefrontProduct.noAdditionalUnits")}
                      </div>
                    );
                  }
                  return (
                    <select
                      className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
                      value={limitUnit}
                      onChange={(e) => setLimitUnit(e.target.value)}
                    >
                      <option value="">
                        {t("storefrontProduct.baseUnitOption", {
                          unit: product.unitOfMeasure || "piece",
                        })}
                      </option>
                      {unitOptions
                        .filter((opt) => !opt.isBase)
                        .map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                    </select>
                  );
                })()}
                <p className="text-[11px] text-slate-400 mt-1">
                  {t("storefrontProduct.limitUnitHelp")}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {t("storefrontProduct.resetModeLabel")}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="resetMode"
                      checked={resetMode === "manual"}
                      onChange={() => setResetMode("manual")}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700">
                      {t("storefrontProduct.manualModeRadio")}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="resetMode"
                      checked={resetMode === "timeline"}
                      onChange={() => setResetMode("timeline")}
                      className="text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-slate-700">
                      {t("storefrontProduct.timelineModeRadio")}
                    </span>
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {t("storefrontProduct.resetModeHelp")}
                </p>
              </div>

              {resetMode === "timeline" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {t("storefrontProduct.resetDaysLabel")}{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={resetDays || ""}
                    onChange={(e) => setResetDays(Number(e.target.value) || 0)}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setIsEcommerceLimitModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer min-h-[40px]"
                >
                  {t("common.close")}
                </button>
                <button
                  onClick={handleSaveEcommerceLimit}
                  disabled={
                    isSavingEcommerceLimit ||
                    ecommerceMaxPerUser <= 0 ||
                    (resetMode === "timeline" && resetDays < 1)
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer min-h-[40px] text-xs sm:text-sm font-semibold"
                >
                  {isSavingEcommerceLimit ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />{" "}
                      {t("storefrontProduct.saving")}
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />{" "}
                      {t("storefrontProduct.saveLimit")}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StorefrontProductDetail;
