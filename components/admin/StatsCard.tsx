import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  change?: string;
}

export default function StatsCard({ title, value, icon: Icon, color = "#1A5276", change }: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-xs mt-1 ${change.startsWith("+") ? "text-green-500" : "text-red-500"}`}>
              {change} vs semana anterior
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={22} style={{ color }} />
        </div>
      </div>
    </div>
  );
}
