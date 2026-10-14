import axios from "../axios";

export interface BatchItem {
  _id: string;
  inventoryId: string;
  locationType: "warehouse" | "storefront";
  locationId: {
    _id: string;
    locationName: string;
    locationCode: string;
    type?: string;
  };
  batchNumber: string;
  batchBarcode: string;
  expiryDate: string | null;
  manufacturingDate?: string | null;
  quantity: number;
  costPrice?: number;
  status: "active" | "expired" | "depleted";
  receivedDate?: string;
  isExpired?: boolean;
  daysUntilExpiry?: number | null;
}

export interface FetchBatchesResponse {
  success: boolean;
  count: number;
  data: BatchItem[];
  message?: string;
}

export const fetchBatchesByProduct = async (
  inventoryId: string,
  params?: { locationId?: string; includeDepleted?: boolean }
): Promise<FetchBatchesResponse> => {
  try {
    const res = await axios.get(`/batches/by-product/${inventoryId}`, {
      params: {
        locationId: params?.locationId,
        includeDepleted: params?.includeDepleted ? "true" : "false",
      },
    });
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      count: 0,
      data: [],
      message: error?.response?.data?.message || "Failed to fetch batches",
    };
  }
};
