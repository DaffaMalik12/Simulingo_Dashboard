"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Upload, FileText, X } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Swal from "sweetalert2";

// Pisahkan komponen yang menggunakan useSearchParams
function TambahModulContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const moduleId = searchParams.get("id");
  const isEditMode = !!moduleId;

  const supabase = createSupabaseBrowser();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState<string | null>(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<
    string | null
  >(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pdfFile: null as File | null,
    thumbnailFile: null as File | null,
  });

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

  // Load module data if editing
  useEffect(() => {
    if (isEditMode && moduleId) {
      loadModuleData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleId, isEditMode]);

  const loadModuleData = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("id", moduleId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || "",
          description: data.description || "",
          pdfFile: null,
          thumbnailFile: null,
        });
        setExistingPdfUrl(data.pdf_url);
        setExistingThumbnailUrl(data.thumbnail_url);
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to load module",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (file.type !== "application/pdf") {
        Swal.fire({
          icon: "warning",
          title: "Invalid File",
          text: "Only PDF files are allowed!",
        });
        return;
      }

      // Validate file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: "File Too Large",
          text: "PDF file should be less than 20MB",
        });
        return;
      }

      setFormData({ ...formData, pdfFile: file });
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: "File Too Large",
          text: "Thumbnail should be less than 10MB",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          icon: "warning",
          title: "Invalid File",
          text: "Please select an image file",
        });
        return;
      }

      setFormData({ ...formData, thumbnailFile: file });
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
        text: "Please fill in module title",
      });
      return;
    }

    if (!isEditMode && !formData.pdfFile) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please upload a PDF file",
      });
      return;
    }

    setLoading(true);

    try {
      let pdfUrl = existingPdfUrl;
      let thumbnailUrl = existingThumbnailUrl;

      // Upload PDF if new file is selected
      if (formData.pdfFile) {
        const fileExt = formData.pdfFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;
        const filePath = fileName;

        // Upload to post_modul bucket
        const { error: uploadError } = await supabase.storage
          .from("post_modul")
          .upload(filePath, formData.pdfFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("post_modul").getPublicUrl(filePath);

        pdfUrl = publicUrl;
      }

      // Upload thumbnail if new file is selected
      if (formData.thumbnailFile) {
        const fileExt = formData.thumbnailFile.name.split(".").pop();
        const fileName = `thumb-${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;
        const filePath = fileName;

        // Upload to post_modul bucket
        const { error: uploadError } = await supabase.storage
          .from("post_modul")
          .upload(filePath, formData.thumbnailFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("post_modul").getPublicUrl(filePath);

        thumbnailUrl = publicUrl;
      }

      const moduleData: any = {
        title: formData.title,
        description: formData.description || null,
        pdf_url: pdfUrl,
        thumbnail_url: thumbnailUrl,
      };

      let data, error;

      if (isEditMode && moduleId) {
        // Update existing module
        const result = await supabase
          .from("modules")
          .update(moduleData)
          .eq("id", moduleId)
          .select();

        data = result.data;
        error = result.error;
      } else {
        // Insert new module
        const result = await supabase
          .from("modules")
          .insert({
            ...moduleData,
            created_by: currentUserId,
            created_at: new Date().toISOString(),
          })
          .select();

        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      Swal.fire({
        icon: "success",
        title: "Success",
        text: isEditMode
          ? "Module updated successfully!"
          : "Module created successfully!",
      }).then(() => {
        router.push("/dashboard/modul");
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to save module",
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
          <p className="mt-4 text-gray-600">Loading module...</p>
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
            {isEditMode ? "Edit Modul" : "Tambah Modul Baru"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditMode
              ? "Edit existing module"
              : "Upload a new learning module"}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-8"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Module Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter module title..."
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-400 transition-all"
            />
          </div>

          {/* Description */}
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
              placeholder="Enter module description..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-400 transition-all resize-none"
            />
          </div>

          {/* PDF Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              PDF File {!isEditMode && <span className="text-red-500">*</span>}
            </label>

            {/* PDF Preview */}
            {(formData.pdfFile || existingPdfUrl) && (
              <div className="mb-4 border border-gray-300 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <FileText size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formData.pdfFile
                          ? formData.pdfFile.name
                          : "PDF already uploaded"}
                      </p>
                      {formData.pdfFile && (
                        <p className="text-xs text-gray-500">
                          {(formData.pdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                      {existingPdfUrl && !formData.pdfFile && (
                        <a
                          href={existingPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          View PDF
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, pdfFile: null });
                      setExistingPdfUrl(null);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Upload Area */}
            {!(formData.pdfFile || existingPdfUrl) && (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                  id="pdf-upload"
                />
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Upload size={32} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      Click to upload PDF
                    </p>
                    <p className="text-sm text-gray-500 mt-1">PDF up to 20MB</p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Drag and drop your PDF file here
                  </p>
                </label>
              </div>
            )}

            {/* Change PDF Button */}
            {(formData.pdfFile || existingPdfUrl) && (
              <div className="flex items-center justify-center gap-3">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                  id="pdf-upload-change"
                />
                <label
                  htmlFor="pdf-upload-change"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm font-medium"
                >
                  Change PDF
                </label>
                {formData.pdfFile && (
                  <div className="text-sm text-gray-600">
                    {(formData.pdfFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Thumbnail Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Thumbnail Image
              <span className="text-xs text-gray-500 font-normal ml-2">
                (Optional - Recommended for better preview)
              </span>
            </label>

            {/* Thumbnail Preview */}
            {(formData.thumbnailFile || existingThumbnailUrl) && (
              <div className="mb-4 relative inline-block">
                <img
                  src={
                    formData.thumbnailFile
                      ? URL.createObjectURL(formData.thumbnailFile)
                      : existingThumbnailUrl || undefined
                  }
                  alt="Thumbnail preview"
                  className="max-h-48 rounded-lg border-2 border-gray-200 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (formData.thumbnailFile) {
                      URL.revokeObjectURL(
                        URL.createObjectURL(formData.thumbnailFile)
                      );
                    }
                    setFormData({ ...formData, thumbnailFile: null });
                    setExistingThumbnailUrl(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Upload Area */}
            {!(formData.thumbnailFile || existingThumbnailUrl) && (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                  id="thumbnail-upload"
                />
                <label
                  htmlFor="thumbnail-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Upload size={24} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Click to upload thumbnail
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Change Thumbnail Button */}
            {(formData.thumbnailFile || existingThumbnailUrl) && (
              <div className="flex items-center justify-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                  id="thumbnail-upload-change"
                />
                <label
                  htmlFor="thumbnail-upload-change"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer text-sm font-medium"
                >
                  Change Thumbnail
                </label>
              </div>
            )}
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
                "Update Module"
              ) : (
                "Save Module"
              )}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => router.push("/dashboard/modul")}
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
export default function TambahModulPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TambahModulContent />
    </Suspense>
  );
}
