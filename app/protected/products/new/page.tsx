import ProductNewForm from '@/components/forms/product-new-form';
import Link from 'next/link';

export default function NewProductPage() {
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
                <span className="text-sm font-medium text-gray-500">New Product</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 border">
          <h1 className="text-2xl font-bold mb-6">Create New Product</h1>
          <ProductNewForm />
        </div>
      </div>
    </div>
  );
}