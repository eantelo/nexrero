import { db } from '@/utils/supabase/database';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductDeleteForm from '@/components/forms/product-delete-form';

interface ProductDeletePageProps {
  params: {
    id: string;
  };
}

export default async function ProductDeletePage({ params }: ProductDeletePageProps) {
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
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link href={`/protected/products/${product.id}`} className="text-sm font-medium text-gray-700 hover:text-blue-600">
                  {product.name}
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-500">Delete</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
      
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 border">
          <h1 className="text-2xl font-bold mb-6 text-red-600">Delete Product</h1>
          <ProductDeleteForm product={product} />
        </div>
      </div>
    </div>
  );
}