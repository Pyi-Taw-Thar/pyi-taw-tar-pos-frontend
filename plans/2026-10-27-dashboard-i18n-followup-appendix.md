# Appendix — ကျန်နေသော English စာ နေရာစာရင်း (2026-10-27 snapshot)

> `2026-10-27-dashboard-i18n-followup-plan.md` ၏ နောက်ဆက်တွဲ။ Line နံပါတ်များသည် snapshot ယူချိန်အတိုင်း — ဖိုင်ပြင်ပြီးနောက် ရွေ့နိုင်၍ §2 ရှိ grep command ဖြင့် ပြန်ထုတ်ပါ။

## A. `my.ts` တွင် မရှိသော key (188 ခု) — `en.ts` တွင်သာ ရှိ

```
creditOrders.creditOrderNumber
creditOrders.editPaidAmount
creditOrders.totalAmount
creditOrders.enterPaidAmount
creditOrders.enterAmountPlaceholder
creditOrders.remainingBalanceLabel
creditOrders.deleteCreditOrder
creditOrders.deleteWarningSubtitle
creditOrders.deleteWarningText
creditOrders.deleteOrderButton
creditOrders.deleting
creditOrders.updating
creditOrders.creditOrderDeleted
creditOrders.failedToDeleteCreditOrder
creditOrders.paidAmountUpdated
creditOrders.failedToUpdatePaidAmount
creditDetail.addCreditOrder
creditDetail.orderNo
creditDetail.status
creditDetail.actions
creditDetail.pay
creditDetail.purchasedProducts
creditDetail.loadingProducts
creditDetail.noProductsFound
creditDetail.productName
creditDetail.sku
creditDetail.quantity
creditDetail.orderCount
creditDetail.selectStorefront
creditDetail.creditOrderCreated
creditDetail.failedToCreateCreditOrder
reports.financialReports
reports.allStorefronts
reports.refresh
reports.totalRevenue
reports.revenue
reports.overall
reports.paidOrders
reports.paid
reports.creditOrders
reports.credit
reports.saleStatistics
reports.stats
reports.focProducts
reports.foc
reports.totalSales
reports.paidAmount
reports.creditAmount
reports.totalOrders
reports.discount
reports.tax
reports.storefront
reports.finalAmount
reports.subTotal
reports.allStorefrontsBreakdown
reports.storefrontDetails
reports.loadingFOC
reports.totalProducts
reports.totalQuantity
reports.totalValue
reports.focDetails
reports.focDescription
reports.noFOC
reports.productName
reports.productCode
reports.unitPrice
reports.quantity
reports.ordersCount
reports.order
reports.orders
reports.loadingCreditOrders
reports.noCreditOrdersData
reports.remainingBalance
reports.records
reports.initialPayments
reports.paymentMethod
reports.noInitialPayments
reports.total
reports.creditPayments
reports.noCreditPayments
reports.loadingPaymentMethods
reports.noPaidOrdersData
reports.totalPaidOrders
reports.paymentMethodsDistribution
reports.paymentMethodsBreakdown
reports.noPaidOrders
reports.loadingRevenueData
reports.fetchingData
reports.totalRevenueOverview
reports.showHideMetrics
reports.totalInventoryValue
reports.creditRemaining
reports.creditPaidAmount
reports.paidOrderAmount
reports.outstandingCreditAmount
reports.amountCollectedCredit
reports.directPaidOrders
reports.inventoryValueBreakdown
reports.noInventoryData
reports.loadingSaleStats
reports.noProductSalesData
reports.totalQtySold
reports.uniqueProducts
reports.noProductsInPeriod
reports.avgPrice
reports.minPrice
reports.maxPrice
reports.currentPeriodSales
reports.searchingRecentOrders
reports.noRecentOrders
reports.noOrdersProductPeriod
reports.orderHistory
reports.cashCustomer
reports.stock
purchaseReport.overview
purchaseReport.byProduct
purchaseReport.bySupplier
purchaseReport.allStatuses
purchaseReport.allSuppliers
purchaseReport.allCategories
purchaseReport.descending
purchaseReport.ascending
purchaseReport.totalPOs
purchaseReport.totalAmount
purchaseReport.ordered
purchaseReport.received
purchaseReport.remaining
purchaseReport.poNumber
purchaseReport.supplier
purchaseReport.date
purchaseReport.status
purchaseReport.items
purchaseReport.actions
purchaseReport.viewDetails
purchaseReport.noPOsFound
purchaseReport.products
purchaseReport.code
purchaseReport.category
purchaseReport.unit
purchaseReport.progress
purchaseReport.amount
purchaseReport.noProductsFound
purchaseReport.suppliers
purchaseReport.contact
purchaseReport.pos
purchaseReport.lastPO
purchaseReport.noSuppliersFound
purchaseReport.pageOf
purchaseReport.perPage
settings.shopSettings
settings.shop
settings.stockAuditLogs
settings.audit
settings.transferManagement
settings.transfers
settings.activityLog
settings.activity
settings.loadingLogs
settings.noLogsFound
settings.accessRestricted
settings.accessRestrictedDesc
settings.filters
settings.feature
settings.allAdmins
settings.dateRange
settings.apply
settings.exportCSV
settings.retry
settings.timestamp
settings.description
settings.ip
settings.noActivityLogsFound
settings.clearAllFilters
settings.metadata
settings.noMetadata
settings.loadingShopSettings
settings.noShopSettings
settings.show
settings.date
settings.product
settings.location
settings.action
settings.before
settings.after
settings.change
settings.adminUser
settings.reason
settings.previous
settings.next
```

## B. JSX ထဲ တိုက်ရိုက်ရေးထားသော English (294 ကြောင်း)

