import axios from "../axios";
import { Supplier } from "../../types";

export interface SupplierQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  township?: string;
  isCredit?: boolean | string;
  isConsign?: boolean | string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isDeleted?: boolean;
}

export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface FetchSuppliersResponse {
  success: boolean;
  message: string;
  data: Supplier[];
  pagination?: PaginationMeta;
}

/**
 * Fetch supplier profiles via API with filter & query params
 */
export const fetchSuppliers = async (
  params?: boolean | SupplierQueryParams
): Promise<FetchSuppliersResponse> => {
  try {
    let queryParams: Record<string, any> = {};

    if (typeof params === "boolean") {
      if (params) queryParams.isDeleted = true;
    } else if (params && typeof params === "object") {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== "" && val !== undefined && val !== null) {
          queryParams[key] = val;
        }
      });
    }

    const response = await axios.get("/supplier-profile", {
      params: queryParams,
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching suppliers:", error);

    if (axios.isAxiosError(error)) {
      if (
        error.response &&
        error.response.headers["content-type"] &&
        error.response.headers["content-type"].includes("text/html")
      ) {
        throw new Error(
          `API endpoint not found. Please check if the API is running and the endpoint "${error.config?.url}" is correct.`
        );
      }

      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          `HTTP error! status: ${error.response.status}`;
        throw new Error(errorMessage);
      }

      if (error.request) {
        throw new Error(
          "Network error: Unable to reach the API. Please check if the API server is running."
        );
      }
    }

    throw error;
  }
};
