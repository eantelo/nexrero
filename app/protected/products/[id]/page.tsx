import { db } from '@/utils/supabase/database';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { notFound } from 'next/navigation';

interface ProductViewPageProps {
  params: {
    id: string;
  };
}

export default async function ProductViewPage({ params }: ProductViewPageProps) {
  const productId = params.id;
  const product = await db.products.getById(productId);
  
  if (!product) {
    notFound();
  }

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
                <Link href="/protected/products" className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  Products
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Product Details</h1>
          <div className="flex space-x-3">
            <Link href={`/protected/products/${product.id}/edit`}>
              <Button variant="outline" size="sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit
              </Button>
            </Link>
            <Link href={`/protected/products/${product.id}/delete`}>
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
                {product.name.charAt(0).toUpperCase()}
              </div>
              <div className="ml-6">
                <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
                <p className="text-sm text-gray-500">
                  <span className="font-medium">SKU:</span> {product.sku || 'Not assigned'}
                </p>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Price</dt>
                  <dd className="mt-1 text-sm text-gray-900">${product.price.toFixed(2)}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Stock Quantity</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <Badge variant={product.stock_quantity === 0 ? 'destructive' : product.stock_quantity <= 10 ? 'secondary' : 'default'}>
                      {product.stock_quantity} units
                    </Badge>
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900">{product.description || 'No description available'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Created At</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(product.created_at).toLocaleString()}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(product.updated_at).toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-3 flex justify-end">
          <Button variant="ghost" asChild>
            <Link href="/protected/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}