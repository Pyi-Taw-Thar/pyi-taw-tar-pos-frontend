import axios from "../axios";
import { CreditPaymentRecord } from "./createCreditPayment";
import { PaginationMeta } from "../Supplier/fetchSuppliers";

export interface SupplierCreditSummary {
  totalPOs: number;
  totalPOAmount: number;
  totalPaid: number;
  totalOutstanding: number;
}

export interface FetchPaymentsBySupplierResponse {
  success: boolean;
  message?: string;
  data: {
    supplierId: string;
    summary: SupplierCreditSummary;
    payments: {
      count: number;
      records: CreditPaymentRecord[];
    };
  };
  pagination?: PaginationMeta;
}

/**
 * Fetch credit payments and credit summary for a specific Supplier
 */
export const fetchPaymentsBySupplier = async (
  supplierId: string,
  page: number = 1,
  limit: number = 10
): Promise<FetchPaymentsBySupplierResponse> => {
  try {
    const response = await axios.get(
      `/supplier-profile/${supplierId}/credit-payments`,
      { params: { page, limit } }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching payments by supplier:", error);
    throw error;
  }
};
