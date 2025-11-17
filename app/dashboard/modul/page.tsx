'use client';

import { useState } from 'react';
import ModuleForm from '@/components/module-form';
import { FileCheck, Trash2 } from 'lucide-react';

const existingModules = [
  { id: 1, title: 'TOEFL Reading Basics', category: 'reading', uploaded: '2024-01-15' },
  { id: 2, title: 'Grammar Essentials', category: 'grammar', uploaded: '2024-01-10' },
];

export default function ModulPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Modul PDF</h1>
          <p className="text-foreground-tertiary mt-2">Manage learning modules</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
        >
          {showForm ? 'Hide Form' : 'Upload Modul'}
        </button>
      </div>

      {showForm && (
        <div className="bg-surface border border-border rounded-lg p-8">
          <ModuleForm onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Existing Modules */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Existing Modules</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Module Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Uploaded</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {existingModules.map((module) => (
                <tr key={module.id} className="border-b border-border hover:bg-neutral-100 transition-colors">
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-3">
                      <FileCheck size={18} className="text-primary" />
                      <span className="font-medium text-foreground">{module.title}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground-secondary">{module.category}</td>
                  <td className="px-4 py-3 text-sm text-foreground-secondary">{module.uploaded}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                      <Trash2 size={18} className="text-accent-error" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
