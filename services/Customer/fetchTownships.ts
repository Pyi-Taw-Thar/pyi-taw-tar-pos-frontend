import axios from "../axios";

interface FetchTownshipsResponse {
  success: boolean;
  message: string;
  data: string[];
}

/**
 * Fetch all unique townships among customers
 * @returns {Promise<FetchTownshipsResponse>}
 */
export const fetchTownships = async (): Promise<FetchTownshipsResponse> => {
  try {
    const response = await axios.get("/customer/townships");
    return response.data;
  } catch (error: any) {
    console.error("Error fetching townships:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch townships",
      data: [],
    };
  }
};
