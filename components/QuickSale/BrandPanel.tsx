import React from "react";
import { Store, Search, Scan, ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import type { StorefrontStockItem } from "../../services/Storefront/fetchStorefrontStock";

interface BrandPanelProps {
  brands: string[];
  selectedBrand: string | null;
  onBrandSelect: (brand: string) => void;
  onBack: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  onBarcodeScan: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  loading: boolean;
  brandsLoading: boolean;
  filteredProducts: StorefrontStockItem[];
  onAddToCart: (item: StorefrontStockItem) => void;
}

export const BrandPanel: React.FC<BrandPanelProps> = ({
  brands,
  selectedBrand,
  onBrandSelect,
  onBack,
  search,
  onSearchChange,
  onBarcodeScan,
  selectedCategory,
  onCategoryChange,
  categories,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
  loading,
  brandsLoading,
  filteredProducts,
  onAddToCart,
}) => {
  const { t } = useLanguage();

  if (selectedBrand) {
    return (
      <div className="flex-1 bg-white flex flex-col border-l border-[#E9ECEF] shadow-sm h-[calc(100vh-60px)]">
        <div className="p-4 border-b space-y-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-dark-600 hover:text-dark-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("quickSale.backToBrands")}
          </button>
          <h2 className="font-bold text-lg text-primary">{selectedBrand}</h2>
          <div className="relative">
            <Search className="absolute left-3 top-[11px] h-4 w-4 text-gray-400 pointer-events-none" />
            <Scan className="absolute right-3 top-[11px] h-4 w-4 text-gray-400 pointer-events-none opacity-50" />
            <input
              type="text"
              placeholder={t("pos.searchOrScanBarcode") || "Search..."}
              className="w-full pl-9 pr-9 py-2 border border-dark-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white text-sm"
              value={search}
              onChange={(e) => {
                onSearchChange(e.target.value);
                onPageChange(1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && search.trim()) {
                  e.preventDefault();
                  onBarcodeScan(search);
                }
              }}
              autoFocus
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onCategoryChange("All")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === "All"
                  ? "bg-primary text-white"
                  : "bg-dark-100 text-dark-600 hover:bg-dark-200"
              }`}
            >
              {t("pos.allCategories")}
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => onCategoryChange(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === c
                    ? "bg-primary text-white"
                    : "bg-dark-100 text-dark-600 hover:bg-dark-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {!loading && totalPages > 1 && (
          <div className="px-4 py-2 border-b flex items-center justify-between text-xs text-gray-500">
            <span>
              {(currentPage - 1) * 100 + 1}-
              {Math.min(currentPage * 100, totalItems)} of {totalItems}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange(1)}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronDown className="w-3 h-3 rotate-90" />
              </button>
              <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 text-xs"
              >
                Prev
              </button>
              <span className="px-2 font-medium text-dark-800">
                {currentPage}
              </span>
              <button
                onClick={() =>
                  onPageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30 text-xs"
              >
                Next
              </button>
              <button
                onClick={() => onPageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronDown className="w-3 h-3 -rotate-90" />
              </button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              {t("pos.loading")}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              {t("quickSale.noProducts")}
            </div>
          ) : (
            filteredProducts.map((item) => (
              <div
                key={item._id}
                onClick={() => onAddToCart(item)}
                className={`bg-white p-3 rounded-xl border border-dark-200 cursor-pointer transition-all hover:shadow-md hover:border-primary hover:scale-[1.01] ${item.availableQuantity === 0 ? "opacity-50 grayscale pointer-events-none" : ""}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0 mr-2">
                    <h3 className="font-medium text-gray-800 text-sm line-clamp-2">
                      {item.inventoryId.productName}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5 font-mono">
                      {item.inventoryId.productCode}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.inventoryId.category}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-[#212529] text-sm">
                      {item.inventoryId.sellingPrice.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-400">MMK</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white flex flex-col border-l border-[#E9ECEF] shadow-sm h-[calc(100vh-60px)]">
      <div className="p-4 border-b">
        <h2 className="font-bold text-lg">{t("quickSale.brands")}</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-4 gap-2 auto-rows-min content-start">
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => onBrandSelect(brand)}
            className="flex flex-col items-center justify-center gap-2 px-3 py-6 border border-dark-600 rounded-xl bg-dark-50 hover:bg-primary/10 hover:shadow-sm text-dark-800 transition-all"
          >
            <p className="font-medium text-xs text-center leading-tight line-clamp-2 w-full">
              {brand}
            </p>
          </button>
        ))}

        {brandsLoading ? (
          <div className="col-span-4 flex flex-col items-center justify-center mt-10 gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-gray-400 text-sm">Loading brands...</p>
          </div>
        ) : brands.length === 0 ? (
          <div className="col-span-4 text-center text-gray-400 mt-10">
            {t("quickSale.noBrands")}
          </div>
        ) : null}
      </div>
    </div>
  );
};
