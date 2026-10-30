import type { LucideIcon } from "lucide-react";
import {
  ShoppingBag,
  PackageCheck,
  Users,
  Package,
  Truck,
  Store,
  ClipboardList,
  PieChart,
  LayoutDashboard,
  MessageSquare,
  Shield,
  Settings,
  ShoppingCart,
  Receipt,
  CreditCard,
  PackageSearch,
} from "lucide-react";
import { FEATURES, type FeatureKey } from "./features";

export interface MenuItem {
  path: string;
  labelKey: string; // e.g. "sidebar.ecommerceOrders"
  descKey: string; // e.g. "menu.desc.ecommerceOrders"
  icon: LucideIcon;
  roles?: string[]; // Allowed roles (e.g. ["admin", "owner"]). If undefined/empty, all roles allowed
  feature?: FeatureKey; // Feature flag. If false, item hidden
}

export interface MenuSection {
  id: string;
  titleKey: string;
  items: MenuItem[];
}

export type WorkQueueKey =
  | "ecommercePending"
  | "fulfillmentPending"
  | "poPending"
  | "outOfStock";

export interface WorkQueueItemConfig {
  key: WorkQueueKey;
  path: string;
  labelKey: string;
  activeTextKey: string;
  zeroTextKey: string;
  actionKey: string;
  roles?: string[];
}

export const WORK_QUEUE: WorkQueueItemConfig[] = [
  {
    key: "ecommercePending",
    path: "/admin/ecommerce-orders",
    labelKey: "menu.workQueue.ecommercePendingLabel",
    activeTextKey: "menu.workQueue.ecommercePendingActive",
    zeroTextKey: "menu.workQueue.ecommercePendingZero",
    actionKey: "menu.workQueue.ecommercePendingAction",
    roles: ["admin", "owner"],
  },
  {
    key: "fulfillmentPending",
    path: "/order-fulfillment",
    labelKey: "menu.workQueue.fulfillmentPendingLabel",
    activeTextKey: "menu.workQueue.fulfillmentPendingActive",
    zeroTextKey: "menu.workQueue.fulfillmentPendingZero",
    actionKey: "menu.workQueue.fulfillmentPendingAction",
  },
  {
    key: "poPending",
    path: "/purchasing",
    labelKey: "menu.workQueue.poAwaitingLabel",
    activeTextKey: "menu.workQueue.poAwaitingActive",
    zeroTextKey: "menu.workQueue.poAwaitingZero",
    actionKey: "menu.workQueue.poAwaitingAction",
    roles: ["admin", "owner"],
  },
  {
    key: "outOfStock",
    path: "/storefront",
    labelKey: "menu.workQueue.outOfStockLabel",
    activeTextKey: "menu.workQueue.outOfStockActive",
    zeroTextKey: "menu.workQueue.outOfStockZero",
    actionKey: "menu.workQueue.outOfStockAction",
  },
];

export const canSeeWorkQueueItem = (
  item: WorkQueueItemConfig,
  role: string
): boolean => {
  if (item.roles && item.roles.length > 0 && !item.roles.includes(role)) {
    return false;
  }
  return true;
};

