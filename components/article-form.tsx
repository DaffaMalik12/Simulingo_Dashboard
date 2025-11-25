"use client";

import {
  Upload,
  X,
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo,
  Redo,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface ArticleFormProps {
  formData: {
    title: string;
    coverImage: File | null;
    category: string;
    content: string;
    author?: string;
  };
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  existingThumbnailUrl?: string | null;
  isEditMode?: boolean;
}

export default function ArticleForm({
  formData,
  setFormData,
  onSubmit,
  isLoading = false,
  existingThumbnailUrl = null,
  isEditMode = false,
}: ArticleFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rich Text Editor
  const editor = useEditor({
    extensions: [StarterKit],
    content: formData.content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setFormData({ ...formData, content: editor.getHTML() });
    },
  });

  // Set image preview after mount to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    if (existingThumbnailUrl) {
      setImagePreview(existingThumbnailUrl);
    }
  }, [existingThumbnailUrl]);

  // Update editor when formData.content changes externally
  useEffect(() => {
    if (editor && formData.content !== editor.getHTML()) {
      editor.commands.setContent(formData.content);
    }
  }, [formData.content, editor]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size should be less than 10MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }

      setFormData({ ...formData, coverImage: file });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, coverImage: null });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Don't render image preview until mounted to avoid hydration mismatch
  const showImagePreview = isMounted && imagePreview;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Article Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter article title..."
          required
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground placeholder:text-foreground-tertiary"
        />
      </div>

      {/* Author */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Author <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.author || ""}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          placeholder="Enter author name..."
          required
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground placeholder:text-foreground-tertiary"
        />
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Cover Image
        </label>

        {showImagePreview ? (
          <div className="relative">
            <div className="border-2 border-border rounded-lg overflow-hidden bg-gray-50">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-[400px] object-contain mx-auto"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload size={32} className="text-foreground-tertiary" />
                <p className="text-sm font-medium text-foreground">
                  Click to upload image or drag and drop
                </p>
                <p className="text-xs text-foreground-tertiary">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Category <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          required
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground"
        >
          <option value="general">General</option>
          <option value="grammar">Grammar Tips</option>
          <option value="vocabulary">Vocabulary</option>
          <option value="reading">Reading Strategies</option>
          <option value="listening">Listening Tips</option>
        </select>
      </div>

      {/* Content Editor with Rich Text */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Content <span className="text-red-500">*</span>
        </label>

        {/* Toolbar */}
        <div className="border border-border rounded-t-lg bg-surface p-2 flex gap-1 flex-wrap">
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-neutral-100 transition-colors ${
              editor?.isActive("bold") ? "bg-neutral-200" : ""
            }`}
            title="Bold"
          >
            <Bold size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-neutral-100 transition-colors ${
              editor?.isActive("italic") ? "bg-neutral-200" : ""
            }`}
            title="Italic"
          >
            <Italic size={18} />
          </button>
          <div className="w-px bg-border mx-1"></div>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-neutral-100 transition-colors ${
              editor?.isActive("bulletList") ? "bg-neutral-200" : ""
            }`}
            title="Bullet List"
          >
            <List size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-neutral-100 transition-colors ${
              editor?.isActive("orderedList") ? "bg-neutral-200" : ""
            }`}
            title="Numbered List"
          >
            <ListOrdered size={18} />
          </button>
          <div className="w-px bg-border mx-1"></div>
          <button
            type="button"
            onClick={() => editor?.chain().focus().undo().run()}
            disabled={!editor?.can().undo()}
            className="p-2 rounded hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo size={18} />
          </button>
          <button
            type="button"
            onClick={() => editor?.chain().focus().redo().run()}
            disabled={!editor?.can().redo()}
            className="p-2 rounded hover:bg-neutral-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo size={18} />
          </button>
        </div>

        {/* Editor Content */}
        <EditorContent
          editor={editor}
          className="border-x border-b border-border rounded-b-lg bg-surface min-h-[300px] p-4 prose prose-sm max-w-none focus-within:ring-2 focus-within:ring-primary"
        />

        <p className="text-xs text-foreground-tertiary mt-2">
          Use the toolbar above to format your content
        </p>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading
            ? "Saving..."
            : isEditMode
            ? "Update Article"
            : "Publish Article"}
        </button>
        <button
          type="button"
          disabled={isLoading}
          onClick={() => window.history.back()}
          className="px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-neutral-100 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
