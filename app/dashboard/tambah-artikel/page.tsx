"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ArticleForm from "@/components/article-form";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Swal from "sweetalert2";

// Pisahkan komponen yang menggunakan useSearchParams
function TambahArtikelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get("id");
  const isEditMode = !!articleId;

  const supabase = createSupabaseBrowser();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [existingThumbnailUrl, setExistingThumbnailUrl] = useState<
    string | null
  >(null);

  const [formData, setFormData] = useState({
    title: "",
    coverImage: null as File | null,
    category: "general",
    content: "",
    tags: [] as string[],
    author: "", //
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

  // Load article data if editing
  useEffect(() => {
    if (isEditMode && articleId) {
      loadArticleData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleId, isEditMode]);

  const loadArticleData = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("id", articleId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || "",
          coverImage: null,
          category: data.category || "general",
          content: data.content || "",
          tags: data.tags || [],
          author: data.author || "", // Tambahkan ini
        });
        setExistingThumbnailUrl(data.thumbnail_url);
      }
    } catch (error: any) {
      // ... existing error handling ...
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

    if (
      !formData.title.trim() ||
      !formData.content.trim() ||
      !formData.author.trim()
    ) {
      Swal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Please fill in title, author, and content",
      });
      return;
    }

    setLoading(true);

    try {
      let thumbnailUrl = existingThumbnailUrl;

      // Upload thumbnail if new file is selected
      if (formData.coverImage) {
        const fileExt = formData.coverImage.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${fileExt}`;
        const filePath = fileName;

        // Upload to Post_Article bucket
        const { error: uploadError } = await supabase.storage
          .from("Post_Article")
          .upload(filePath, formData.coverImage, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("Post_Article").getPublicUrl(filePath);

        thumbnailUrl = publicUrl;
      }

      const articleData: any = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        tags: formData.tags,
        thumbnail_url: thumbnailUrl,
        author: formData.author,
      };

      let data, error;

      if (isEditMode && articleId) {
        // Update existing article
        const result = await supabase
          .from("articles")
          .update(articleData)
          .eq("id", articleId)
          .select();

        data = result.data;
        error = result.error;
      } else {
        // Insert new article
        const result = await supabase
          .from("articles")
          .insert({
            ...articleData,
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
          ? "Article updated successfully!"
          : "Article created successfully!",
      }).then(() => {
        router.push("/dashboard/artikel");
      });
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to save article",
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
          <p className="mt-4 text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {isEditMode ? "Edit Artikel" : "Tambah Artikel Baru"}
        </h1>
        <p className="text-foreground-tertiary mt-2">
          {isEditMode
            ? "Edit existing article"
            : "Create a new learning article"}
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-8">
        <ArticleForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          isLoading={loading}
          existingThumbnailUrl={existingThumbnailUrl}
          isEditMode={isEditMode}
        />
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
export default function TambahArtikelPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TambahArtikelContent />
    </Suspense>
  );
}
