'use client';

import { useState } from 'react';
import BadgeForm from '@/components/badge-form';
import { Award, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';

const existingBadges = [
  { id: 1, name: 'Quick Learner', description: 'Complete 10 questions', icon: '⚡' },
  { id: 2, name: 'Reading Master', description: 'Score 90% on reading tests', icon: '📖' },
];

export default function BadgePage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Badge/Lencana</h1>
          <p className="text-foreground-tertiary mt-2">Manage achievement badges</p>
        </div>
       <Link href="/dashboard/tambah-badge" className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          Tambah Badge
        </Link>
      </div>

      {showForm && (
        <div className="bg-surface border border-border rounded-lg p-8">
          <BadgeForm onCancel={() => setShowForm(false)} />
        </div>
      )}

      {/* Existing Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {existingBadges.map((badge) => (
          <div key={badge.id} className="bg-surface border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="text-5xl">{badge.icon}</div>
              <button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                <Trash2 size={18} className="text-accent-error" />
              </button>
            </div>
            <h3 className="text-lg font-bold text-foreground">{badge.name}</h3>
            <p className="text-sm text-foreground-secondary mt-2">{badge.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
