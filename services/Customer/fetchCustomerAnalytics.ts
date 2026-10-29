import axios from "../axios";
import { Customer } from "./fetchCustomers";

export interface CustomerMetrics {
  totalOrders?: number;
  totalSpent?: number;
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

export interface CustomerOrderProduct {
  inventoryId?: {
    _id: string;
    productName: string;
    productCode: string;
    images?: { url: string }[];
  } | string;
  productName: string;
  productCode: string;
  unit: string;
  quantity: number;
  originalQuantity?: number;
  originalUnit?: string;
  salePrice: number;
  subtotal: number;
}

export interface CustomerOrderItem {
  _id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  products: CustomerOrderProduct[];
  note?: string;
  isEdited?: boolean;
}

export interface CustomerTopProduct {
  _id: string;
  productName: string;
  productCode: string;
  unit: string;
  totalQuantity: number;
  totalSpent: number;
  orderCount: number;
  lastPurchasedAt: string;
  image?: string;
}

export interface CustomerAnalyticsData {
  customer: Customer;
  metrics: CustomerMetrics;
  orders: CustomerOrderItem[];
  topProducts: CustomerTopProduct[];
}

export interface CustomerAnalyticsResponse {
  success: boolean;
  data: CustomerAnalyticsData;
}

/**
 * ဝယ်ယူသူ (Customer) ၏ အသေးစိတ် အချက်အလက်နှင့် ဝယ်ယူမှု Analytics ရယူရန် API Service
 */
export const fetchCustomerAnalytics = async (
  customerId: string
): Promise<CustomerAnalyticsResponse> => {
  const response = await axios.get<CustomerAnalyticsResponse>(
    `/customer/${customerId}/analytics`
  );
  return response.data;
};
