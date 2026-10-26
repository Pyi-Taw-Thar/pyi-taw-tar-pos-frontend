import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axios from "../services/axios";
import { useLanguage } from "../context/LanguageContext";
import { getSavedPrintPaperSize } from "../utils/printPaperSize";
import { detectDevice } from "../utils/deviceDetect";
import {
  fetchStorefrontStock,
  StorefrontStockItem,
} from "../services/Storefront/fetchStorefrontStock";
import {
  fetchStorefrontProfiles,
  StorefrontProfile,
} from "../services/Storefront/fetchStorefrontProfiles";
import { fetchCategories } from "../services/Inventory/fetchCategories";
import { createOrder } from "../services/Order/createOrder";
import {
  fetchCreditPersonas,
  CreditPersona,
} from "../services/Credit/fetchCreditPersonas";
import {
  UomCartItem,
  cartLineToOrderProduct,
  cartLineSubtotal,
  createCartLine,
  getCartLineId,
  getCartLineMaxQty,
  getCartLineEffectivePrice,
  getInventoryUomFromStock,
  getCartLineStockId,
  getInitialCartUnit,
} from "../utils/posCartUom";
import { cartLineKey } from "../utils/uom";

enum PaymentMethod {
  CASH = "Cash",
  KBZ_PAY = "KBZPay",
  WAVE_PAY = "WavePay",
  AYA_PAY = "AYA Pay",
  UAB_PAY = "UAB Pay",
  MMQR = "MMQR",
  BANK_TRANSFER = "Bank Transfer",
  NORMAL = "Normal",
  HOT = "Hot",
  FOC = "FOC",
}

type CartItem = UomCartItem;

