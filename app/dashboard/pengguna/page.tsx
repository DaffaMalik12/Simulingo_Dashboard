'use client';

import { Trash2, Edit } from 'lucide-react';

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Student', joined: '2024-01-10', progress: '45%' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'Student', joined: '2024-01-12', progress: '62%' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'Instructor', joined: '2024-01-08', progress: '—' },
];

export default function PenggunaPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pengguna</h1>
        <p className="text-foreground-tertiary mt-2">Manage users and permissions</p>
      </div>

      {/* Users Table */}
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-neutral-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Joined</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Progress</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} className={`border-b border-border hover:bg-neutral-50 transition-colors ${index === users.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-foreground-secondary">{user.email}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.role === 'Student' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground-secondary">{user.joined}</td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{user.progress}</td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                      <Edit size={18} className="text-primary" />
                    </button>
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
