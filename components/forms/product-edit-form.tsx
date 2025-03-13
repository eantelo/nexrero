"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/utils/supabase/database";

interface ProductEditFormProps {
  product: Product;
}

export default function ProductEditForm({ product }: ProductEditFormProps) {
  const router = useRouter();
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || "");
  const [price, setPrice] = useState(product.price.toString());
  const [sku, setSku] = useState(product.sku || "");
  const [stockQuantity, setStockQuantity] = useState(product.stock_quantity.toString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setError("Name is required");
      setLoading(false);
      return;
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError("Valid price is required");
      setLoading(false);
      return;
    }

    if (!stockQuantity || isNaN(Number(stockQuantity)) || Number(stockQuantity) < 0) {
      setError("Valid stock quantity is required");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error: supabaseError } = await supabase
        .from("products")
        .update({
          name,
          description: description || null,
          price: Number(price),
          sku: sku || null,
          stock_quantity: Number(stockQuantity)
        })
        .eq("id", product.id);

      if (supabaseError) throw supabaseError;

      setSuccessMessage("Product updated successfully");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while updating the product");
      console.error("Error updating product:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md text-green-600">
          {successMessage}
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sku">SKU</Label>
          <Input
            id="sku"
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Product SKU"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="stockQuantity">Stock Quantity *</Label>
          <Input
            id="stockQuantity"
            type="number"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            placeholder="0"
            min="0"
            required
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder="Product description"
            rows={4}
          />
        </div>
      </div>

      <div className="flex gap-4 justify-end">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}