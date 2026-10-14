import axios from "../axios";
import { Order, OrderPagination } from "../Order/fetchOrders";

export interface FetchPendingFulfillmentOrdersParams {
  search?: string;
  storefrontId?: string;
  page?: number;
  limit?: number;
}

export interface FetchPendingFulfillmentOrdersResponse {
  success: boolean;
  data: Order[];
  pagination: OrderPagination;
  message?: string;
}

export const fetchPendingFulfillmentOrders = async (
  params?: FetchPendingFulfillmentOrdersParams
): Promise<FetchPendingFulfillmentOrdersResponse> => {
  const query = new URLSearchParams();
  if (params?.search) query.append("search", params.search);
  if (params?.storefrontId && params.storefrontId !== "all") {
    query.append("storefrontId", params.storefrontId);
  }
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  const response = await axios.get<FetchPendingFulfillmentOrdersResponse>(
    `/fulfillment/pending?${query.toString()}`
  );
  return response.data;
};
