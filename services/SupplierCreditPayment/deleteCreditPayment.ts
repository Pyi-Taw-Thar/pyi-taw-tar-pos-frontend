import axios from "../axios";
import { CreditPaymentRecord } from "./createCreditPayment";

export interface DeleteCreditPaymentResponse {
  success: boolean;
  message: string;
  data: {
    deletedPayment: CreditPaymentRecord;
    purchase: {
      poNumber: string;
      previousPaidAmount: number;
      deletedAmount: number;
      newPaidAmount: number;
      newRemainingBalance: number;
    };
  };
}

/**
 * Delete a supplier credit payment record
 */
export const deleteCreditPayment = async (
  paymentId: string
): Promise<DeleteCreditPaymentResponse> => {
  try {
    const response = await axios.delete(`/supplier-credit-payment/${paymentId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error deleting credit payment:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || "Failed to delete payment");
    }
    throw error;
  }
};
