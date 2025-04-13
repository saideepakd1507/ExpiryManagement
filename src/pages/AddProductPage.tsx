
import { useNavigate } from 'react-router-dom';
import ProductForm from '@/components/ProductForm';
import { addProduct } from '@/services/productService';
import { toast } from 'sonner';
import { z } from 'zod';

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

const AddProductPage = () => {
  const navigate = useNavigate();
  
  const handleFormSubmit = (data: ProductFormValues) => {
    try {
      // Ensure all required properties are present before passing to addProduct
      const productData = {
        name: data.name,
        barcode: data.barcode,
        batchId: data.batchId,
        expiryDate: data.expiryDate,
        quantity: data.quantity,
        category: data.category,
        location: data.location
      };
      
      addProduct(productData);
      toast.success('Product added successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to add product');
      console.error(error);
    }
  };
  
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">Add Product Manually</h1>
      <p className="text-gray-500">
        Enter product details manually or <a href="/scan" className="text-blue-500 hover:underline">scan a barcode</a> to auto-fill.
      </p>
      
      <ProductForm onSubmit={handleFormSubmit} />
    </div>
  );
};

export default AddProductPage;
