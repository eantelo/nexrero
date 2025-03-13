import { db } from '@/utils/supabase/database';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

interface SaleViewPageProps {
  params: {
    id: string;
  };
}

export default async function SaleViewPage({ params }: SaleViewPageProps) {
  const saleId = params.id;
  
  // Authentication check
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }
  
  // Get the order and its items
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .select('*, customers(*)')
    .eq('id', saleId)
    .single();
    
  if (orderError || !orderData) {
    console.error('Error fetching order:', orderError);
    notFound();
  }
  
  const { data: orderItems, error: itemsError } = await supabase
    .from('order_items')
    .select('*, products(*)')
    .eq('order_id', saleId)
    .order('created_at', { ascending: true });
    
  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
    return (
      <div className="container mx-auto py-10 px-4">
        <p>Error loading order items. Please try again later.</p>
      </div>
    );
  }
  
  const order = orderData;
  const items = orderItems || [];
  
  // Format currency
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
                <Link href="/protected/sales" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Sales
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500">Order #{saleId.substring(0, 8)}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
      
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Order #{saleId.substring(0, 8)}</h1>
            <p className="text-gray-500 text-sm">{new Date(order.order_date).toLocaleString()}</p>
          </div>
          <div className="flex space-x-3">
            <Link href={`/protected/sales/${order.id}/edit`}>
              <Button variant="outline" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
              </Button>
            </Link>
            <Link href={`/protected/sales/${order.id}/delete`}>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Info */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow rounded-lg overflow-hidden border mb-8">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Order Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <div className="mt-1">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Payment Status</h3>
                    <div className="mt-1">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.payment_status)}`}>
                        {order.payment_status}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Order Date</h3>
                    <p className="mt-1 text-sm text-gray-900">{new Date(order.order_date).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Order Total</h3>
                    <p className="mt-1 text-sm font-semibold text-gray-900">{formatCurrency(order.total_amount)}</p>
                  </div>

                  {order.notes && (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                      <p className="mt-1 text-sm text-gray-900">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="bg-white shadow rounded-lg overflow-hidden border">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                                {item.products?.name.charAt(0).toUpperCase() || 'P'}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  <Link href={`/protected/products/${item.product_id}`} className="hover:text-blue-600">
                                    {item.products?.name || 'Unknown Product'}
                                  </Link>
                                </div>
                                <div className="text-sm text-gray-500">
                                  SKU: {item.products?.sku || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(item.total_price)}
                          </td>
                        </tr>
                      ))}
                      
                      {/* Total row */}
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500" colSpan={3}>
                          Total
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          {/* Customer Info */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden border">
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4">Customer</h2>
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-xl">
                    {order.customers?.name.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-md font-medium">
                      <Link href={`/protected/customers/${order.customer_id}`} className="hover:text-blue-600">
                        {order.customers?.name}
                      </Link>
                    </h3>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {order.customers?.email && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-500">Email</h4>
                      <p className="text-sm">{order.customers.email}</p>
                    </div>
                  )}
                  
                  {order.customers?.phone && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-500">Phone</h4>
                      <p className="text-sm">{order.customers.phone}</p>
                    </div>
                  )}
                  
                  {order.customers?.address && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-500">Address</h4>
                      <p className="text-sm">{order.customers.address}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <Link href={`/protected/customers/${order.customer_id}`}>
                    <Button variant="outline" size="sm" className="w-full">
                      View Customer
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-3 flex justify-end mt-8">
          <Button variant="ghost" asChild>
            <Link href="/protected/sales">Back to Sales</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}