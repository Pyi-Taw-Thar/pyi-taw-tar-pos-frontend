import axios from "../axios";
import { Order } from "../Order/fetchOrders";

export interface ScannedBatchPayload {
  batchStockId?: string;
  batchBarcode?: string;
  batchNumber?: string;
  expiryDate?: Date | string | null;
  quantity: number;
}

export interface FulfilledProductPayload {
  orderProductId?: string;
  inventoryId: string;
  batches: ScannedBatchPayload[];
}

export interface FulfillOrderPayload {
  fulfilledProducts: FulfilledProductPayload[];
  items?: FulfilledProductPayload[];
  autoAdjust?: boolean;
}

export interface FulfillOrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

export const fulfillOrder = async (
  orderId: string,
  payload: FulfillOrderPayload
): Promise<FulfillOrderResponse> => {
  const response = await axios.post<FulfillOrderResponse>(
    `/fulfillment/${orderId}`,
    payload
  );
  return response.data;
};

export const savePartialFulfillmentOrder = async (
  orderId: string,
  payload: FulfillOrderPayload
): Promise<FulfillOrderResponse> => {
  const response = await axios.post<FulfillOrderResponse>(
    `/fulfillment/${orderId}/partial`,
    payload
  );
  return response.data;
};
