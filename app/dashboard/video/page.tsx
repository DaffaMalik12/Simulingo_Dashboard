"use client";

import { Video, Trash2, Plus, Edit, Search } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Swal from "sweetalert2";

interface VideoItem {
  id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  category: string;
  duration_seconds: number;
  created_at: string;
}

export default function VideoPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    loadVideos();
  }, [searchQuery, categoryFilter]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply search filter
      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      // Apply category filter
      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setVideos(data || []);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to load videos",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete video "${title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        // Get video data first to delete from storage
        const { data: videoData } = await supabase
          .from("videos")
          .select("video_url, thumbnail_url")
          .eq("id", id)
          .single();

        // Delete from database
        const { error } = await supabase.from("videos").delete().eq("id", id);

        if (error) throw error;

        // Optionally delete files from storage
        // Note: You might want to keep files for backup or delete them
        // if (videoData?.video_url) {
        //   const videoPath = videoData.video_url.split('/').pop();
        //   await supabase.storage.from('post_video').remove([videoPath]);
        // }

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Video has been deleted.",
        });

        loadVideos();
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to delete video",
        });
      }
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      !searchQuery ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (video.description &&
        video.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory =
      categoryFilter === "all" || video.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Video Pembelajaran</h1>
          <p className="text-gray-600 mt-1">Manage learning videos</p>
        </div>
        <Link
          href="/dashboard/tambah-video"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Tambah Video
        </Link>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari video..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Kategori</option>
            <option value="general">General</option>
            <option value="grammar">Grammar</option>
            <option value="vocabulary">Vocabulary</option>
            <option value="reading">Reading</option>
            <option value="listening">Listening</option>
            <option value="speaking">Speaking</option>
          </select>
        </div>
      </div>

      {/* Video Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading videos...</p>
          </div>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Video size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No videos found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Thumbnail */}
              <div className="relative h-48 bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center overflow-hidden">
                {video.thumbnail_url ? (
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Video size={48} className="text-gray-400" />
                )}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration_seconds)}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 truncate">{video.title}</h3>
                {video.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {video.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {video.category}
                  </span>
                  <p className="text-xs text-gray-500">
                    {formatDate(video.created_at)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/dashboard/tambah-video?id=${video.id}`}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit size={16} />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(video.id, video.title)}
                    className="px-3 py-2 hover:bg-red-50 rounded transition-colors flex items-center justify-center"
                  >
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
