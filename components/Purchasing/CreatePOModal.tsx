import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Modal } from "../Modal";
import { Supplier, Product, PurchaseOrderItem } from "../../types";
import { createPurchase } from "../../services/Purchase/createPurchase";
import { fetchSuppliers } from "../../services/Supplier/fetchSuppliers";
import { fetchProducts } from "../../services/Inventory/fetchProducts";
import { getUnitOptions, getConversionFactor } from "../../utils/uom";
import { toast } from "sonner";

interface CreatePOModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  products: Product[];
  onSuccess: () => void;
}

export const CreatePOModal: React.FC<CreatePOModalProps> = ({
  isOpen,
  onClose,
  suppliers,
  products,
  onSuccess,
}) => {
  const [poSupplierId, setPOSupplierId] = useState("");
  const [poItems, setPOItems] = useState<PurchaseOrderItem[]>([]);
  const [poSelectedProduct, setPOSelectedProduct] = useState("");
  const [poQty, setPOQty] = useState(1);
  const [poItemNote, setPOItemNote] = useState("");
  const [poNote, setPONote] = useState("");
  const [poNewProductName, setPONewProductName] = useState("");
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("piece");
  const productDropdownRef = useRef<HTMLDivElement>(null);

  // Product Search & Pagination States
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [productPage, setProductPage] = useState(1);
  const [productPagination, setProductPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [selectedProductObj, setSelectedProductObj] = useState<Product | null>(null);

  // Supplier Search & Pagination States
  const [localSuppliers, setLocalSuppliers] = useState<Supplier[]>([]);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState("");
  const [supplierPage, setSupplierPage] = useState(1);
  const [supplierPagination, setSupplierPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedSupplierName, setSelectedSupplierName] = useState("");

  const loadSuppliersData = async (search = "", page = 1) => {
    try {
      const res = await fetchSuppliers({ search, page, limit: 10 });
      if (res.success) {
        setLocalSuppliers(res.data);
        if (res.pagination) {
          setSupplierPagination({
            currentPage: res.pagination.currentPage,
            totalPages: res.pagination.totalPages,
            totalItems: res.pagination.totalItems,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch suppliers in modal", error);
    }
  };

  const loadProductsData = async (search = "", page = 1) => {
    try {
      const res = await fetchProducts({ search, page, limit: 10 });
      if (res.success) {
        if (Array.isArray(res.data)) {
          setLocalProducts(res.data);
        }
        if (res.pagination) {
          setProductPagination({
            currentPage: res.pagination.currentPage,
            totalPages: res.pagination.totalPages,
            totalItems: res.pagination.totalItems,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch products in modal", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSuppliersData(supplierSearchQuery, supplierPage);
    }
  }, [isOpen, supplierSearchQuery, supplierPage]);

  useEffect(() => {
    if (isOpen) {
      loadProductsData(productSearchQuery, productPage);
    }
  }, [isOpen, productSearchQuery, productPage]);

  // Reset fields when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setPOSupplierId("");
      setSelectedSupplierName("");
      setSupplierSearchQuery("");
      setSupplierPage(1);
      setPOItems([]);
      setPONote("");
      setPOSelectedProduct("");
      setSelectedProductObj(null);
      setProductSearchQuery("");
      setProductPage(1);
    }
  }, [isOpen]);

  // Click outside listener for supplier dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        supplierDropdownRef.current &&
        !supplierDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSupplierDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSupplierSelect = (supplier: Supplier) => {
    const sId = supplier.id || supplier._id || "";
    setPOSupplierId(sId);
    setSelectedSupplierName(
      supplier.township
        ? `${supplier.supplierName} (${supplier.township})`
        : supplier.supplierName || ""
    );
    setShowSupplierDropdown(false);
  };

  const handleProductSelect = (product: Product) => {
    const pId = product._id || product.id || "";
    setPOSelectedProduct(pId);
    setProductSearchQuery(product.productName || product.name || "");
    setSelectedProductObj(product);
    setShowProductDropdown(false);
    setPONewProductName("");
    setSelectedUnit(product.unitOfMeasure || "piece");
  };

  const handleProductInputChange = (value: string) => {
    setProductSearchQuery(value);
    setProductPage(1);
    setShowProductDropdown(true);
    if (value === "") {
      setPOSelectedProduct("");
      setSelectedProductObj(null);
      setSelectedUnit("piece");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        productDropdownRef.current &&
        !productDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProductDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const addPOItem = () => {
    if (!poSelectedProduct && !poNewProductName) return;
    if (poQty <= 0) return;

    let productId = poSelectedProduct;
    let productName = "";
    let buyingPrice = 0;

    if (poSelectedProduct) {
      const product = selectedProductObj;
      if (!product) return;
      productName = product.productName || product.name;
      const factor = getConversionFactor(
        product.unitOfMeasure || "piece",
        selectedUnit,
        product.uomConversions,
      );
      buyingPrice = product.buyingPrice * factor;
    } else {
      productId = `new-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      productName = poNewProductName;
    }

    const newItem: PurchaseOrderItem = {
      productId,
      name: productName,
      qty: poQty,
      costPrice: buyingPrice,
      unit: selectedUnit,
      note: poItemNote,
    };

    setPOItems((prev) => [...prev, newItem]);
    setPOSelectedProduct("");
    setPONewProductName("");
    setPOQty(1);
    setPOItemNote("");
    setSelectedUnit("piece");
    setProductSearchQuery("");
  };

  const removePOItem = (index: number) => {
    setPOItems((prev) => prev.filter((_, i) => i !== index));
  };

  const submitPO = async () => {
    if (!poSupplierId || poItems.length === 0) {
      toast.error("Please select supplier and add at least one item");
      return;
    }

    const totalAmount = poItems.reduce(
      (sum, item) => sum + item.qty * item.costPrice,
      0,
    );

    const payload = {
      products: poItems.map((item) => ({
        inventoryId: item.productId,
        purchaseQuantity: item.qty,
        ...(item.unit && { unit: item.unit }),
      })),
      supplierId: poSupplierId,
      note: poNote,
      totalAmount,
    };

    try {
      const response = await createPurchase(payload);
      if (response.success) {
        toast.success("Purchase Order Created Successfully!");
        setPOSupplierId("");
        setPOItems([]);
        setPONote("");
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || "Failed to create Purchase Order");
      }
    } catch (error: any) {
      console.error("Failed to create PO:", error);
      toast.error(
        error.message || "An error occurred while creating the Purchase Order",
      );
    }
  };

  const selectedProduct = selectedProductObj;
  const unitOptions = selectedProduct
    ? getUnitOptions(
      selectedProduct.unitOfMeasure || "piece",
      selectedProduct.uomConversions,
    )
    : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Purchase Order">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[75vh]">
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="space-y-4">
            <div className="relative" ref={supplierDropdownRef}>
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Supplier Name
              </label>
              <input
                type="text"
                className="w-full border rounded p-2 text-sm bg-white cursor-pointer"
                placeholder="Type to search supplier..."
                value={showSupplierDropdown ? supplierSearchQuery : (selectedSupplierName || "")}
                onChange={(e) => {
                  setSupplierSearchQuery(e.target.value);
                  setSupplierPage(1);
                  setShowSupplierDropdown(true);
                }}
                onFocus={() => {
                  setShowSupplierDropdown(true);
                }}
              />
              {showSupplierDropdown && (
                <div className="absolute z-20 w-full bg-white border border-slate-200 rounded-lg mt-1 max-h-60 overflow-y-auto shadow-lg p-2">
                  {localSuppliers.length > 0 ? (
                    localSuppliers.map((supplier) => (
                      <div
                        key={supplier.id || supplier._id}
                        className="px-3 py-2 hover:bg-slate-100 cursor-pointer text-sm rounded transition flex justify-between items-center"
                        onClick={() => handleSupplierSelect(supplier)}
                      >
                        <span className="font-medium text-slate-800">{supplier.supplierName}</span>
                        {supplier.township && (
                          <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200/50">
                            {supplier.township}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-slate-400 text-sm">
                      No suppliers found
                    </div>
                  )}

                  {/* Supplier Pagination */}
                  {supplierPagination.totalPages > 1 && (
                    <div className="flex justify-between items-center border-t pt-2 mt-2 gap-2">
                      <button
                        type="button"
                        disabled={supplierPage <= 1}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSupplierPage((prev) => Math.max(prev - 1, 1));
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-semibold"
                      >
                        Prev
                      </button>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        Page {supplierPage} of {supplierPagination.totalPages}
                      </span>
                      <button
                        type="button"
                        disabled={supplierPage >= supplierPagination.totalPages}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSupplierPage((prev) => Math.min(prev + 1, supplierPagination.totalPages));
                        }}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-semibold"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t pt-4 mt-4">
              <label className="block text-xs font-bold text-slate-500 mb-2">
                Add Item to PO
              </label>
              <div className="mb-2 relative" ref={productDropdownRef}>
                <input
                  type="text"
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Type to search and select product..."
                  value={productSearchQuery}
                  onChange={(e) => handleProductInputChange(e.target.value)}
                  onFocus={() => setShowProductDropdown(true)}
                />
                {showProductDropdown && (
                  <div className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-60 overflow-y-auto shadow-lg p-2">
                    {localProducts.length > 0 ? (
                      localProducts.map((p) => (
                        <div
                          key={p._id}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm rounded transition"
                          onClick={() =>
                            handleProductSelect(p)
                          }
                        >
                          {p.productName}
                        </div>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        No products found
                      </div>
                    )}

                    {/* Product Pagination */}
                    {productPagination.totalPages > 1 && (
                      <div className="flex justify-between items-center border-t pt-2 mt-2 gap-2">
                        <button
                          type="button"
                          disabled={productPage <= 1}
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductPage((prev) => Math.max(prev - 1, 1));
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-semibold"
                        >
                          Prev
                        </button>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Page {productPage} of {productPagination.totalPages}
                        </span>
                        <button
                          type="button"
                          disabled={productPage >= productPagination.totalPages}
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductPage((prev) => Math.min(prev + 1, productPagination.totalPages));
                          }}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-semibold"
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    className="w-full border rounded p-2 text-sm"
                    placeholder="Qty"
                    value={poQty}
                    onChange={(e) => setPOQty(Number(e.target.value))}
                    min="1"
                  />
                </div>
                {unitOptions.length > 1 && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-2">
                      Unit
                    </label>
                    <select
                      className="w-full border rounded p-2 text-sm"
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                    >
                      {unitOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="flex items-end">
                  <button
                    onClick={addPOItem}
                    className="bg-green-100 text-green-700 p-2 rounded hover:bg-green-200"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <label className="block text-xs font-bold text-slate-500 mb-1">
                Note (Optional)
              </label>
              <textarea
                className="w-full border rounded p-2 text-sm"
                value={poNote}
                onChange={(e) => setPONote(e.target.value)}
                placeholder="Additional notes..."
                rows={2}
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col">
          <h2 className="font-bold text-lg mb-4">PO Summary</h2>
          <div className="flex-1 overflow-auto mb-4">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50">
                <tr className="border-b">
                  <th className="py-2 px-1">Item</th>
                  <th className="py-2 px-1">Qty</th>
                  <th className="py-2 px-1">Unit</th>
                  <th className="py-2 px-1">Cost Price</th>
                  <th className="py-2 px-1 w-12">Action</th>
                </tr>
              </thead>
              <tbody>
                {poItems.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">{item.name}</td>
                    <td className="py-2">{item.qty}</td>
                    <td className="py-2">{item.unit || "—"}</td>
                    <td className="py-2">
                      {(item.costPrice * item.qty).toLocaleString()}
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => removePOItem(i)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {poItems.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-slate-400 py-4">
                      No items added
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={4} className="text-right py-2">
                    Total:{" "}
                    {poItems
                      .reduce(
                        (total, item) => total + item.costPrice * item.qty,
                        0,
                      )
                      .toLocaleString()}{" "}
                    MMK
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          {poNote && (
            <div className="mb-4 p-3 bg-gray-50 border rounded text-sm">
              <span className="font-semibold text-gray-600 block mb-1">
                Order Note:
              </span>
              <p className="text-gray-800">{poNote}</p>
            </div>
          )}
          <button
            onClick={submitPO}
            disabled={poItems.length === 0 || !poSupplierId}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Create Purchase Order
          </button>
          <p className="text-xs text-slate-500 mt-2">
            Note: PO does NOT update stock. Use GRN to receive goods.
          </p>
        </div>
      </div>
    </Modal>
  );
};
