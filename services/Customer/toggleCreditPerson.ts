import axios from "../axios";

interface ToggleCreditResponse {
  success: boolean;
  message: string;
  data?: {
    _id: string;
    name: string;
    phone: string;
    isCreditPerson: boolean;
    blacklist: boolean;
  };
}

export const toggleCreditPerson = async (
  customerId: string
): Promise<ToggleCreditResponse> => {
  try {
    const response = await axios.patch(
      `/customer/${customerId}/toggle-credit`
    );
    return response.data;
  } catch (error: any) {
    console.error("Error toggling credit person status:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Failed to toggle credit person status",
    };
  }
};
