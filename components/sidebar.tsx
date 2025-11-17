'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileText, 
  Video, 
  Dumbbell, 
  FileCheck, 
  Badge, 
  Users, 
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Book,
  ClipboardList
} from 'lucide-react';

const menuItems = [
  { 
    label: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard 
  },
  {
    label: 'Soal',
    icon: BookOpen,
    subItems: [
      { label: 'Soal TOEFL', href: '/dashboard/soal-toefl',  icon: ClipboardList },
      { label: 'Soal TOAFL', href: '/dashboard/soal-toafl', icon: ClipboardList   },
     
    ]
  },
  {
    label: 'Latihan',
    icon: Dumbbell,
    subItems: [
      { label: 'Vocabulary', href: '/dashboard/vocabulary', icon: Book },
      { label: 'Grammar', href: '/dashboard/grammar', icon: Book },
      { label: 'Reading', href: '/dashboard/reading', icon: Book },
      { label: 'Listening', href: '/dashboard/listening', icon: Book },
      { label: 'Structure', href: '/dashboard/structure', icon: Book },
    ]
  },
  {
    label: 'Artikel',
    icon: FileText,
    href: '/dashboard/artikel'
  },
  { 
    label: 'Video', 
    href: '/dashboard/video', 
    icon: Video 
  },
  { 
    label: 'Modul PDF', 
    href: '/dashboard/modul', 
    icon: FileCheck 
  },
  { 
    label: 'Badge', 
    href: '/dashboard/badge', 
    icon: Badge 
  },
  { 
    label: 'Pengguna', 
    href: '/dashboard/pengguna', 
    icon: Users 
  },
  { 
    label: 'Pengaturan', 
    href: '/dashboard/pengaturan', 
    icon: Settings 
  },
];

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const pathname = usePathname();
  const [openDropdowns, setOpenDropdowns] = useState<string[]>([]);

  const toggleDropdown = (label: string) => {
    setOpenDropdowns(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const isParentActive = (subItems?: Array<{ href: string }>) => {
    if (!subItems) return false;
    return subItems.some(item => pathname === item.href);
  };

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-0'} bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden flex flex-col h-screen`}>
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Simulingo</h1>
        <p className="text-xs text-gray-500 mt-1">Admin Dashboard</p>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isDropdownOpen = openDropdowns.includes(item.label);
            const isActive = item.href ? pathname === item.href : isParentActive(item.subItems);

            if (hasSubItems) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleDropdown(item.label)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </div>
                    {isDropdownOpen ? (
                      <ChevronDown size={16} className="text-gray-500" />
                    ) : (
                      <ChevronRight size={16} className="text-gray-500" />
                    )}
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.subItems?.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const isSubActive = pathname === subItem.href;
                        return (
                          <Link
                            key={subItem.label}
                            href={subItem.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                              isSubActive 
                                ? 'bg-blue-50 text-blue-700 font-medium' 
                                : 'text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {SubIcon && <SubIcon size={16} />}
                            <span>{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href!}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs font-medium text-gray-500">Admin</p>
          <p className="text-sm font-semibold text-gray-900 mt-0.5">admin@edutoefl.com</p>
        </div>
      </div>
    </aside>
  );
}