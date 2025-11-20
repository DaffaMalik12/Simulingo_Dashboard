"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Volume2,
  BookOpen,
  Clock,
  ChevronLeft,
  ChevronRight,
  Timer, // Tambahkan import Timer
} from "lucide-react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Swal from "sweetalert2"; // Tambahkan import

interface Question {
  id: string;
  exam_category: string;
  type: "reading" | "listening" | "structure";
  difficulty: "easy" | "medium" | "hard";
  question: string;
  options: string[];
  correct_answer: number;
  audio_url?: string | null;
  passage?: string | null;
  created_at: string;
  time_limit_seconds?: number | null; // Tambahkan ini
}

export default function TOEFLPage() {
  const supabase = createSupabaseBrowser();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Fetch questions from Supabase
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("exam_category", "toefl") // Kembali ke "toefl"
        .order("created_at", { ascending: false });

      if (error) throw error;

      setQuestions(data || []);
    } catch (error: any) {
      console.error("Error fetching questions:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const { error } = await supabase.from("questions").delete().eq("id", id);

      if (error) throw error;

      // Remove from local state
      setQuestions(questions.filter((q) => q.id !== id));

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Question deleted successfully",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error("Error deleting question:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message,
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "hard":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "reading":
        return <BookOpen size={16} />;
      case "listening":
        return <Volume2 size={16} />;
      case "structure":
        return <Edit2 size={16} />;
      default:
        return null;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "toefl":
        return "ETIC";
      case "ielts":
        return "TOAFL";
      default:
        return category;
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || q.type === filterType;
    const matchesDifficulty =
      filterDifficulty === "all" || q.difficulty === filterDifficulty;
    const matchesCategory =
      filterCategory === "all" || q.exam_category === filterCategory;
    return matchesSearch && matchesType && matchesDifficulty && matchesCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterDifficulty, filterCategory]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">TOEFL Questions</h1>
          <p className="text-gray-600 mt-1">
            Manage and organize your TOEFL test questions
          </p>
        </div>
        <Link
          href="/dashboard/tambah-soal"
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          Add Question
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Total Questions</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {questions.length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Reading</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {questions.filter((q) => q.type === "reading").length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Listening</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {questions.filter((q) => q.type === "listening").length}
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600">Structure</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {questions.filter((q) => q.type === "structure").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Categories</option>
            <option value="toefl">ETIC</option>
            <option value="ielts">TOAFL</option>
          </select>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Types</option>
            <option value="reading">Reading</option>
            <option value="listening">Listening</option>
            <option value="structure">Structure</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {paginatedQuestions.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No questions found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          paginatedQuestions.map((question) => (
            <div
              key={question.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Question Header */}
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                      {getCategoryLabel(question.exam_category)}
                    </span>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                      {getTypeIcon(question.type)}
                      {question.type.charAt(0).toUpperCase() +
                        question.type.slice(1)}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-md text-xs font-medium ${getDifficultyColor(
                        question.difficulty
                      )}`}
                    >
                      {question.difficulty.charAt(0).toUpperCase() +
                        question.difficulty.slice(1)}
                    </span>
                    {question.time_limit_seconds && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-medium">
                        <Timer size={12} />
                        {question.time_limit_seconds}s
                      </span>
                    )}
                    {question.audio_url && (
                      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                        <Volume2 size={12} />
                        Audio
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 ml-auto">
                      <Clock size={12} />
                      {new Date(question.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Question Text */}
                  <div
                    className="text-base font-medium text-gray-900 mb-3"
                    dangerouslySetInnerHTML={{ __html: question.question }}
                  />

                  {/* Passage (if exists) */}
                  {question.passage && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {question.passage}
                      </p>
                    </div>
                  )}

                  {/* Options */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {question.options.map((option, index) => (
                      <div
                        key={index}
                        className={`flex items-start gap-2 p-3 rounded-lg border ${
                          index === question.correct_answer
                            ? "bg-green-50 border-green-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                            index === question.correct_answer
                              ? "bg-green-600 text-white"
                              : "bg-gray-300 text-gray-700"
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-sm text-gray-700">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/tambah-soal?id=${question.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </Link>
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredQuestions.length > 0 && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium">
                {startIndex + 1} -{" "}
                {Math.min(endIndex, filteredQuestions.length)}
              </span>{" "}
              of <span className="font-medium">{filteredQuestions.length}</span>{" "}
              questions
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft size={16} />
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span key={page} className="px-2 text-gray-500">
                        ...
                      </span>
                    );
                  }
                  return null;
                }
              )}
            </div>

            {/* Next Button */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
