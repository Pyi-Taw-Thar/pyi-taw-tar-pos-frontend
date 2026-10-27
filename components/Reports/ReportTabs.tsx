import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import {
  Store,
  DollarSign,
  CreditCard,
  BarChart3,
  // TrendingUp,
  Gift,
} from "lucide-react";

type TabType = "overall" | "foc" | "paid" | "credit" | "statistics" | "revenue";

interface ReportTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const ReportTabs: React.FC<ReportTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t } = useLanguage();
  return (
    <div className="flex gap-1 sm:gap-2 border-b overflow-x-auto">
      {/* <button
        onClick={() => onTabChange("revenue")}
        className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold flex items-center gap-1 sm:gap-2 transition-colors whitespace-nowrap ${
          activeTab === "revenue"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">{t("reports.totalRevenue")}</span>
        <span className="sm:hidden">{t("reports.revenue")}</span>
      </button> */}

      <button
        onClick={() => onTabChange("overall")}
        className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold flex items-center gap-1 sm:gap-2 transition-colors whitespace-nowrap ${
          activeTab === "overall"
            ? "border-b-2 border-primary text-primary"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <Store className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">{t("reports.overall")}</span>
        <span className="sm:hidden">{t("reports.overall")}</span>
      </button>
      <button
        onClick={() => onTabChange("paid")}
        className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold flex items-center gap-1 sm:gap-2 transition-colors whitespace-nowrap ${
          activeTab === "paid"
            ? "border-b-2 border-green-600 text-green-600"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <DollarSign className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">{t("reports.paidOrders")}</span>
        <span className="sm:hidden">{t("reports.paid")}</span>
      </button>
      <button
        onClick={() => onTabChange("credit")}
        className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold flex items-center gap-1 sm:gap-2 transition-colors whitespace-nowrap ${
          activeTab === "credit"
            ? "border-b-2 border-orange-600 text-orange-600"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">{t("reports.creditOrders")}</span>
        <span className="sm:hidden">{t("reports.credit")}</span>
      </button>
      <button
        onClick={() => onTabChange("statistics")}
        className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold flex items-center gap-1 sm:gap-2 transition-colors whitespace-nowrap ${
          activeTab === "statistics"
            ? "border-b-2 border-purple-600 text-purple-600"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">{t("reports.saleStatistics")}</span>
        <span className="sm:hidden">{t("reports.stats")}</span>
      </button>
      <button
        onClick={() => onTabChange("foc")}
        className={`px-3 sm:px-6 py-2 sm:py-3 font-semibold flex items-center gap-1 sm:gap-2 transition-colors whitespace-nowrap ${
          activeTab === "foc"
            ? "border-b-2 border-red-600 text-red-600"
            : "text-slate-500 hover:text-slate-700"
        }`}
      >
        <Gift className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">{t("reports.focProducts")}</span>
        <span className="sm:hidden">{t("reports.foc")}</span>
      </button>
    </div>
  );
};
