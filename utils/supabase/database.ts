import { createClient } from './server';

// Types for your database tables
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  sku?: string;
  stock_quantity: number;
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: string;
  customer_id: string;
  order_date: Date;
  total_amount: number;
  status: string;
  payment_status: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: Date;
}

// Database utility functions
export const db = {
  // Customer functions
  customers: {
    async getAll(): Promise<Customer[]> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching customers:', error);
        return [];
      }
      
      return data || [];
    },
    
    async getById(id: string): Promise<Customer | null> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Error fetching customer ${id}:`, error);
        return null;
      }
      
      return data;
    },
    
    async create(customer: Omit<Customer, 'id' | 'created_at' | 'updated_at'>): Promise<Customer | null> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('customers')
        .insert(customer)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating customer:', error);
        return null;
      }
      
      return data;
    },
    
    async update(id: string, updates: Partial<Customer>): Promise<Customer | null> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating customer ${id}:`, error);
        return null;
      }
      
      return data;
    },
    
    async delete(id: string): Promise<boolean> {
      const supabase = await createClient();
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Error deleting customer ${id}:`, error);
        return false;
      }
      
      return true;
    },
    
    // Get customer orders
    async getOrders(customerId: string): Promise<Order[]> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('order_date', { ascending: false });
      
      if (error) {
        console.error(`Error fetching orders for customer ${customerId}:`, error);
        return [];
      }
      
      return data || [];
    }
  },
  
  // Product functions
  products: {
    async getAll(): Promise<Product[]> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }
      
      return data || [];
    },
    
    async getById(id: string): Promise<Product | null> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Error fetching product ${id}:`, error);
        return null;
      }
      
      return data;
    },
    
    async create(product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating product:', error);
        return null;
      }
      
      return data;
    },
    
    async update(id: string, updates: Partial<Product>): Promise<Product | null> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating product ${id}:`, error);
        return null;
      }
      
      return data;
    },
    
    async delete(id: string): Promise<boolean> {
      const supabase = await createClient();
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Error deleting product ${id}:`, error);
        return false;
      }
      
      return true;
    }
  },
  
  // Order functions
  orders: {
    async getAll(): Promise<Order[]> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('order_date', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }
      
      return data || [];
    },
    
    async getById(id: string): Promise<{ order: Order, items: OrderItem[] } | null> {
      const supabase = await createClient();
      
      // Get order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (orderError) {
        console.error(`Error fetching order ${id}:`, orderError);
        return null;
      }
      
      // Get order items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);
      
      if (itemsError) {
        console.error(`Error fetching items for order ${id}:`, itemsError);
        return { order, items: [] };
      }
      
      return { order, items: items || [] };
    },
    
    async getByCustomerId(customerId: string): Promise<Order[]> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('order_date', { ascending: false });
      
      if (error) {
        console.error(`Error fetching orders for customer ${customerId}:`, error);
        return [];
      }
      
      return data || [];
    },
    
    async create(
      order: Omit<Order, 'id' | 'created_at' | 'updated_at'>, 
      items: Omit<OrderItem, 'id' | 'created_at' | 'order_id'>[]
    ): Promise<{ order: Order, items: OrderItem[] } | null> {
      const supabase = await createClient();
      
      // Start a transaction by using a callback
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert(order)
        .select()
        .single();
      
      if (orderError) {
        console.error('Error creating order:', orderError);
        return null;
      }
      
      // Add order items
      const orderItems = items.map(item => ({
        ...item,
        order_id: newOrder.id
      }));
      
      const { data: newItems, error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();
      
      if (itemsError) {
        console.error('Error creating order items:', itemsError);
        // In a real app you'd want to roll back the order creation here
        return { order: newOrder, items: [] };
      }
      
      return { order: newOrder, items: newItems || [] };
    },
    
    async update(
      id: string, 
      updates: Partial<Order>
    ): Promise<Order | null> {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Error updating order ${id}:`, error);
        return null;
      }
      
      return data;
    },
    
    async updateItems(
      orderId: string,
      items: Array<Partial<OrderItem> & { id: string }>
    ): Promise<OrderItem[] | null> {
      const supabase = await createClient();
      
      // Process each item individually
      const results = await Promise.all(
        items.map(async (item) => {
          const { data, error } = await supabase
            .from('order_items')
            .update({ 
              quantity: item.quantity,
              unit_price: item.unit_price,
              total_price: item.total_price 
            })
            .eq('id', item.id)
            .eq('order_id', orderId)
            .select()
            .single();
          
          if (error) {
            console.error(`Error updating order item ${item.id}:`, error);
            return null;
          }
          
          return data;
        })
      );
      
      if (results.some(r => r === null)) {
        return null;
      }
      
      return results as OrderItem[];
    },
    
    async addItems(
      orderId: string,
      items: Omit<OrderItem, 'id' | 'created_at' | 'order_id'>[]
    ): Promise<OrderItem[] | null> {
      const supabase = await createClient();
      
      const orderItems = items.map(item => ({
        ...item,
        order_id: orderId
      }));
      
      const { data, error } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();
      
      if (error) {
        console.error(`Error adding items to order ${orderId}:`, error);
        return null;
      }
      
      return data;
    },
    
    async removeItem(orderId: string, itemId: string): Promise<boolean> {
      const supabase = await createClient();
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', itemId)
        .eq('order_id', orderId);
      
      if (error) {
        console.error(`Error removing item ${itemId} from order ${orderId}:`, error);
        return false;
      }
      
      return true;
    },
    
    async delete(id: string): Promise<boolean> {
      const supabase = await createClient();
      
      // Delete the order - cascade will handle the items
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Error deleting order ${id}:`, error);
        return false;
      }
      
      return true;
    }
  }
};