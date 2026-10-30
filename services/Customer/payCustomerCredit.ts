import axios from "../axios";

export interface PayCustomerCreditPayload {
  paidAmount: number;
  paymentMethod?: string;
  notes?: string;
}

export interface PayCustomerCreditResponse {
  success: boolean;
  message: string;
  data: {
    paidAmount: number;
    previousOutstanding: number;
    remainingOutstanding: number;
    allocatedOrdersCount: number;
    records: any[];
  };
}

/**
 * Customer ၏ အကြွေးကို စုဆပ်ရန် (FIFO စနစ်ဖြင့် မကြေသေးသော order များကို ရှင်းပေးခြင်း)
 */
export const payCustomerCredit = async (
  customerId: string,
  payload: PayCustomerCreditPayload
): Promise<PayCustomerCreditResponse> => {
  const response = await axios.post<PayCustomerCreditResponse>(
    `/customer/${customerId}/pay-credit`,
    payload
  );
  return response.data;
};
