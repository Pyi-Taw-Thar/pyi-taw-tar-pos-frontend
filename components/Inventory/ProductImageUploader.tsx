import React, { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "../../context/LanguageContext";
import { deleteProductImage } from "../../services/Inventory/updateProductImages";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE_MB = 5;

export interface ExistingImage {
  url: string;
  key?: string;
  isPrimary?: boolean;
  _id?: string;
  id?: string;
}

interface ProductImageUploaderProps {
  productId?: string | null;
  existingImages: ExistingImage[];
  onExistingImagesChange: (images: ExistingImage[]) => void;
  newImages: File[];
  onNewImagesChange: (files: File[]) => void;
}

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  productId,
  existingImages,
  onExistingImagesChange,
  newImages,
  onNewImagesChange,
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const urls = newImages.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newImages]);

  const validateImageFile = (file: File): string | null => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Only JPEG, PNG, and WebP images are allowed";
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      return `Image must be smaller than ${MAX_IMAGE_SIZE_MB}MB`;
    }
    return null;
  };

  const addImageFiles = (incoming: File[]) => {
    const valid: File[] = [];
    for (const file of incoming) {
      const err = validateImageFile(file);
      if (err) {
        toast.error(`${file.name}: ${err}`);
        continue;
      }
      valid.push(file);
    }
    if (valid.length === 0) return;
    onNewImagesChange([...newImages, ...valid]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    addImageFiles(files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/"),
    );
    addImageFiles(files);
  };

  const removeNewImage = (index: number) => {
    onNewImagesChange(newImages.filter((_, i) => i !== index));
  };

  const handleDeleteExisting = async (imgId: string) => {
    if (!productId || deletingId) return;
    setDeletingId(imgId);
    try {
      await deleteProductImage(productId, imgId);
      onExistingImagesChange(
        existingImages.filter((i) => (i._id || i.id) !== imgId),
      );
      toast.success(t("inventory.imageDeletedSuccess"));
    } catch {
      toast.error(t("inventory.imageDeleteFailed"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImagePlus className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold text-slate-700">
            {t("inventory.productImages")}
          </h3>
        </div>
        <span className="text-xs text-slate-400">
          {t("inventory.productImagesHint")}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Existing images list */}
        {productId && existingImages.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
              {t("inventory.existingImages")} ({existingImages.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {existingImages.map((img) => {
                const imgId = img._id || img.id;
                const isDeleting = deletingId === imgId;
                return (
                  <div
                    key={imgId || img.url}
                    className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm"
                  >
                    <img
                      src={img.url}
                      alt={t("inventory.existingImageAlt")}
                      className="w-full h-full object-cover"
                    />
                    {img.isPrimary && (
                      <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 text-xs font-bold text-white bg-primary rounded shadow-sm">
                        {t("inventory.primaryImage")}
                      </span>
                    )}
                    {imgId && (
                      <button
                        type="button"
                        disabled={isDeleting}
                        onClick={() => handleDeleteExisting(imgId)}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition-all focus:outline-none focus:ring-2 focus:ring-red-400 disabled:opacity-50"
                        aria-label={t("inventory.deleteImage")}
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <X className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_IMAGE_TYPES.join(",")}
          onChange={handleInputChange}
          className="hidden"
          id="product-images-input"
        />

        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={`relative rounded-xl border-2 border-dashed transition-all cursor-pointer p-6 text-center ${
            isDragOver
              ? "border-primary bg-primary/10 scale-[1.01]"
              : "border-slate-300 bg-slate-50/50 hover:border-primary hover:bg-primary/5"
          }`}
        >
          <div className="flex flex-col items-center gap-2 pointer-events-none">
            <div className="p-3 rounded-full bg-white shadow-sm text-slate-600">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-slate-700">
              {t("inventory.dropImagesHere")}
            </p>
            <p className="text-xs text-slate-400">
              {t("inventory.selectMultipleFilesHint")}
            </p>
          </div>
        </div>

        {/* New uploaded images preview */}
        {newImages.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {t("inventory.previewImages")} ({newImages.length})
              </p>
              <button
                type="button"
                onClick={() => onNewImagesChange([])}
                className="text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
              >
                {t("inventory.clearAllImages")}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {newImages.map((file, idx) => (
                <div
                  key={`${file.name}-${file.size}-${idx}`}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm"
                >
                  <img
                    src={previewUrls[idx]}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-2 pt-6">
                    <p className="text-xs text-white truncate font-medium">
                      {file.name}
                    </p>
                    <p className="text-xs text-white/80">
                      {(file.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeNewImage(idx);
                    }}
                    className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition-all focus:outline-none focus:ring-2 focus:ring-red-400"
                    aria-label={`${t("inventory.removeImage")}: ${file.name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
