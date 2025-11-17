'use client';

import { Upload } from 'lucide-react';

interface ModuleFormProps {
  onCancel: () => void;
}

export default function ModuleForm({ onCancel }: ModuleFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Module uploaded');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Module Title */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Module Title</label>
        <input
          type="text"
          placeholder="Enter module title..."
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground placeholder:text-foreground-tertiary"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Category</label>
        <select className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground">
          <option>Reading</option>
          <option>Listening</option>
          <option>Grammar</option>
          <option>Vocabulary</option>
        </select>
      </div>

      {/* PDF Upload */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">PDF File</label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
          <input type="file" accept=".pdf" className="hidden" id="pdf-upload" />
          <label htmlFor="pdf-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <Upload size={32} className="text-foreground-tertiary" />
              <p className="text-sm font-medium text-foreground">Click to upload PDF</p>
              <p className="text-xs text-foreground-tertiary">PDF up to 100MB</p>
            </div>
          </label>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          Upload Module
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-neutral-100 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
