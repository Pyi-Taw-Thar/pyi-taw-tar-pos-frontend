import axios from "../axios";

export interface ImportCustomersErrorDetail {
  name: string;
  error: string;
}

export interface ImportCustomersExcelResponse {
  success: boolean;
  message: string;
  data: {
    total: number;
    created: number;
    skipped: number;
    failed: number;
    errors: ImportCustomersErrorDetail[];
  };
}

export const importCustomersExcel = async (file: File): Promise<ImportCustomersExcelResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post("/customer/import-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("Error importing customers excel:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to import customers excel",
      data: {
        total: 0,
        created: 0,
        skipped: 0,
        failed: 0,
        errors: [],
      },
    };
  }
};
