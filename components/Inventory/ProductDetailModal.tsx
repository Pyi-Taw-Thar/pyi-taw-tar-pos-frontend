import React, { useState, useEffect, useMemo } from "react";
import {
  Image as ImageIcon,
  X,
  Package,
  Barcode,
  Calendar,
  AlertCircle,
  RefreshCw,
  Building2,
  Store,
} from "lucide-react";
import { ProductDetail } from "../../services/Inventory/fetchProductById";
import { useLanguage } from "../../context/LanguageContext";
import { fetchBatchesByProduct, BatchItem } from "../../services/Batch/fetchBatchesByProduct";
import { BatchBarcodeStickerModal } from "../Common/BatchBarcodeStickerModal";

interface ProductDetailModalProps {
  isOpen: boolean;
  loading: boolean;
  product: ProductDetail | null;
  onClose: () => void;
}

interface GroupedBatch {
  key: string;
  batchBarcode: string;
  batchNumber: string;
  expiryDate: string | null;
  isExpired: boolean;
  daysUntilExpiry: number | null;
  totalQuantity: number;
  status: "active" | "expired" | "depleted";
  locations: {
    locationId: string;
    locationName: string;
    locationType: string;
    quantity: number;
  }[];
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  loading,
  product,
  onClose,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"about" | "quantity" | "batches">("about");
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [selectedBatchForModal, setSelectedBatchForModal] = useState<GroupedBatch | null>(null);

  useEffect(() => {
    if (isOpen && product?._id && activeTab === "batches") {
      loadBatches();
    }
  }, [isOpen, product?._id, activeTab]);

  const loadBatches = async () => {
    if (!product?._id) return;
    setLoadingBatches(true);
    try {
      const res = await fetchBatchesByProduct(product._id, { includeDepleted: true });
      if (res.success) {
        setBatches(res.data);
      } else {
        setBatches([]);
      }
    } catch (err) {
      console.error("Error loading product batches:", err);
      setBatches([]);
    } finally {
      setLoadingBatches(false);
    }
  };

