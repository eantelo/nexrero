import { db } from '@/utils/supabase/database';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';

interface CustomerViewPageProps {
  params: {
    id: string;
  };
}

export default async function CustomerViewPage({ params }: CustomerViewPageProps) {
  // The params object itself doesn't need to be awaited, only async operations that use it
  const customerId = params.id;
  const customer = await db.customers.getById(customerId);
  
  if (!customer) {
    notFound();
  }
  
  // Get customer orders (this will be implemented later)
  // For now, we'll use dummy data
  const customerOrders = [
    {
      id: 'ord-001',
      order_date: new Date().toISOString(),
      total_amount: 249.99,
      status: 'completed',
      payment_status: 'paid'
    },
    {
      id: 'ord-002',
      order_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      total_amount: 129.50,
      status: 'processing',
      payment_status: 'pending'
    }
  ];
  
  // Calculate customer metrics
  const totalSpent = customerOrders.reduce((sum, order) => sum + order.total_amount, 0);
  const avgOrderValue = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0;
  const lastOrderDate = customerOrders.length > 0 
    ? new Date(Math.max(...customerOrders.map(o => new Date(o.order_date).getTime())))
    : null;
  
  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/protected" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link href="/protected/customers" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Customers
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500">{customer.name}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Customer Details</h1>
          <div className="flex space-x-3">
            <Link href={`/protected/customers/${customer.id}/edit`}>
              <Button variant="outline" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
              </Button>
            </Link>
            <Link href={`/protected/customers/${customer.id}/delete`}>
              <Button variant="destructive" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                Delete
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden border mb-8">
          <div className="p-6 space-y-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center text-2xl text-gray-600">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-gray-900">{customer.name}</h2>
                {customer.email && (
                  <p className="text-sm text-gray-500">
                    <span className="font-medium">Email:</span> {customer.email}
                  </p>
                )}
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.phone || 'Not provided'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Customer ID</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.id}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-sm text-gray-900">{customer.address || 'Not provided'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(customer.created_at).toLocaleString()}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(customer.updated_at).toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        
        {/* Customer Metrics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white shadow rounded-lg p-6 border">
            <p className="text-sm text-gray-500">Total Spent</p>
            <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 border">
            <p className="text-sm text-gray-500">Orders</p>
            <p className="text-2xl font-bold">{customerOrders.length}</p>
          </div>
          <div className="bg-white shadow rounded-lg p-6 border">
            <p className="text-sm text-gray-500">Avg. Order Value</p>
            <p className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</p>
          </div>
        </div>
        
        {/* Customer Orders Section */}
        <div className="bg-white shadow rounded-lg overflow-hidden border mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Orders</h3>
              <Link href={`/protected/customers/${customer.id}/orders/new`}>
                <Button size="sm">
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
                  New Order
                </Button>
              </Link>
            </div>
            
            {customerOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No orders found for this customer.</p>
                <div className="mt-4">
                  <Link href={`/protected/customers/${customer.id}/orders/new`}>
                    <Button size="sm">Create First Order</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customerOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.order_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${order.total_amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            href={`/protected/orders/${order.id}`}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            View
                          </Link>
                          <Link 
                            href={`/protected/orders/${order.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-3 flex justify-end">
          <Button variant="ghost" asChild>
            <Link href="/protected/customers">Back to Customers</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}