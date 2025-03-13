"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Product } from "@/utils/supabase/database";

interface ProductDeleteFormProps {
  product: Product;
}

export default function ProductDeleteForm({ product }: ProductDeleteFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: supabaseError } = await supabase
        .from("products")
        .delete()
        .eq("id", product.id);

      if (supabaseError) throw supabaseError;

      router.push("/protected/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting the product");
      console.error("Error deleting product:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-700">
        <p className="font-medium">Are you sure you want to delete this product?</p>
        <p className="mt-1 text-sm">This action cannot be undone. This will permanently delete the product &quot;{product.name}&quot;.</p>
      </div>

      <div className="flex gap-4 justify-end">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button 
          type="button"
          variant="destructive"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete Product"}
        </Button>
      </div>
    </div>
  );
}