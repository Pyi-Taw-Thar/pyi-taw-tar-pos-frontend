import axios from "../axios";

interface FetchSubCategoriesResponse {
  success: boolean;
  message: string;
  data: string[];
}

/**
 * Fetch all unique inventory sub categories
 * @returns {Promise<FetchSubCategoriesResponse>} Response from API
 */
export const fetchSubCategories = async (): Promise<FetchSubCategoriesResponse> => {
  try {
    const response = await axios.get("/inventory/subcategories");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching sub categories:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch sub categories",
      data: [],
    };
  }
};
