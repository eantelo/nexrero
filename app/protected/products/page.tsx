import { db } from '@/utils/supabase/database';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchIcon, ArrowUpDown } from 'lucide-react';

// Define allowed sort options
type SortField = 'name' | 'price' | 'stock_quantity' | 'created_at';
type SortOrder = 'asc' | 'desc';

// Define search params interface
interface SearchParams {
  search?: string;
  sort?: SortField;
  order?: SortOrder;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { search, sort = 'name', order = 'asc' } = searchParams;
  
  // Get all products
  const allProducts = await db.products.getAll();
  
  // Apply search filter if provided
  const filteredProducts = search 
    ? allProducts.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase()) ||
        product.sku?.toLowerCase().includes(search.toLowerCase())
      )
    : allProducts;
    
  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'price') {
      return order === 'asc' ? a.price - b.price : b.price - a.price;
    }
    
    if (sort === 'stock_quantity') {
      return order === 'asc' ? a.stock_quantity - b.stock_quantity : b.stock_quantity - a.stock_quantity;
    }
    
    if (sort === 'created_at') {
      return order === 'asc'
        ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    
    // Default sort by name
    return order === 'asc'
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name);
  });

  // Get product counts for stats
  const productCount = allProducts.length;
  const lowStockThreshold = 10;
  const lowStockCount = allProducts.filter(p => p.stock_quantity <= lowStockThreshold).length;
  const outOfStockCount = allProducts.filter(p => p.stock_quantity === 0).length;
  
  // Get recent products for activity feed
  const recentProducts = [...allProducts]
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
          <h1 className="text-3xl font-bold">Products</h1>
        </div>
        <Link href="/protected/products/new">
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
            New Product
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
              placeholder="Search products..."
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
          <p className="text-sm text-gray-500">Total Products</p>
          <p className="text-3xl font-bold">{productCount}</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 border">
          <p className="text-sm text-gray-500">Low Stock</p>
          <p className="text-3xl font-bold">{lowStockCount}</p>
          <p className="text-xs text-gray-400 mt-1">Below {lowStockThreshold} units</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6 border">
          <p className="text-sm text-gray-500">Out of Stock</p>
          <p className="text-3xl font-bold">{outOfStockCount}</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border">
          <p className="text-sm text-gray-500">Average Price</p>
          <p className="text-3xl font-bold">
            ${(allProducts.reduce((sum, p) => sum + p.price, 0) / productCount || 0).toFixed(2)}
          </p>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="mb-8 bg-white shadow-md rounded-lg p-6 border">
        <h2 className="text-lg font-semibold mb-4">Recent Product Activity</h2>
        {recentProducts.length > 0 ? (
          <ul className="space-y-3">
            {recentProducts.map(product => (
              <li key={product.id} className="flex items-center gap-3 text-sm border-b pb-2">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs">
                  {product.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-grow">
                  <Link href={`/protected/products/${product.id}`} className="font-medium hover:text-blue-600">
                    {product.name}
                  </Link>
                  <p className="text-gray-500 text-xs">Product added</p>
                </div>
                <div className="text-gray-500 text-xs">
                  {new Date(product.created_at).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recent activity</p>
        )}
      </div>
      
      {/* Product table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg border">
        {sortedProducts.length === 0 ? (
          <div className="text-center py-10">
            <h3 className="text-lg font-medium text-gray-500">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search ? "Try adjusting your search criteria." : "Get started by creating a new product."}
            </p>
            <div className="mt-6">
              <Link href="/protected/products/new">
                <Button>Add Product</Button>
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
                    SKU
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Link href={createSortUrl('price')} className="group flex items-center space-x-1 hover:text-gray-700">
                      <span>Price</span>
                      <ArrowUpDown className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                    </Link>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Link href={createSortUrl('stock_quantity')} className="group flex items-center space-x-1 hover:text-gray-700">
                      <span>Stock</span>
                      <ArrowUpDown className="h-4 w-4 opacity-50 group-hover:opacity-100" />
                    </Link>
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
                {sortedProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          {product.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-500">{product.description.substring(0, 50)}...</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.sku || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${product.price.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={product.stock_quantity === 0 ? 'destructive' : product.stock_quantity <= 10 ? 'secondary' : 'default'}>
                        {product.stock_quantity}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(product.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <Link 
                          href={`/protected/products/${product.id}`} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        <Link 
                          href={`/protected/products/${product.id}/edit`} 
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                        <Link 
                          href={`/protected/products/${product.id}/delete`} 
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