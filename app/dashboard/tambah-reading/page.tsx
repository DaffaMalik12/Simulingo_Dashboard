"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Swal from "sweetalert2";

// Pisahkan komponen yang menggunakan useSearchParams
function TambahReadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const questionId = searchParams.get("id");
  const isEditMode = !!questionId;

  const supabase = createSupabaseBrowser();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [passages, setPassages] = useState<
    Array<{ id: string; title: string | null }>
  >([]);
  const [loadingPassages, setLoadingPassages] = useState(false);

  const [formData, setFormData] = useState({
    passageMode: "existing" as "existing" | "new",
    passageId: "",
    newPassageTitle: "",
    newPassageContent: "",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    difficulty: "easy",
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

  // Load passages
  useEffect(() => {
    loadPassages();
  }, []);

  // Load question data if editing
  useEffect(() => {
    if (isEditMode && questionId) {
      loadQuestionData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId, isEditMode]);

  const loadPassages = async () => {
    setLoadingPassages(true);
    try {
      const { data, error } = await supabase
        .from("reading_passages")
        .select("id, title")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPassages(data || []);
    } catch (error: any) {
      console.error("Error loading passages:", error);
    } finally {
      setLoadingPassages(false);
    }
  };

  const loadQuestionData = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from("reading_questions")
        .select(
          `
          *,
          reading_passages (
            id,
            title,
            content
          )
        `
        )
        .eq("id", questionId)
        .single();

      if (error) throw error;

      if (data) {
        const passage = data.reading_passages;
        const options = data.options || [];

        setFormData({
          passageMode: passage ? "existing" : "new",
          passageId: data.passage_id || "",
          newPassageTitle: passage?.title || "",
          newPassageContent: passage?.content || "",
          question: data.question || "",
          options: options.length >= 4 ? options : [...options, "", "", "", ""].slice(0, 4),
          correctAnswer: data.correct_answer ?? 0,
          difficulty: data.difficulty || "easy",
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to load question",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
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

    // Validation
    if (!formData.question.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill in the question",
      });
      return;
    }

    if (formData.options.filter((opt) => opt.trim()).length < 2) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please provide at least 2 answer options",
      });
      return;
    }

    if (formData.options[formData.correctAnswer]?.trim() === "") {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please select a valid correct answer",
      });
      return;
    }

    setLoading(true);

    try {
      let passageId = formData.passageId;

      // Create new passage if needed
      if (formData.passageMode === "new") {
        if (!formData.newPassageTitle.trim()) {
          Swal.fire({
            icon: "warning",
            title: "Validation Error",
            text: "Please fill in passage title",
          });
          setLoading(false);
          return;
        }

        if (!formData.newPassageContent.trim()) {
          Swal.fire({
            icon: "warning",
            title: "Validation Error",
            text: "Please fill in passage content",
          });
          setLoading(false);
          return;
        }

        const { data: newPassage, error: passageError } = await supabase
          .from("reading_passages")
          .insert({
            title: formData.newPassageTitle.trim(),
            content: formData.newPassageContent.trim(),
            created_by: currentUserId,
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (passageError) throw passageError;

        passageId = newPassage.id;
      } else {
        if (!passageId) {
          Swal.fire({
            icon: "warning",
            title: "Validation Error",
            text: "Please select a passage",
          });
          setLoading(false);
          return;
        }
      }

      // Filter out empty options
      const validOptions = formData.options.filter((opt) => opt.trim() !== "");

      const questionData: any = {
        passage_id: passageId,
        question: formData.question.trim(),
        options: validOptions,
        correct_answer: formData.correctAnswer,
        difficulty: formData.difficulty,
      };

      let data, error;

      if (isEditMode && questionId) {
        // Update existing question
        const result = await supabase
          .from("reading_questions")
          .update(questionData)
          .eq("id", questionId)
          .select();

        data = result.data;
        error = result.error;
      } else {
        // Insert new question
        const result = await supabase
          .from("reading_questions")
          .insert({
            ...questionData,
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
          ? "Reading question updated successfully!"
          : "Reading question created successfully!",
      }).then(() => {
        router.push("/dashboard/reading");
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to save reading question",
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
          <p className="mt-4 text-gray-600">Loading question...</p>
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
            {isEditMode ? "Edit Reading Question" : "Tambah Reading Question"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditMode
              ? "Edit existing reading question"
              : "Create a new reading comprehension question"}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6"
        >
          {/* Passage Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Passage <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.passageMode === "existing"}
                    onChange={() =>
                      setFormData({ ...formData, passageMode: "existing" })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Use Existing Passage
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={formData.passageMode === "new"}
                    onChange={() =>
                      setFormData({ ...formData, passageMode: "new" })
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Create New Passage
                  </span>
                </label>
              </div>

              {formData.passageMode === "existing" ? (
                <select
                  value={formData.passageId}
                  onChange={(e) =>
                    setFormData({ ...formData, passageId: e.target.value })
                  }
                  required
                  disabled={loadingPassages}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition-all"
                >
                  <option value="">Select a passage</option>
                  {passages.map((passage) => (
                    <option key={passage.id} value={passage.id}>
                      {passage.title || "Untitled Passage"}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.newPassageTitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        newPassageTitle: e.target.value,
                      })
                    }
                    placeholder="Passage Title"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-400 transition-all"
                  />
                  <textarea
                    value={formData.newPassageContent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        newPassageContent: e.target.value,
                      })
                    }
                    placeholder="Passage Content (the reading text)"
                    rows={8}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-400 transition-all resize-none"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Question <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              placeholder="Enter the reading question here..."
              rows={4}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-400 transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              Example: "What is the author's main argument?"
            </p>
          </div>

          {/* Difficulty Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Difficulty Level <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              {["easy", "medium", "hard"].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, difficulty: level })
                  }
                  className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                    formData.difficulty === level
                      ? level === "easy"
                        ? "bg-green-600 text-white"
                        : level === "medium"
                        ? "bg-yellow-600 text-white"
                        : "bg-red-600 text-white"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Answer Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Answer Options <span className="text-red-500">*</span>
            </label>

            <div className="space-y-3">
              {formData.options.map((opt, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="radio"
                    checked={formData.correctAnswer === index}
                    onChange={() =>
                      setFormData({ ...formData, correctAnswer: index })
                    }
                    className="w-5 h-5 cursor-pointer accent-blue-600"
                  />

                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-400 transition-all"
                  />

                  <span className="text-sm font-semibold text-gray-700 w-6">
                    {String.fromCharCode(65 + index)}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-500 mt-3">
              <strong>Pilih jawaban benar</strong> dengan klik radio button di
              sebelahnya.
            </p>
          </div>

          {/* Submit Buttons */}
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
                "Update Question"
              ) : (
                "Save Question"
              )}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => router.push("/dashboard/reading")}
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
export default function TambahReadingPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TambahReadingContent />
    </Suspense>
  );
}