```
pages/AccountManagement.tsx:620: <span className="sm:hidden">Name</span>
pages/AccountManagement.tsx:624: <span className="sm:hidden">Role</span>
pages/AccountManagement.tsx:628: <span className="sm:hidden">Location</span>
pages/AccountManagement.tsx:632: <span className="sm:hidden">Status</span>
pages/AccountManagement.tsx:636: <span className="sm:hidden">Active</span>
pages/AccountManagement.tsx:639: <span className="hidden sm:inline">Created</span>
pages/AccountManagement.tsx:640: <span className="sm:hidden">Created</span>
pages/AccountManagement.tsx:721: <span className="hidden sm:inline">Edit</span>
pages/AccountManagement.tsx:730: <span className="hidden sm:inline">Deactivate</span>
pages/AccountManagement.tsx:731: <span className="sm:hidden">Del</span>
pages/AccountManagement.tsx:824: placeholder="Enter account name"
pages/AccountManagement.tsx:844: <option value="">Select Role</option>
pages/AccountManagement.tsx:897: <span className="hidden sm:inline">Update Account</span>
pages/AccountManagement.tsx:898: <span className="sm:hidden">Update</span>
pages/AccountManagement.tsx:1056: <span className="font-medium text-red-600">Deactivated</span>
pages/AccountManagement.tsx:1126: placeholder="Enter account name"
pages/AccountManagement.tsx:1152: <option value="cashier">Cashier</option>
pages/AccountManagement.tsx:1153: <option value="owner">Owner</option>
pages/AccountManagement.tsx:1171: <option value="">No location</option>
pages/AccountManagement.tsx:1173: <option disabled>Loading locations...</option>
pages/AccountManagement.tsx:1232: placeholder="Enter password"
pages/AccountManagement.tsx:1264: placeholder="Confirm password"
pages/CreditDetail.tsx:675: <th className="px-4 py-3 font-medium">Unit</th>
pages/CreditDetail.tsx:923: <p className="text-slate-500">Failed to load credit details</p>
pages/CreditDetail.tsx:1106: placeholder="Enter subtotal amount..."
pages/CreditOrders.tsx:403: <span className="sm:hidden">SF</span>
pages/CreditOrders.tsx:531: title="Edit Paid Amount"
pages/CreditOrders.tsx:586: <span className="hidden xl:block">Delete</span>
pages/CreditOrders.tsx:587: <span className="xl:hidden sm:hidden">Del</span>
pages/Credits.tsx:351: <span className="sm:hidden">Blacklisted</span>
pages/Credits.tsx:359: <span className="sm:hidden">Active</span>
pages/Customers.tsx:393: <span>Import Excel</span>
pages/Customers.tsx:430: <option value="">All Townships</option>
pages/Customers.tsx:678: placeholder="Enter township"
pages/Customers.tsx:693: placeholder="Enter address"
pages/DirectSale.tsx:715: title="First Page"
pages/DirectSale.tsx:765: title="Last Page"
pages/DirectSale.tsx:1217: <span>MMQR</span>
pages/DirectSale.tsx:1220: <span>FOC</span>
pages/DirectSale.tsx:1241: <span className="text-sm">Discount</span>
pages/DirectSale.tsx:1251: <span className="text-sm">Markup</span>
pages/DirectSale.tsx:1264: title="Calculate discount percentage"
pages/DirectSale.tsx:1288: title="Add fixed markup amount"
pages/DirectSale.tsx:1368: <span>Markup Amount</span>
pages/DirectSale.tsx:1463: <p className="text-sm text-slate-500 mb-1">Current Subtotal</p>
pages/DirectSale.tsx:1478: placeholder="Enter markup amount..."
pages/DirectSale.tsx:1563: <p className="text-sm text-slate-500 mb-1">Current Subtotal</p>
pages/DirectSale.tsx:1579: placeholder="Enter discount amount..."
pages/Expenses.tsx:434: <span className="sm:hidden">No location</span>
pages/Expenses.tsx:655: <span className="sm:hidden">Create</span>
pages/QuickSale.tsx:27: <p className="text-gray-500 text-sm">Loading...</p>
pages/QuickSale.tsx:106: <p className="text-sm text-gray-500">Please wait while we process your order...</p>
pages/Reports.tsx:640: <p className="text-slate-600">Loading reports...</p>
pages/Settings.tsx:221: <span className="hidden sm:inline">Date</span>
pages/Settings.tsx:222: <span className="sm:hidden">Date</span>
pages/Settings.tsx:225: <span className="hidden sm:inline">Product</span>
pages/Settings.tsx:226: <span className="sm:hidden">Product</span>
pages/Settings.tsx:229: <span className="hidden sm:inline">Location</span>
pages/Settings.tsx:230: <span className="sm:hidden">Location</span>
pages/Settings.tsx:233: <span className="hidden sm:inline">Action</span>
pages/Settings.tsx:234: <span className="sm:hidden">Action</span>
pages/Settings.tsx:237: <span className="hidden sm:inline">Before</span>
pages/Settings.tsx:238: <span className="sm:hidden">Before</span>
pages/Settings.tsx:241: <span className="hidden sm:inline">After</span>
pages/Settings.tsx:242: <span className="sm:hidden">After</span>
pages/Settings.tsx:245: <span className="hidden sm:inline">Change</span>
pages/Settings.tsx:246: <span className="sm:hidden">Change</span>
pages/Settings.tsx:249: <span className="hidden sm:inline">Admin</span>
pages/Settings.tsx:250: <span className="sm:hidden">Admin</span>
pages/Settings.tsx:253: <span className="hidden sm:inline">Reason</span>
pages/Settings.tsx:254: <span className="sm:hidden">Reason</span>
pages/Storefront.tsx:383: <span className="hidden sm:inline">Product Name</span>
pages/Storefront.tsx:384: <span className="sm:hidden">Name</span>
pages/Storefront.tsx:387: <span className="hidden sm:inline">Product Code</span>
pages/Storefront.tsx:388: <span className="sm:hidden">Code</span>
pages/Storefront.tsx:397: <span className="hidden sm:inline">Storefront</span>
pages/Storefront.tsx:398: <span className="sm:hidden">SF</span>
pages/Storefront.tsx:404: <span className="hidden sm:inline">Available</span>
pages/Storefront.tsx:405: <span className="sm:hidden">Avail</span>
pages/StorefrontDetail.tsx:685: <span className="hidden sm:inline">Transfer to Warehouse</span>
pages/StorefrontDetail.tsx:686: <span className="sm:hidden">Transfer</span>
pages/StorefrontDetail.tsx:771: <span className="hidden sm:inline">Clear Filters</span>
pages/StorefrontDetail.tsx:772: <span className="sm:hidden">Clear</span>
pages/StorefrontDetail.tsx:912: <span className="hidden sm:inline">Product Name</span>
pages/StorefrontDetail.tsx:913: <span className="sm:hidden">Name</span>
pages/StorefrontDetail.tsx:1546: <p className="text-sm text-slate-500 mb-1">Product</p>
pages/StorefrontProductDetail.tsx:341: title="Refresh"
pages/StorefrontProductDetail.tsx:789: <p className="text-sm text-slate-500 mb-1">Product</p>
pages/SupplierDetail.tsx:139: title="Back to Suppliers"
pages/SupplierDetail.tsx:175: title="Reload Data"
pages/SupplierDetail.tsx:225: <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded">No</span>
pages/SupplierDetail.tsx:236: <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded">No</span>
pages/SupplierDetail.tsx:423: title="Payment History"
pages/Suppliers.tsx:401: title="Filters ပြန်လည်ရှင်းလင်းရန်"
pages/Suppliers.tsx:582: title="View Supplier Details"
pages/Suppliers.tsx:869: placeholder="No. 123, Main Road"
pages/Warehouse.tsx:382: <span className="hidden sm:inline">Product Name</span>
pages/Warehouse.tsx:383: <span className="sm:hidden">Name</span>
pages/Warehouse.tsx:386: <span className="hidden sm:inline">Product Code</span>
pages/Warehouse.tsx:387: <span className="sm:hidden">Code</span>
pages/Warehouse.tsx:396: <span className="hidden sm:inline">Warehouse</span>
pages/Warehouse.tsx:397: <span className="sm:hidden">WH</span>
pages/Warehouse.tsx:403: <span className="hidden sm:inline">Available</span>
pages/Warehouse.tsx:404: <span className="sm:hidden">Avail</span>
pages/WarehouseDetail.tsx:502: <span className="hidden sm:inline">Transfer to Storefront</span>
pages/WarehouseDetail.tsx:503: <span className="sm:hidden">Transfer</span>
pages/WarehouseDetail.tsx:564: <span className="hidden sm:inline">Clear Filters</span>
pages/WarehouseDetail.tsx:565: <span className="sm:hidden">Clear</span>
pages/WarehouseDetail.tsx:686: <span className="hidden sm:inline">Product Name</span>
pages/WarehouseDetail.tsx:687: <span className="sm:hidden">Name</span>
pages/WarehouseDetail.tsx:690: <span className="hidden sm:inline">Product Code</span>
pages/WarehouseDetail.tsx:691: <span className="sm:hidden">Code</span>
pages/WarehouseDetail.tsx:700: <span className="hidden sm:inline">Available</span>
pages/WarehouseDetail.tsx:701: <span className="sm:hidden">Avail</span>
pages/WarehouseDetail.tsx:788: <span className="hidden sm:inline">Transfer</span>
pages/WarehouseDetail.tsx:796: title="Increase Stock"
pages/WarehouseDetail.tsx:806: title="Decrease Stock"
pages/WarehouseDetail.tsx:834: title="Previous Page"
pages/WarehouseDetail.tsx:874: title="Next Page"
components/AIChat.tsx:118: <h3 className="font-semibold tracking-wide">AI Assistant</h3>
components/AIChat.tsx:160: <span className="text-sm text-gray-500">AI is thinking...</span>
components/AIChat.tsx:174: placeholder="Ask me anything..."
components/Customer/CustomerDetailModal.tsx:104: <span className="text-sm text-slate-600">Tier</span>
components/Customer/CustomerDetailModal.tsx:109: <span className="text-sm text-slate-500">Updating...</span>
components/Ecommerce/EcommerceOrderDetailModal.tsx:237: title="Close"
components/Ecommerce/EcommerceOrderDetailModal.tsx:474: <span className="text-slate-500">Payment Status</span>
components/Inventory/ImportResultModal.tsx:52: <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Total Rows</p>
components/Inventory/ImportResultModal.tsx:56: <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Success</p>
components/Inventory/ImportResultModal.tsx:60: <p className="text-xs text-rose-600 font-bold uppercase tracking-wider mb-1">Failed</p>
components/Inventory/ImportResultModal.tsx:70: <h4>Detailed Error Log</h4>
components/Inventory/ImportResultModal.tsx:77: <th className="px-4 py-3 font-black">Row</th>
components/Inventory/ImportResultModal.tsx:78: <th className="px-4 py-3 font-black">Error Message</th>
components/Inventory/ProductDetailModal.tsx:304: <th className="px-4 py-2.5 text-right text-xs font-semibold text-slate-500">Price (MMK)</th>
components/Inventory/ProductDetailModal.tsx:331: <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500">Unit</th>
components/Orders/AddItemsToOrderModal.tsx:842: <span className="text-sm">Discount</span>
components/Orders/AddItemsToOrderModal.tsx:852: <span className="text-sm">Markup</span>
components/Orders/AddItemsToOrderModal.tsx:986: <span>Markup Amount</span>
components/Orders/CreditPersonModal.tsx:64: <p>No credit persons available</p>
components/Orders/OrderDetailModal.tsx:147: title="Print Order"
components/Orders/RemoveItemsFromOrderModal.tsx:574: <span className="text-sm">Discount</span>
components/Orders/RemoveItemsFromOrderModal.tsx:584: <span className="text-sm">Markup</span>
components/Orders/RemoveItemsFromOrderModal.tsx:724: <span>Markup Amount</span>
components/POS/CheckoutModal.tsx:276: <button onClick={onOpenDiscountCalc} className="ml-2 text-primary hover:text-primary-700 transition-colors" title="Calculate discount percentage">
components/POS/CheckoutModal.tsx:291: <button onClick={onOpenMarkupCalc} className="ml-2 text-primary hover:text-primary-700 transition-colors" title="Add fixed markup amount">
components/POS/DiscountCalculatorModal.tsx:34: <p className="text-sm text-slate-500 mb-1">Current Subtotal</p>
components/POS/DiscountCalculatorModal.tsx:38: <label className="block text-sm font-medium text-slate-700 mb-1">Discount Amount (MMK)</label>
components/POS/DiscountCalculatorModal.tsx:41: placeholder="Enter discount amount..."
components/POS/DiscountCalculatorModal.tsx:62: <button onClick={() => { onClose(); onDiscountAmountChange(""); }} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">C
components/POS/DiscountCalculatorModal.tsx:66: >Apply Discount</button>
components/POS/MarkupCalculatorModal.tsx:34: <p className="text-sm text-slate-500 mb-1">Current Subtotal</p>
components/POS/MarkupCalculatorModal.tsx:38: <label className="block text-sm font-medium text-slate-700 mb-1">Markup Amount (MMK)</label>
components/POS/MarkupCalculatorModal.tsx:41: placeholder="Enter markup amount..."
components/POS/MarkupCalculatorModal.tsx:62: <button onClick={onClose} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
components/POS/MarkupCalculatorModal.tsx:66: >Apply Markup</button>
components/POS/SuccessModal.tsx:25: <p className="text-green-50 text-sm">Your order has been processed successfully</p>
components/POS/SuccessModal.tsx:30: >Done</button>
components/Print/VoucherContent.tsx:188: <th style={{ width: "16%" }} className="text-center">Qty</th>
components/Print/VoucherContent.tsx:189: <th style={{ width: "18%" }} className="text-right">Price</th>
components/Print/VoucherContent.tsx:190: <th style={{ width: "18%" }} className="text-right">Amount</th>
components/Print/VoucherContent.tsx:230: <span style={{ width: "45%" }}>Subtotal</span>
components/Print/VoucherContent.tsx:236: <span style={{ width: "45%" }}>Discount</span>
components/Print/VoucherContent.tsx:246: <span>Total</span>
components/Print/VoucherContent.tsx:284: <th style={{ width: "26%" }}>CCTV Time</th>
components/Print/VoucherContent.tsx:500: <th style={{ width: "26%" }}>CCTV Time</th>
components/Print/VoucherContent.tsx:671: <span className="w-28 font-semibold">Printed Date</span>
components/Print/VoucherContent.tsx:789: <th style={{ width: "20%" }}>CCTV Time</th>
components/ProtectedRoute.tsx:77: <p className="text-slate-600">Validating session...</p>
components/PurchaseReport/OverviewTab.tsx:137: <option value="pending">Pending</option>
components/PurchaseReport/OverviewTab.tsx:138: <option value="confirmed">Confirmed</option>
components/PurchaseReport/OverviewTab.tsx:139: <option value="arrived">Arrived</option>
components/PurchaseReport/OverviewTab.tsx:140: <option value="completed">Completed</option>
components/PurchaseReport/OverviewTab.tsx:141: <option value="cancelled">Cancelled</option>
components/PurchaseReport/OverviewTab.tsx:178: <p className="text-xs text-slate-500 uppercase font-bold">Total POs</p>
components/PurchaseReport/OverviewTab.tsx:182: <p className="text-xs text-slate-500 uppercase font-bold">Total Amount</p>
components/PurchaseReport/OverviewTab.tsx:188: <p className="text-xs text-slate-500 uppercase font-bold">Ordered</p>
components/PurchaseReport/OverviewTab.tsx:194: <p className="text-xs text-slate-500 uppercase font-bold">Received</p>
components/PurchaseReport/OverviewTab.tsx:200: <p className="text-xs text-slate-500 uppercase font-bold">Remaining</p>
components/PurchaseReport/OverviewTab.tsx:237: <th className="px-3 py-3 font-medium text-slate-600">Created By</th>
components/PurchaseReport/OverviewTab.tsx:326: <th className="px-3 py-2 text-left">Product</th>
components/PurchaseReport/OverviewTab.tsx:327: <th className="px-3 py-2 text-left">Code</th>
components/PurchaseReport/OverviewTab.tsx:329: <th className="px-3 py-2 text-right">Received</th>
components/PurchaseReport/OverviewTab.tsx:330: <th className="px-3 py-2 text-right">Price</th>
components/PurchaseReport/ProductTab.tsx:180: <p className="text-xs text-slate-500 uppercase font-bold">Products</p>
components/PurchaseReport/ProductTab.tsx:184: <p className="text-xs text-slate-500 uppercase font-bold">Total Ordered</p>
components/PurchaseReport/ProductTab.tsx:202: <p className="text-xs text-slate-500 uppercase font-bold">Total Amount</p>
components/PurchaseReport/SupplierTab.tsx:134: <p className="text-xs text-slate-500 uppercase font-bold">Suppliers</p>
components/PurchaseReport/SupplierTab.tsx:138: <p className="text-xs text-slate-500 uppercase font-bold">Total POs</p>
components/Purchasing/CreateGRNModal.tsx:201: title="Create Goods Received Note"
components/Purchasing/CreateGRNModal.tsx:218: <option value="">Select PO...</option>
components/Purchasing/CreateGRNModal.tsx:229: <h3 className="font-semibold text-slate-800 mb-3">PO Details</h3>
components/Purchasing/CreateGRNModal.tsx:285: placeholder="Additional notes..."
components/Purchasing/CreatePOModal.tsx:289: <Modal isOpen={isOpen} onClose={onClose} title="Create Purchase Order">
components/Purchasing/CreatePOModal.tsx:442: placeholder="Qty"
components/Purchasing/CreatePOModal.tsx:518: title="Remove item"
components/Purchasing/GRNDetailModal.tsx:320: title="Sticker ပရင့်ထုတ်မည်"
components/Purchasing/GRNDetailModal.tsx:328: title="Update Line Item"
components/Purchasing/GRNManager.tsx:148: <h2 className="font-bold text-lg mb-4">Create Goods Received Note</h2>
components/Purchasing/GRNManager.tsx:162: <option value="">Select PO...</option>
components/Purchasing/GRNManager.tsx:213: placeholder="Additional notes..."
components/Purchasing/PaymentHistoryModal.tsx:114: <span className="text-slate-500 block">Paid / Remaining</span>
components/Purchasing/PaymentHistoryModal.tsx:162: title="Delete Payment"
components/Purchasing/PaymentHistoryModal.tsx:180: title="Delete Payment Record"
components/Purchasing/PODetailModal.tsx:102: <Modal isOpen={isOpen} onClose={handleClose} title="Purchase Order Details">
components/Purchasing/PODetailModal.tsx:228: <th className="p-3 text-center">Unit (Base Qty)</th>
components/Purchasing/PurchaseOrderList.tsx:35: loadPurchases: (page?: number, limit?: number, filter?: string) => Promise<void>;
components/Purchasing/PurchaseOrderList.tsx:36: loadDeletedPurchases: (page?: number, limit?: number) => Promise<void>;
components/Purchasing/PurchaseOrderList.tsx:394: title="View PO Details"
components/Purchasing/PurchaseOrderList.tsx:407: title="Record Credit Payment"
components/Purchasing/PurchaseOrderList.tsx:418: title="View Credit Payment History"
components/Purchasing/PurchaseOrderList.tsx:457: title="Delete PO"
components/Purchasing/PurchaseOrderList.tsx:479: title="Delete Purchase Order"
components/Purchasing/RecordPaymentModal.tsx:165: <option value="bank_transfer">Bank Transfer</option>
components/Purchasing/RecordPaymentModal.tsx:166: <option value="mobile_payment">KPay / WavePay</option>
components/Purchasing/RecordPaymentModal.tsx:167: <option value="cheque">Cheque</option>
components/Purchasing/RecordPaymentModal.tsx:168: <option value="other">Other</option>
components/Purchasing/RecordPaymentModal.tsx:196: placeholder="Optional payment notes"
components/Purchasing/TransferDetailModal.tsx:168: <Modal isOpen={isOpen} onClose={handleClose} title="Transfer Details">
components/Purchasing/TransferStorefrontModal.tsx:190: <Modal isOpen={isOpen} onClose={handleClose} title="Transfer to Storefront">
components/Purchasing/TransferStorefrontModal.tsx:194: <span className="ml-3 text-slate-500">Loading...</span>
components/Purchasing/TransferStorefrontModal.tsx:235: <option value="">Select Storefront...</option>
components/Purchasing/TransferStorefrontModal.tsx:264: placeholder="Additional notes..."
components/Purchasing/TransferWarehouseModal.tsx:185: <Modal isOpen={isOpen} onClose={handleClose} title="Transfer to Warehouse">
components/Purchasing/TransferWarehouseModal.tsx:189: <span className="ml-3 text-slate-500">Loading...</span>
components/Purchasing/TransferWarehouseModal.tsx:233: <option value="">Select Warehouse...</option>
components/Purchasing/TransferWarehouseModal.tsx:264: placeholder="Additional notes..."
components/Purchasing/UpdateLineItemModal.tsx:29: ) => Promise<void>;
components/Purchasing/UpdateLineItemModal.tsx:82: <Modal isOpen={isOpen} onClose={handleClose} title="Update Line Item">
components/Purchasing/UpdateLineItemModal.tsx:157: placeholder="Add any notes about this update..."
components/QuickSale/BrandPanel.tsx:218: <p className="text-gray-400 text-sm">Loading brands...</p>
components/QuickSale/CartProductModal.tsx:73: <label className="text-xs text-gray-500 uppercase">Qty</label>
components/QuickSale/CartProductModal.tsx:107: <label className="text-xs text-gray-500 uppercase">Unit</label>
components/QuickSale/CartProductModal.tsx:129: <label className="text-xs text-gray-500 uppercase">Amount</label>
components/QuickSale/CartProductModal.tsx:152: <th className="px-3 py-1.5">Min Qty</th>
components/QuickSale/CartProductModal.tsx:153: <th className="px-3 py-1.5 text-right">Price</th>
components/QuickSale/CartProductModal.tsx:154: <th className="px-3 py-1.5 text-right">Save</th>
components/QuickSale/CartSidebar.tsx:55: <th className="px-4 py-2 w-10">Sr</th>
components/QuickSale/CartSidebar.tsx:56: <th className="px-4 py-2">Description</th>
components/QuickSale/CartSidebar.tsx:57: <th className="px-4 py-2 w-20 text-center">Qty</th>
components/QuickSale/CartSidebar.tsx:58: <th className="px-4 py-2 w-24 text-right">Amount</th>
components/QuickSale/CheckoutModal.tsx:190: placeholder="Search name or phone..."
components/QuickSale/CheckoutModal.tsx:200: <option value="">All Townships</option>
components/QuickSale/CheckoutModal.tsx:258: <label className="block text-sm font-medium text-gray-700 mb-2">Pricing Option</label>
components/QuickSale/CheckoutModal.tsx:263: <span className="text-sm">Discount</span>
components/QuickSale/CheckoutModal.tsx:268: <span className="text-sm">Markup</span>
components/QuickSale/CheckoutModal.tsx:277: <button onClick={onOpenDiscountCalc} className="ml-2 text-primary hover:text-primary-700 transition-colors" title="Calculate discount percentage">
components/QuickSale/CheckoutModal.tsx:292: <button onClick={onOpenMarkupCalc} className="ml-2 text-primary hover:text-primary-700 transition-colors" title="Add fixed markup amount">
components/QuickSale/CheckoutModal.tsx:340: <span>Markup Amount</span>
components/QuickSale/DiscountCalculatorModal.tsx:34: <p className="text-sm text-slate-500 mb-1">Current Subtotal</p>
components/QuickSale/DiscountCalculatorModal.tsx:38: <label className="block text-sm font-medium text-slate-700 mb-1">Discount Amount (MMK)</label>
components/QuickSale/DiscountCalculatorModal.tsx:41: placeholder="Enter discount amount..."
components/QuickSale/DiscountCalculatorModal.tsx:62: <button onClick={() => { onClose(); onDiscountAmountChange(""); }} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-col
components/QuickSale/DiscountCalculatorModal.tsx:66: >Apply Discount</button>
components/QuickSale/MarkupCalculatorModal.tsx:34: <p className="text-sm text-slate-500 mb-1">Current Subtotal</p>
components/QuickSale/MarkupCalculatorModal.tsx:38: <label className="block text-sm font-medium text-slate-700 mb-1">Markup Amount (MMK)</label>
components/QuickSale/MarkupCalculatorModal.tsx:41: placeholder="Enter markup amount..."
components/QuickSale/MarkupCalculatorModal.tsx:62: <button onClick={onClose} className="px-4 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
components/QuickSale/MarkupCalculatorModal.tsx:66: >Apply Markup</button>
components/QuickSale/ProductGrid.tsx:136: className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="First Page"
components/QuickSale/ProductGrid.tsx:153: className="p-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" title="Last Page"
components/QuickSale/SuccessModal.tsx:25: <p className="text-green-50 text-sm">Your order has been processed successfully</p>
components/QuickSale/SuccessModal.tsx:30: >Done</button>
components/Reports/OverallReportTab.tsx:109: <p className="text-slate-500 text-xs uppercase font-bold">Tax</p>
components/Reports/PaidOrdersTab.tsx:208: <td className="px-4 py-3 font-bold text-slate-800">Total</td>
components/Reports/ReportTabs.tsx:34: <span className="hidden sm:inline">Total Revenue</span>
components/Reports/ReportTabs.tsx:35: <span className="sm:hidden">Revenue</span>
components/Reports/ReportTabs.tsx:47: <span className="hidden sm:inline">Overall</span>
components/Reports/ReportTabs.tsx:48: <span className="sm:hidden">Overall</span>
components/Reports/ReportTabs.tsx:59: <span className="hidden sm:inline">Paid Orders</span>
components/Reports/ReportTabs.tsx:60: <span className="sm:hidden">Paid</span>
components/Reports/ReportTabs.tsx:71: <span className="hidden sm:inline">Credit Orders</span>
components/Reports/ReportTabs.tsx:72: <span className="sm:hidden">Credit</span>
components/Reports/ReportTabs.tsx:83: <span className="hidden sm:inline">Sale Statistics</span>
components/Reports/ReportTabs.tsx:84: <span className="sm:hidden">Stats</span>
components/Reports/ReportTabs.tsx:95: <span className="hidden sm:inline">FOC Products</span>
components/Reports/ReportTabs.tsx:96: <span className="sm:hidden">FOC</span>
components/Reports/TotalRevenueTab.tsx:160: title="Customize View"
components/Reports/TotalRevenueTab.tsx:174: <span>Total Inventory Value</span>
components/Reports/TotalRevenueTab.tsx:183: <span>Credit Remaining</span>
components/Reports/TotalRevenueTab.tsx:192: <span>Credit Paid Amount</span>
components/Reports/TotalRevenueTab.tsx:201: <span>Paid Order Amount</span>
components/Reports/TotalRevenueTab.tsx:279: <p className="text-xs text-purple-600 mt-1">Direct paid orders</p>
components/Settings/ActivityLogTab.tsx:99: return <p className="text-sm text-slate-500">No metadata</p>;
components/Settings/ActivityLogTab.tsx:301: <option value="">All Admins</option>
components/Settings/ActivityLogTab.tsx:338: title="Clear filters"
components/Settings/ActivityLogTab.tsx:393: <span className="hidden sm:inline">Export CSV</span>
components/Settings/BusinessHoursCard.tsx:39: <span className="text-sm text-red-600 font-medium">Closed</span>
components/Settings/BusinessHoursCard.tsx:45: <span className="text-sm text-slate-400">Not set</span>
components/Settings/ShopLogoUpload.tsx:197: title="Delete Shop Logo"
components/Settings/ShopSettingsForm.tsx:86: placeholder="My Super Shop"
components/ThermalReceipt.tsx:678: <div>NO</div>
components/ThermalReceipt.tsx:679: <div>ITEM DESCRIPTION</div>
components/ThermalReceipt.tsx:680: <div>PRICE</div>
components/ThermalReceipt.tsx:681: <div>QTY.</div>
components/ThermalReceipt.tsx:682: <div>TOTAL</div>
```

