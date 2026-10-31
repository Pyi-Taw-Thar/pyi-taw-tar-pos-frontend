import axios from "../axios";

export interface CustomerSummaryProfile {
  _id: string;
  name: string;
  phone?: string;
  address?: string;
  township?: string;
  tier?: string;
  isActive?: boolean;
  isCreditPerson?: boolean;
  blacklist?: boolean;
  blacklistReason?: string | null;
  blacklistDate?: string | null;
  createdAt?: string;
}

export interface CustomerCreditPaymentItem {
  _id: string;
  orderId?: {
    _id: string;
    orderNumber: string;
  } | null;
  ecommerceOrderId?: {
    _id: string;
    orderNumber: string;
  } | null;
  creditPersonId: string;
  paidAmount: number;
  paymentDate: string;
  paymentMethod: string;
  notes?: string | null;
  addedBy?: {
    _id: string;
    name: string;
  } | null;
  createdAt?: string;
}

export interface CustomerSummaryData {
  customer: CustomerSummaryProfile;
  totalPurchase: number;
  creditRemaining: number;
  payableRemaining: number;
  creditPaid: number;
  ecommerceRemaining: number;
  posRemaining: number;
  orderCount: {
    ecommerce: number;
    pos: number;
    total: number;
  };
  lastOrderDate: string | null;
  creditPayments: CustomerCreditPaymentItem[];
}

export interface FetchCustomerSummaryResponse {
  success: boolean;
  message?: string;
  data?: CustomerSummaryData;
}

// Customer တစ်ဦး၏ အကျဉ်းချုပ်၊ အကြွေးလက်ကျန်နှင့် အကြွေးဆပ်မှတ်တမ်း ရယူခြင်း
export const fetchCustomerSummary = async (
  customerId: string
): Promise<FetchCustomerSummaryResponse> => {
  const response = await axios.get<FetchCustomerSummaryResponse>(
    `/customer/${customerId}/summary`
  );
  return response.data;
};
