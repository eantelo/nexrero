"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function NewSalePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customer_name: '',
    order_date: '',
    total_amount: '',
    status: '',
    payment_status: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.from('orders').insert([formData]);
    if (error) {
      console.error('Error creating sale:', error);
    } else {
      router.push('/protected/sales');
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">New Sale</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="customer_name"
          label="Customer Name"
          value={formData.customer_name}
          onChange={handleChange}
          required
        />
        <Input
          name="order_date"
          label="Order Date"
          type="date"
          value={formData.order_date}
          onChange={handleChange}
          required
        />
        <Input
          name="total_amount"
          label="Total Amount"
          type="number"
          value={formData.total_amount}
          onChange={handleChange}
          required
        />
        <Input
          name="status"
          label="Status"
          value={formData.status}
          onChange={handleChange}
          required
        />
        <Input
          name="payment_status"
          label="Payment Status"
          value={formData.payment_status}
          onChange={handleChange}
          required
        />
        <Button type="submit">Create Sale</Button>
      </form>
    </div>
  );
}