  const groupedBatches = useMemo<GroupedBatch[]>(() => {
    const map = new Map<string, GroupedBatch>();

    for (const b of batches) {
      const key = b.batchBarcode || `${b.batchNumber}_${b.expiryDate || "no_exp"}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          batchBarcode: b.batchBarcode,
          batchNumber: b.batchNumber,
          expiryDate: b.expiryDate,
          isExpired: b.isExpired || false,
          daysUntilExpiry: b.daysUntilExpiry ?? null,
          totalQuantity: 0,
          status: "active",
          locations: [],
        });
      }

      const group = map.get(key)!;
      group.totalQuantity += b.quantity;
      group.locations.push({
        locationId: b.locationId?._id || "",
        locationName: b.locationId?.locationName || "Unknown Location",
        locationType: b.locationType,
        quantity: b.quantity,
      });
    }

    const result = Array.from(map.values());

    for (const group of result) {
      if (group.totalQuantity <= 0) {
        group.status = "depleted";
      } else if (group.isExpired) {
        group.status = "expired";
      } else {
        group.status = "active";
      }

      // Sort locations: positive quantities first
      group.locations.sort((a, b) => b.quantity - a.quantity);
    }

    return result;
  }, [batches]);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const productImages = product?.images ?? [];
  const primaryImageUrl =
    productImages.find((img) => img.isPrimary)?.url ?? productImages[0]?.url;
  const wholesalePrices = product?.wholesalePrices ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden min-h-0">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b bg-slate-50">
          <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            {t("inventory.productDetails")}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-4 py-2 gap-5">
          <button
            onClick={() => setActiveTab("about")}
            className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === "about"
                ? "bg-[#E8F5E9] text-slate-800 rounded-2xl"
                : "text-slate-600 hover:text-slate-800"
              }`}
          >
            {t("inventory.aboutProduct")}
          </button>
          <button
            onClick={() => setActiveTab("quantity")}
            className={`px-4 py-3 text-sm font-medium transition-colors ${activeTab === "quantity"
                ? "bg-[#E8F5E9] text-slate-800 rounded-2xl"
                : "text-slate-600 hover:text-slate-800"
              }`}
          >
            {t("inventory.productQuantity")}
          </button>
          <button
            onClick={() => setActiveTab("batches")}
            className={`px-4 py-3 text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === "batches"
                ? "bg-[#E8F5E9] text-slate-800 rounded-2xl"
                : "text-slate-600 hover:text-slate-800"
              }`}
          >
            <Barcode className="w-4 h-4 text-emerald-600" />
            {t("inventory.productBatches")}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto min-h-0 p-6 min-h-[420px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-slate-500">
                {t("inventory.loadingProductDetails")}
              </p>
            </div>
          ) : product ? (
            <>
              {activeTab === "about" ? (
                <div className="space-y-5">
                  {/* ── Basic Info ── */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                      <h4 className="font-semibold text-slate-700 text-sm">{t("inventory.basicInfo")}</h4>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t("inventory.productName")}</span>
                        <span className="font-medium text-slate-800 text-right">{product.productName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t("inventory.productCode")}</span>
                        <span className="font-medium text-slate-800 text-right">{product.productCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">SKU</span>
                        <span className="font-medium text-slate-800 text-right">{product.SKU || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t("inventory.category")}</span>
                        <span className="font-medium text-slate-800 text-right">{product.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t("inventory.subCategory")}</span>
                        <span className="font-medium text-slate-800 text-right">{product.subCategory || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t("inventory.brand")}</span>
                        <span className="font-medium text-slate-800 text-right">{product.brand || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t("inventory.unitOfMeasure")}</span>
                        <span className="font-medium text-slate-800 text-right">{product.unitOfMeasure}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t("common.status")}</span>
                        <span className={`font-medium ${product.status === "active" ? "text-green-600" : "text-red-600"}`}>
                          {product.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">{t("inventory.created")}</span>
                        <span className="font-medium text-slate-800 text-right">{formatDate(product.createdAt)}</span>
                      </div>
                      <div className="col-span-2 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 pt-2 border-t border-slate-100">
                        <span className="text-slate-500 shrink-0">{t("inventory.chemicalNames")}</span>
                        {product.chemicalNames && product.chemicalNames.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 sm:justify-end">
                            {product.chemicalNames.map((chem, idx) => (
                              <span
                                key={`${chem}-${idx}`}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                              >
                                {chem}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="font-medium text-slate-800 text-right">—</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Pricing ── */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                      <h4 className="font-semibold text-slate-700 text-sm">{t("inventory.pricing")}</h4>
                    </div>
                    <div className="p-4 grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-xs text-red-600 font-medium">{t("inventory.buyingPrice")}</p>
                        <p className="text-lg font-bold text-slate-800 mt-1">{product.buyingPrice.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-green-600 font-medium">{t("inventory.sellingPrice")}</p>
                        <p className="text-lg font-bold text-slate-800 mt-1">{product.sellingPrice.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-600 font-medium">{t("inventory.profit")}</p>
                        <p className="text-lg font-bold text-blue-700 mt-1">{product.profitAmount.toLocaleString()}</p>
                        <p className="text-xs text-blue-500">{product.profitMargin}%</p>
                      </div>
                    </div>
                  </div>

                  {/* ── Wholesale Prices ── */}
                  {wholesalePrices.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                        <h4 className="font-semibold text-slate-700 text-sm">{t("inventory.wholesalePrices")}</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">{t("inventory.unit") || "Unit"}</th>
                              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">{t("inventory.minQty")}</th>
                              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">{t("inventory.priceMmk")}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {wholesalePrices.map((wp, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="px-4 py-2.5 text-slate-600">{wp.unit?.trim() || "—"}</td>
                                <td className="px-4 py-2.5 text-right">{wp.quantity.toLocaleString()}</td>
                                <td className="px-4 py-2.5 text-right font-medium">{wp.price.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ── UOM Conversions ── */}
                  {product.uomConversions && product.uomConversions.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                        <h4 className="font-semibold text-slate-700 text-sm">{t("inventory.uomConversions")}</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">{t("common.unit")}</th>
                              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">{t("inventory.factor")}</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">{t("inventory.convertFrom")}</th>
                              <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500">{t("inventory.default")}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {product.uomConversions.map((row, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="px-4 py-2.5 font-medium text-slate-800">{row.unit}</td>
                                <td className="px-4 py-2.5 text-right font-mono text-slate-600">×{row.factor}</td>
                                <td className="px-4 py-2.5 text-slate-600">{row.convertFrom || product.unitOfMeasure + " (base)"}</td>
                                <td className="px-4 py-2.5 text-center">{row.isDefaultSellingUnit ? <span className="text-green-600 font-bold text-lg">✓</span> : "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* ── Product Images ── */}
                  {productImages.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                        <h4 className="font-semibold text-slate-700 text-sm">{t("inventory.images")}</h4>
                      </div>
                      <div className="p-4 space-y-3">
                        {primaryImageUrl && (
                          <img src={primaryImageUrl} alt={product.productName} className="w-64 h-64 object-contain rounded-lg border bg-slate-50 mx-auto" />
                        )}
                        {productImages.length > 1 && primaryImageUrl && (
                          <div className="grid grid-cols-6 gap-2">
                            {productImages.filter((img) => img.url !== primaryImageUrl).slice(0, 6).map((img, idx) => (
                              <div key={img.key || img.id || img._id || `${img.url}-${idx}`} className="rounded-md overflow-hidden border bg-slate-50">
                                <img src={img.url} alt={product.productName} className="w-full h-16 object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── Note ── */}
                  {product.note && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <p className="text-xs font-semibold text-amber-700 mb-1">{t("inventory.note")}</p>
                      <p className="text-sm text-amber-900">{product.note}</p>
                    </div>
                  )}
                </div>
              ) : activeTab === "quantity" ? (
                <div className="space-y-5">
                  {/* ── Total Quantity ── */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                      <h4 className="font-semibold text-slate-700 text-sm">{t("inventory.stockSummary")}</h4>
                    </div>
                    <div className="p-6 text-center">
                      <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">{t("inventory.totalQuantity")}</p>
                      <p className="text-5xl font-bold text-slate-800">
                        {product.stockAvailability.totalQuantity.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* ── Warehouse Stock ── */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                      <h4 className="font-semibold text-slate-700 text-sm">{t("inventory.warehouses")}</h4>
                      <span className="text-xs font-medium text-slate-500">
                        {product.stockAvailability.warehouses.count} location(s) · Total: {product.stockAvailability.warehouses.totalQuantity.toLocaleString()}
                      </span>
                    </div>
                    {product.stockAvailability.warehouses.count > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">{t("inventory.location")}</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">{t("common.address")}</th>
                              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">{t("common.quantity")}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {product.stockAvailability.warehouses.locations.map((loc) => (
                              <tr key={loc.locationId} className="hover:bg-slate-50">
                                <td className="px-4 py-2.5 font-medium text-slate-800">{loc.locationName}</td>
                                <td className="px-4 py-2.5 text-slate-500">{loc.locationAddress || "—"}</td>
                                <td className="px-4 py-2.5 text-right font-bold text-slate-800">{loc.quantity.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-sm">{t("inventory.noWarehousesFound")}</div>
                    )}
                  </div>

                  {/* ── Storefront Stock ── */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                      <h4 className="font-semibold text-slate-700 text-sm">{t("inventory.storefronts")}</h4>
                      <span className="text-xs font-medium text-slate-500">
                        {product.stockAvailability.storefronts.count} location(s) · Total: {product.stockAvailability.storefronts.totalQuantity.toLocaleString()}
                      </span>
                    </div>
                    {product.stockAvailability.storefronts.count > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">{t("inventory.location")}</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">{t("common.address")}</th>
                              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">{t("common.quantity")}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {product.stockAvailability.storefronts.locations.map((loc) => (
                              <tr key={loc.locationId} className="hover:bg-slate-50">
                                <td className="px-4 py-2.5 font-medium text-slate-800">{loc.locationName}</td>
                                <td className="px-4 py-2.5 text-slate-500">{loc.locationAddress || "—"}</td>
                                <td className="px-4 py-2.5 text-right font-bold text-slate-800">{loc.quantity.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-sm">{t("inventory.noStorefrontsFound")}</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                      <h4 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
                        <Barcode className="w-4 h-4 text-emerald-600" />
                        {t("inventory.productBatches")}
                      </h4>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-slate-500">
                          {groupedBatches.length} batch(es)
                        </span>
                        <button
                          type="button"
                          onClick={loadBatches}
                          disabled={loadingBatches}
                          className="p-1 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                          title={t("common.refresh")}
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loadingBatches ? "animate-spin" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {loadingBatches ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-slate-500 text-sm">{t("inventory.loadingBatches")}</p>
                      </div>
                    ) : groupedBatches.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-sm">
                        <Barcode className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-medium text-slate-600">{t("inventory.noBatchesFound")}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {t("inventory.noBatchesHelp")}
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">
                                {t("inventory.batchBarcode")}
                              </th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">
                                {t("inventory.batchNumber")}
                              </th>
                              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">
                                {t("inventory.totalBatchQuantity")}
                              </th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">
                                {t("inventory.expiryDate")}
                              </th>
                              <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500">
                                {t("inventory.batchStatus")}
                              </th>
                              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">
                                {t("inventory.batchAction")}
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {groupedBatches.map((g) => {
                              const isExp = g.isExpired;
                              const isNearExp = !isExp && g.daysUntilExpiry != null && g.daysUntilExpiry <= 30;
                              return (
                                <tr key={g.key} className="hover:bg-slate-50">
                                  <td className="px-4 py-2.5">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedBatchForModal(g)}
                                      className="font-mono font-bold text-xs px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md hover:bg-emerald-100 hover:border-emerald-300 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                      title={t("inventory.viewBarcode")}
                                    >
                                      <Barcode className="w-3.5 h-3.5 text-emerald-600" />
                                      {g.batchBarcode}
                                    </button>
                                  </td>
                                  <td className="px-4 py-2.5 font-medium text-slate-800">
                                    {g.batchNumber}
                                  </td>
                                  <td className="px-4 py-2.5 text-right font-bold text-slate-800">
                                    <span>{g.totalQuantity.toLocaleString()}</span>{" "}
                                    <span className="text-xs text-slate-500 font-normal">
                                      {product.unitOfMeasure || ""}
                                    </span>
                                  </td>
                                  <td className="px-4 py-2.5 text-xs">
                                    {g.expiryDate ? (
                                      <div>
                                        <div className="font-medium text-slate-700">
                                          {new Date(g.expiryDate).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            year: "numeric",
                                          })}
                                        </div>
                                        {isExp ? (
                                          <span className="text-[11px] text-rose-600 font-semibold">{t("inventory.batchExpired")}</span>
                                        ) : isNearExp ? (
                                          <span className="text-[11px] text-amber-600 font-semibold">
                                            {t("inventory.batchDaysLeft").replace("{days}", String(g.daysUntilExpiry))}
                                          </span>
                                        ) : null}
                                      </div>
                                    ) : (
                                      <span className="text-slate-400">—</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2.5 text-center">
                                    {g.status === "depleted" || g.totalQuantity <= 0 ? (
                                      <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                        {t("inventory.batchDepleted")}
                                      </span>
                                    ) : isExp ? (
                                      <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                                        {t("inventory.batchExpired")}
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        {t("inventory.batchActive")}
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2.5 text-right">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedBatchForModal(g)}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                                      title={t("inventory.viewBarcode")}
                                    >
                                      <Barcode className="w-3.5 h-3.5 text-emerald-600" />
                                      {t("inventory.viewBarcode")}
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
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="w-12 h-12 text-slate-300 mb-3" />
              <p className="text-slate-500">
                {t("inventory.noProductDetails")}
              </p>
            </div>
          )}
        </div>

        {/* Batch Barcode Sticker — ဖာ/ပုံး ဖောက်ပြီး unit အလိုက် sticker ထပ်ထုတ်ရန် */}
        {selectedBatchForModal && product && (
          <BatchBarcodeStickerModal
            isOpen={!!selectedBatchForModal}
            onClose={() => setSelectedBatchForModal(null)}
            batchData={{
              productName: product.productName,
              productCode: product.productCode,
              batchNumber: selectedBatchForModal.batchNumber,
              batchBarcode: selectedBatchForModal.batchBarcode,
              expiryDate: selectedBatchForModal.expiryDate,
              sellingPrice: product.sellingPrice,
              quantity: selectedBatchForModal.totalQuantity,
              baseUnit: product.unitOfMeasure,
              uomConversions: product.uomConversions,
            }}
          />
        )}
      </div>
    </div>
  );
};
