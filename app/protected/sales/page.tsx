import { db } from '@/utils/supabase/database';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchIcon, ArrowUpDown } from 'lucide-react';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

// Define allowed sort options
type SortField = 'order_date' | 'status' | 'payment_status' | 'total_amount' | 'customer_name';
type SortOrder = 'asc' | 'desc';

// Define search params interface
interface SearchParams {
  search?: string;
  sort?: SortField;
  order?: SortOrder;
  status?: string;
}

export default async function SalesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedParams = await Promise.resolve(searchParams);
  const { search, sort = 'order_date', order = 'desc', status } = resolvedParams;
  
  // Authentication check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }
  
  // Get all orders with customer information
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*, customers(name)')
    .order('order_date', { ascending: false });
    
  if (error) {
    console.error('Error fetching orders:', error);
    return (
      <div className="container mx-auto py-10 px-4">
        <p>Error loading sales data. Please try again later.</p>
      </div>
    );
  }

  // Process orders to include customer name
  const allOrders = orders.map(order => ({
    ...order,
    customer_name: order.customers?.name || 'Unknown Customer'
  }));
  
  // Apply search filter if provided
  const filteredOrders = search 
    ? allOrders.filter(order => 
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        order.status.toLowerCase().includes(search.toLowerCase()) ||
        order.payment_status.toLowerCase().includes(search.toLowerCase())
      )
    : allOrders;

  // Apply status filter if provided
  const statusFilteredOrders = status
    ? filteredOrders.filter(order => order.status === status)
    : filteredOrders;
    
  // Apply sorting
  const sortedOrders = [...statusFilteredOrders].sort((a, b) => {
    if (sort === 'order_date') {
      return order === 'asc' 
        ? new Date(a.order_date).getTime() - new Date(b.order_date).getTime() 
        : new Date(b.order_date).getTime() - new Date(a.order_date).getTime();
    }
    
    if (sort === 'total_amount') {
      return order === 'asc' ? a.total_amount - b.total_amount : b.total_amount - a.total_amount;
    }
    
    if (sort === 'customer_name') {
      return order === 'asc' 
        ? a.customer_name.localeCompare(b.customer_name) 
        : b.customer_name.localeCompare(a.customer_name);
    }
    
    // Default sort by status or payment_status
    if (sort === 'status' || sort === 'payment_status') {
      return order === 'asc' 
        ? a[sort].localeCompare(b[sort]) 
        : b[sort].localeCompare(a[sort]);
    }
    
    // Default fallback
    return order === 'asc'
      ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  // Order counts for stats
  const orderCount = allOrders.length;
  const pendingOrders = allOrders.filter(order => order.status === 'pending').length;
  const completedOrders = allOrders.filter(order => order.status === 'completed').length;
  const unpaidOrders = allOrders.filter(order => order.payment_status === 'unpaid').length;
  
  // Calculate total sales
  const totalSales = allOrders.reduce((sum, order) => sum + order.total_amount, 0);
  
  // Get recent orders for activity feed
  const recentOrders = allOrders.slice(0, 5);
  
  // Create sort URL helper
  const createSortUrl = (field: SortField) => {
    const newOrder = sort === field && order === 'asc' ? 'desc' : 'asc';
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    params.set('sort', field);
    params.set('order', newOrder);
    return `?${params.toString()}`;
  };

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Get appropriate badge color based on status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      case 'partially_paid':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <Link href="/protected">
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Sales</h1>
        </div>
        <Link href="/protected/sales/new">
          <Button>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Sale
          </Button>
        </Link>
      </div>
      
      {/* Search and filter section */}
      <div className="mb-6">
        <form className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              placeholder="Search sales..."
              defaultValue={search}
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select 
            name="status" 
            defaultValue={status || ''}
            className="block rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="shipped">Shipped</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Button type="submit">Filter</Button>
        </form>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow-md rounded-lg p-6 border">
          <p className="text-sm text-gray-500">Total Sales</p>
          <p className="text-3xl font-bold">{orderCount}</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 border">
          <p className="text-sm text-gray-500">Pending Orders</p>
          <p className="text-3xl font-bold">{pendingOrders}</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 border">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-3xl font-bold">{formatCurrency(totalSales)}</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border">
          <p className="text-sm text-gray-500">Unpaid Orders</p>
          <p className="text-3xl font-bold">{unpaidOrders}</p>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="mb-8 bg-white shadow-md rounded-lg p-6 border">
        <h2 className="text-lg font-semibold mb-4">Recent Sales Activity</h2>
        {recentOrders.length > 0 ? (
          <ul className="space-y-3">
            {recentOrders.map(order => (
              <li key={order.id} className="flex items-center gap-3 text-sm border-b pb-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                  {order.customer_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-grow">
                  <Link href={`/protected/sales/${order.id}`} className="font-medium hover:text-blue-600">
                    Order #{order.id.substring(0, 8)}
                  </Link>
                  <p className="text-gray-500 text-xs">
                    {order.customer_name} - {formatCurrency(order.total_amount)}
                  </p>
                </div>
                <div className="text-gray-500 text-xs">
                  {new Date(order.order_date).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recent activity</p>
        )}
      </div>
      
      {/* Orders table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border">
        {sortedOrders.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-gray-500">No sales found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search || status ? "Try adjusting your search or filter criteria." : "Get started by creating a new sale."}
            </p>
            <div className="mt-6">
              <Link href="/protected/sales/new">
                <Button>Create Sale</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Link href={createSortUrl('order_date')} className="group flex items-center space-x-1 hover:text-gray-700">
                      <span>Date</span>
                      <ArrowUpDown className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                    </Link>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Link href={createSortUrl('customer_name')} className="group flex items-center space-x-1 hover:text-gray-700">
                      <span>Customer</span>
                      <ArrowUpDown className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                    </Link>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Link href={createSortUrl('total_amount')} className="group flex items-center space-x-1 hover:text-gray-700">
                      <span>Amount</span>
                      <ArrowUpDown className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                    </Link>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Link href={createSortUrl('status')} className="group flex items-center space-x-1 hover:text-gray-700">
                      <span>Status</span>
                      <ArrowUpDown className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                    </Link>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Link href={createSortUrl('payment_status')} className="group flex items-center space-x-1 hover:text-gray-700">
                      <span>Payment</span>
                      <ArrowUpDown className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                    </Link>
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {order.customer_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatCurrency(order.total_amount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <Link 
                          href={`/protected/sales/${order.id}`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <Link 
                          href={`/protected/sales/${order.id}/edit`} 
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                        <Link 
                          href={`/protected/sales/${order.id}/delete`} 
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}