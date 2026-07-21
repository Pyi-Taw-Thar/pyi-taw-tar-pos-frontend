import axios from "../axios";
import { Supplier } from "../../types";

interface FetchSupplierByIdResponse {
  success: boolean;
  message?: string;
  data: Supplier;
}

/**
 * Fetch supplier profile by ID
 */
export const fetchSupplierById = async (
  supplierId: string
): Promise<FetchSupplierByIdResponse> => {
  try {
    const response = await axios.get(`/supplier-profile/${supplierId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching supplier by ID:", error);
    throw error;
  }
};
