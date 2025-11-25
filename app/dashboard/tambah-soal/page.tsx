"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import QuestionForm from "@/components/question-form";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Swal from "sweetalert2";

export default function TambahSoalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const questionId = searchParams.get("id");
  const supabase = createSupabaseBrowser();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    exam_category: "",
    type: "reading",
    question: "",
    options: ["", "", "", ""],
    correct_answer: 0,
    audio: null as File | null,
    audio_url: undefined as string | undefined,
    passage: "",
    difficulty: "medium",
    time_limit_seconds: undefined as number | undefined,
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
  }, [supabase]);

  // Load question data if editing
  useEffect(() => {
    if (questionId) {
      loadQuestionData();
    }
  }, [questionId]);

  const loadQuestionData = async () => {
    try {
      setLoadingData(true);
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("id", questionId)
        .single();

      if (error) throw error;

      if (data) {
        setIsEditMode(true);
        setFormData({
          exam_category: data.exam_category || "",
          type: data.type || "reading",
          question: data.question || "",
          options: data.options || ["", "", "", ""],
          correct_answer: data.correct_answer || 0,
          audio: null,
          audio_url: data.audio_url || undefined,
          passage: data.passage || "",
          difficulty: data.difficulty || "medium",
          time_limit_seconds: data.time_limit_seconds || undefined,
        });
      }
    } catch (error: any) {
      console.error("Error loading question:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to load question",
      });
      router.push("/dashboard/soal-toefl");
    } finally {
      setLoadingData(false);
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

    if (!formData.exam_category) {
      Swal.fire({
        icon: "warning",
        title: "Missing Category",
        text: "Please select exam category",
      });
      return;
    }

    if (formData.options.some((opt) => !opt.trim())) {
      Swal.fire({
        icon: "warning",
        title: "Incomplete Options",
        text: "Please fill all answer options",
      });
      return;
    }

    setLoading(true);

    try {
      let audioUrl = formData.audio_url;

      // Upload audio file if exists (only if new file is uploaded)
      if (formData.audio) {
        const fileExt = formData.audio.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `audio/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("audio")
          .upload(filePath, formData.audio);

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("audio").getPublicUrl(filePath);

        audioUrl = publicUrl;
      }

      const updateData = {
        exam_category: formData.exam_category,
        type: formData.type,
        question: formData.question,
        options: formData.options,
        correct_answer: formData.correct_answer,
        audio_url: audioUrl || null,
        passage: formData.passage || null,
        difficulty: formData.difficulty,
        time_limit_seconds: formData.time_limit_seconds || null,
      };

      let data, error;

      if (isEditMode && questionId) {
        // Update existing question
        const result = await supabase
          .from("questions")
          .update(updateData)
          .eq("id", questionId)
          .select();

        data = result.data;
        error = result.error;
      } else {
        // Insert new question
        const insertData = {
          ...updateData,
          created_by: currentUserId,
        };

        const result = await supabase
          .from("questions")
          .insert(insertData)
          .select();

        data = result.data;
        error = result.error;
      }

      if (error) {
        throw error;
      }

      // SweetAlert success
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: isEditMode
          ? "Question updated successfully!"
          : "Question added successfully!",
        confirmButtonColor: "#2563eb",
      });

      // Redirect berdasarkan exam_category
      if (formData.exam_category === "ielts") {
        router.push("/dashboard/soal-toafl");
      } else {
        router.push("/dashboard/soal-toefl");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.message ||
          (isEditMode ? "Failed to update question" : "Failed to add question"),
        confirmButtonColor: "#dc2626",
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
          <p className="mt-4 text-gray-600">Loading question data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isEditMode ? "Edit Soal" : "Tambah Soal Baru"}
        </h1>
        <p className="text-foreground-tertiary mt-2">
          {isEditMode
            ? "Edit existing TOEFL/TOAFL question"
            : "Create a new TOEFL/TOAFL question"}
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-8">
        <QuestionForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          loading={loading}
          isEditMode={isEditMode}
        />
      </div>
    </div>
  );
}
