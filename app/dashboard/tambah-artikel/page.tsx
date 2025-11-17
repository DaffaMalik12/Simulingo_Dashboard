'use client';

import { useState } from 'react';
import ArticleForm from '@/components/article-form';

export default function TambahArtikelPage() {
  const [formData, setFormData] = useState({
    title: '',
    coverImage: null as File | null,
    category: 'general',
    content: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Article submitted:', formData);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tambah Artikel Baru</h1>
        <p className="text-foreground-tertiary mt-2">Create a new learning article</p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-8">
        <ArticleForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
