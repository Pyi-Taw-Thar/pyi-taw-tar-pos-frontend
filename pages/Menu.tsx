import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import axios from "../services/axios";
import { useLanguage } from "../context/LanguageContext";
import { useApp } from "../context/AppContext";
import {
  MENU_SECTIONS,
  WORK_QUEUE,
  canSeeItem,
  canSeeWorkQueueItem,
  WorkQueueKey,
} from "../config/menuConfig";
import { FEATURES } from "../config/features";
import { fetchEcommerceOrders } from "../services/Ecommerce/fetchEcommerceOrders";
import { fetchPendingFulfillmentOrders } from "../services/Fulfillment/fetchPendingFulfillmentOrders";
import { fetchPurchases } from "../services/Purchase/fetchPurchases";
import { performLogout } from "../utils/logout";
import { WorkQueue, WorkQueueTileState } from "../components/Menu/WorkQueue";
import { MenuPanel } from "../components/Menu/MenuPanel";

const MYANMAR_DIGITS = ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"];
const MYANMAR_WEEKDAYS = [
  "တနင်္ဂနွေ",
  "တနင်္လာ",
  "အင်္ဂါ",
  "ဗုဒ္ဓဟူး",
  "ကြာသပတေး",
  "သောကြာ",
  "စနေ",
];
const MYANMAR_MONTHS = [
  "ဇန်နဝါရီ",
  "ဖေဖော်ဝါရီ",
  "မတ်",
  "ဧပြီ",
  "မေ",
  "ဇွန်",
  "ဇူလိုင်",
  "ဩဂုတ်",
  "စက်တင်ဘာ",
  "အောက်တိုဘာ",
  "နိုဝင်ဘာ",
  "ဒီဇင်ဘာ",
];

const toMyanmarNumber = (num: number): string =>
  String(num)
    .split("")
    .map((ch) => MYANMAR_DIGITS[Number(ch)] ?? ch)
    .join("");

const formatTodayDate = (lang: "my" | "en"): string => {
  const now = new Date();
  if (lang === "my") {
    const weekday = MYANMAR_WEEKDAYS[now.getDay()];
    const day = toMyanmarNumber(now.getDate());
    const month = MYANMAR_MONTHS[now.getMonth()];
    const year = toMyanmarNumber(now.getFullYear());
    return `${weekday}၊ ${day} ${month} ${year}`;
  }
  return now.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const Menu: React.FC = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const { currentUser } = useApp();

  const [workQueueStates, setWorkQueueStates] = useState<
    Record<WorkQueueKey, WorkQueueTileState>
  >({
    ecommercePending: { status: "loading" },
    fulfillmentPending: { status: "loading" },
    poPending: { status: "loading" },
    outOfStock: { status: "loading" },
  });

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

  // Role ခွင့်ရှိသော section နှင့် item များကိုသာ စစ်ထုတ်ခြင်း
  const visibleSections = useMemo(() => {
    return MENU_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter((item) =>
        canSeeItem(item, userRole, FEATURES)
      ),
    })).filter((section) => section.items.length > 0);
  }, [userRole]);

  // Role ခွင့်ရှိသော work queue tile များကိုသာ စစ်ထုတ်ခြင်း
  const visibleWorkQueue = useMemo(() => {
    return WORK_QUEUE.filter((item) => canSeeWorkQueueItem(item, userRole));
  }, [userRole]);

  const totalVisibleItemsCount = useMemo(() => {
    return visibleSections.reduce((acc, sec) => acc + sec.items.length, 0);
  }, [visibleSections]);

  const formattedDate = useMemo(() => formatTodayDate(language), [language]);

  // Mount တစ်ကြိမ်သာ ခွင့်ပြုထားသော work queue tile များအတွက် API ခေါ်ခြင်း
  useEffect(() => {
    if (totalVisibleItemsCount === 0) return;

    let cancelled = false;
    const allowedKeys = new Set(visibleWorkQueue.map((item) => item.key));

    const tasks: Array<{
      key: WorkQueueKey;
      promise: Promise<number>;
    }> = [];

    if (allowedKeys.has("ecommercePending")) {
      tasks.push({
        key: "ecommercePending",
        promise: fetchEcommerceOrders({
          status: "pending",
          page: 1,
          limit: 1,
        }).then((res) => {
          if (!res?.success) {
            throw new Error(res?.message || "Failed to fetch ecommerce orders");
          }
          return (
            res.pagination?.totalItems ??
            (Array.isArray(res.data) ? res.data.length : 0)
          );
        }),
      });
    }

    if (allowedKeys.has("fulfillmentPending")) {
      tasks.push({
        key: "fulfillmentPending",
        promise: fetchPendingFulfillmentOrders({ page: 1, limit: 1 }).then(
          (res) => {
            if (!res?.success) {
              throw new Error(
                res?.message || "Failed to fetch fulfillment orders"
              );
            }
            return (
              res.pagination?.totalItems ??
              (Array.isArray(res.data) ? res.data.length : 0)
            );
          }
        ),
      });
    }

    if (allowedKeys.has("poPending")) {
      tasks.push({
        key: "poPending",
        promise: fetchPurchases({
          status: "pending",
          isDeleted: false,
          page: 1,
          limit: 1,
        }).then((res) => {
          if (!res?.success) {
            throw new Error(res?.message || "Failed to fetch purchases");
          }
          return (
            res.pagination?.totalItems ??
            (Array.isArray(res.data) ? res.data.length : 0)
          );
        }),
      });
    }

    if (allowedKeys.has("outOfStock")) {
      tasks.push({
        key: "outOfStock",
        promise: axios.get("ecommerce/products").then((res) => {
          const rows = res?.data?.data;
          if (!Array.isArray(rows)) {
            throw new Error("Invalid ecommerce products response");
          }
          return rows.filter((i: any) => (i?.quantity ?? 0) <= 0).length;
        }),
      });
    }

    Promise.allSettled(tasks.map((t) => t.promise)).then((results) => {
      if (cancelled) return;
      setWorkQueueStates((prev) => {
        const next = { ...prev };
        results.forEach((result, idx) => {
          const key = tasks[idx].key;
          if (result.status === "fulfilled") {
            next[key] = { status: "ready", count: result.value };
          } else {
            next[key] = { status: "error" };
          }
        });
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [visibleWorkQueue, totalVisibleItemsCount]);

  const handleLogout = () => {
    performLogout(navigate, t);
  };

  // ခွင့်ပြုထားသော မီနူး လုံးဝမရှိသည့် အခြေအနေ
  if (totalVisibleItemsCount === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center max-w-md mx-auto shadow-sm">
          <p className="text-slate-600 font-medium mb-6 leading-[1.6]">
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
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* ဇုန် ၁ — ယနေ့ လုပ်စရာ (Work Queue) */}
      {visibleWorkQueue.length > 0 && (
        <section className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[17px] font-semibold text-[#1E2937] leading-[1.6]">
              {t("menu.workQueue.title")}
            </h2>
            <span className="text-[13px] text-slate-500 leading-[1.6]">
              {formattedDate}
            </span>
          </div>
          <WorkQueue items={visibleWorkQueue} states={workQueueStates} />
        </section>
      )}

      {/* ဇုန် ၂ — လမ်းညွှန် Panel များ (Directory) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
        {visibleSections.map((section) => (
          <MenuPanel key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
};

export default Menu;
