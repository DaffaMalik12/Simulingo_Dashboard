"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QuestionForm from "@/components/question-form";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

export default function TambahSoalPage() {
  const router = useRouter();
  const supabase = createSupabaseBrowser();
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      alert("User not authenticated");
      return;
    }

    if (!formData.exam_category) {
      alert("Please select exam category");
      return;
    }

    if (formData.options.some((opt) => !opt.trim())) {
      alert("Please fill all answer options");
      return;
    }

    setLoading(true);

    try {
      let audioUrl = formData.audio_url;

      // Upload audio file if exists
      if (formData.audio) {
        const fileExt = formData.audio.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `audio/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("audio") // Make sure you have a storage bucket named 'audio'
          .upload(filePath, formData.audio);

        if (uploadError) {
          throw uploadError;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("audio").getPublicUrl(filePath);

        audioUrl = publicUrl;
      }

      // Debug: Log nilai yang akan di-insert
      console.log("Form Data Exam Category:", formData.exam_category);
      console.log("Full Form Data:", formData);

      // Insert question to database
      const insertData = {
        exam_category: formData.exam_category, // Pastikan ini "etic" atau "toafl"
        type: formData.type,
        question: formData.question,
        options: formData.options,
        correct_answer: formData.correct_answer,
        audio_url: audioUrl || null,
        passage: formData.passage || null,
        difficulty: formData.difficulty,
        created_by: currentUserId,
      };

      console.log("Data to insert:", insertData);

      const { data, error } = await supabase
        .from("questions")
        .insert(insertData)
        .select();

      if (error) {
        console.error("Insert error:", error);
        throw error;
      }

      console.log("Inserted data:", data);

      alert("Question added successfully!");

      // Redirect berdasarkan exam_category
      if (formData.exam_category === "ielts") {
        router.push("/dashboard/soal-toafl");
      } else {
        router.push("/dashboard/soal-toefl");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      alert(`Error: ${error.message || "Failed to add question"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tambah Soal Baru</h1>
        <p className="text-foreground-tertiary mt-2">
          Create a new TOEFL/TOAFL question
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-8">
        <QuestionForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}
