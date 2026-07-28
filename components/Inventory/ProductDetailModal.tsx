import React, { useState } from "react";
import {
  Image as ImageIcon,
  X,
  Package,
  DollarSign,
  Store,
  Warehouse,
} from "lucide-react";
import { ProductDetail } from "../../services/Inventory/fetchProductById";
import { useLanguage } from "../../context/LanguageContext";

interface ProductDetailModalProps {
  isOpen: boolean;
  loading: boolean;
  product: ProductDetail | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  isOpen,
  loading,
  product,
  onClose,
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"about" | "quantity">("about");

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
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "about"
                ? "bg-[#E8F5E9] text-slate-800 rounded-2xl"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            {t("inventory.aboutProduct")}
          </button>
          <button
            onClick={() => setActiveTab("quantity")}
            className={`px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "quantity"
                ? "bg-[#E8F5E9] text-slate-800 rounded-2xl"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            {t("inventory.productQuantity")}
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
                      <h4 className="font-semibold text-slate-700 text-sm">Basic Info</h4>
                    </div>
                    <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Product Name</span>
                        <span className="font-medium text-slate-800 text-right">{product.productName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Product Code</span>
                        <span className="font-medium text-slate-800 text-right">{product.productCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">SKU</span>
                        <span className="font-medium text-slate-800 text-right">{product.SKU || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Category</span>
                        <span className="font-medium text-slate-800 text-right">{product.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Brand</span>
                        <span className="font-medium text-slate-800 text-right">{product.brand || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Unit of Measure</span>
                        <span className="font-medium text-slate-800 text-right">{product.unitOfMeasure}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Status</span>
                        <span className={`font-medium ${product.status === "active" ? "text-green-600" : "text-red-600"}`}>
                          {product.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Created</span>
                        <span className="font-medium text-slate-800 text-right">{formatDate(product.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* ── Pricing ── */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                      <h4 className="font-semibold text-slate-700 text-sm">Pricing</h4>
                    </div>
                    <div className="p-4 grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <p className="text-xs text-red-600 font-medium">Buying Price</p>
                        <p className="text-lg font-bold text-slate-800 mt-1">{product.buyingPrice.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-xs text-green-600 font-medium">Selling Price</p>
                        <p className="text-lg font-bold text-slate-800 mt-1">{product.sellingPrice.toLocaleString()}</p>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-600 font-medium">Profit</p>
                        <p className="text-lg font-bold text-blue-700 mt-1">{product.profitAmount.toLocaleString()}</p>
                        <p className="text-xs text-blue-500">{product.profitMargin}%</p>
                      </div>
                    </div>
                  </div>

                  {/* ── Wholesale Prices ── */}
                  {wholesalePrices.length > 0 && (
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                        <h4 className="font-semibold text-slate-700 text-sm">Wholesale Prices</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Unit</th>
                              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Min Qty</th>
                              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Price (MMK)</th>
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
                        <h4 className="font-semibold text-slate-700 text-sm">UOM Conversions</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Unit</th>
                              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Factor</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Convert From</th>
                              <th className="px-4 py-2.5 text-center text-xs font-semibold text-slate-500">Default</th>
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
                        <h4 className="font-semibold text-slate-700 text-sm">Images</h4>
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
                      <p className="text-xs font-semibold text-amber-700 mb-1">Note</p>
                      <p className="text-sm text-amber-900">{product.note}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  {/* ── Total Quantity ── */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                      <h4 className="font-semibold text-slate-700 text-sm">Stock Summary</h4>
                    </div>
                    <div className="p-6 text-center">
                      <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Total Quantity</p>
                      <p className="text-5xl font-bold text-slate-800">
                        {product.stockAvailability.totalQuantity.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* ── Warehouse Stock ── */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                      <h4 className="font-semibold text-slate-700 text-sm">Warehouses</h4>
                      <span className="text-xs font-medium text-slate-500">
                        {product.stockAvailability.warehouses.count} location(s) · Total: {product.stockAvailability.warehouses.totalQuantity.toLocaleString()}
                      </span>
                    </div>
                    {product.stockAvailability.warehouses.count > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Location</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Address</th>
                              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Quantity</th>
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
                      <div className="p-6 text-center text-slate-400 text-sm">No warehouses found</div>
                    )}
                  </div>

                  {/* ── Storefront Stock ── */}
                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                      <h4 className="font-semibold text-slate-700 text-sm">Storefronts</h4>
                      <span className="text-xs font-medium text-slate-500">
                        {product.stockAvailability.storefronts.count} location(s) · Total: {product.stockAvailability.storefronts.totalQuantity.toLocaleString()}
                      </span>
                    </div>
                    {product.stockAvailability.storefronts.count > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Location</th>
                              <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Address</th>
                              <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Quantity</th>
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
                      <div className="p-6 text-center text-slate-400 text-sm">No storefronts found</div>
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
      </div>
    </div>
  );
};
