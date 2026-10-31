import axios from "../axios";
import type { EcommerceOrder } from "./fetchEcommerceOrders";

export interface EcommerceUpdatePriceItem {
  // ဈေးနှုန်းပြင်ဆင်မည့် order line _id နှင့် ပစ္စည်း ID
  lineId: string;
  inventoryId: string;
  unitPrice: number;
}

export interface UpdateEcommerceOrderPricesPayload {
  action: "price";
  reason?: string;
  products: EcommerceUpdatePriceItem[];
}

interface UpdateEcommerceOrderPricesResponse {
  success: boolean;
  message: string;
  data?: EcommerceOrder;
}

// အော်ဒါကို ဂိုဒေါင်မလွှဲမီ line ဈေးနှုန်းများ ပြင်ဆင်ရန် API ခေါ်ဆိုခြင်း
export const updateEcommerceOrderPrices = async (
  orderId: string,
  payload: UpdateEcommerceOrderPricesPayload,
): Promise<UpdateEcommerceOrderPricesResponse> => {
  try {
    const response = await axios.patch(
      `ecommerce/admin/orders/${orderId}/products`,
      payload,
    );
    return response.data;
  } catch (error: any) {
    console.error("Error updating ecommerce order prices:", error);
    return {
      success: false,
      message:
        error?.response?.data?.message ||
        "ဈေးနှုန်း ပြင်ဆင်ရာတွင် မအောင်မြင်ပါ",
    };
  }
};
