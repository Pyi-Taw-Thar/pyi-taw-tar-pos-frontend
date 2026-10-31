import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Toaster } from "sonner";
import { LayoutGrid } from "lucide-react";
import { AppProvider } from "./context/AppContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { LanguageSwitcher } from "./components/LanguageSwitcher";
import { UserMenu } from "./components/UserMenu";
import { FeatureRoute } from "./components/FeatureRoute";
import { getMenuItemByPath } from "./config/menuConfig";

import MenuPage from "./pages/Menu";
import { POS } from "./pages/POS";
import { QuickSale } from "./pages/QuickSale";
import { DirectSale } from "./pages/DirectSale";
import { Warehouse } from "./pages/Warehouse";
import { WarehouseDetail } from "./pages/WarehouseDetail";
import { Storefront } from "./pages/Storefront";
import { StorefrontDetail } from "./pages/StorefrontDetail";
import { StorefrontProductDetail } from "./pages/StorefrontProductDetail";
import { Reports } from "./pages/Reports";
import { PurchaseReport } from "./pages/PurchaseReport";
import { Settings } from "./pages/Settings";
import { Inventory } from "./pages/Inventory";
import { Purchasing } from "./pages/Purchasing";
// /credits/:id သို့ ဝင်ရောက်လာပါက /customers/:id သို့ အလိုအလျောက် လမ်းကြောင်းလွှဲပေးသည့် component
const CreditDetailRedirect: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  return <Navigate to={id ? `/customers/${id}` : "/customers"} replace />;
};
import { Expenses } from "./pages/Expenses";
import { Suppliers } from "./pages/Suppliers";
import { SupplierDetail } from "./pages/SupplierDetail";
import { Orders } from "./pages/Orders";
import { DirectSaleOrders } from "./pages/DirectSaleOrders";
import { EcommerceOrders } from "./pages/EcommerceOrders";
import { EcommerceReports } from "./pages/EcommerceReports";
import { EcommerceProductOrdersReport } from "./pages/EcommerceProductOrdersReport";
import { CustomerDetail } from "./pages/CustomerDetail";
import { Customers } from "./pages/Customers";
import { CreditOrders } from "./pages/CreditOrders";
import { QuotationList } from "./pages/QuotationList";
import { QuotationCreate } from "./pages/QuotationCreate";
import { QuotationDetail } from "./pages/QuotationDetail";
import { AccountManagement } from "./pages/AccountManagement";
import { Login } from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import PrintReceipt from "./pages/PrintReceipt";
import { AIChat } from "./pages/AIChat";
import { OrderFulfillment } from "./pages/OrderFulfillment";

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const token = localStorage.getItem("authToken");

  const isMenuPage = location.pathname === "/menu";
  const currentMenuItem = getMenuItemByPath(location.pathname);
  const pageTitle = currentMenuItem ? t(currentMenuItem.labelKey) : "";

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA]">
      {/* Only show header if authenticated */}
      {token && (
        <header
          className="app-navbar-fixed bg-[#1E2937] border-b border-white/10 print:hidden shadow-lg"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            width: "100%",
            height: "56px",
            zIndex: 30,
          }}
        >
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center min-w-0">
              {/* Menu shortcut icon (hidden on /menu page) */}
              {!isMenuPage && (
                <button
                  onClick={() => navigate("/menu")}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors mr-2.5 text-white focus:outline-none focus:ring-2 focus:ring-white/20"
                  aria-label={t("menu.openMenu")}
                  title={t("menu.openMenu")}
                >
                  <LayoutGrid className="w-5 h-5 text-white" />
                </button>
              )}

              {/* Title / Breadcrumb */}
              {!isMenuPage ? (
                <div className="flex items-center min-w-0 text-white">
                  <button
                    onClick={() => navigate("/menu")}
                    className="text-base sm:text-lg font-bold tracking-wide hover:text-white/80 transition-colors hidden sm:inline truncate"
                  >
                    {t("menu.appName")}
                  </button>
                  <span className="text-white/40 mx-2 hidden sm:inline">›</span>
                  <h1 className="text-sm sm:text-base font-semibold tracking-wide truncate">
                    {pageTitle || t("menu.appName")}
                  </h1>
                </div>
              ) : (
                <h1 className="text-lg font-bold text-white tracking-wide">
                  {t("menu.appName")}
                </h1>
              )}
            </div>

            {/* Right side: Language Switcher + User Dropdown */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <UserMenu />
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      {/* Fixed header အတွက် 56px — header မပြသော print တွင် ဖယ် (A5 footer စာမျက်နှာကွဲခြင်း ကာကွယ်ရန်) */}
      <main className="flex-1 overflow-x-hidden pt-[56px] print:pt-0">
        <Routes>
          <Route path="/" element={<Navigate to="/menu" replace />} />
          <Route path="/menu" element={<MenuPage />} />

          {/* POS & Sales routes guarded by posSales feature flag */}
          <Route
            path="/pos"
            element={
              <FeatureRoute feature="posSales">
                <POS />
              </FeatureRoute>
            }
          />
          <Route
            path="/quick-sale"
            element={
              <FeatureRoute feature="posSales">
                <QuickSale />
              </FeatureRoute>
            }
          />
          <Route
            path="/direct-sale"
            element={
              <FeatureRoute feature="posSales">
                <DirectSale />
              </FeatureRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <FeatureRoute feature="posSales">
                <Orders />
              </FeatureRoute>
            }
          />
          <Route
            path="/direct-sale-orders"
            element={
              <FeatureRoute feature="posSales">
                <DirectSaleOrders />
              </FeatureRoute>
            }
          />
          <Route
            path="/credit-orders"
            element={
              <FeatureRoute feature="posSales">
                <CreditOrders />
              </FeatureRoute>
            }
          />
          <Route
            path="/quotations"
            element={
              <FeatureRoute feature="posSales">
                <QuotationList />
              </FeatureRoute>
            }
          />
          <Route
            path="/quotations/create"
            element={
              <FeatureRoute feature="posSales">
                <QuotationCreate />
              </FeatureRoute>
            }
          />
          <Route
            path="/quotations/new"
            element={
              <FeatureRoute feature="posSales">
                <Navigate to="/quotations/create" replace />
              </FeatureRoute>
            }
          />
          <Route
            path="/quotations/:id/edit"
            element={
              <FeatureRoute feature="posSales">
                <QuotationCreate />
              </FeatureRoute>
            }
          />
          <Route
            path="/quotations/:id"
            element={
              <FeatureRoute feature="posSales">
                <QuotationDetail />
              </FeatureRoute>
            }
          />
          <Route path="/credits" element={<Navigate to="/customers" replace />} />
          <Route path="/credits/:id" element={<CreditDetailRedirect />} />
          <Route
            path="/print-receipt/:orderId"
            element={<PrintReceipt />}
          />

          {/* E-commerce, Inventory, Warehouse, Purchasing & System routes */}
          <Route path="/admin/ecommerce-orders" element={<EcommerceOrders />} />
          <Route path="/admin/ecommerce-reports" element={<EcommerceReports />} />
          <Route path="/admin/ecommerce-product-orders" element={<EcommerceProductOrdersReport />} />
          <Route path="/order-fulfillment" element={<OrderFulfillment />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/warehouse" element={<Warehouse />} />
          <Route path="/warehouse/:id" element={<WarehouseDetail />} />
          <Route path="/storefront" element={<Storefront />} />
          <Route path="/storefront/:id" element={<StorefrontDetail />} />
          <Route
            path="/storefront/:storeId/product/:productId"
            element={<StorefrontProductDetail />}
          />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/suppliers/:id" element={<SupplierDetail />} />
          <Route path="/purchasing" element={<Purchasing />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/purchase-report" element={<PurchaseReport />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/accounts" element={<AccountManagement />} />
          <Route
            path="/ai-chat"
            element={
              <FeatureRoute feature="aiAssistant">
                <AIChat />
              </FeatureRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AppProvider>
        <Toaster position="top-right" richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="*" element={<AppLayout />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </LanguageProvider>
  );
};

export default App;
