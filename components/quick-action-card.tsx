import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  label: string;
  href: string;
  icon: LucideIcon;
}

export default function QuickActionCard({ label, href, icon: Icon }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="bg-surface border border-border rounded-lg p-6 hover:border-primary hover:shadow-lg transition-all group cursor-pointer"
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div className="p-3 bg-neutral-100 group-hover:bg-primary-light rounded-lg transition-colors">
          <Icon size={24} className="text-primary" />
        </div>
        <p className="font-medium text-foreground">{label}</p>
      </div>
    </Link>
  );
}
