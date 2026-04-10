import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

export default function Pagination({ currentPage, totalPages, onPageChange, totalItems, pageSize }: PaginationProps) {
  if (totalPages <= 1) return null;
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-sm text-muted-foreground">Showing {start}–{end} of {totalItems}</p>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage <= 1} onClick={() => onPageChange(1)}><ChevronsLeft className="w-4 h-4" /></Button>
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}><ChevronLeft className="w-4 h-4" /></Button>
        <span className="text-sm px-3 text-foreground font-medium">{currentPage} / {totalPages}</span>
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}><ChevronRight className="w-4 h-4" /></Button>
        <Button variant="outline" size="icon" className="h-8 w-8" disabled={currentPage >= totalPages} onClick={() => onPageChange(totalPages)}><ChevronsRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}
