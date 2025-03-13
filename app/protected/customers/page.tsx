import { db } from '@/utils/supabase/database';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchIcon, ArrowUpDown } from 'lucide-react';

// Define allowed sort options
type SortField = 'name' | 'email' | 'created_at';
type SortOrder = 'asc' | 'desc';

// Define search params interface
interface SearchParams {
  search?: string;
  sort?: SortField;
  order?: SortOrder;
}

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { search, sort = 'name', order = 'asc' } = searchParams;
  
  // Get all customers
  const allCustomers = await db.customers.getAll();
  
  // Apply search filter if provided
  const filteredCustomers = search 
    ? allCustomers.filter(customer => 
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        (customer.email && customer.email.toLowerCase().includes(search.toLowerCase())) ||
        (customer.phone && customer.phone.toLowerCase().includes(search.toLowerCase()))
      )
    : allCustomers;
    
  // Apply sorting
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    // Handle null values for optional fields
    if (sort === 'email') {
      const emailA = a.email || '';
      const emailB = b.email || '';
      return order === 'asc' 
        ? emailA.localeCompare(emailB)
        : emailB.localeCompare(emailA);
    }
    
    if (sort === 'created_at') {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    }
    
    // Default sort by name
    return order === 'asc' 
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name);
  });
  
  // Calculate stats
  const customerCount = allCustomers.length;
  const newCustomersThisMonth = allCustomers.filter(customer => {
    const customerDate = new Date(customer.created_at);
    const now = new Date();
    return customerDate.getMonth() === now.getMonth() && 
           customerDate.getFullYear() === now.getFullYear();
  }).length;
  
  // Get recent customer activity
  const recentCustomers = [...allCustomers]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);
  
  // Create sort URL helper
  const createSortUrl = (field: SortField) => {
    const newOrder = sort === field && order === 'asc' ? 'desc' : 'asc';
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('sort', field);
    params.set('order', newOrder);
    return `?${params.toString()}`;
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
          <h1 className="text-3xl font-bold">Customers</h1>
        </div>
        <Link href="/protected/customers/new">
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
            New Customer
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
              placeholder="Search customers..."
              defaultValue={search}
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:outline-none focus:text-gray-900 focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white shadow-md rounded-lg p-6 border">
          <p className="text-sm text-gray-500">Total Customers</p>
          <p className="text-3xl font-bold">{customerCount}</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 border">
          <p className="text-sm text-gray-500">New This Month</p>
          <p className="text-3xl font-bold">{newCustomersThisMonth}</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 border">
          <p className="text-sm text-gray-500">With Orders</p>
          <p className="text-3xl font-bold">0</p>
          <p className="text-xs text-gray-400 mt-1">(Orders feature coming soon)</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 border">
          <p className="text-sm text-gray-500">Average Order Value</p>
          <p className="text-3xl font-bold">$0</p>
          <p className="text-xs text-gray-400 mt-1">(Orders feature coming soon)</p>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="mb-8 bg-white shadow-md rounded-lg p-6 border">
        <h2 className="text-lg font-semibold mb-4">Recent Customer Activity</h2>
        {recentCustomers.length > 0 ? (
          <ul className="space-y-3">
            {recentCustomers.map(customer => (
              <li key={customer.id} className="flex items-center gap-3 text-sm border-b pb-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-grow">
                  <Link href={`/protected/customers/${customer.id}`} className="font-medium hover:text-blue-600">
                    {customer.name}
                  </Link>
                  <p className="text-gray-500 text-xs">Customer created</p>
                </div>
                <div className="text-gray-500 text-xs">
                  {new Date(customer.created_at).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recent activity</p>
        )}
      </div>
      
      {/* Customer table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border">
        {sortedCustomers.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-gray-500">No customers found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search ? "Try adjusting your search criteria." : "Get started by creating a new customer."}
            </p>
            <div className="mt-6">
              <Link href="/protected/customers/new">
                <Button>Add Customer</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Link href={createSortUrl('name')} className="group flex items-center space-x-1 hover:text-gray-700">
                      <span>Name</span>
                      <ArrowUpDown className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                    </Link>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Link href={createSortUrl('email')} className="group flex items-center space-x-1 hover:text-gray-700">
                      <span>Email</span>
                      <ArrowUpDown className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                    </Link>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Link href={createSortUrl('created_at')} className="group flex items-center space-x-1 hover:text-gray-700">
                      <span>Created</span>
                      <ArrowUpDown className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                    </Link>
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(customer.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <Link 
                          href={`/protected/customers/${customer.id}`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <Link 
                          href={`/protected/customers/${customer.id}/edit`} 
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                        <Link 
                          href={`/protected/customers/${customer.id}/delete`} 
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