import axios from "../axios";

export interface CreateCreditPaymentPayload {
  purchaseId: string;
  paidAmount: number;
  paymentDate?: string;
  paymentMethod?: "cash" | "bank_transfer" | "cheque" | "mobile_payment" | "other" | string;
  notes?: string;
}

export interface CreditPaymentRecord {
  _id: string;
  purchaseId: any;
  supplierId: any;
  paidAmount: number;
  paymentDate: string;
  paymentMethod: string;
  notes?: string;
  addedBy?: { name: string; role: string };
  createdAt?: string;
}

export interface CreateCreditPaymentResponse {
  success: boolean;
  message: string;
  data: {
    payment: CreditPaymentRecord;
    purchase: {
      poNumber: string;
      totalAmount: number;
      previousPaidAmount: number;
      paymentAmount: number;
      newPaidAmount: number;
      newRemainingBalance: number;
    };
  };
}

/**
 * Record a new supplier credit payment
 */
export const createCreditPayment = async (
  payload: CreateCreditPaymentPayload
): Promise<CreateCreditPaymentResponse> => {
  try {
    const response = await axios.post("/supplier-credit-payment", payload);
    return response.data;
  } catch (error: any) {
    console.error("Error creating supplier credit payment:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data?.message || "Failed to record payment");
    }
    throw error;
  }
};
