"use client";

import { Save, Mail, Settings, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import Swal from "sweetalert2";

export default function PengaturanPage() {
  const supabase = createSupabaseBrowser();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load maintenance mode status
  useEffect(() => {
    loadMaintenanceMode();
  }, []);

  const loadMaintenanceMode = async () => {
    try {
      const { data, error } = await supabase
        .from("maintenance_mode")
        .select("active")
        .limit(1)
        .single();

      if (error) throw error;

      if (data) {
        setMaintenanceMode(data.active || false);
      }
    } catch (error: any) {
      console.error("Error loading maintenance mode:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to load maintenance mode status",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMaintenanceModeToggle = async (checked: boolean) => {
    // Jika ingin mengaktifkan maintenance mode, tampilkan konfirmasi
    if (checked) {
      const result = await Swal.fire({
        title: "Enable Maintenance Mode?",
        html: `
          <div class="text-left">
            <p class="mb-3">Are you sure you want to enable maintenance mode?</p>
            <div class="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
              <p class="text-sm text-orange-800 font-semibold mb-2">⚠️ Warning:</p>
              <ul class="text-sm text-orange-700 list-disc list-inside space-y-1">
                <li>The platform will be temporarily unavailable to all users</li>
                <li>Users will see a maintenance message instead of the platform</li>
                <li>Only administrators can access the dashboard</li>
              </ul>
            </div>
            <p class="text-sm text-gray-600">This action can be reversed at any time.</p>
          </div>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#f97316",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, Enable Maintenance Mode",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      // Jika user cancel, jangan update
      if (!result.isConfirmed) {
        return;
      }
    } else {
      // Jika ingin mematikan maintenance mode, juga tampilkan konfirmasi
      const result = await Swal.fire({
        title: "Disable Maintenance Mode?",
        html: `
          <div class="text-left">
            <p class="mb-3">Are you sure you want to disable maintenance mode?</p>
            <p class="text-sm text-gray-600">The platform will be accessible to all users again.</p>
          </div>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#10b981",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Yes, Disable Maintenance Mode",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      });

      // Jika user cancel, jangan update
      if (!result.isConfirmed) {
        return;
      }
    }

    setSaving(true);
    try {
      // Update maintenance mode (karena hanya 1 row, kita update semua row)
      const { error } = await supabase
        .from("maintenance_mode")
        .update({ active: checked })
        .eq("id", 1);

      if (error) {
        throw error;
      }

      setMaintenanceMode(checked);

      Swal.fire({
        icon: "success",
        title: "Success",
        text: checked
          ? "Maintenance mode has been enabled"
          : "Maintenance mode has been disabled",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error("Error updating maintenance mode:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update maintenance mode",
      });
      // Revert the toggle on error
      setMaintenanceMode(!checked);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pengaturan</h1>
        <p className="text-gray-600 mt-2">System and platform settings</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Maintenance Mode */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle size={24} className="text-orange-600" />
            <h2 className="text-lg font-bold text-gray-900">
              Maintenance Mode
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Enable Maintenance Mode
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  When enabled, the platform will be temporarily unavailable to
                  users
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) =>
                    handleMaintenanceModeToggle(e.target.checked)
                  }
                  disabled={loading || saving}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>
            {maintenanceMode && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  <strong>Warning:</strong> Maintenance mode is currently
                  active. Users will not be able to access the platform.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
