import axios from "../axios";

interface FetchStorefrontBrandsResponse {
  success: boolean;
  message: string;
  data: string[];
}

export const fetchStorefrontBrands = async (
  storefrontId: string,
): Promise<FetchStorefrontBrandsResponse> => {
  try {
    const response = await axios.get(
      `/storefront-inventory/storefront/${storefrontId}/brands`,
    );
    return response.data;
  } catch (error: any) {
    console.error("Error fetching storefront brands:", error);
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch storefront brands",
      data: [],
    };
  }
};
