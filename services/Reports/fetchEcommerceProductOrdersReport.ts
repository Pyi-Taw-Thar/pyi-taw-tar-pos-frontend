import axios from "../axios";

export interface EcommerceProductOrderItem {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerTownship?: string;
  createdAt: string;
  status: string;
  paymentMethod: string;
  quantity: number;
  originalQuantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
  orderTotalAmount: number;
}

export interface EcommerceProductSalesItem {
  _id: string;
  productName: string;
  productCode: string;
  unit: string;
  totalQuantity: number;
  totalRevenue: number;
  orderCount: number;
  pendingQuantity: number;
  confirmedQuantity: number;
  shippedQuantity: number;
  deliveredQuantity: number;
  averageUnitPrice: number;
  image?: string;
  category?: string;
}

export interface EcommerceProductReportTotals {
  uniqueProductsCount: number;
  totalQuantity: number;
  totalRevenue: number;
}

export interface EcommerceProductOrdersReportResponse {
  success: boolean;
  data: {
    totals?: EcommerceProductReportTotals;
    products?: EcommerceProductSalesItem[];
    inventoryId?: string;
    orders?: EcommerceProductOrderItem[];
  };
}

export interface FetchEcommerceProductOrdersReportParams {
  startDate?: string | null;
  endDate?: string | null;
  status?: string;
  search?: string;
  inventoryId?: string;
}

/**
 * Ecommerce ပစ္စည်းအလိုက် မှာယူထားသော အရေအတွက် အစီရင်ခံစာ ဆွဲယူသည့် API Service
 */
export const fetchEcommerceProductOrdersReport = async (
  params: FetchEcommerceProductOrdersReportParams = {}
): Promise<EcommerceProductOrdersReportResponse> => {
  const queryParams = new URLSearchParams();

  if (params.startDate) queryParams.append("startDate", params.startDate);
  if (params.endDate) queryParams.append("endDate", params.endDate);
  if (params.status && params.status !== "all") queryParams.append("status", params.status);
  if (params.search && params.search.trim()) queryParams.append("search", params.search.trim());
  if (params.inventoryId) queryParams.append("inventoryId", params.inventoryId);

  const queryString = queryParams.toString();
  const url = `/ecommerce/admin/product-orders-report${queryString ? `?${queryString}` : ""}`;

  const response = await axios.get<EcommerceProductOrdersReportResponse>(url);
  return response.data;
};
