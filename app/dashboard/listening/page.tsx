"use client";

import {
  Volume2,
  Edit,
  Trash2,
  Plus,
  Search,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Swal from "sweetalert2";

interface ListeningQuestion {
  id: string;
  audio_url: string | null;
  question: string | null;
  options: string[] | null;
  correct_answer: number | null;
  created_at: string;
}

export default function ListeningPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadQuestions();
  }, [searchQuery]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("listening_questions")
        .select("*")
        .order("created_at", { ascending: false });

      // Apply search filter
      if (searchQuery) {
        query = query.ilike("question", `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setQuestions(data || []);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to load listening questions",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, questionText: string | null) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete listening question "${questionText || "Untitled"}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        // Get question data first to delete audio from storage
        const { data: questionData } = await supabase
          .from("listening_questions")
          .select("audio_url")
          .eq("id", id)
          .single();

        // Delete from database
        const { error } = await supabase
          .from("listening_questions")
          .delete()
          .eq("id", id);

        if (error) throw error;

        // Optionally delete audio file from storage
        // Note: You might want to keep files for backup or delete them
        // if (questionData?.audio_url) {
        //   const audioPath = questionData.audio_url.split('/').pop();
        //   await supabase.storage.from('audio').remove([`audio/${audioPath}`]);
        // }

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Listening question has been deleted.",
        });

        loadQuestions();
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Failed to delete listening question",
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

  const getAudioFileName = (url: string | null) => {
    if (!url) return "No audio";
    const parts = url.split("/");
    return parts[parts.length - 1] || "audio file";
  };

  // Calculate stats
  const stats = [
    {
      label: "Total Questions",
      value: questions.length.toString(),
      color: "bg-blue-500",
    },
    {
      label: "With Audio",
      value: questions.filter((q) => q.audio_url).length.toString(),
      color: "bg-green-500",
    },
    {
      label: "Without Audio",
      value: questions.filter((q) => !q.audio_url).length.toString(),
      color: "bg-yellow-500",
    },
    {
      label: "Total Options",
      value: questions
        .reduce((acc, q) => acc + (q.options?.length || 0), 0)
        .toString(),
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Listening Questions
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola soal listening comprehension
          </p>
        </div>
        <Link
          href="/dashboard/tambah-listening"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Tambah Soal
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
              placeholder="Cari soal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Questions Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading questions...</p>
          </div>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Volume2 size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No listening questions found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Question
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Audio
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Options
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {questions.map((question) => {
                  const options = question.options || [];

                  return (
                    <tr
                      key={question.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <p className="font-medium text-gray-900 line-clamp-2">
                            {question.question || "No question"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {question.audio_url ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg w-fit">
                              <Volume2 size={16} className="text-blue-600" />
                              <a
                                href={question.audio_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 font-medium hover:underline"
                              >
                                Play Audio
                              </a>
                            </div>
                            <p className="text-xs text-gray-500">
                              {getAudioFileName(question.audio_url)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400">
                            No audio
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5 max-w-xs">
                          {options.map((option, index) => (
                            <div key={index} className="flex items-start gap-2">
                              {index === question.correct_answer && (
                                <CheckCircle
                                  size={14}
                                  className="text-green-600 mt-0.5"
                                />
                              )}
                              <span
                                className={`text-xs ${
                                  index === question.correct_answer
                                    ? "text-green-700 font-medium"
                                    : "text-gray-600"
                                } line-clamp-1`}
                              >
                                {String.fromCharCode(65 + index)}. {option}
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {formatDate(question.created_at)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/tambah-listening?id=${question.id}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(question.id, question.question)
                            }
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
