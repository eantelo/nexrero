import { useRouter } from 'next/router';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';

export default function DeleteSalePage({ params }) {
  const router = useRouter();
  const { id } = params;

  const handleDelete = async () => {
    const supabase = await createClient();
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
      console.error('Error deleting sale:', error);
    } else {
      router.push('/protected/sales');
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Delete Sale</h1>
      <p>Are you sure you want to delete this sale?</p>
      <div className="mt-4">
        <Button onClick={handleDelete} className="mr-2">Yes, Delete</Button>
        <Button variant="outline" onClick={() => router.push('/protected/sales')}>Cancel</Button>
      </div>
    </div>
  );
}
