import axios from "../axios";

export interface EcommerceReportSummary {
  totalRevenue?: number;
  totalOrders?: number;
  deliveredOrders?: number;
  deliveredCount?: number;
  cancelledOrders?: number;
  cancelledCount?: number;
  pendingOrders?: number;
  pendingCount?: number;
  confirmedOrders?: number;
  confirmedCount?: number;
  shippedOrders?: number;
  shippedCount?: number;
  validOrdersCount?: number;
  avgOrderValue?: number;
}

export interface DailySalesItem {
  date: string;
  totalSales?: number;
  revenue?: number;
  orderCount?: number;
  orders?: number;
}

export interface TopProductItem {
  _id: string;
  productName: string;
  productCode: string;
  unit: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
  image?: string;
}

export interface PaymentMethodItem {
  method: string;
  count: number;
  totalAmount: number;
}

export interface RecentOrderItem {
  _id: string;
  orderNumber: string;
  customerId?: {
    _id: string;
    name: string;
    phone: string;
  };
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

export interface EcommerceReportData {
  summary: EcommerceReportSummary;
  dailySales: DailySalesItem[];
  topProducts: TopProductItem[];
  paymentMethods: PaymentMethodItem[];
  recentOrders: RecentOrderItem[];
}

export interface EcommerceReportResponse {
  success: boolean;
  data: EcommerceReportData;
}

export interface FetchEcommerceReportParams {
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
}

/**
 * Ecommerce အွန်လိုင်းအရောင်းဆိုင် report များ ရယူရန် API Service
 */
export const fetchEcommerceReport = async (
  params: FetchEcommerceReportParams = {}
): Promise<EcommerceReportResponse> => {
  const queryParams = new URLSearchParams();

  if (params.startDate) {
    queryParams.append("startDate", params.startDate);
  }
  if (params.endDate) {
    queryParams.append("endDate", params.endDate);
  }
  if (params.status && params.status !== "all") {
    queryParams.append("status", params.status);
  }

  const queryString = queryParams.toString();
  const url = `/ecommerce/admin/reports${queryString ? `?${queryString}` : ""}`;

  const response = await axios.get<EcommerceReportResponse>(url);
  return response.data;
};
