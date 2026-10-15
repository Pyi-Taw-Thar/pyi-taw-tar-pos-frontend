import axios from "../axios";
import type { EcommerceOrder } from "./fetchEcommerceOrders";

export interface SendOrderToFulfillmentResponse {
  success: boolean;
  message: string;
  data?: {
    ecommerceOrder: EcommerceOrder;
    fulfillmentOrder: any;
  };
}

export const sendOrderToFulfillment = async (
  orderId: string,
): Promise<SendOrderToFulfillmentResponse> => {
  try {
    const response = await axios.post(
      `ecommerce/admin/orders/${orderId}/send-to-fulfillment`,
    );
    return response.data;
  } catch (error: any) {
    console.error("Error sending ecommerce order to fulfillment:", error);
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "Failed to send order to warehouse fulfillment",
    };
  }
};
