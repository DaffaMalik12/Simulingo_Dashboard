'use client';

import { Upload } from 'lucide-react';
import { useState } from 'react';

interface ArticleFormProps {
  formData: {
    title: string;
    coverImage: File | null;
    category: string;
    content: string;
  };
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ArticleForm({ formData, setFormData, onSubmit }: ArticleFormProps) {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData({ ...formData, coverImage: e.target.files[0] });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Article Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter article title..."
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground placeholder:text-foreground-tertiary"
        />
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Cover Image</label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
          <input
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
                {formData.coverImage ? formData.coverImage.name : 'Click to upload image or drag and drop'}
              </p>
              <p className="text-xs text-foreground-tertiary">PNG, JPG, GIF up to 10MB</p>
            </div>
          </label>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Category</label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground"
        >
          <option value="general">General</option>
          <option value="grammar">Grammar Tips</option>
          <option value="vocabulary">Vocabulary</option>
          <option value="reading">Reading Strategies</option>
          <option value="listening">Listening Tips</option>
        </select>
      </div>

      {/* Content Editor */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Content</label>
        <textarea
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Write your article content here..."
          rows={10}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground placeholder:text-foreground-tertiary font-mono text-sm"
        />
        <p className="text-xs text-foreground-tertiary mt-2">Markdown is supported</p>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Publish Article
        </button>
        <button
          type="button"
          className="px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-neutral-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
