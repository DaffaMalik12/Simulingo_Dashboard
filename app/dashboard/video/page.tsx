'use client';

import { Video, Trash2 } from 'lucide-react';

const videos = [
  { id: 1, title: 'Introduction to TOEFL', duration: '12:45', uploaded: '2024-01-20' },
  { id: 2, title: 'Reading Comprehension Tips', duration: '18:30', uploaded: '2024-01-18' },
];

export default function VideoPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Video Pembelajaran</h1>
          <p className="text-foreground-tertiary mt-2">Manage learning videos</p>
        </div>
        <button className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors">
          Add Video
        </button>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-surface border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-gradient-to-br from-neutral-200 to-neutral-300 h-40 flex items-center justify-center">
              <Video size={48} className="text-foreground-tertiary" />
            </div>
            <div className="p-4">
              <h3 className="font-bold text-foreground truncate">{video.title}</h3>
              <p className="text-sm text-foreground-secondary mt-1">Duration: {video.duration}</p>
              <p className="text-xs text-foreground-tertiary mt-1">Uploaded: {video.uploaded}</p>
              <div className="flex gap-2 mt-4">
                <button className="flex-1 px-3 py-2 bg-primary/10 text-primary text-sm font-medium rounded hover:bg-primary/20 transition-colors">
                  Edit
                </button>
                <button className="p-2 hover:bg-red-100 rounded transition-colors">
                  <Trash2 size={18} className="text-accent-error" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