export function usePOS() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [storefronts, setStorefronts] = useState<StorefrontProfile[]>([]);
  const [selectedStorefrontId, setSelectedStorefrontId] = useState<string>("");
  const [allStockItems, setAllStockItems] = useState<StorefrontStockItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(100);

  const [cart, setCart] = useState<CartItem[]>([]);
  console.log("cart", cart);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<"paid" | "credit">("paid");
  const [creditPersonas, setCreditPersonas] = useState<CreditPersona[]>([]);
  const [selectedCreditPersonId, setSelectedCreditPersonId] =
    useState<string>("");
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successOrderNumber, setSuccessOrderNumber] = useState("");
  const [discount, setDiscount] = useState(0);
  const [markup, setMarkup] = useState(0);
  const [markupAmount, setMarkupAmount] = useState(0);
  const [note, setNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStorefrontMenu, setShowStorefrontMenu] = useState(false);
  const [useMarkup, setUseMarkup] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH,
  );
  const [showDiscountCalculator, setShowDiscountCalculator] = useState(false);
  const [showMarkupCalculator, setShowMarkupCalculator] = useState(false);
  const [discountAmount, setDiscountAmount] = useState("");
  const [createdAt, setCreatedAt] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const devices = detectDevice();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setInitialLoading(true);
    try {
      const [sfResponse, catResponse] = await Promise.all([
        fetchStorefrontProfiles(),
        fetchCategories(),
      ]);

      if (sfResponse.success && sfResponse.data) {
        const activeStorefronts = sfResponse.data.filter(
          (sf) => sf.status === "active",
        );
        setStorefronts(activeStorefronts);
        if (activeStorefronts.length > 0) {
          setSelectedStorefrontId(activeStorefronts[0]._id);
        }
      }

      if (catResponse.success && catResponse.data) {
        setCategories(catResponse.data);
      }
    } catch (error) {
      toast.error(t("pos.failedToLoadData"));
    } finally {
      setInitialLoading(false);
      setIsProcessing(false);
    }
    loadCreditPersonas();
  };

  const loadCreditPersonas = async () => {
    try {
      const cpResponse = await fetchCreditPersonas();
      if (cpResponse.success && cpResponse.data) {
        const activePersonas = cpResponse.data.filter((p) => !p.blacklist);
        setCreditPersonas(activePersonas);
      }
    } catch (error) {
      console.error("Error loading credit personas:", error);
    }
  };

  useEffect(() => {
    if (!selectedStorefrontId) return;
    loadStockItems();
  }, [selectedStorefrontId, debouncedSearch, selectedCategory, currentPage]);

  const loadStockItems = async () => {
    setLoading(true);
    try {
      const response = await fetchStorefrontStock(
        selectedStorefrontId,
        currentPage,
        itemsPerPage,
        selectedCategory === "All" ? undefined : selectedCategory,
        debouncedSearch,
      );
      if (response.success && response.data) {
        setAllStockItems(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalItems(response.pagination.totalItems);
        }
      }
    } catch (error) {
      console.error("Error loading stock items:", error);
      toast.error(t("pos.failedToLoadProducts"));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await loadStockItems();
    setLoading(false);
    toast.success(t("pos.productsRefreshed"));
  };

  const filteredProducts = allStockItems.filter((item) => {
    const hideProduct = item.inventoryId?._id === "69a15d55218ec5ff9a3fe4a3";
    return !hideProduct;
  });

  const addToCart = (stockItem: StorefrontStockItem) => {
    if (stockItem.availableQuantity <= 0) {
      toast.error(t("pos.outOfStock"));
      return;
    }

    const inventoryId = getCartLineStockId(stockItem);
    const initialUnit = getInitialCartUnit(stockItem);
    const lineId = cartLineKey(inventoryId, initialUnit);

    setCart((prev) => {
      // 1. Check exact match (same inventory ID + same unit)
      let existingIndex = prev.findIndex(
        (item) => getCartLineId(item) === lineId
      );

      // 2. If not found, check if this product already exists in cart with any unit
      if (existingIndex === -1) {
        existingIndex = prev.findIndex(
          (item) => getCartLineStockId(item.stockItem) === inventoryId
        );
      }

      if (existingIndex !== -1) {
        const existing = prev[existingIndex];
        const maxQty = getCartLineMaxQty(existing);
        if (existing.qty + 1 > maxQty) {
          toast.error(t("pos.cannotExceedStock"));
          return prev;
        }
        return prev.map((item, idx) =>
          idx === existingIndex ? { ...item, qty: item.qty + 1 } : item
        );
      }

      const newLine = createCartLine(stockItem, 1);
      return [...prev, newLine];
    });
  };

  const updateQty = (lineId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (getCartLineId(item) === lineId) {
          const newQty = item.qty + delta;
          const maxQty = getCartLineMaxQty(item);
          if (newQty > maxQty) {
            toast.error(t("pos.cannotExceedStock"));
            return item;
          }
          if (newQty < 1) return item;
          return { ...item, qty: newQty };
        }
        return item;
      }),
    );
  };

  const setQty = (lineId: string, newQty: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (getCartLineId(item) === lineId) {
          const maxQty = getCartLineMaxQty(item);
          if (newQty < 1) return { ...item, qty: 1 };
          if (newQty > maxQty) {
            toast.error(t("pos.cannotExceedStock"));
            return { ...item, qty: maxQty };
          }
          return { ...item, qty: newQty };
        }
        return item;
      }),
    );
  };

  const setCartLineUnit = (lineId: string, unit: string) => {
    setCart((prev) => {
      const targetIndex = prev.findIndex(
        (item) => getCartLineId(item) === lineId
      );
      if (targetIndex === -1) return prev;

      const currentItem = prev[targetIndex];
      const targetProductId = getCartLineStockId(currentItem.stockItem);
      const targetLineKey = cartLineKey(targetProductId, unit);

      // If another line already exists with this new unit, merge them
      const duplicateIndex = prev.findIndex(
        (item, idx) =>
          idx !== targetIndex && getCartLineId(item) === targetLineKey
      );

      if (duplicateIndex !== -1) {
        const existingItem = prev[duplicateIndex];
        const mergedQty = existingItem.qty + currentItem.qty;
        const maxQty = getCartLineMaxQty({ ...existingItem, qty: mergedQty });
        return prev
          .filter((_, idx) => idx !== targetIndex)
          .map((item) => {
            if (getCartLineId(item) === targetLineKey) {
              return { ...item, qty: Math.min(mergedQty, maxQty) || 1 };
            }
            return item;
          });
      }

      return prev.map((item, idx) => {
        if (idx !== targetIndex) return item;
        const updated = { ...item, selectedUnit: unit };
        const maxQty = getCartLineMaxQty(updated);
        return {
          ...updated,
          qty: Math.min(updated.qty, maxQty) || 1,
        };
      });
    });
  };

  const removeFromCart = (lineId: string) => {
    setCart((prev) => prev.filter((item) => getCartLineId(item) !== lineId));
  };

  const handleBarcodeScan = async (searchValue: string) => {
    const cleanCode = searchValue.trim();
    if (!cleanCode) return;

    try {
      // 1. Try scanning as Batch Barcode first
      try {
        const batchRes = await axios.get(
          `/batches/scan/${encodeURIComponent(cleanCode)}${
            selectedStorefrontId ? `?locationId=${selectedStorefrontId}` : ""
          }`
        );

        if (batchRes.data?.success && batchRes.data?.data) {
          const batch = batchRes.data.data;

          if (batch.isExpired) {
            toast.error(
              `⚠ ဤကုန်ပစ္စည်းသည် သက်တမ်းကုန်ဆုံးနေပါသည် (Expired: ${new Date(
                batch.expiryDate
              ).toLocaleDateString("en-GB")})! ရောင်းချခွင့်မပြုပါ။`
            );
            setSearch("");
            return;
          }

          if (batch.quantity <= 0) {
            toast.error(
              `Batch (${batch.batchNumber}) လက်ကျန်ကုန်နေပါသည် (Out of Stock)!`
            );
            setSearch("");
            return;
          }

          // Find product in cart or allStockItems
          const inventoryIdStr =
            typeof batch.inventoryId === "object"
              ? batch.inventoryId._id
              : batch.inventoryId;

          // Unit barcode (B000001-10) — cart line unit = scan လုပ်သော unit, batch qty = base unit
          const scanFactor: number = batch.scanFactor || 1;
          const normUnit = (u?: string | null) => (u || "").trim().toLowerCase();
          const scannedUnitNorm = normUnit(batch.scannedUnit);
          const isSameLine = (item: UomCartItem) =>
            getCartLineStockId(item.stockItem) === inventoryIdStr &&
            (!scannedUnitNorm || normUnit(item.selectedUnit) === scannedUnitNorm);

          let updatedQty = 0;
          let productFoundInCart = false;

          setCart((prev) => {
            const existingCartIndex = prev.findIndex(isSameLine);

            if (existingCartIndex !== -1) {
              productFoundInCart = true;
              const updated = [...prev];
              const item = { ...updated[existingCartIndex] };
              const currentBatches = item.scannedBatches
                ? [...item.scannedBatches]
                : [];

              const existingBatchIndex = currentBatches.findIndex(
                (b) => b.batchNumber === batch.batchNumber
              );

              if (existingBatchIndex !== -1) {
                currentBatches[existingBatchIndex] = {
                  ...currentBatches[existingBatchIndex],
                  quantity: currentBatches[existingBatchIndex].quantity + scanFactor,
                };
              } else {
                currentBatches.push({
                  batchStockId: batch._id,
                  batchNumber: batch.batchNumber,
                  batchBarcode: batch.batchBarcode,
                  expiryDate: batch.expiryDate,
                  quantity: scanFactor,
                });
              }

              item.qty = item.qty + 1;
              item.scannedBatches = currentBatches;
              updated[existingCartIndex] = item;
              updatedQty = item.qty;
              return updated;
            }
            return prev;
          });

          if (productFoundInCart) {
            toast.success(
              `[အသုတ်: ${batch.batchNumber}] စကင်ဖတ်ပြီးပါပြီ (စုစုပေါင်း: ${updatedQty})`
            );
            setSearch("");
            return;
          } else {
            // Product not yet in cart - find matching stock item
            let matchingStock = allStockItems.find(
              (s) => getCartLineStockId(s) === inventoryIdStr
            );

            if (!matchingStock && selectedStorefrontId) {
              try {
                const stockRes = await fetchStorefrontStock(
                  selectedStorefrontId,
                  1,
                  1,
                  undefined,
                  inventoryIdStr
                );
                if (stockRes.success && stockRes.data?.length > 0) {
                  matchingStock = stockRes.data[0];
                }
              } catch (e) {
                console.error("Error fetching matching stock:", e);
              }
            }

            if (matchingStock) {
              const newLine = createCartLine(matchingStock, 1);
              // Scan လုပ်သော unit ဖြင့် line ဖန်တီး (ပုံး barcode → ပုံး line)
              if (batch.scannedUnit) newLine.selectedUnit = batch.scannedUnit;
              newLine.scannedBatches = [
                {
                  batchStockId: batch._id,
                  batchNumber: batch.batchNumber,
                  batchBarcode: batch.batchBarcode,
                  expiryDate: batch.expiryDate,
                  quantity: scanFactor,
                },
              ];
              setCart((prev) => {
                const existingIdx = prev.findIndex(isSameLine);
                if (existingIdx !== -1) {
                  return prev.map((item, idx) =>
                    idx === existingIdx ? { ...item, qty: item.qty + 1 } : item
                  );
                }
                return [...prev, newLine];
              });
              toast.success(
                `[အသုတ်: ${batch.batchNumber}] ${matchingStock.inventoryId.productName} ခြင်းထဲထည့်ပြီးပါပြီ`
              );
              setSearch("");
              return;
            }
          }
        }
      } catch (batchErr: any) {
        // 400 = batch တွေ့သော်လည်း unit barcode မမှန် (ဥပမာ conversion ပြောင်းသွား) — product code ဖြင့် ဆက်မရှာ
        if (batchErr.response?.status === 400) {
          toast.error(batchErr.response?.data?.message || "Invalid batch barcode");
          setSearch("");
          return;
        }
        // If 404, not a batch barcode; fall through to product code scan
        if (batchErr.response?.status !== 404) {
          console.warn("Batch scan error:", batchErr);
        }
      }

      // 2. Fallback: Search by productCode
      const response = await fetchStorefrontStock(
        selectedStorefrontId,
        1,
        1,
        undefined,
        cleanCode,
      );
      if (response.success && response.data && response.data.length > 0) {
        const matchingProduct = response.data[0];
        if (matchingProduct.availableQuantity <= 0) {
          toast.error(t("pos.outOfStock"));
          setSearch("");
          return;
        }
        addToCart(matchingProduct);
        toast.success(
          `${matchingProduct.inventoryId.productName} ${
            t("pos.addedToCart") || "added to cart"
          }`,
        );
        setSearch("");
      } else {
        toast.error(t("pos.productNotFound") || "Product not found");
      }
    } catch (error) {
      console.error("Error during barcode scan:", error);
      toast.error(t("pos.failedToSearchProduct") || "Failed to search product");
    }
  };

  const subtotal = cart.reduce((sum, item) => sum + cartLineSubtotal(item), 0);

  const totalAfterDiscount = Math.round(
    subtotal * (1 - (Number(discount) || 0) / 100),
  );
  const totalAfterMarkup = subtotal + markupAmount;

  const total = useMarkup ? totalAfterMarkup : totalAfterDiscount;
  const combinedDiscountAmount = useMarkup
    ? 0
    : Math.round(subtotal - totalAfterDiscount);

  useEffect(() => {
    if (
      showCheckoutModal &&
      paymentType === "paid" &&
      paymentMethod !== PaymentMethod.FOC
    ) {
      setPaidAmount(Math.ceil(total));
    }
  }, [showCheckoutModal, total, paymentType, paymentMethod]);

  const handleCheckout = async (targetStatus: "completed" | "pending" = "completed") => {
    if (cart.length === 0) return;

    if (
      paymentType === "paid" &&
      paymentMethod !== PaymentMethod.FOC &&
      paidAmount < total
    ) {
      toast.error(t("pos.paidAmountError"));
      return;
    }

    const finalPaidAmount =
      paymentMethod === PaymentMethod.FOC ? 0 : paidAmount;

    setIsProcessing(true);

    try {
      const paymentMethodMap: Record<string, string> = {
        [PaymentMethod.CASH]: "cash",
        [PaymentMethod.KBZ_PAY]: "kpay",
        [PaymentMethod.WAVE_PAY]: "wavepay",
        [PaymentMethod.AYA_PAY]: "ayapay",
        [PaymentMethod.UAB_PAY]: "uabpay",
        [PaymentMethod.BANK_TRANSFER]: "bank_transfer",
        [PaymentMethod.NORMAL]: "normal",
        [PaymentMethod.HOT]: "hot",
        [PaymentMethod.FOC]: "foc",
        [PaymentMethod.MMQR]: "MMQR",
      };

      const discountAmountCalc = useMarkup
        ? 0
        : Math.round(subtotal - totalAfterDiscount);

      const orderPayload: any = {
        storefrontId: selectedStorefrontId,
        ordersProducts: cart.map(cartLineToOrderProduct),
        subTotal: subtotal,
        discount: discountAmountCalc,
        finalAmount: total,
        paidAmount: finalPaidAmount,
        paymentType: paymentType,
        paymentMethod: paymentMethodMap[paymentMethod],
        orderDate: new Date(createdAt).toISOString(),
        orderStatus: targetStatus,
        ...(selectedCreditPersonId
          ? { creditPersonId: selectedCreditPersonId }
          : {}),
      };

      const result = await createOrder(orderPayload);
      console.log("result", result);

      if (result.success) {
        if (targetStatus === "pending") {
          toast.success(
            `Order (${result.data?.orderNumber}) ကို ဂိုဒေါင်သို့ စစ်ဆေးထုတ်ပိုးရန် ပို့ဆောင်လိုက်ပါပြီ`
          );
          setCart([]);
          setDiscount(0);
          setMarkup(0);
          setMarkupAmount(0);
          setNote("");
          setPaidAmount(0);
          setPaymentMethod(PaymentMethod.CASH);
          setPaymentType("paid");
          setSelectedCreditPersonId("");
          setCreatedAt(new Date().toISOString().split("T")[0]);
          await loadStockItems();
          return;
        }

        console.log("creditPersonId", selectedCreditPersonId);
        console.log("creditPersonName", creditPersonas.find((cp) => cp._id === selectedCreditPersonId)?.name);
        // Find credit person details if credit order
        const creditPersonName = result.data?.creditPersonId?.name || undefined;
        const creditPersonAddress = result.data?.creditPersonId?.address || undefined;
        const creditPersonTownship = result.data?.creditPersonId?.township || undefined;

        // Get outstanding balance from order response (backend calculates it)
        const creditPersonOutstanding = selectedCreditPersonId
          ? result.data?.creditPersonTotalOutstanding
          : undefined;

        const receiptData = {
          date: new Date().toISOString(),
          creditPersonName,
          creditPersonOutstanding,
          creditPersonAddress,
          creditPersonTownship,
          invoiceNumber: result.data?.orderNumber || `INV-${Date.now()}`,
          // storefrontName: "HONGCHI Myanmar",
          items: cart.map((i) => ({
            name: i.stockItem.inventoryId.productName,
            code: i.stockItem.inventoryId.productCode,
            qty: i.qty,
            unit: i.selectedUnit,
            price: getCartLineEffectivePrice(i),
            batches: i.scannedBatches || [],
          })),
          subtotal,
          discountPercent: discount,
          total,
          paidAmount: finalPaidAmount,
          change: finalPaidAmount - total,
          paymentMethod,
          note,
        };
        const receiptId = `receipt_${receiptData.invoiceNumber}`;
        localStorage.setItem(receiptId, JSON.stringify(receiptData));

        navigate(
          `/print-receipt/${receiptData.invoiceNumber}?size=${getSavedPrintPaperSize()}&autoprint=1`,
        );
        setCart([]);
        setDiscount(0);
        setMarkup(0);
        setMarkupAmount(0);
        setNote("");
        setPaidAmount(0);
        setPaymentMethod(PaymentMethod.CASH);
        setPaymentType("paid");
        setSelectedCreditPersonId("");
        setCreatedAt(new Date().toISOString().split("T")[0]);

        setSuccessOrderNumber(result.data?.orderNumber || `INV-${Date.now()}`);
        setShowSuccessModal(true);

        await loadStockItems();
      } else {
        toast.error(result.message || t("pos.failedToProcessSale"));
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error(t("pos.failedToProcessSale"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStorefrontChange = (storefrontId: string) => {
    setSelectedStorefrontId(storefrontId);
    setCart([]);
    setSelectedCategory("All");
  };

  return {
    storefronts,
    selectedStorefrontId,
    allStockItems,
    categories,
    initialLoading,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    cart,
    search,
    setSearch,
    selectedCategory,
    setSelectedCategory,
    paidAmount,
    setPaidAmount,
    paymentType,
    setPaymentType,
    creditPersonas,
    selectedCreditPersonId,
    setSelectedCreditPersonId,
    showCheckoutModal,
    setShowCheckoutModal,
    showSuccessModal,
    setShowSuccessModal,
    successOrderNumber,
    setSuccessOrderNumber,
    discount,
    setDiscount,
    markupAmount,
    setMarkupAmount,
    note,
    setNote,
    isProcessing,
    showStorefrontMenu,
    setShowStorefrontMenu,
    useMarkup,
    setUseMarkup,
    paymentMethod,
    setPaymentMethod,
    showDiscountCalculator,
    setShowDiscountCalculator,
    showMarkupCalculator,
    setShowMarkupCalculator,
    discountAmount,
    setDiscountAmount,
    createdAt,
    setCreatedAt,
    devices,
    subtotal,
    total,
    combinedDiscountAmount,
    totalAfterDiscount,
    filteredProducts,
    addToCart,
    updateQty,
    setQty,
    setCartLineUnit,
    removeFromCart,
    handleBarcodeScan,
    handleCheckout,
    handleRefresh,
    handleStorefrontChange,
    t,
  };
}
