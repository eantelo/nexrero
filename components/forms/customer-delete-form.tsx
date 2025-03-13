"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Customer } from "@/utils/supabase/database";

interface CustomerDeleteFormProps {
  customer: Customer;
}

export default function CustomerDeleteForm({ customer }: CustomerDeleteFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: supabaseError } = await supabase
        .from("customers")
        .delete()
        .eq("id", customer.id);

      if (supabaseError) throw supabaseError;
      
      // Successfully deleted customer, redirect to customers list
      router.push("/protected/customers");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred while deleting the customer");
      console.error("Error deleting customer:", err);
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
      
      <div className="bg-red-50 p-4 rounded-md border border-red-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Warning</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Are you sure you want to delete the customer <strong>{customer.name}</strong>?</p>
              <p className="mt-1">This action cannot be undone. All customer data will be permanently removed.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between">
        <Button 
          type="button" 
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        
        <Button 
          type="button" 
          variant="destructive"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Deleting..." : "Yes, Delete Customer"}
        </Button>
      </div>
    </div>
  );
}