## C. English toast (75 ကြောင်း)

```
pages/AccountManagement.tsx:139: toast.error("Failed to load locations");
pages/AccountManagement.tsx:155: toast.error("Failed to load accounts");
pages/AccountManagement.tsx:251: toast.error("Name is required");
pages/AccountManagement.tsx:268: toast.success("Account updated successfully!");
pages/AccountManagement.tsx:393: toast.error("Role is required");
pages/CreditDetail.tsx:155: toast.error("Failed to load payment records");
pages/CreditDetail.tsx:178: toast.error("Failed to load credit details");
pages/CreditDetail.tsx:361: toast.error("Failed to load order details");
pages/CreditOrders.tsx:232: toast.success("Credit person assigned successfully");
pages/CreditOrders.tsx:242: toast.error("Failed to assign credit person");
pages/Customers.tsx:179: toast.success("Customer tier updated");
pages/Expenses.tsx:81: toast.error("Failed to load locations");
pages/PrintReceipt.tsx:145: toast.error("Failed to prepare voucher for printing");
pages/Reports.tsx:198: toast.error("Failed to load storefronts");
pages/Reports.tsx:202: toast.error("Failed to load reports");
pages/Reports.tsx:224: toast.error("Failed to load paid orders report");
pages/Reports.tsx:243: toast.error("Failed to load all storefronts paid orders report");
pages/Reports.tsx:264: toast.error("Failed to load credit orders report");
pages/Reports.tsx:285: toast.error("Failed to load all storefronts credit orders report");
pages/Reports.tsx:308: toast.error("Failed to load product sales statistics");
pages/Reports.tsx:345: toast.error("Failed to load all storefronts product sales statistics");
pages/Reports.tsx:360: //       toast.error("Failed to load storefront inventory");
pages/Reports.tsx:364: //     toast.error("Failed to load storefront inventory");
pages/Reports.tsx:377: //     toast.error("Failed to load all storefronts stock");
pages/Reports.tsx:398: toast.error("Failed to load FOC orders");
pages/Reports.tsx:416: toast.error("Failed to load all storefronts FOC orders");
pages/Reports.tsx:504: toast.error("Failed to load revenue data");
pages/Settings.tsx:68: toast.error("Failed to load stock audit logs");
pages/Settings.tsx:82: toast.error("Failed to load transfers");
pages/StorefrontDetail.tsx:157: toast.error("Storefront ID is missing");
pages/StorefrontDetail.tsx:324: toast.error("Storefront ID is missing");
pages/StorefrontDetail.tsx:500: toast.error("Cannot update — missing product id");
pages/StorefrontDetail.tsx:505: toast.error("Max per user must be greater than 0");
pages/StorefrontDetail.tsx:510: toast.error("Reset days must be at least 1");
pages/StorefrontDetail.tsx:556: toast.error("Cannot remove limit — missing product id");
pages/StorefrontDetail.tsx:595: toast.error("Quantity must be greater than 0");
pages/StorefrontProductDetail.tsx:168: toast.error("Max per user must be greater than 0");
pages/StorefrontProductDetail.tsx:173: toast.error("Reset days must be at least 1");
pages/WarehouseDetail.tsx:137: toast.error("Warehouse ID is missing");
pages/WarehouseDetail.tsx:413: toast.error("Quantity must be greater than 0");
components/AIChat.tsx:80: toast.error("Failed to get a response from AI.");
components/AIChat.tsx:84: toast.error("Something went wrong while contacting the AI.");
components/Ecommerce/AddItemsToEcommerceOrderModal.tsx:84: toast.error("Failed to load products");
components/Ecommerce/AddItemsToEcommerceOrderModal.tsx:185: toast.error("Please select at least one item");
components/Ecommerce/AddItemsToEcommerceOrderModal.tsx:196: toast.error("Invalid unit price");
components/ProtectedRoute.tsx:63: toast.error("Session expired. Please login again.");
components/PurchaseReport/OverviewTab.tsx:100: toast.error("Failed to load purchase report");
components/PurchaseReport/ProductTab.tsx:84: toast.error("Failed to load product report");
components/PurchaseReport/SupplierTab.tsx:70: toast.error("Failed to load supplier report");
components/Purchasing/CreateGRNModal.tsx:136: toast.error("Please select a Purchase Order");
components/Purchasing/CreateGRNModal.tsx:141: toast.error("Please load PO items first");
components/Purchasing/CreateGRNModal.tsx:150: toast.error("Please select at least one item to create GRN");
components/Purchasing/CreateGRNModal.tsx:182: toast.success("GRN Created Successfully!");
components/Purchasing/CreateGRNModal.tsx:191: toast.error("An error occurred while creating GRN");
components/Purchasing/GRNDetailModal.tsx:115: toast.error("Failed to update line item: " + result.message);
components/Purchasing/GRNDetailModal.tsx:119: toast.error("Error updating line item: " + error);
components/Purchasing/GRNManager.tsx:93: toast.error("Please select a Purchase Order");
components/Purchasing/GRNManager.tsx:98: toast.error("Please load PO items first");
components/Purchasing/GRNManager.tsx:132: toast.success("GRN Created Successfully!");
components/Purchasing/GRNManager.tsx:139: toast.error("An error occurred while creating GRN");
components/Purchasing/RecordPaymentModal.tsx:65: toast.success("Supplier credit payment recorded successfully!");
components/Purchasing/TransferStorefrontModal.tsx:87: toast.error("Failed to load data");
components/Purchasing/TransferStorefrontModal.tsx:133: toast.error("GRN ID is required");
components/Purchasing/TransferStorefrontModal.tsx:138: toast.error("Please select a destination storefront");
components/Purchasing/TransferStorefrontModal.tsx:174: toast.success("Transfer to storefront completed successfully!");
components/Purchasing/TransferStorefrontModal.tsx:183: toast.error("An error occurred while transferring");
components/Purchasing/TransferWarehouseModal.tsx:82: toast.error("Failed to load data");
components/Purchasing/TransferWarehouseModal.tsx:128: toast.error("GRN ID is required");
components/Purchasing/TransferWarehouseModal.tsx:133: toast.error("Please select a destination warehouse");
components/Purchasing/TransferWarehouseModal.tsx:169: toast.success("Transfer completed successfully!");
components/Purchasing/TransferWarehouseModal.tsx:178: toast.error("An error occurred while transferring");
components/Settings/ShopLogoUpload.tsx:51: toast.error("Please select an image first");
components/Settings/ShopSettingsForm.tsx:35: toast.error("Please fill in all required fields");
components/Settings/ShopSettingsTab.tsx:52: toast.error("Failed to load shop settings");
hooks/usePurchasing.ts:141: toast.error("Failed to load deleted POs");
```

