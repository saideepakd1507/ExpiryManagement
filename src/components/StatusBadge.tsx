
import { ExpiryStatus } from '@/types/product';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ExpiryStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const baseClasses = "px-2 py-1 rounded-md text-xs font-medium";
  
  const statusClasses = {
    safe: "bg-green-100 text-green-800 border border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    danger: "bg-red-100 text-red-800 border border-red-200",
  };
  
  const statusText = {
    safe: "Safe",
    warning: "Expiring Soon",
    danger: "Expired",
  };
  
  return (
    <span className={cn(baseClasses, statusClasses[status], className)}>
      {statusText[status]}
    </span>
  );
};

export default StatusBadge;