export const MENU_SECTIONS: MenuSection[] = [
  {
    id: "onlineSales",
    titleKey: "menu.sectionOnline",
    items: [
      {
        path: "/admin/ecommerce-orders",
        labelKey: "sidebar.ecommerceOrders",
        descKey: "menu.desc.ecommerceOrders",
        icon: ShoppingBag,
        roles: ["admin", "owner"],
      },
      {
        path: "/order-fulfillment",
        labelKey: "sidebar.orderFulfillment",
        descKey: "menu.desc.orderFulfillment",
        icon: PackageCheck,
      },
      {
        path: "/customers",
        labelKey: "sidebar.customers",
        descKey: "menu.desc.customers",
        icon: Users,
        roles: ["admin", "owner"],
      },
      {
        path: "/admin/ecommerce-reports",
        labelKey: "sidebar.ecommerceReports",
        descKey: "menu.desc.ecommerceReports",
        icon: PieChart,
        roles: ["admin", "owner"],
      },
      {
        path: "/admin/ecommerce-product-orders",
        labelKey: "sidebar.ecommerceProductOrders",
        descKey: "menu.desc.ecommerceProductOrders",
        icon: PackageSearch,
        roles: ["admin", "owner"],
      },
    ],
  },
  {
    id: "stock",
    titleKey: "menu.sectionStock",
    items: [
      {
        path: "/inventory",
        labelKey: "sidebar.inventory",
        descKey: "menu.desc.inventory",
        icon: Package,
        roles: ["admin", "owner"],
      },
      {
        path: "/warehouse",
        labelKey: "sidebar.warehouse",
        descKey: "menu.desc.warehouse",
        icon: Truck,
        roles: ["admin", "owner"],
      },
      {
        path: "/storefront",
        labelKey: "sidebar.storefront",
        descKey: "menu.desc.storefront",
        icon: Store,
      },
    ],
  },
  {
    id: "purchasing",
    titleKey: "menu.sectionPurchasing",
    items: [
      {
        path: "/purchasing",
        labelKey: "sidebar.purchasing",
        descKey: "menu.desc.purchasing",
        icon: ShoppingBag,
        roles: ["admin", "owner"],
      },
      {
        path: "/suppliers",
        labelKey: "sidebar.suppliers",
        descKey: "menu.desc.suppliers",
        icon: Users,
        roles: ["admin", "owner"],
      },
      {
        path: "/purchase-report",
        labelKey: "sidebar.purchaseReport",
        descKey: "menu.desc.purchaseReport",
        icon: ClipboardList,
        roles: ["admin", "owner"],
      },
    ],
  },
  {
    id: "finance",
    titleKey: "menu.sectionFinance",
    items: [
      {
        path: "/expenses",
        labelKey: "sidebar.expenses",
        descKey: "menu.desc.expenses",
        icon: PieChart,
      },
      {
        path: "/reports",
        labelKey: "sidebar.reports",
        descKey: "menu.desc.reports",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "system",
    titleKey: "menu.sectionSystem",
    items: [
      {
        path: "/ai-chat",
        labelKey: "sidebar.aiAssistant",
        descKey: "menu.desc.aiAssistant",
        icon: MessageSquare,
        feature: "aiAssistant",
      },
      {
        path: "/accounts",
        labelKey: "sidebar.accountManagement",
        descKey: "menu.desc.accountManagement",
        icon: Shield,
        roles: ["owner"],
      },
      {
        path: "/settings",
        labelKey: "sidebar.settings",
        descKey: "menu.desc.settings",
        icon: Settings,
      },
    ],
  },
  {
    id: "sales",
    titleKey: "menu.sectionSales",
    items: [
      {
        path: "/pos",
        labelKey: "sidebar.checkout",
        descKey: "menu.desc.checkout",
        icon: ShoppingCart,
        feature: "posSales",
      },
      {
        path: "/quick-sale",
        labelKey: "sidebar.quickSale",
        descKey: "menu.desc.quickSale",
        icon: ShoppingBag,
        feature: "posSales",
      },
      {
        path: "/orders",
        labelKey: "sidebar.orders",
        descKey: "menu.desc.orders",
        icon: Receipt,
        feature: "posSales",
      },
      {
        path: "/credit-orders",
        labelKey: "sidebar.creditOrder",
        descKey: "menu.desc.creditOrder",
        icon: CreditCard,
        roles: ["admin", "owner"],
        feature: "posSales",
      },
      {
        path: "/credits",
        labelKey: "sidebar.creditSales",
        descKey: "menu.desc.creditSales",
        icon: CreditCard,
        roles: ["admin", "owner"],
        feature: "posSales",
      },
    ],
  },
];

export const canSeeItem = (
  item: MenuItem,
  role: string,
  features: Record<FeatureKey, boolean> = FEATURES
): boolean => {
  if (item.feature && !features[item.feature]) {
    return false;
  }
  if (item.roles && item.roles.length > 0 && !item.roles.includes(role)) {
    return false;
  }
  return true;
};

// Flattened list of all menu items across all sections
export const ALL_MENU_ITEMS: MenuItem[] = MENU_SECTIONS.flatMap(
  (section) => section.items
);

// Lookup menu item by path for breadcrumbs / header titles
export const getMenuItemByPath = (pathname: string): MenuItem | undefined => {
  // First attempt exact match
  const exact = ALL_MENU_ITEMS.find((item) => item.path === pathname);
  if (exact) return exact;

  // Next attempt prefix match (longest path first)
  const prefixMatches = ALL_MENU_ITEMS.filter(
    (item) => item.path !== "/" && pathname.startsWith(item.path + "/")
  ).sort((a, b) => b.path.length - a.path.length);

  return prefixMatches[0];
};
