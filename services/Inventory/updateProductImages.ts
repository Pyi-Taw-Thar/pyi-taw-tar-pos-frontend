import axios from "../axios";

interface UploadImagesResponse {
  success: boolean;
  message: string;
  data?: any;
}

export const uploadProductImages = async (
  productId: string,
  images: File[],
): Promise<UploadImagesResponse> => {
  try {
    const formData = new FormData();
    images.forEach((file) => {
      formData.append("images", file);
    });

    const response = await axios.post(
      `/inventory/${productId}/images`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  } catch (error: any) {
    console.error("Error uploading product images:", error);
    throw (
      error.response?.data?.message ||
      error.message ||
      "Failed to upload images"
    );
  }
};

export const deleteProductImage = async (
  productId: string,
  imageId: string,
): Promise<UploadImagesResponse> => {
  try {
    const response = await axios.delete(
      `/inventory/${productId}/images/${imageId}`,
    );
    return response.data;
  } catch (error: any) {
    console.error("Error deleting product image:", error);
    throw (
      error.response?.data?.message ||
      error.message ||
      "Failed to delete image"
    );
  }
};
