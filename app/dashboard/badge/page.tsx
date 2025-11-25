"use client";

import { Award, Trash2, Plus, Edit, Search } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Swal from "sweetalert2";

interface Badge {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export default function BadgePage() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadBadges();
  }, [searchQuery]);

  const loadBadges = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("badges")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply search filter
      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      setBadges(data || []);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to load badges",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete badge "${title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        // Get badge data first to delete from storage
        const { data: badgeData } = await supabase
          .from("badges")
          .select("image_url")
          .eq("id", id)
          .single();

        // Delete from database
        const { error } = await supabase.from("badges").delete().eq("id", id);

        if (error) throw error;

        // Optionally delete file from storage
        // Note: You might want to keep files for backup or delete them
        // if (badgeData?.image_url) {
        //   const imagePath = badgeData.image_url.split('/').pop();
        //   await supabase.storage.from('post_badge').remove([imagePath]);
        // }

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Badge has been deleted.",
        });

        loadBadges();
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to delete badge",
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const filteredBadges = badges.filter((badge) => {
    const matchesSearch =
      !searchQuery ||
      badge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (badge.description &&
        badge.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Badge/Lencana</h1>
          <p className="text-gray-600 mt-1">Manage achievement badges</p>
        </div>
        <Link
          href="/dashboard/tambah-badge"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Tambah Badge
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Cari badge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Badges Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading badges...</p>
          </div>
        </div>
      ) : filteredBadges.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Award size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No badges found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBadges.map((badge) => (
            <div
              key={badge.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 flex items-center min-h-[80px]">
                  {badge.image_url && badge.image_url.trim() !== "" ? (
                    <img
                      src={badge.image_url}
                      alt={badge.title}
                      className="w-20 h-20 object-contain"
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        const img = e.target as HTMLImageElement;
                        img.style.display = "none";
                        const parent = img.parentElement;
                        if (parent && !parent.querySelector(".fallback-icon")) {
                          const icon = document.createElement("div");
                          icon.className = "fallback-icon text-5xl";
                          icon.innerHTML = "🏆";
                          parent.appendChild(icon);
                        }
                      }}
                      onLoad={() => {
                        // Image loaded successfully
                        console.log("Badge image loaded:", badge.image_url);
                      }}
                    />
                  ) : (
                    <div className="text-5xl">🏆</div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/dashboard/tambah-badge?id=${badge.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(badge.id, badge.title)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{badge.title}</h3>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {badge.description || "No description"}
              </p>
              <p className="text-xs text-gray-500 mt-3">
                Created: {formatDate(badge.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
