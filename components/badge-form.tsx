'use client';

import { Upload } from 'lucide-react';

interface BadgeFormProps {
  onCancel: () => void;
}

export default function BadgeForm({ onCancel }: BadgeFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Badge created');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Badge Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Badge Name</label>
          <input
            type="text"
            placeholder="Badge name..."
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground placeholder:text-foreground-tertiary"
          />
        </div>

        {/* Trigger Event */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-3">Trigger Event</label>
          <select className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground">
            <option>Complete N questions</option>
            <option>Achieve N% score</option>
            <option>Complete section</option>
            <option>Milestone</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Description</label>
        <textarea
          placeholder="Badge description..."
          rows={3}
          className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground placeholder:text-foreground-tertiary"
        />
      </div>

      {/* Icon Upload */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Badge Icon</label>
        <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
          <input type="file" accept="image/*" className="hidden" id="icon-upload" />
          <label htmlFor="icon-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <Upload size={32} className="text-foreground-tertiary" />
              <p className="text-sm font-medium text-foreground">Click to upload icon</p>
              <p className="text-xs text-foreground-tertiary">PNG or SVG, max 5MB</p>
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
          Create Badge
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
