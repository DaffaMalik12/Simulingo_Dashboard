'use client';

import { Save, Mail } from 'lucide-react';

export default function PengaturanPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Pengaturan</h1>
        <p className="text-foreground-tertiary mt-2">System and platform settings</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">General Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Platform Name</label>
              <input
                type="text"
                defaultValue="Simulingo_Dashboard"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Platform URL</label>
              <input
                type="text"
                defaultValue="https://Simulingo_Dashboard.com"
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground"
              />
            </div>
          </div>
        </div>

        {/* Email Settings */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail size={24} className="text-primary" />
            <h2 className="text-lg font-bold text-foreground">Email Settings</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">SMTP Host</label>
                <input
                  type="text"
                  placeholder="smtp.gmail.com"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">SMTP Port</label>
                <input
                  type="text"
                  placeholder="587"
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-surface text-foreground"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-surface border border-border rounded-lg p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">Notification Settings</h2>
          <div className="space-y-3">
            {[
              { label: 'Email notifications on new submissions', checked: true },
              { label: 'Daily digest email', checked: true },
              { label: 'System alerts', checked: false },
            ].map((item, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={item.checked}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm text-foreground">{item.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors">
            <Save size={18} />
            Save Settings
          </button>
          <button className="px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-neutral-100 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
