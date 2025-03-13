"use client";

import { 
  LucideIcon,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  BarChart3,
  Calendar,
  MessageSquare,
  Settings,
  TrendingUp
} from "lucide-react";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  iconName: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

// Map of icon names to icon components
const iconMap: Record<string, LucideIcon> = {
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  BarChart3,
  Calendar,
  MessageSquare,
  Settings,
  TrendingUp
};

export function StatsCard({
  title,
  value,
  description,
  iconName,
  trend,
  className,
}: StatsCardProps) {
  // Get the icon component from the map
  const Icon = iconMap[iconName] || Users; // Default to Users icon if not found
  
  return (
    <div className={`bg-card rounded-lg border p-6 shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="rounded-full bg-secondary/20 p-2">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
      </div>
      <div className="mt-2">
        <h2 className="text-3xl font-bold">{value}</h2>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="mt-2 flex items-center gap-1 text-xs">
            <span
              className={
                trend.isPositive ? "text-green-500" : "text-red-500"
              }
            >
              {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
            </span>
            <span className="text-muted-foreground">from last month</span>
          </div>
        )}
      </div>
    </div>
  );
}