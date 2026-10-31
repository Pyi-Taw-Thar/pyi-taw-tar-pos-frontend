import axios from "../axios";
import type { CustomerOrderSource } from "./fetchCustomerOrders";

export interface CustomerProductRow {
  inventoryId: string;
  productName: string;
  productCode: string;
  baseUnit: string;
  totalBaseQty: number;
  displayQty: string;
  totalAmount: number;
  orderCount: number;
  lastPurchaseDate: string | null;
  image?: string | null;
}

export interface CustomerMonthlyPurchase {
  month: string;
  amount: number;
}

export interface CustomerProductsTotals {
  uniqueProducts: number;
  totalAmount: number;
  topProduct: {
    inventoryId: string;
    productName: string;
    totalAmount: number;
    displayQty: string;
  } | null;
}

export interface CustomerProductsData {
  products: CustomerProductRow[];
  monthly: CustomerMonthlyPurchase[];
  totals: CustomerProductsTotals;
}

export interface FetchCustomerProductsParams {
  source?: CustomerOrderSource;
  from?: string;
  to?: string;
}

export interface FetchCustomerProductsResponse {
  success: boolean;
  message?: string;
  data: CustomerProductsData;
}

// Customer ဝယ်ထားသော ပစ္စည်းများနှင့် လအလိုက် ဝယ်ယူငွေ စာရင်းအင်း ရယူခြင်း
export const fetchCustomerProducts = async (
  customerId: string,
  params: FetchCustomerProductsParams = {}
): Promise<FetchCustomerProductsResponse> => {
  const queryParams: Record<string, string> = {};
  if (params.source) queryParams.source = params.source;
  if (params.from) queryParams.from = params.from;
  if (params.to) queryParams.to = params.to;

  const response = await axios.get<FetchCustomerProductsResponse>(
    `/customer/${customerId}/products`,
    { params: queryParams }
  );
  return response.data;
};
