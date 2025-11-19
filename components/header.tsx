"use client";

import { useState, useEffect, useRef } from "react";
import { User, LogOut } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const [open, setOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [role, setRole] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const supabase = createSupabaseBrowser();
  const router = useRouter();

  // Ambil data user dari Supabase
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserEmail(data.user.email || "Admin");
        setRole((data.user.user_metadata?.role as string) || "Admin");
      }
    };
    getUser();
  }, []);

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout user
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header className="w-full bg-white shadow-sm px-6 py-4 flex items-center justify-between">
      {/* Left Side - Logo / Title */}
      <h1 className="text-lg font-semibold text-neutral-800">Dashboard</h1>

      {/* Right Side - User Dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-3 px-4 py-2 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-foreground">{userEmail}</p>
            <p className="text-xs text-foreground-tertiary">{role}</p>
          </div>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg border rounded-lg py-2 animate-in fade-in slide-in-from-top-2 z-50">
            <button
              className="flex items-center gap-2 px-4 py-2 hover:bg-neutral-100 w-full text-left"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
