"use client";

import {
  Calendar,
  User,
  Eye,
  Tag,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Swal from "sweetalert2";

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  thumbnail_url: string | null;
  created_by: string;
  created_at: string;
  author?: string;
}

export default function ArtikelPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalArticles, setTotalArticles] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    loadArticles();
  }, [searchQuery, categoryFilter, statusFilter, currentPage]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("articles")
        .select("*", {
          count: "exact",
        })
        .order("created_at", { ascending: false });

      // Apply search filter
      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`
        );
      }

      // Apply category filter
      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      const { data, error, count } = await query.range(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage - 1
      );

      if (error) throw error;

      // Langsung gunakan data dari database tanpa mapping
      setArticles(data || []);
      setTotalArticles(count || 0);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to load articles",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete article "${title}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase.from("articles").delete().eq("id", id);

        if (error) throw error;

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Article has been deleted.",
        });

        loadArticles();
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to delete article",
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

  const getExcerpt = (content: string, maxLength: number = 100) => {
    // Hapus semua HTML tags
    const stripHtml = (html: string) => {
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    };

    const textContent = stripHtml(content).trim();

    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength) + "...";
  };

  // Calculate stats
  const stats = [
    {
      label: "Total Artikel",
      value: totalArticles.toString(),
      color: "bg-blue-500",
    },
    {
      label: "Published",
      value: articles.filter((a) => a.category).length.toString(),
      color: "bg-green-500",
    },
    {
      label: "Draft",
      value: "0",
      color: "bg-yellow-500",
    },
    {
      label: "Total Views",
      value: "0",
      color: "bg-purple-500",
    },
  ];

  const totalPages = Math.ceil(totalArticles / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Artikel</h1>
          <p className="text-gray-600 mt-1">
            Kelola semua artikel pembelajaran
          </p>
        </div>
        <Link
          href="/dashboard/tambah-artikel"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Tambah Artikel
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-lg border border-gray-200 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 ${stat.color} rounded-lg opacity-10`}
              ></div>
            </div>
          </div>
        ))}
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
              placeholder="Cari artikel..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Kategori</option>
            <option value="general">General</option>
            <option value="grammar">Grammar Tips</option>
            <option value="vocabulary">Vocabulary</option>
            <option value="reading">Reading Strategies</option>
            <option value="listening">Listening Tips</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-600">No articles found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Artikel
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {articles.map((article) => (
                    <tr
                      key={article.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {article.thumbnail_url ? (
                            <img
                              src={article.thumbnail_url}
                              alt={article.title}
                              className="w-16 h-16 rounded-lg object-cover"
                              onError={(e) => {
                                // Fallback jika gambar tidak bisa dimuat
                                (e.target as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Tag size={24} className="text-gray-400" />
                            </div>
                          )}
                          <div className="max-w-xs">
                            <p className="font-medium text-gray-900 line-clamp-1">
                              {article.title}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-1">
                              {getExcerpt(article.content)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {article.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">
                          {article.author || "Unknown"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {formatDate(article.created_at)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/tambah-artikel?id=${article.id}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(article.id, article.title)
                            }
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Menampilkan{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, totalArticles)}
                  </span>{" "}
                  dari <span className="font-medium">{totalArticles}</span>{" "}
                  artikel
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
