import axios from "../axios";

interface FetchTownshipsResponse {
  success: boolean;
  message: string;
  data: string[];
}

/**
 * Fetch all townships for supplier profile dropdown
 */
export const fetchTownships = async (): Promise<FetchTownshipsResponse> => {
  try {
    const response = await axios.get("/supplier-profile/townships");
    return response.data;
  } catch (error) {
    console.error("Error fetching townships:", error);
    throw error;
  }
};
