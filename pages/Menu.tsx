import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useApp } from "../context/AppContext";
import { MENU_SECTIONS, canSeeItem, MenuItem } from "../config/menuConfig";
import { FEATURES } from "../config/features";
import { fetchEcommerceOrders } from "../services/Ecommerce/fetchEcommerceOrders";
import { fetchPendingFulfillmentOrders } from "../services/Fulfillment/fetchPendingFulfillmentOrders";
import { performLogout } from "../utils/logout";

const Menu: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { currentUser } = useApp();

  const [badges, setBadges] = useState<{
    ecommercePending?: number;
    fulfillmentPending?: number;
  }>({});

  const adminData = useMemo(() => {
    try {
      const saved = localStorage.getItem("adminData");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }, []);

  const userRole = useMemo(() => {
    if (adminData?.role) return String(adminData.role).toLowerCase();
    return String(currentUser?.role || "staff").toLowerCase();
  }, [adminData?.role, currentUser?.role]);

  const userName = adminData?.name || currentUser?.name || "User";

  // Filter sections that have at least one visible item
  const visibleSections = useMemo(() => {
    return MENU_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        canSeeItem(item, userRole, FEATURES)
      ),
    })).filter((section) => section.items.length > 0);
  }, [userRole]);

  const totalVisibleItemsCount = useMemo(() => {
    return visibleSections.reduce((acc, sec) => acc + sec.items.length, 0);
  }, [visibleSections]);

  // Fetch pending count badges once on mount (only for items the user has permission to see)
  useEffect(() => {
    let cancelled = false;

    const canSeeEcommerce = visibleSections.some((sec) =>
      sec.items.some((item) => item.badge === "ecommercePending")
    );
    const canSeeFulfillment = visibleSections.some((sec) =>
      sec.items.some((item) => item.badge === "fulfillmentPending")
    );

    const promises: Promise<void>[] = [];

    if (canSeeEcommerce) {
      promises.push(
        fetchEcommerceOrders({ status: "pending", page: 1, limit: 1 })
          .then((res) => {
            if (!cancelled && res?.success) {
              const count =
                res.pagination?.totalItems ??
                (Array.isArray(res.data) ? res.data.length : 0);
              if (count > 0) {
                setBadges((prev) => ({ ...prev, ecommercePending: count }));
              }
            }
          })
          .catch(() => {
            // Silently ignore badge fetch errors
          })
      );
    }

    if (canSeeFulfillment) {
      promises.push(
        fetchPendingFulfillmentOrders({ page: 1, limit: 1 })
          .then((res) => {
            if (!cancelled && res?.success) {
              const count =
                res.pagination?.totalItems ??
                (Array.isArray(res.data) ? res.data.length : 0);
              if (count > 0) {
                setBadges((prev) => ({ ...prev, fulfillmentPending: count }));
              }
            }
          })
          .catch(() => {
            // Silently ignore badge fetch errors
          })
      );
    }

    Promise.allSettled(promises);

    return () => {
      cancelled = true;
    };
  }, [visibleSections]);

  const handleLogout = () => {
    performLogout(navigate, t);
  };

  return (
    <div className="h-full flex flex-col max-w-6xl w-full mx-auto px-4 sm:px-6 pt-4 sm:pt-6 overflow-hidden">
      {/* Greeting Header (Fixed at top of Menu page) */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 pb-4 mb-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            {t("menu.greeting", { name: userName })}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t("menu.welcomeSubtitle") || "Select a module to continue"}
          </p>
        </div>
      </div>

      {/* No Access State */}
      {totalVisibleItemsCount === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto shadow-sm">
            <p className="text-slate-600 font-medium mb-6">
              {t("menu.noAccess")}
            </p>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl px-5 py-2.5 min-h-[44px] text-sm font-semibold transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>{t("sidebar.logout")}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Sections & Card Grids (Only scrollable container) */
        <div className="flex-1 min-h-0 overflow-y-auto pt-2 pb-8 space-y-6 sm:space-y-8 pr-1 sm:pr-2">
          {visibleSections.map((section) => (
            <section key={section.id} className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-500 tracking-wide uppercase px-0.5">
                {t(section.titleKey)}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {section.items.map((item: MenuItem) => {
                  const Icon = item.icon;
                  const badgeCount = item.badge ? badges[item.badge] : undefined;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="group relative flex flex-col justify-between rounded-2xl bg-white border border-slate-200 p-4 min-h-[120px] hover:border-primary hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary outline-none transition"
                    >
                      {/* Top Row: Icon + Badge */}
                      <div className="flex items-start justify-between w-full">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        {typeof badgeCount === "number" && badgeCount > 0 && (
                          <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                            {badgeCount > 99 ? "99+" : badgeCount}
                          </span>
                        )}
                      </div>

                      {/* Content: Title & Description */}
                      <div className="mt-2 space-y-1">
                        <h4 className="font-semibold text-slate-800 text-sm sm:text-base leading-snug group-hover:text-primary transition-colors">
                          {t(item.labelKey)}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                          {t(item.descKey)}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}

        </div>
      )}
    </div>
  );
};

export default Menu;
