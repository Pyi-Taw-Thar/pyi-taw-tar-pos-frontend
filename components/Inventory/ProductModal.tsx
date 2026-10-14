import React, { useEffect, useRef, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { Product } from "../../types";
import { UomConversion } from "../../types/uom";
import { useLanguage } from "../../context/LanguageContext";
import { UomConversionsEditor } from "./UomConversionsEditor";
import {
  WholesalePriceEditor,
  WholesalePriceTier,
} from "./WholesalePriceEditor";
import {
  ProductImageUploader,
  ExistingImage,
} from "./ProductImageUploader";

export type { WholesalePriceTier };

export const sanitizeWholesalePricesForApi = (
  tiers?: WholesalePriceTier[],
): Array<{ quantity: number; price: number; unit?: string }> | undefined => {
  if (!tiers?.length) return undefined;

  const result = tiers
    .filter((t) => t.quantity > 0 && t.price >= 0)
    .map(({ quantity, price, unit }) => ({
      quantity,
      price,
      ...(unit?.trim() ? { unit: unit.trim() } : {}),
    }));

  return result.length > 0 ? result : undefined;
};

export interface ProductFormData {
  productName: string;
  productCode: string;
  saleCode?: string;
  SKU: string;
  barcode?: string;
  category: string;
  subCategory?: string;
  brand?: string;
  chemicalNames?: string[];
  description?: string;
  buyingPrice: number;
  sellingPrice: number;
  unitOfMeasure: string;
  uomConversions: UomConversion[];
  wholesalePrices?: WholesalePriceTier[];
  images?: File[];
  reorderPoint?: number;
  reorderQuantity?: number;
  taxRate?: number;
  status?: string;
  tags?: string[];
  note?: string;
}

export interface ApiProduct {
  _id?: string;
  id?: string;
  productName: string;
  productCode: string;
  saleCode?: string;
  SKU: string;
  barcode?: string;
  category: string;
  subCategory?: string;
  brand?: string;
  chemicalNames?: string[];
  description?: string;
  buyingPrice: number;
  sellingPrice: number;
  unitOfMeasure: string;
  uomConversions: UomConversion[];
  wholesalePrices?: WholesalePriceTier[];
  reorderPoint?: number;
  reorderQuantity?: number;
  taxRate?: number;
  images?: ExistingImage[];
  status?: string;
  tags?: string[];
  note?: string;
  stockWarehouse?: number;
  stockShop?: number;
}

interface ProductModalProps {
  isOpen: boolean;
  editingId: string | null;
  formData: ProductFormData;
  error: string | null;
  isLoading: boolean;
  products: Product[];
  apiProducts: ApiProduct[];
  onClose: () => void;
  onSave: () => void;
  onFormDataChange: (data: ProductFormData) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  editingId,
  formData,
  error,
  isLoading,
  products,
  apiProducts,
  onClose,
  onSave,
  onFormDataChange,
}) => {
  const { t } = useLanguage();
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);

  // Combobox states
  const [categoryInput, setCategoryInput] = useState("");
  const [categoryShowDropdown, setCategoryShowDropdown] = useState(false);
  const [subCategoryInput, setSubCategoryInput] = useState("");
  const [subCategoryShowDropdown, setSubCategoryShowDropdown] = useState(false);
  const [chemicalInput, setChemicalInput] = useState("");

  const categoryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subCategoryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, isLoading, onClose]);

  // Sync existing images on editingId change
  useEffect(() => {
    if (editingId) {
      const product = apiProducts.find(
        (p) => p._id === editingId || p.id === editingId,
      );
      setExistingImages(product?.images || []);
    } else {
      setExistingImages([]);
    }
  }, [editingId, apiProducts]);

  useEffect(() => {
    setCategoryInput("");
    setSubCategoryInput("");
    setChemicalInput("");
    return () => {
      if (categoryTimeoutRef.current) clearTimeout(categoryTimeoutRef.current);
      if (subCategoryTimeoutRef.current)
        clearTimeout(subCategoryTimeoutRef.current);
    };
  }, [isOpen, editingId]);

  const updateFormData = (updates: Partial<ProductFormData>) => {
    onFormDataChange({ ...formData, ...updates });
  };

  const handleAddChemicalName = () => {
    const raw = chemicalInput.trim();
    if (!raw) return;
    const newNames = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const existing = formData.chemicalNames || [];
    const merged = [...existing];
    for (const name of newNames) {
      if (!merged.some((item) => item.toLowerCase() === name.toLowerCase())) {
        merged.push(name);
      }
    }
    updateFormData({ chemicalNames: merged });
    setChemicalInput("");
  };

  const handleRemoveChemicalName = (indexToRemove: number) => {
    const existing = formData.chemicalNames || [];
    updateFormData({
      chemicalNames: existing.filter((_, idx) => idx !== indexToRemove),
    });
  };

  // Unique categories & subcategories
  const getFilteredCategories = (input: string): string[] => {
    const categories = new Set<string>();
    products.forEach((p) => {
      if (p.category) categories.add(p.category);
    });
    const all = Array.from(categories).sort();
    if (!input.trim()) return all;
    return all.filter((cat) => cat.toLowerCase().includes(input.toLowerCase()));
  };

  const getFilteredSubCategories = (input: string): string[] => {
    const subCategories = new Set<string>();
    apiProducts.forEach((p) => {
      if (p.subCategory?.trim()) subCategories.add(p.subCategory.trim());
    });
    const all = Array.from(subCategories).sort();
    if (!input.trim()) return all;
    return all.filter((sub) => sub.toLowerCase().includes(input.toLowerCase()));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Fixed Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white rounded-t-xl shrink-0">
          <h2 id="modal-product-title" className="text-lg sm:text-xl font-bold text-slate-800">
            {editingId
              ? t("inventory.editProduct")
              : t("inventory.addNewProduct")}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? t("inventory.saving") : t("inventory.save")}
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm shrink-0">
            {error}
          </div>
        )}

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 auto-rows-min">
          {/* Product Name */}
          <div className="col-span-1">
            <label
              htmlFor="product-name-input"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1"
            >
              {t("inventory.productName")} <span className="text-red-500">*</span>
            </label>
            <input
              id="product-name-input"
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={formData.productName}
              placeholder={t("inventory.productNamePlaceholder")}
              onChange={(e) => {
                const productName = e.target.value;
                updateFormData({ productName, productCode: productName });
              }}
              required
            />
          </div>

          {/* Barcode */}
          <div className="col-span-1">
            <label
              htmlFor="product-barcode-input"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1"
            >
              {t("inventory.barcode")}
            </label>
            <input
              id="product-barcode-input"
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={formData.barcode || ""}
              onChange={(e) => updateFormData({ barcode: e.target.value })}
              placeholder={t("inventory.barcode")}
            />
          </div>

          {/* Product Code */}
          <div className="col-span-1">
            <label
              htmlFor="product-code-input"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1"
            >
              {t("inventory.productCode")} <span className="text-red-500">*</span>
            </label>
            <input
              id="product-code-input"
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={formData.productCode}
              placeholder={t("inventory.productCodePlaceholder")}
              onChange={(e) => updateFormData({ productCode: e.target.value })}
              required
            />
          </div>

          {/* SKU */}
          <div className="col-span-1">
            <label
              htmlFor="product-sku-input"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1"
            >
              {t("inventory.sku")}
            </label>
            <input
              id="product-sku-input"
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={formData.SKU}
              placeholder={t("inventory.skuPlaceholder")}
              onChange={(e) => updateFormData({ SKU: e.target.value })}
            />
          </div>

          {/* Brand */}
          <div className="col-span-1">
            <label
              htmlFor="product-brand-input"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1"
            >
              {t("inventory.brand")}
            </label>
            <input
              id="product-brand-input"
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={formData.brand || ""}
              placeholder={t("inventory.brandPlaceholder")}
              onChange={(e) => updateFormData({ brand: e.target.value })}
            />
          </div>

          {/* Category */}
          <div className="col-span-1">
            <label
              htmlFor="product-category-input"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1"
            >
              {t("inventory.category")} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="product-category-input"
                type="text"
                required
                className="w-full border border-slate-300 rounded-lg p-2 pr-8 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={categoryInput || formData.category}
                onChange={(e) => {
                  const value = e.target.value;
                  setCategoryInput(value);
                  updateFormData({ category: value });
                  setCategoryShowDropdown(true);
                }}
                onFocus={() => setCategoryShowDropdown(true)}
                onBlur={() => {
                  categoryTimeoutRef.current = setTimeout(
                    () => setCategoryShowDropdown(false),
                    200,
                  );
                }}
                placeholder={t("inventory.categoryPlaceholder")}
              />
              {categoryShowDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {getFilteredCategories(categoryInput || formData.category).map(
                    (category) => (
                      <div
                        key={category}
                        className="px-4 py-2 text-sm hover:bg-primary/10 cursor-pointer text-slate-700"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          updateFormData({ category });
                          setCategoryInput("");
                          setCategoryShowDropdown(false);
                        }}
                      >
                        {category}
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sub Category */}
          <div className="col-span-1">
            <label
              htmlFor="product-subcategory-input"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1"
            >
              {t("inventory.subCategory")}
            </label>
            <div className="relative">
              <input
                id="product-subcategory-input"
                type="text"
                className="w-full border border-slate-300 rounded-lg p-2 pr-8 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={subCategoryInput || formData.subCategory || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setSubCategoryInput(value);
                  updateFormData({ subCategory: value });
                  setSubCategoryShowDropdown(true);
                }}
                onFocus={() => setSubCategoryShowDropdown(true)}
                onBlur={() => {
                  subCategoryTimeoutRef.current = setTimeout(
                    () => setSubCategoryShowDropdown(false),
                    200,
                  );
                }}
                placeholder={t("inventory.subCategoryPlaceholder")}
              />
              {subCategoryShowDropdown && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {getFilteredSubCategories(
                    subCategoryInput || formData.subCategory || "",
                  ).map((subCategory) => (
                    <div
                      key={subCategory}
                      className="px-4 py-2 text-sm hover:bg-primary/10 cursor-pointer text-slate-700"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        updateFormData({ subCategory });
                        setSubCategoryInput("");
                        setSubCategoryShowDropdown(false);
                      }}
                    >
                      {subCategory}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Unit of Measure */}
          <div className="col-span-1">
            <label
              htmlFor="product-uom-input"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1"
            >
              {t("inventory.unitOfMeasure")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="product-uom-input"
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={formData.unitOfMeasure}
              onChange={(e) =>
                updateFormData({ unitOfMeasure: e.target.value })
              }
              placeholder={t("inventory.unitOfMeasurePlaceholder")}
              required
            />
          </div>

          {/* Chemical Names — full width */}
          <div className="col-span-1 sm:col-span-2">
            <label
              htmlFor="product-chemical-input"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1"
            >
              {t("inventory.chemicalNames")}
            </label>
            <div className="flex gap-2">
              <input
                id="product-chemical-input"
                type="text"
                className="flex-1 border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                value={chemicalInput}
                onChange={(e) => setChemicalInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddChemicalName();
                  }
                }}
                placeholder={t("inventory.chemicalNamePlaceholder")}
              />
              <button
                type="button"
                onClick={handleAddChemicalName}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors shrink-0"
              >
                <Plus className="w-4 h-4" />
                {t("inventory.addChemicalName")}
              </button>
            </div>
            {formData.chemicalNames && formData.chemicalNames.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.chemicalNames.map((chem, idx) => (
                  <span
                    key={`${chem}-${idx}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    {chem}
                    <button
                      type="button"
                      onClick={() => handleRemoveChemicalName(idx)}
                      className="text-blue-500 hover:text-blue-800 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${chem}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Buying Price */}
          <div className="col-span-1">
            <label
              htmlFor="product-buying-price-input"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1"
            >
              {t("inventory.buyingPrice")} <span className="text-red-500">*</span>
            </label>
            <input
              id="product-buying-price-input"
              type="number"
              step="0.01"
              min="0"
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={formData.buyingPrice}
              onChange={(e) =>
                updateFormData({ buyingPrice: Number(e.target.value) || 0 })
              }
              required
            />
          </div>

          {/* Selling Price */}
          <div className="col-span-1">
            <label
              htmlFor="product-selling-price-input"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1"
            >
              {t("inventory.sellingPrice")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              id="product-selling-price-input"
              type="number"
              step="0.01"
              min="0"
              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              value={formData.sellingPrice}
              onChange={(e) =>
                updateFormData({ sellingPrice: Number(e.target.value) || 0 })
              }
              required
            />
          </div>

          {/* UOM Conversions — full width */}
          <div className="col-span-1 sm:col-span-2">
            <UomConversionsEditor
              baseUnit={formData.unitOfMeasure}
              conversions={formData.uomConversions}
              onChange={(uomConversions) => updateFormData({ uomConversions })}
            />
          </div>

          {/* Wholesale prices — full width */}
          <div className="col-span-1 sm:col-span-2">
            <WholesalePriceEditor
              tiers={formData.wholesalePrices || []}
              onChange={(wholesalePrices) => updateFormData({ wholesalePrices })}
            />
          </div>

          {/* Product images — full width */}
          <div className="col-span-1 sm:col-span-2">
            <ProductImageUploader
              productId={editingId}
              existingImages={existingImages}
              onExistingImagesChange={setExistingImages}
              newImages={formData.images || []}
              onNewImagesChange={(images) => updateFormData({ images })}
            />
          </div>

          {/* Note — full width */}
          <div className="col-span-1 sm:col-span-2">
            <label
              htmlFor="product-note-input"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1"
            >
              {t("pos.note")}
            </label>
            <textarea
              id="product-note-input"
              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              rows={2}
              value={formData.note || ""}
              onChange={(e) => updateFormData({ note: e.target.value })}
              placeholder={t("pos.notePlaceholder")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
