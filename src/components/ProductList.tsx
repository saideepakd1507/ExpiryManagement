
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Product, ProductFilter, ExpiryStatus } from '@/types/product';
import { getExpiryStatus } from '@/services/productService';
import StatusBadge from './StatusBadge';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit, Trash2, Filter, Search as SearchIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProductListProps {
  products: Product[];
  onDelete: (id: string) => void;
  initialSearchTerm?: string;
}

const ProductList = ({ products, onDelete, initialSearchTerm = '' }: ProductListProps) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [statusFilter, setStatusFilter] = useState<ExpiryStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [highlightedProduct, setHighlightedProduct] = useState<string | null>(null);

  // Update search term when initialSearchTerm changes
  useEffect(() => {
    setSearchTerm(initialSearchTerm);
    
    // If there's a search term, find the first matching product and highlight it
    if (initialSearchTerm) {
      const matchingProduct = products.find(product => 
        product.name.toLowerCase().includes(initialSearchTerm.toLowerCase()) ||
        product.barcode?.toLowerCase().includes(initialSearchTerm.toLowerCase()) ||
        product.batchId?.toLowerCase().includes(initialSearchTerm.toLowerCase())
      );
      
      if (matchingProduct) {
        setHighlightedProduct(matchingProduct.id);
        // Clear highlight after 3 seconds
        setTimeout(() => {
          setHighlightedProduct(null);
        }, 3000);
      }
    }
  }, [initialSearchTerm, products]);

  const handleEdit = (id: string) => {
    navigate(`/edit/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      onDelete(productToDelete);
      setProductToDelete(null);
    }
  };

  const cancelDelete = () => {
    setProductToDelete(null);
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.batchId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      getExpiryStatus(product.expiryDate) === statusFilter;
    
    const matchesCategory = 
      categoryFilter === 'all' || 
      product.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getStatusStyles = (expiryDate: Date) => {
    const status = getExpiryStatus(expiryDate);
    switch (status) {
      case 'danger':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      default:
        return '';
    }
  };

  const getRowStyles = (product: Product) => {
    const statusStyle = getStatusStyles(product.expiryDate);
    const highlightStyle = highlightedProduct === product.id ? 'bg-blue-100 animate-pulse' : '';
    return `${statusStyle} ${highlightStyle}`.trim();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex-1">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, barcode, or batch ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md pl-8"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ExpiryStatus | 'all')}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="safe">Safe</SelectItem>
              <SelectItem value="warning">Expiring Soon</SelectItem>
              <SelectItem value="danger">Expired</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="food">Food</SelectItem>
              <SelectItem value="medicine">Medicine</SelectItem>
              <SelectItem value="cosmetics">Cosmetics</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <AlertDialog open={productToDelete !== null} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id} className={getRowStyles(product)}>
                  <TableCell className="font-medium">
                    <div>
                      {product.name}
                      {product.barcode && (
                        <div className="text-xs text-gray-500">
                          {product.barcode}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                  </TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{format(new Date(product.expiryDate), 'dd MMM yyyy')}</TableCell>
                  <TableCell>
                    <StatusBadge status={getExpiryStatus(product.expiryDate)} />
                  </TableCell>
                  <TableCell>{product.location}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(product.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteClick(product.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductList;
