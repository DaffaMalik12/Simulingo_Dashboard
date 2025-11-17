'use client';

import { useState } from 'react';
import { Upload, X } from 'lucide-react';

interface QuestionFormProps {
  formData: {
    question: string;
    type: string;
    audio: File | null;
    options: string[];
    correctAnswer: number;
    difficulty: string;
  };
  setFormData: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function QuestionForm({ formData, setFormData, onSubmit }: QuestionFormProps) {
  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData({ ...formData, audio: e.target.files[0] });
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Question Text */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Question Text</label>
        <textarea
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          placeholder="Enter the question text here..."
          rows={4}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground placeholder:text-foreground-tertiary"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Question Type */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Question Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground"
          >
            <option value="reading">Reading</option>
            <option value="listening">Listening</option>
            <option value="structure">Structure</option>
          </select>
        </div>

        {/* Difficulty Level */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Difficulty Level</label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Audio Upload (for Listening) */}
      {formData.type === 'listening' && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Audio File</label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className="hidden"
              id="audio-upload"
            />
            <label htmlFor="audio-upload" className="cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <Upload size={32} className="text-foreground-tertiary" />
                <p className="text-sm font-medium text-foreground">
                  {formData.audio ? formData.audio.name : 'Click to upload audio or drag and drop'}
                </p>
                <p className="text-xs text-foreground-tertiary">MP3, WAV, OGG up to 50MB</p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Multiple Choice Options */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Answer Options</label>
        <div className="space-y-3">
          {formData.options.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="radio"
                name="correctAnswer"
                checked={formData.correctAnswer === index}
                onChange={() => setFormData({ ...formData, correctAnswer: index })}
                className="w-4 h-4 cursor-pointer accent-primary"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground placeholder:text-foreground-tertiary"
                />
              </div>
              <span className="text-sm font-medium text-foreground-tertiary min-w-fit">
                {String.fromCharCode(65 + index)}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-foreground-tertiary mt-3">Select the correct answer by clicking the radio button</p>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Add Question
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
