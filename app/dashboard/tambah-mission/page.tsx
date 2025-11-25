"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Swal from "sweetalert2";

// Pisahkan komponen yang menggunakan useSearchParams
function TambahMissionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const missionId = searchParams.get("id");
  const isEditMode = !!missionId;

  const supabase = createSupabaseBrowser();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    xp_reward: "",
    mission_type: "",
    condition: "",
    active: true,
  });

  // Load mission data if editing
  useEffect(() => {
    if (isEditMode && missionId) {
      loadMissionData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missionId, isEditMode]);

  const loadMissionData = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .eq("id", missionId)
        .single();

      if (error) throw error;

      if (data) {
        console.log("Loaded mission data:", data);
        setFormData({
          title: data.title || "",
          description: data.description || "",
          xp_reward: data.xp_reward?.toString() || "",
          mission_type: data.mission_type || "",
          condition: data.condition
            ? JSON.stringify(data.condition, null, 2)
            : "",
          active: data.active ?? true,
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to load mission",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill in mission title",
      });
      return;
    }

    if (!formData.mission_type) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please select mission type",
      });
      return;
    }

    // Validate XP reward
    const xpReward = parseInt(formData.xp_reward) || 0;
    if (xpReward < 0) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "XP reward must be a positive number",
      });
      return;
    }

    // Parse condition JSON
    let conditionData = null;
    if (formData.condition.trim()) {
      try {
        conditionData = JSON.parse(formData.condition);
      } catch (error) {
        Swal.fire({
          icon: "warning",
          title: "Validation Error",
          text: "Condition must be valid JSON format",
        });
        return;
      }
    }

    setLoading(true);

    try {
      const missionData: any = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        xp_reward: xpReward,
        mission_type: formData.mission_type,
        condition: conditionData,
        active: formData.active,
      };

      console.log("Saving mission data:", missionData);

      let data, error;

      if (isEditMode && missionId) {
        // Update existing mission
        const result = await supabase
          .from("missions")
          .update(missionData)
          .eq("id", missionId)
          .select();

        data = result.data;
        error = result.error;
      } else {
        // Insert new mission
        const result = await supabase
          .from("missions")
          .insert({
            ...missionData,
            created_at: new Date().toISOString(),
          })
          .select();

        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      // Log hasil untuk debugging
      console.log("Mission saved successfully:", data);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: isEditMode
          ? "Mission updated successfully!"
          : "Mission created successfully!",
      }).then(() => {
        router.push("/dashboard/mission");
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to save mission",
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
          <p className="mt-4 text-gray-600">Loading mission...</p>
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
            {isEditMode ? "Edit Mission" : "Tambah Mission Baru"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditMode
              ? "Edit existing mission"
              : "Create a new mission for users to complete"}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6"
        >
          {/* Mission Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Mission Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Complete 10 lessons"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-400 transition-all"
            />
          </div>

          {/* Mission Description */}
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
              placeholder="Complete 10 lessons to unlock this achievement"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-400 transition-all resize-none"
            />
          </div>

          {/* Mission Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Mission Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.mission_type}
              onChange={(e) =>
                setFormData({ ...formData, mission_type: e.target.value })
              }
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-all"
            >
              <option value="">Select mission type</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="achievement">Achievement</option>
              <option value="special">Special</option>
            </select>
          </div>

          {/* XP Reward */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              XP Reward
            </label>
            <input
              type="number"
              value={formData.xp_reward}
              onChange={(e) =>
                setFormData({ ...formData, xp_reward: e.target.value })
              }
              placeholder="100"
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-400 transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">
              Amount of XP users will receive upon completion
            </p>
          </div>

          {/* Condition (JSON) */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Condition (JSON)
              <span className="text-xs text-gray-500 font-normal ml-2">
                (Optional)
              </span>
            </label>
            <textarea
              value={formData.condition}
              onChange={(e) =>
                setFormData({ ...formData, condition: e.target.value })
              }
              placeholder='{"lessons_completed": 10, "score_minimum": 80}'
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-400 transition-all resize-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              JSON format for mission conditions (e.g., requirements, targets)
            </p>
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) =>
                  setFormData({ ...formData, active: e.target.checked })
                }
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-semibold text-gray-900">
                Active Mission
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-8">
              Only active missions will be visible to users
            </p>
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
                "Update Mission"
              ) : (
                "Save Mission"
              )}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => router.push("/dashboard/mission")}
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
export default function TambahMissionPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TambahMissionContent />
    </Suspense>
  );
}

