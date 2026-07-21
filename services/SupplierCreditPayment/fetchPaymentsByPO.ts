import axios from "../axios";
import { CreditPaymentRecord } from "./createCreditPayment";

export interface FetchPaymentsByPOResponse {
  success: boolean;
  message?: string;
  data: {
    purchase: {
      _id: string;
      poNumber: string;
      totalAmount: number;
      paidAmount: number;
      remainingBalance: number;
    };
    payments: {
      count: number;
      records: CreditPaymentRecord[];
    };
  };
}

/**
 * Fetch credit payments for a specific Purchase Order
 */
export const fetchPaymentsByPO = async (
  purchaseId: string
): Promise<FetchPaymentsByPOResponse> => {
  try {
    const response = await axios.get(`/purchase/${purchaseId}/credit-payments`);
    return response.data;
  } catch (error) {
    console.error("Error fetching payments by PO:", error);
    throw error;
  }
};
