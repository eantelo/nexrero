"use client";

import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  UserPlus, 
  FileText, 
  PackagePlus, 
  Mail,
  Phone
} from "lucide-react";

export function QuickActions() {
  const actions = [
    { name: "New Sale", icon: PlusCircle, color: "bg-blue-100 text-blue-600 hover:bg-blue-200" },
    { name: "Add Customer", icon: UserPlus, color: "bg-green-100 text-green-600 hover:bg-green-200" },
    { name: "Create Invoice", icon: FileText, color: "bg-purple-100 text-purple-600 hover:bg-purple-200" },
    { name: "Add Product", icon: PackagePlus, color: "bg-orange-100 text-orange-600 hover:bg-orange-200" },
    { name: "Send Email", icon: Mail, color: "bg-red-100 text-red-600 hover:bg-red-200" },
    { name: "Call Contact", icon: Phone, color: "bg-teal-100 text-teal-600 hover:bg-teal-200" },
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((action) => (
          <Button
            key={action.name}
            variant="outline"
            className={`flex flex-col h-24 items-center justify-center gap-2 ${action.color}`}
          >
            <action.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{action.name}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}