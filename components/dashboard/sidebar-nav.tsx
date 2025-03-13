"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Users, 
  ShoppingCart, 
  BarChart3, 
  Package, 
  Settings, 
  Calendar, 
  MessageSquare, 
  DollarSign
} from "lucide-react";

interface SidebarNavProps {
  className?: string;
}

export function SidebarNav({ className }: SidebarNavProps) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/protected", icon: Home },
    { name: "Customers", href: "/protected/customers", icon: Users },
    { name: "Sales", href: "/protected/sales", icon: ShoppingCart },
    { name: "Inventory", href: "/protected/inventory", icon: Package },
    { name: "Analytics", href: "/protected/analytics", icon: BarChart3 },
    { name: "Finance", href: "/protected/finance", icon: DollarSign },
    { name: "Calendar", href: "/protected/calendar", icon: Calendar },
    { name: "Messages", href: "/protected/messages", icon: MessageSquare },
    { name: "Settings", href: "/protected/settings", icon: Settings },
  ];

  return (
    <nav className={`flex flex-col space-y-1 ${className}`}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center py-2 px-4 text-sm font-medium rounded-md transition-all ${
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            }`}
          >
            <item.icon className="mr-3 h-4 w-4" />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}