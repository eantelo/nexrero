import { ActivityLog } from "@/components/dashboard/activity-log";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { StatsCard } from "@/components/dashboard/stats-card";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/utils/supabase/database";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }

  // Get customer data and recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*, customers!inner(name)')
    .order('order_date', { ascending: false })
    .limit(5);

  // Get all customer data and calculate stats
  const allCustomers = await db.customers.getAll();
  const customerCount = allCustomers.length;
  const newCustomersThisMonth = allCustomers.filter(customer => {
    const customerDate = new Date(customer.created_at);
    const now = new Date();
    return customerDate.getMonth() === now.getMonth() && 
           customerDate.getFullYear() === now.getFullYear();
  }).length;

  // Calculate new customer percentage change
  const customerGrowthRate = customerCount > 0 
    ? ((newCustomersThisMonth / customerCount) * 100)
    : 0;

  // Get recent customers
  const { data: recentCustomers } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  // Get product stats
  const allProducts = await db.products.getAll();
  const productCount = allProducts.length;
  const lowStockThreshold = 10;
  const lowStockCount = allProducts.filter(p => p.stock_quantity <= lowStockThreshold && p.stock_quantity > 0).length;
  const outOfStockCount = allProducts.filter(p => p.stock_quantity === 0).length;
  const averagePrice = allProducts.length > 0 
    ? allProducts.reduce((sum, p) => sum + p.price, 0) / allProducts.length 
    : 0;
    
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
                Welcome back! Here's an overview of your Negocio.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatsCard
                title="Total Customers"
                value={customerCount}
                iconName="Users"
                trend={{ value: Math.round(customerGrowthRate), isPositive: customerGrowthRate > 0 }}
              />
              <StatsCard
                title="Products" 
                value={productCount.toString()}
                iconName="Package"
                description={`${lowStockCount + outOfStockCount} items need attention`}
              />
              <StatsCard
                title="Low Stock"
                value={lowStockCount.toString()}
                iconName="AlertCircle"
                description="Below 10 units"
              />
              <StatsCard
                title="Out of Stock"
                value={outOfStockCount.toString()}
                iconName="XCircle"
                description="Needs immediate attention"
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
                    {recentOrders?.map((order) => (
                      <tr key={order.id} className="border-b">
                        <td className="py-3 text-sm">{order.id.substring(0, 8)}</td>
                        <td className="py-3 text-sm">{order.customers.name}</td>
                        <td className="py-3 text-sm">{new Date(order.order_date).toLocaleDateString()}</td>
                        <td className="py-3 text-sm">${order.total_amount.toFixed(2)}</td>
                        <td className="py-3 text-sm">
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            order.status === "completed" 
                              ? "bg-green-100 text-green-800"
                              : order.status === "processing"
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
            
            <div className="rounded-lg border p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Recent Customers</h3>
                <span className="text-sm text-muted-foreground">Last 5 new customers</span>
              </div>
              <div className="mt-4 space-y-4">
                {recentCustomers?.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between border-b pb-4">
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Joined {new Date(customer.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