## D. Object literal label / option (45 ကြောင်း)

```
pages/CreditDetail.tsx:208: { value: "cash", label: "Cash" },
pages/CreditDetail.tsx:210: { value: "wavepay", label: "Wave Pay" },
pages/CreditDetail.tsx:213: { value: "bank_transfer", label: "Bank Transfer" },
pages/Customers.tsx:40: { value: null, label: "Regular", color: "bg-slate-100 text-slate-700", multiplier: "1x", factor: 10 },
pages/Customers.tsx:41: { value: "silver", label: "Silver", color: "bg-gray-100 text-gray-700", multiplier: "1.5x", factor: 15 },
pages/Customers.tsx:42: { value: "gold", label: "Gold", color: "bg-yellow-100 text-yellow-700", multiplier: "2x", factor: 20 },
pages/Customers.tsx:43: { value: "platinum", label: "Platinum", color: "bg-purple-100 text-purple-700", multiplier: "3x", factor: 30 },
components/Customer/CustomerDetailModal.tsx:8: { value: null, label: "Regular", color: "bg-slate-100 text-slate-700 border-slate-300", multiplier: "1x", factor: 10 },
components/Customer/CustomerDetailModal.tsx:9: { value: "silver", label: "Silver", color: "bg-gray-100 text-gray-700 border-gray-300", multiplier: "1.5x", factor: 15 },
components/Customer/CustomerDetailModal.tsx:10: { value: "gold", label: "Gold", color: "bg-yellow-100 text-yellow-700 border-yellow-300", multiplier: "2x", factor: 20 },
components/Customer/CustomerDetailModal.tsx:11: { value: "platinum", label: "Platinum", color: "bg-purple-100 text-purple-700 border-purple-300", multiplier: "3x", factor: 30 },
components/PurchaseReport/PurchaseReportTabs.tsx:18: { id: "overview", label: "Overview", icon: LayoutGrid },
components/PurchaseReport/PurchaseReportTabs.tsx:19: { id: "products", label: "By Product", icon: Package },
components/PurchaseReport/PurchaseReportTabs.tsx:20: { id: "suppliers", label: "By Supplier", icon: Users },
components/PurchaseReport/purchaseReportUtils.tsx:39: label: "Pending",
components/PurchaseReport/purchaseReportUtils.tsx:43: label: "Confirmed",
components/PurchaseReport/purchaseReportUtils.tsx:47: label: "Arrived",
components/PurchaseReport/purchaseReportUtils.tsx:51: label: "Completed",
components/PurchaseReport/purchaseReportUtils.tsx:55: label: "Cancelled",
components/Settings/activityLogUtils.ts:4: { value: "", label: "All Features" },
components/Settings/activityLogUtils.ts:5: { value: "order", label: "Order" },
components/Settings/activityLogUtils.ts:6: { value: "inventory", label: "Inventory" },
components/Settings/activityLogUtils.ts:7: { value: "purchase", label: "Purchase" },
components/Settings/activityLogUtils.ts:9: { value: "transfer", label: "Transfer" },
components/Settings/activityLogUtils.ts:10: { value: "quotation", label: "Quotation" },
components/Settings/activityLogUtils.ts:11: { value: "expense", label: "Expense" },
components/Settings/activityLogUtils.ts:12: { value: "credit", label: "Credit" },
components/Settings/activityLogUtils.ts:13: { value: "supplier", label: "Supplier" },
components/Settings/activityLogUtils.ts:14: { value: "warehouse_stock", label: "Warehouse Stock" },
components/Settings/activityLogUtils.ts:15: { value: "storefront_stock", label: "Storefront Stock" },
components/Settings/activityLogUtils.ts:16: { value: "warehouse_profile", label: "Warehouse Profile" },
components/Settings/activityLogUtils.ts:17: { value: "storefront_profile", label: "Storefront Profile" },
components/Settings/activityLogUtils.ts:18: { value: "admin", label: "Admin" },
components/Settings/activityLogUtils.ts:22: { value: "", label: "All Actions" },
components/Settings/activityLogUtils.ts:23: { value: "create", label: "Create" },
components/Settings/activityLogUtils.ts:24: { value: "update", label: "Update" },
components/Settings/activityLogUtils.ts:25: { value: "delete", label: "Delete" },
components/Settings/activityLogUtils.ts:26: { value: "login", label: "Login" },
components/Settings/activityLogUtils.ts:27: { value: "logout", label: "Logout" },
components/Settings/activityLogUtils.ts:28: { value: "create_payment", label: "Create Payment" },
components/Settings/activityLogUtils.ts:29: { value: "update_status", label: "Update Status" },
components/Settings/activityLogUtils.ts:30: { value: "update_quantity", label: "Update Quantity" },
components/Settings/activityLogUtils.ts:31: { value: "update_line_items", label: "Update Line Items" },
components/Settings/activityLogUtils.ts:32: { value: "mark_converted", label: "Mark Converted" },
components/Settings/activityLogUtils.ts:47: return { name: "Unknown", role: "-", id: String(log.admin || "") };
```
