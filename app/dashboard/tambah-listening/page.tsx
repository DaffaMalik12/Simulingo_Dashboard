"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Upload, Volume2, X } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Swal from "sweetalert2";

// Pisahkan komponen yang menggunakan useSearchParams
function TambahListeningContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const questionId = searchParams.get("id");
  const isEditMode = !!questionId;

  const supabase = createSupabaseBrowser();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [existingAudioUrl, setExistingAudioUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    question: "",
    audio: null as File | null,
    options: ["", "", "", ""],
    correctAnswer: 0,
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

  // Load question data if editing
  useEffect(() => {
    if (isEditMode && questionId) {
      loadQuestionData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId, isEditMode]);

  const loadQuestionData = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from("listening_questions")
        .select("*")
        .eq("id", questionId)
        .single();

      if (error) throw error;

      if (data) {
        const options = data.options || [];

        setFormData({
          question: data.question || "",
          audio: null,
          options:
            options.length >= 4
              ? options
              : [...options, "", "", "", ""].slice(0, 4),
          correctAnswer: data.correct_answer ?? 0,
        });
        setExistingAudioUrl(data.audio_url);
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

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];

      // Validate file type
      if (!file.type.startsWith("audio/")) {
        Swal.fire({
          icon: "warning",
          title: "Invalid File",
          text: "Only audio files are allowed!",
        });
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        Swal.fire({
          icon: "warning",
          title: "File Too Large",
          text: "Audio should be less than 50MB",
        });
        return;
      }

      setFormData({ ...formData, audio: file });
    }
  };

  const removeAudio = () => {
    setFormData({ ...formData, audio: null });
    setExistingAudioUrl(null);
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

    // Validasi: untuk create baru, harus ada audio file
    // Untuk edit, boleh tidak upload file baru jika sudah ada existing audio
    if (!isEditMode && !formData.audio) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please upload an audio file",
      });
      return;
    }

    // Validasi: untuk edit, harus ada audio file ATAU existing audio
    if (isEditMode && !formData.audio && !existingAudioUrl) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please upload an audio file",
      });
      return;
    }

    setLoading(true);

    try {
      let audioUrl = existingAudioUrl;

      // Upload audio file if new file is selected
      if (formData.audio) {
        const fileExt = formData.audio.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;
        const filePath = `audio/${fileName}`;

        // Upload to audio bucket
        const { error: uploadError } = await supabase.storage
          .from("audio")
          .upload(filePath, formData.audio, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("audio").getPublicUrl(filePath);

        audioUrl = publicUrl;
        console.log("Uploaded audio URL:", audioUrl);
      }

      // Filter out empty options
      const validOptions = formData.options.filter((opt) => opt.trim() !== "");

      const questionData: any = {
        audio_url: audioUrl || null,
        question: formData.question.trim(),
        options: validOptions,
        correct_answer: formData.correctAnswer,
      };

      console.log("Saving question data:", questionData);

      let data, error;

      if (isEditMode && questionId) {
        // Update existing question
        const result = await supabase
          .from("listening_questions")
          .update(questionData)
          .eq("id", questionId)
          .select();

        data = result.data;
        error = result.error;
      } else {
        // Insert new question
        const result = await supabase
          .from("listening_questions")
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

      // Log hasil untuk debugging
      console.log("Question saved successfully:", data);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: isEditMode
          ? "Listening question updated successfully!"
          : "Listening question created successfully!",
      }).then(() => {
        router.push("/dashboard/listening");
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to save listening question",
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

  const hasAudio = formData.audio || existingAudioUrl;

  return (
    <div className="flex flex-col items-center min-h-screen py-8">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode
              ? "Edit Listening Question"
              : "Tambah Listening Question"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditMode
              ? "Edit existing listening question"
              : "Create a new listening comprehension question"}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 space-y-6"
        >
          {/* Audio Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Audio File{" "}
              {!isEditMode && <span className="text-red-500">*</span>}
            </label>

            {!hasAudio ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                  id="audio-upload"
                />
                <label htmlFor="audio-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Upload size={32} className="text-blue-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      Click to upload audio or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      MP3, WAV, OGG up to 50MB
                    </p>
                  </div>
                </label>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 bg-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Volume2 size={20} className="text-white" />
                    </div>
                    <div>
                      {formData.audio ? (
                        <>
                          <p className="text-sm font-medium text-gray-900">
                            {formData.audio.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(formData.audio.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </>
                      ) : existingAudioUrl ? (
                        <>
                          <p className="text-sm font-medium text-gray-900">
                            Current Audio File
                          </p>
                          <a
                            href={existingAudioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Play Audio
                          </a>
                        </>
                      ) : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeAudio}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Change Audio Button */}
            {hasAudio && (
              <div className="flex items-center justify-center mt-3">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  className="hidden"
                  id="audio-upload-change"
                />
                <label
                  htmlFor="audio-upload-change"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer text-sm font-medium"
                >
                  Change Audio
                </label>
              </div>
            )}
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Question Text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              placeholder="Enter the listening comprehension question here..."
              rows={4}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder:text-gray-400 transition-all resize-none"
            />
          </div>

          {/* Answer Options */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Answer Options <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              {formData.options.map((option, index) => (
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
                    value={option}
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
              onClick={() => router.push("/dashboard/listening")}
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
export default function TambahListeningPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TambahListeningContent />
    </Suspense>
  );
}
