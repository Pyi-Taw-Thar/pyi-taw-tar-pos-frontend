import React from "react";
import { ShoppingBag, FileText, PackageCheck } from "lucide-react";
import { usePurchasing } from "../hooks/usePurchasing";
import { PurchaseOrderList } from "../components/Purchasing/PurchaseOrderList";
import { CreatePOModal } from "../components/Purchasing/CreatePOModal";
import { GRNList } from "../components/Purchasing/GRNList";
import { CreateGRNModal } from "../components/Purchasing/CreateGRNModal";
import { GRNDetailModal } from "../components/Purchasing/GRNDetailModal";
import { PODetailModal } from "../components/Purchasing/PODetailModal";
import { TransferWarehouseModal } from "../components/Purchasing/TransferWarehouseModal";
import { TransferStorefrontModal } from "../components/Purchasing/TransferStorefrontModal";

export const Purchasing: React.FC = () => {
  const {
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
  } = usePurchasing();

  return (
    <div className="p-6 w-full">
      {/* Title */}
      <h1 className="text-xl font-bold mb-5 flex items-center gap-2 text-slate-800 tracking-tight">
        <div className="p-1.5 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-100/70 shadow-sm">
          <ShoppingBag className="w-5 h-5" />
        </div>
        {t("purchasing.title")}
      </h1>

      {/* Tabs - Modern Segmented Style */}
      <div className="flex gap-1 mb-5 bg-slate-100/80 p-1 rounded-xl max-w-sm border border-slate-200/50 shadow-inner backdrop-blur-md">
        <button
          onClick={() => setActiveTab("po")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${activeTab === "po"
            ? "bg-white text-yellow-800 shadow border border-slate-200/20 scale-[1.01]"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
            }`}
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">
            {t("purchasing.purchaseOrder")}
          </span>
          <span className="sm:hidden">PO</span>
        </button>
        <button
          onClick={() => setActiveTab("grn")}
          className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${activeTab === "grn"
            ? "bg-white text-yellow-800 shadow border border-slate-200/20 scale-[1.01]"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
            }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span className="hidden sm:inline">
            {t("purchasing.goodsReceivedNote")}
          </span>
          <span className="sm:hidden">GRN</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden p-6 transition-all duration-300">
        {/* PO Tab */}
        {activeTab === "po" && (
          <div className="space-y-6">
            <PurchaseOrderList
              poList={poList}
              deletedPOList={deletedPOList}
              suppliers={suppliers}
              setIsCreateModalOpen={setIsCreateModalOpen}
              loadPurchases={loadPurchases}
              loadDeletedPurchases={loadDeletedPurchases}
              onViewPO={handleViewPO}
              pagination={poPagination}
              deletedPagination={deletedPoPagination}
              onCreateGRN={handleCreateGRNFromPO}
              poFilter={poFilter}
              setPoFilter={setPoFilter}
            />
            <CreatePOModal
              isOpen={isCreateModalOpen}
              onClose={() => setIsCreateModalOpen(false)}
              suppliers={suppliers}
              products={products}
              onSuccess={loadPurchases}
            />
            <PODetailModal
              isOpen={isPODetailModalOpen}
              onClose={() => setIsPODetailModalOpen(false)}
              purchaseId={selectedPOId}
              suppliers={suppliers}
            />
          </div>
        )}

        {/* GRN Tab */}
        {activeTab === "grn" && (
          <div className="space-y-6">
            <GRNList
              grnList={grnList}
              setIsCreateModalOpen={setIsCreateGRNModalOpen}
              onStatusChange={loadGRNs}
              onViewGRN={handleViewGRN}
              onTransferGRN={handleTransferGRN}
              onTransferGRNToStorefront={handleTransferGRNToStorefront}
              pagination={grnPagination}
              grnFilter={grnFilter}
              setGrnFilter={setGrnFilter}
            />
          </div>
        )}
      </div>

      {/* Global Modals - accessible from any tab */}
      <CreateGRNModal
        isOpen={isCreateGRNModalOpen}
        onClose={() => setIsCreateGRNModalOpen(false)}
        purchaseOrders={poList}
        suppliers={suppliers}
        onSuccess={handleGRNSuccess}
        selectedPOId={selectedPOId}
      />
      <GRNDetailModal
        isOpen={isGRNDetailModalOpen}
        onClose={() => setIsGRNDetailModalOpen(false)}
        grnId={selectedGRNId}
        onGRNUpdate={loadGRNs}
      />
      <TransferWarehouseModal
        isOpen={transferModalType === "warehouse"}
        onClose={handleCloseTransferModal}
        grnId={transferGRNId}
        onSuccess={handleGRNSuccess}
      />
      <TransferStorefrontModal
        isOpen={transferModalType === "storefront"}
        onClose={handleCloseTransferModal}
        grnId={transferGRNId}
        onSuccess={handleGRNSuccess}
      />
    </div>
  );
};

export default Purchasing;
