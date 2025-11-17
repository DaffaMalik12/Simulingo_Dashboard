'use client';

import { useState } from 'react';
import QuestionForm from '@/components/question-form';

export default function TambahSoalPage() {
  const [formData, setFormData] = useState({
    question: '',
    type: 'reading',
    audio: null as File | null,
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'medium',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tambah Soal Baru</h1>
        <p className="text-foreground-tertiary mt-2">Create a new TOEFL/TOAFL question</p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-8">
        <QuestionForm formData={formData} setFormData={setFormData} onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
