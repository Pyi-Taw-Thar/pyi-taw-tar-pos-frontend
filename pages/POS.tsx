import React, { useState } from "react";
import { Store, Loader2, ShoppingCart } from "lucide-react";
import { usePOS } from "../hooks/usePOS";
import { useLanguage } from "../context/LanguageContext";
import { ProductGrid } from "../components/POS/ProductGrid";
import { CartSidebar } from "../components/POS/CartSidebar";
import { CheckoutModal } from "../components/POS/CheckoutModal";
import { SuccessModal } from "../components/POS/SuccessModal";

export const POS: React.FC = () => {
  const { t } = useLanguage();
  const pos = usePOS();
  const [cartOpen, setCartOpen] = useState(false);

  if (pos.initialLoading && pos.storefronts.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-dark-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-dark-600">{t("pos.loading")}</p>
        </div>
      </div>
    );
  }

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
      <ProductGrid
        search={pos.search}
        onSearchChange={pos.setSearch}
        onBarcodeScan={pos.handleBarcodeScan}
        selectedCategory={pos.selectedCategory}
        onCategoryChange={pos.setSelectedCategory}
        categories={pos.categories}
        currentPage={pos.currentPage}
        totalPages={pos.totalPages}
        totalItems={pos.totalItems}
        onPageChange={pos.setCurrentPage}
        storefronts={pos.storefronts}
        selectedStorefrontId={pos.selectedStorefrontId}
        showStorefrontMenu={pos.showStorefrontMenu}
        onToggleStorefrontMenu={() => pos.setShowStorefrontMenu(!pos.showStorefrontMenu)}
        loading={pos.loading}
        filteredProducts={pos.filteredProducts}
        onAddToCart={pos.addToCart}
        onRefresh={pos.handleRefresh}
        onStorefrontChange={pos.handleStorefrontChange}
      />

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
        onOpenCheckout={() => {
          setCartOpen(false);
          pos.setShowCheckoutModal(true);
        }}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />

      {/* Mobile/Tablet Fixed Bottom Cart Bar */}
      {pos.cart.length > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-200 px-4 py-3 shadow-lg flex items-center justify-between">
          <div
            className="flex items-center gap-3 cursor-pointer flex-1 mr-3 min-w-0"
            onClick={() => setCartOpen(true)}
          >
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {pos.cart.reduce((sum, i) => sum + i.qty, 0)}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-xs text-gray-500 font-medium">
                {pos.cart.reduce((sum, i) => sum + i.qty, 0)} {t("pos.itemsLower") || "ခု"}
              </div>
              <div className="text-sm sm:text-base font-bold text-gray-900 truncate">
                {pos.subtotal.toLocaleString()} MMK
              </div>
            </div>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow transition-colors shrink-0"
          >
            {t("pos.proceedToCheckout") || "ငွေရှင်းမယ်"}
          </button>
        </div>
      )}

      {pos.isProcessing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-16 h-16 animate-spin text-primary" />
            <div className="text-center">
              <p className="text-xl font-bold text-gray-800 mb-1">{t("pos.processing")}</p>
              <p className="text-sm text-gray-500">{t("pos.processingOrderWait")}</p>
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
        onCheckout={(status) => { pos.handleCheckout(status); pos.setShowCheckoutModal(false); }}
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
