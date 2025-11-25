"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Upload, X } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Swal from "sweetalert2";

// Pisahkan komponen yang menggunakan useSearchParams
function TambahBadgeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const badgeId = searchParams.get("id");
  const isEditMode = !!badgeId;

  const supabase = createSupabaseBrowser();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    iconFile: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setCurrentUserId(data.user.id);
      }
    };
    getUser();
  }, []);

  // Load badge data if editing
  useEffect(() => {
    if (isEditMode && badgeId) {
      loadBadgeData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [badgeId, isEditMode]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const loadBadgeData = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .eq("id", badgeId)
        .single();

      if (error) throw error;

      if (data) {
        console.log("Loaded badge data:", data);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          iconFile: null,
        });
        setExistingImageUrl(data.image_url);
        // Set preview URL untuk existing image
        if (data.image_url && data.image_url.trim() !== "") {
          console.log("Setting preview URL:", data.image_url);
          setPreviewUrl(data.image_url);
        } else {
          console.log("No image URL found, clearing preview");
          setPreviewUrl(null);
        }
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to load badge",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          icon: "warning",
          title: "Invalid File",
          text: "Only image files are allowed!",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: "File Too Large",
          text: "Image should be less than 5MB",
        });
        return;
      }

      setFormData({ ...formData, iconFile: file });

      // Create preview URL
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      Swal.fire({
        icon: "error",
        title: "Authentication Error",
        text: "User not authenticated",
      });
      return;
    }

    if (!formData.title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill in badge title",
      });
      return;
    }

    // Validasi: untuk create baru, harus ada icon file
    // Untuk edit, boleh tidak upload file baru jika sudah ada existing image
    if (!isEditMode && !formData.iconFile) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please upload a badge icon",
      });
      return;
    }

    // Validasi: untuk edit, harus ada icon file ATAU existing image
    if (isEditMode && !formData.iconFile && !existingImageUrl) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please upload a badge icon",
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrl = existingImageUrl;

      // Upload image if new file is selected
      if (formData.iconFile) {
        const fileExt = formData.iconFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;
        const filePath = fileName;

        // Upload to post_badge bucket
        const { error: uploadError } = await supabase.storage
          .from("post_badge")
          .upload(filePath, formData.iconFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("post_badge").getPublicUrl(filePath);

        imageUrl = publicUrl;
        console.log("Uploaded image URL:", imageUrl);
      }

      const badgeData: any = {
        title: formData.title,
        description: formData.description || null,
        image_url: imageUrl || null,
      };

      console.log("Saving badge data:", badgeData);

      let data, error;

      if (isEditMode && badgeId) {
        // Update existing badge
        const result = await supabase
          .from("badges")
          .update(badgeData)
          .eq("id", badgeId)
          .select();

        data = result.data;
        error = result.error;
      } else {
        // Insert new badge
        const result = await supabase
          .from("badges")
          .insert({
            ...badgeData,
            created_by: currentUserId,
            created_at: new Date().toISOString(),
          })
          .select();

        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      // Log hasil untuk debugging
      console.log("Badge saved successfully:", data);
      if (data && data[0]) {
        console.log("Saved badge image_url:", data[0].image_url);
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: isEditMode
          ? "Badge updated successfully!"
          : "Badge created successfully!",
      }).then(() => {
        router.push("/dashboard/badge");
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to save badge",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading badge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? "Edit Badge" : "Tambah Badge Baru"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditMode
              ? "Edit existing badge"
              : "Create a new achievement badge"}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-8"
        >
          {/* Badge Icon Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Badge Icon{" "}
              {!isEditMode && <span className="text-red-500">*</span>}
            </label>

            {/* Icon Preview */}
            {previewUrl && (
              <div className="mb-4 relative inline-block">
                <div className="border-2 border-gray-200 rounded-lg p-6 bg-gray-50">
                  <img
                    src={previewUrl}
                    alt="Badge Icon Preview"
                    className="w-32 h-32 object-contain mx-auto"
                    onError={(e) => {
                      console.error(
                        "Failed to load preview image:",
                        previewUrl
                      );
                      // Show error message
                      const img = e.target as HTMLImageElement;
                      img.style.display = "none";
                      const parent = img.parentElement;
                      if (parent) {
                        const errorDiv = document.createElement("div");
                        errorDiv.className = "text-center text-red-500 text-sm";
                        errorDiv.textContent = "Failed to load image";
                        parent.appendChild(errorDiv);
                      }
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (previewUrl && previewUrl.startsWith("blob:")) {
                      URL.revokeObjectURL(previewUrl);
                    }
                    setPreviewUrl(null);
                    setFormData({ ...formData, iconFile: null });
                    setExistingImageUrl(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Upload Area */}
            {!previewUrl && (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                  className="hidden"
                  id="icon-upload"
                />
                <label
                  htmlFor="icon-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Upload size={32} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      Click to upload icon
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      PNG, JPG, SVG up to 5MB
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Drag and drop your image file here
                  </p>
                </label>
              </div>
            )}

            {/* Change Icon Button */}
            {previewUrl && (
              <div className="flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                  className="hidden"
                  id="icon-upload-change"
                />
                <label
                  htmlFor="icon-upload-change"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm font-medium"
                >
                  Change Icon
                </label>
              </div>
            )}
          </div>

          {/* Badge Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Badge Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Quick Learner"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-400 transition-all"
            />
          </div>

          {/* Badge Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Description
              <span className="text-xs text-gray-500 font-normal ml-2">
                (Optional)
              </span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Complete 10 questions"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-400 transition-all resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : isEditMode ? (
                "Update Badge"
              ) : (
                "Save Badge"
              )}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => router.push("/dashboard/badge")}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
}

// Export default dengan Suspense wrapper
export default function TambahBadgePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TambahBadgeContent />
    </Suspense>
  );
}
