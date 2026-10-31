import axios from "../axios";

export type CustomerOrderSource = "all" | "ecommerce" | "pos";

export interface CustomerOrderRow {
  _id: string;
  source: "ecommerce" | "pos";
  orderNumber: string;
  date: string;
  status: string;
  itemCount: number;
  totalAmount: number;
  paidAmount: number;
  remaining: number;
  paymentType: string;
  paymentStatus: "unpaid" | "partial" | "paid" | string;
}

export interface CustomerOrdersPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface FetchCustomerOrdersParams {
  source?: CustomerOrderSource;
  status?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

export interface FetchCustomerOrdersResponse {
  success: boolean;
  message?: string;
  data: CustomerOrderRow[];
  pagination: CustomerOrdersPagination;
}

// Customer ၏ E-commerce နှင့် POS အော်ဒါများကို ပေါင်းစပ်ရယူခြင်း
export const fetchCustomerOrders = async (
  customerId: string,
  params: FetchCustomerOrdersParams = {}
): Promise<FetchCustomerOrdersResponse> => {
  const queryParams: Record<string, string | number> = {};
  if (params.source) queryParams.source = params.source;
  if (params.status && params.status !== "all") queryParams.status = params.status;
  if (params.from) queryParams.from = params.from;
  if (params.to) queryParams.to = params.to;
  if (params.page) queryParams.page = params.page;
  if (params.limit) queryParams.limit = params.limit;

  const response = await axios.get<FetchCustomerOrdersResponse>(
    `/customer/${customerId}/orders`,
    { params: queryParams }
  );
  return response.data;
};
