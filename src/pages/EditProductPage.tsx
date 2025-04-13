
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '@/components/ProductForm';
import { getProductById, updateProduct } from '@/services/productService';
import { toast } from 'sonner';
import { z } from 'zod';
import { Skeleton } from '@/components/ui/skeleton';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  barcode: z.string().optional(),
  batchId: z.string().optional(),
  expiryDate: z.date({
    required_error: 'Expiry date is required',
  }),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  category: z.enum(['food', 'medicine', 'cosmetics', 'other'] as const),
  location: z.string().min(1, 'Location is required'),
});

type ProductFormValues = z.infer<typeof productSchema>;

const EditProductPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id) {
      const productData = getProductById(id);
      if (productData) {
        setProduct(productData);
      } else {
        toast.error('Product not found');
        navigate('/products');
      }
    }
    setLoading(false);
  }, [id, navigate]);
  
  const handleFormSubmit = (data: ProductFormValues) => {
    if (!id) return;
    
    try {
      updateProduct(id, data);
      toast.success('Product updated successfully');
      navigate('/products');
    } catch (error) {
      toast.error('Failed to update product');
      console.error(error);
    }
  };
  
  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-gray-500 mb-6">The product you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/products')}
          className="text-blue-500 hover:underline"
        >
          Return to Products
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Edit Product</h1>
      
      <ProductForm
        initialData={product}
        onSubmit={handleFormSubmit}
        isEditing={true}
      />
    </div>
  );
};

export default EditProductPage;
