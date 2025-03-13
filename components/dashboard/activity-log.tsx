"use client";

import { User, CheckCircle, Users, ShoppingCart, AlertCircle, Package } from "lucide-react";
import { Badge } from "../ui/badge";

// Sample activity data
const activities = [
  {
    id: 1,
    type: "customer",
    action: "New customer registered",
    name: "John Smith",
    time: "2 hours ago",
    icon: User,
    status: "success",
  },
  {
    id: 2,
    type: "sale",
    action: "New order placed",
    name: "Order #38294",
    time: "5 hours ago",
    icon: ShoppingCart,
    status: "success",
  },
  {
    id: 3,
    type: "inventory",
    action: "Low stock alert",
    name: "Product XYZ",
    time: "1 day ago",
    icon: Package,
    status: "warning",
  },
  {
    id: 4,
    type: "team",
    action: "Team member added",
    name: "Jane Cooper",
    time: "2 days ago",
    icon: Users,
    status: "info",
  },
];

export function ActivityLog() {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            className="flex items-start gap-4 rounded-md border p-4"
          >
            <div className={`rounded-full p-2 ${
              activity.status === "success" 
                ? "bg-green-100" 
                : activity.status === "warning"
                  ? "bg-yellow-100"
                  : "bg-blue-100"
            }`}>
              <activity.icon className={`h-4 w-4 ${
                activity.status === "success" 
                  ? "text-green-600" 
                  : activity.status === "warning"
                    ? "text-yellow-600"
                    : "text-blue-600"
              }`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-medium">{activity.action}</p>
                <Badge variant="outline" className="text-xs">{activity.time}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{activity.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}