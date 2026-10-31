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
    blacklistReason?: string | null;
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

// Customer ၏ Blacklist အခြေအနေကို ပြောင်းလဲခြင်း (PATCH /customer/:id/blacklist)
export const updateCustomerBlacklist = async (
  customerId: string,
  blacklist: boolean,
  blacklistReason?: string
): Promise<ToggleCreditResponse> => {
  try {
    const response = await axios.patch(`/customer/${customerId}/blacklist`, {
      blacklist,
      blacklistReason: blacklist ? blacklistReason || null : null,
    });
    return response.data;
  } catch (error: any) {
    console.error("Error updating customer blacklist status:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Blacklist အခြေအနေ ပြောင်းလဲ၍ မရပါ",
    };
  }
};
