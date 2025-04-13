
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { ProductCategory } from '@/types/product';
import { getProductInfoFromBarcode } from '@/services/productService';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

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

interface ProductFormProps {
  initialData?: Partial<ProductFormValues>;
  barcode?: string;
  onSubmit: (data: ProductFormValues) => void;
  isEditing?: boolean;
}

const ProductForm = ({
  initialData,
  barcode,
  onSubmit,
  isEditing = false,
}: ProductFormProps) => {
  const [date, setDate] = useState<Date | undefined>(initialData?.expiryDate);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      category: 'food' as ProductCategory,
    },
  });

  const watchedBarcode = watch('barcode');

  // Handle barcode auto-fill when provided from scanner
  useEffect(() => {
    if (barcode && !isEditing) {
      setValue('barcode', barcode);
      fetchProductDetails(barcode);
    }
  }, [barcode, isEditing, setValue]);

  // Auto-fetch product details when barcode changes in the form
  useEffect(() => {
    if (watchedBarcode && watchedBarcode.length >= 8 && !isEditing) {
      fetchProductDetails(watchedBarcode);
    }
  }, [watchedBarcode, isEditing]);

  const fetchProductDetails = async (barcode: string) => {
    try {
      const productInfo = getProductInfoFromBarcode(barcode);
      
      if (productInfo) {
        if (productInfo.name) setValue('name', productInfo.name);
        if (productInfo.category) setValue('category', productInfo.category);
        toast.success('Product details loaded from database');
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
    }
  };

  const handleFormSubmit = (data: ProductFormValues) => {
    onSubmit(data);
    if (!isEditing) {
      reset();
      setDate(undefined);
    }
  };

  const categories: { value: ProductCategory; label: string }[] = [
    { value: 'food', label: 'Food' },
    { value: 'medicine', label: 'Medicine' },
    { value: 'cosmetics', label: 'Cosmetics' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              placeholder="Enter product name"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode (Optional)</Label>
              <Input
                id="barcode"
                placeholder="Enter barcode"
                {...register('barcode')}
                disabled={isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchId">Batch ID (Optional)</Label>
              <Input
                id="batchId"
                placeholder="Enter batch ID"
                {...register('batchId')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !date && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate);
                      if (newDate) {
                        setValue('expiryDate', newDate);
                      }
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              {errors.expiryDate && (
                <p className="text-sm text-red-500">{errors.expiryDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="Enter quantity"
                {...register('quantity')}
              />
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                defaultValue={initialData?.category || 'food'}
                onValueChange={(value) => setValue('category', value as ProductCategory)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Store, Shelf, Bin"
                {...register('location')}
              />
              {errors.location && (
                <p className="text-sm text-red-500">{errors.location.message}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            {isEditing ? 'Update Product' : 'Add Product'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProductForm;
