"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Upload, Video, X } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Swal from "sweetalert2";

// Pisahkan komponen yang menggunakan useSearchParams
function TambahVideoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoId = searchParams.get("id");
  const isEditMode = !!videoId;

  const supabase = createSupabaseBrowser();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [existingVideoUrl, setExistingVideoUrl] = useState<string | null>(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<
    string | null
  >(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
    videoFile: null as File | null,
    thumbnailFile: null as File | null,
    duration: "",
  });
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

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

  // Load video data if editing
  useEffect(() => {
    if (isEditMode && videoId) {
      loadVideoData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, isEditMode]);

  // Cleanup video preview URL on unmount
  useEffect(() => {
    return () => {
      if (videoPreview) {
        URL.revokeObjectURL(videoPreview);
      }
    };
  }, [videoPreview]);

  const loadVideoData = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("id", videoId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || "",
          description: data.description || "",
          category: data.category || "general",
          videoFile: null,
          thumbnailFile: null,
          duration: data.duration_seconds
            ? formatDuration(data.duration_seconds)
            : "",
        });
        setExistingVideoUrl(data.video_url);
        setExistingThumbnailUrl(data.thumbnail_url);
        // Set video preview for existing video
        if (data.video_url) {
          setVideoPreview(data.video_url);
        }
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to load video",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const parseDuration = (duration: string): number => {
    // Format: "12:45" atau "1:12:45"
    const parts = duration.split(":").map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];

      // Validate file size (max 200MB)
      if (file.size > 200 * 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: "File Too Large",
          text: "Video file should be less than 200MB",
        });
        return;
      }

      // Validate file type
      if (!file.type.startsWith("video/")) {
        Swal.fire({
          icon: "warning",
          title: "Invalid File",
          text: "Please select a video file",
        });
        return;
      }

      setFormData({ ...formData, videoFile: file });

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setVideoPreview(previewUrl);
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
        text: "Please fill in video title",
      });
      return;
    }

    if (!isEditMode && !formData.videoFile) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please upload a video file",
      });
      return;
    }

    if (!formData.duration.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please enter video duration",
      });
      return;
    }

    setLoading(true);

    try {
      let videoUrl = existingVideoUrl;
      let thumbnailUrl = existingThumbnailUrl;

      // Upload video if new file is selected
      if (formData.videoFile) {
        const fileExt = formData.videoFile.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;
        const filePath = fileName;

        // Upload to post_video bucket
        const { error: uploadError } = await supabase.storage
          .from("post_video")
          .upload(filePath, formData.videoFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("post_video").getPublicUrl(filePath);

        videoUrl = publicUrl;
      }

      // Upload thumbnail if new file is selected
      if (formData.thumbnailFile) {
        const fileExt = formData.thumbnailFile.name.split(".").pop();
        const fileName = `thumb-${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;
        const filePath = fileName;

        // Upload to post_video bucket (or create separate thumbnail bucket)
        const { error: uploadError } = await supabase.storage
          .from("post_video")
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
        } = supabase.storage.from("post_video").getPublicUrl(filePath);

        thumbnailUrl = publicUrl;
      }

      const durationSeconds = parseDuration(formData.duration);

      const videoData: any = {
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        duration_seconds: durationSeconds,
      };

      let data, error;

      if (isEditMode && videoId) {
        // Update existing video
        const result = await supabase
          .from("videos")
          .update(videoData)
          .eq("id", videoId)
          .select();

        data = result.data;
        error = result.error;
      } else {
        // Insert new video
        const result = await supabase
          .from("videos")
          .insert({
            ...videoData,
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
          ? "Video updated successfully!"
          : "Video created successfully!",
      }).then(() => {
        router.push("/dashboard/video");
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to save video",
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
          <p className="mt-4 text-gray-600">Loading video...</p>
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
            {isEditMode ? "Edit Video" : "Tambah Video Baru"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditMode ? "Edit existing video" : "Upload a new learning video"}
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
              Video Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter video title..."
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
              placeholder="Enter video description..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-400 transition-all resize-none"
            />
          </div>

          {/* Category and Duration in Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-all"
              >
                <option value="general">General</option>
                <option value="grammar">Grammar</option>
                <option value="vocabulary">Vocabulary</option>
                <option value="reading">Reading</option>
                <option value="listening">Listening</option>
                <option value="speaking">Speaking</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Duration <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                placeholder="Example: 12:45 or 1:12:45"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-400 transition-all"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: MM:SS or HH:MM:SS
              </p>
            </div>
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Video File{" "}
              {!isEditMode && <span className="text-red-500">*</span>}
            </label>

            {/* Video Preview */}
            {(videoPreview || existingVideoUrl) && (
              <div className="mb-4 relative rounded-lg overflow-hidden bg-gray-900">
                <video
                  src={videoPreview || existingVideoUrl || undefined}
                  controls
                  className="w-full max-h-96 object-contain"
                >
                  Your browser does not support the video tag.
                </video>
                <button
                  type="button"
                  onClick={() => {
                    if (videoPreview) {
                      URL.revokeObjectURL(videoPreview);
                      setVideoPreview(null);
                    }
                    setFormData({ ...formData, videoFile: null });
                    setExistingVideoUrl(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Upload Area */}
            {!(videoPreview || existingVideoUrl) && (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload"
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Video size={32} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      Click to upload video
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      MP4, MOV, AVI up to 200MB
                    </p>
                  </div>
                  <p className="text-xs text-gray-400">
                    Drag and drop your video file here
                  </p>
                </label>
              </div>
            )}

            {/* Change Video Button */}
            {(videoPreview || existingVideoUrl) && (
              <div className="flex items-center justify-center gap-3">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  className="hidden"
                  id="video-upload-change"
                />
                <label
                  htmlFor="video-upload-change"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm font-medium"
                >
                  Change Video
                </label>
                {formData.videoFile && (
                  <div className="text-sm text-gray-600">
                    {(formData.videoFile.size / 1024 / 1024).toFixed(2)} MB
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
                "Update Video"
              ) : (
                "Save Video"
              )}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => router.push("/dashboard/video")}
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
export default function TambahVideoPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TambahVideoContent />
    </Suspense>
  );
}
