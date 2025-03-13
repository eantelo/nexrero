import { ActivityLog } from "@/components/dashboard/activity-log";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { StatsCard } from "@/components/dashboard/stats-card";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return redirect("/sign-in");
  }
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader user={user} />
      
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r lg:block p-6">
          <SidebarNav />
        </aside>
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
              <p className="text-muted-foreground">
                Welcome back! Here's an overview of your business.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Customers"
                value="5,234"
                iconName="Users"
                trend={{ value: 12, isPositive: true }}
              />
              <StatsCard
                title="Total Revenue"
                value="$54,321"
                iconName="DollarSign"
                trend={{ value: 8, isPositive: true }}
              />
              <StatsCard
                title="Orders"
                value="432"
                description="Last 30 days"
                iconName="ShoppingCart"
                trend={{ value: 5, isPositive: false }}
              />
              <StatsCard
                title="Products"
                value="198"
                iconName="Package"
                description="12 low stock items"
              />
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-lg border p-6">
                <QuickActions />
              </div>
              <div className="rounded-lg border p-6">
                <ActivityLog />
              </div>
            </div>
            
            <div className="rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Recent Orders</h3>
                <span className="text-sm text-muted-foreground">Last 5 orders</span>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2 text-left font-medium">Order ID</th>
                      <th className="pb-2 text-left font-medium">Customer</th>
                      <th className="pb-2 text-left font-medium">Date</th>
                      <th className="pb-2 text-left font-medium">Amount</th>
                      <th className="pb-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: "ORD-001", customer: "John Smith", date: "Today", amount: "$432.00", status: "Completed" },
                      { id: "ORD-002", customer: "Sarah Johnson", date: "Yesterday", amount: "$150.00", status: "Processing" },
                      { id: "ORD-003", customer: "Michael Brown", date: "2 days ago", amount: "$65.50", status: "Shipped" },
                      { id: "ORD-004", customer: "Emma Davis", date: "3 days ago", amount: "$324.75", status: "Completed" },
                      { id: "ORD-005", customer: "Robert Wilson", date: "4 days ago", amount: "$198.20", status: "Processing" },
                    ].map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="py-3 text-sm">{order.id}</td>
                        <td className="py-3 text-sm">{order.customer}</td>
                        <td className="py-3 text-sm">{order.date}</td>
                        <td className="py-3 text-sm">{order.amount}</td>
                        <td className="py-3 text-sm">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "Completed" 
                              ? "bg-green-100 text-green-800"
                              : order.status === "Processing"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
