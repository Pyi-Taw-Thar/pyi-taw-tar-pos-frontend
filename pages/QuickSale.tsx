import React, { useState } from "react";
import { Store, Loader2 } from "lucide-react";
import { useQuickSale } from "../hooks/useQuickSale";
import { useLanguage } from "../context/LanguageContext";
import { BrandPanel } from "../components/QuickSale/BrandPanel";
import { CartSidebar } from "../components/QuickSale/CartSidebar";
import { CartProductModal } from "../components/QuickSale/CartProductModal";
import { CheckoutModal } from "../components/QuickSale/CheckoutModal";
import { SuccessModal } from "../components/QuickSale/SuccessModal";
import { getCartLineId } from "../utils/posCartUom";
import { cartLineKey } from "../utils/uom";

export const QuickSale: React.FC = () => {
  const { t } = useLanguage();
  const pos = useQuickSale();
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);

  const selectedItem = selectedLineId
    ? pos.cart.find((item) => getCartLineId(item) === selectedLineId) ?? null
    : null;

  if (pos.storefronts.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-100">
        <div className="text-center">
          <Store className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-dark-600">You are not assigned to any storefront. Please contact the administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden bg-[#F8F9FA]">
      <CartSidebar
        cart={pos.cart}
        subtotal={pos.subtotal}
        total={pos.total}
        paymentMethod={pos.paymentMethod}
        paymentType={pos.paymentType}
        onUpdateQty={pos.updateQty}
        onSetQty={pos.setQty}
        onSetCartLineUnit={pos.setCartLineUnit}
        onRemoveFromCart={pos.removeFromCart}
        onOpenCheckout={() => pos.setShowCheckoutModal(true)}
        onSelectLine={setSelectedLineId}
      />

      <BrandPanel
        brands={pos.uniqueBrands}
        selectedBrand={pos.selectedBrand}
        onBrandSelect={pos.handleBrandSelect}
        onBack={pos.handleBackToBrands}
        search={pos.search}
        onSearchChange={pos.setSearch}
        onBarcodeScan={pos.handleBarcodeScan}
        selectedCategory={pos.selectedCategory}
        onCategoryChange={pos.setSelectedCategory}
        categories={pos.selectedBrandCategories}
        currentPage={pos.currentPage}
        totalPages={pos.totalPages}
        totalItems={pos.totalItems}
        onPageChange={pos.setCurrentPage}
        loading={pos.loading}
        filteredProducts={pos.filteredProducts}
        onAddToCart={pos.addToCart}
      />

      <CartProductModal
        isOpen={selectedLineId !== null}
        item={selectedItem}
        onClose={() => setSelectedLineId(null)}
        onUnitChange={(lineId, unit) => {
          pos.setCartLineUnit(lineId, unit);
          const item = pos.cart.find((i) => getCartLineId(i) === lineId);
          if (item) {
            setSelectedLineId(cartLineKey(item.stockItem._id, unit));
          }
        }}
        onSetQty={pos.setQty}
        onUpdateQty={pos.updateQty}
        onRemoveFromCart={(lineId) => {
          pos.removeFromCart(lineId);
          setSelectedLineId(null);
        }}
      />

      {pos.isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-xl font-bold text-gray-800 mb-1">{t("pos.processing")}</p>
              <p className="text-sm text-gray-500">Please wait while we process your order...</p>
            </div>
          </div>
        </div>
      )}

      <CheckoutModal
        show={pos.showCheckoutModal}
        onClose={() => pos.setShowCheckoutModal(false)}
        paymentType={pos.paymentType}
        onPaymentTypeChange={pos.setPaymentType}
        createdAt={pos.createdAt}
        onCreatedAtChange={pos.setCreatedAt}
        creditPersonas={pos.creditPersonas}
        selectedCreditPersonId={pos.selectedCreditPersonId}
        onCreditPersonChange={pos.setSelectedCreditPersonId}
        paymentMethod={pos.paymentMethod}
        onPaymentMethodChange={pos.setPaymentMethod}
        useMarkup={pos.useMarkup}
        onUseMarkupChange={pos.setUseMarkup}
        discount={pos.discount}
        onDiscountChange={pos.setDiscount}
        markupAmount={pos.markupAmount}
        onMarkupAmountChange={pos.setMarkupAmount}
        paidAmount={pos.paidAmount}
        onPaidAmountChange={pos.setPaidAmount}
        note={pos.note}
        onNoteChange={pos.setNote}
        subtotal={pos.subtotal}
        total={pos.total}
        combinedDiscountAmount={pos.combinedDiscountAmount}
        cartItemCount={pos.cart.reduce((sum, i) => sum + i.qty, 0)}
        isProcessing={pos.isProcessing}
        devices={pos.devices}
        onCheckout={() => { pos.handleCheckout(); pos.setShowCheckoutModal(false); }}
        showDiscountCalculator={pos.showDiscountCalculator}
        showMarkupCalculator={pos.showMarkupCalculator}
        onOpenDiscountCalc={() => pos.setShowDiscountCalculator(true)}
        onOpenMarkupCalc={() => pos.setShowMarkupCalculator(true)}
        onCloseDiscountCalc={() => pos.setShowDiscountCalculator(false)}
        onCloseMarkupCalc={() => pos.setShowMarkupCalculator(false)}
        discountAmount={pos.discountAmount}
        onDiscountAmountChange={pos.setDiscountAmount}
      />

      <SuccessModal
        show={pos.showSuccessModal}
        orderNumber={pos.successOrderNumber}
        onClose={() => { pos.setShowSuccessModal(false); pos.setSuccessOrderNumber(""); }}
      />
    </div>
  );
};
