'use client';

import { Menu, Bell, User } from 'lucide-react';

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="bg-surface border-b border-border">
      <div className="px-8 py-4 flex items-center justify-between">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <Menu size={20} className="text-foreground" />
        </button>

        <div className="flex items-center gap-6">
          <button className="p-2 hover:bg-neutral-100 rounded-lg transition-colors relative">
            <Bell size={20} className="text-foreground-secondary" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-error rounded-full"></span>
          </button>

          <button className="flex items-center gap-3 px-4 py-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">Admin User</p>
              <p className="text-xs text-foreground-tertiary">Super Admin</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
