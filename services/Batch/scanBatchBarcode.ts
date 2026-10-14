import axios from "../axios";
import { BatchItem } from "./fetchBatchesByProduct";

export interface ScanBatchResponse {
  success: boolean;
  data?: BatchItem & {
    inventoryId: {
      _id: string;
      productName: string;
      productCode?: string;
      SKU?: string;
      sellingPrice?: number;
    } | string;
  };
  message?: string;
}

export const scanBatchBarcode = async (
  batchBarcode: string,
  locationId?: string
): Promise<ScanBatchResponse> => {
  try {
    const res = await axios.get(
      `/batches/scan/${encodeURIComponent(batchBarcode.trim())}`,
      {
        params: locationId ? { locationId } : undefined,
      }
    );
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || "Invalid or unknown batch barcode",
    };
  }
};
