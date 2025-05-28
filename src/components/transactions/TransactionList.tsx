import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Trash2, Search, Filter, TrendingUp, TrendingDown, Calendar, X, ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { useMoneyFlow, Transaction } from '@/contexts/MoneyFlowContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

const ITEMS_PER_PAGE = 8; // Consistent items per page

interface TransactionListProps {
  maxHeight?: string;
  showPagination?: boolean;
  className?: string;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  maxHeight = "600px", 
  showPagination = true,
  className 
}) => {
  const { transactions, deleteTransaction } = useMoneyFlow();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType =
        filterType === 'all' ||
        transaction.type === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [transactions, searchTerm, filterType]);

  // Paginated transactions
  const displayTransactions = useMemo(() => {
    if (!showPagination) {
      return filteredTransactions;
    }
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredTransactions.slice(startIndex, endIndex);
  }, [filteredTransactions, currentPage, showPagination]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  if (transactions.length === 0) {
    return (
      <Card className={cn("w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50", className)}>
        <CardContent className="pt-12 pb-12" style={{ height: maxHeight }}>
          <div className="text-center space-y-4 flex flex-col justify-center h-full">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <TrendingUp className="h-8 w-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions yet</h3>
              <p className="text-gray-500">Start tracking your expenses by adding your first transaction!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 flex flex-col", className)}>
      {/* Header - Fixed height */}
      <CardHeader className="space-y-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Recent Transactions
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {showPagination 
                ? `${displayTransactions.length} of ${filteredTransactions.length} transactions`
                : `${Math.min(filteredTransactions.length, 50)} recent transactions`
              }
            </p>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-white border-gray-200 focus:border-blue-300 transition-colors"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[140px] h-10 bg-white border-gray-200">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expenses</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      {/* Content - Scrollable area with fixed height */}
      <CardContent className="flex-1 px-3 sm:px-6 pb-4 overflow-hidden">
        <ScrollArea style={{ height: `calc(${maxHeight} - 200px)` }} className="w-full">
          <div className="space-y-3 pr-4">
            {displayTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Search className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500">No transactions found matching your search</p>
              </div>
            ) : (
              displayTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onDelete={deleteTransaction}
                />
              ))
            )}
          </div>
        </ScrollArea>

        {/* Pagination - Only show if enabled and needed */}
        {showPagination && totalPages > 1 && (
          <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredTransactions.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-xs text-gray-600">
        {startItem}-{endItem} of {totalItems}
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 px-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex gap-1">
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
                className={cn(
                  "h-8 w-8 p-0 text-xs",
                  currentPage === pageNumber && "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 px-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction, onDelete }) => {
  const { id, amount, description, category, type, date } = transaction;
  
  return (
    <div className="group relative bg-white rounded-lg border border-gray-100 p-3 hover:shadow-md transition-all duration-200 hover:border-gray-200">
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
            type === 'income' 
              ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-600' 
              : 'bg-gradient-to-br from-red-100 to-red-200 text-red-600'
          )}
        >
          {type === 'income' ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 truncate text-sm">
                {description}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs font-medium px-2 py-0",
                    type === 'income' 
                      ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                      : 'bg-red-100 text-red-700 hover:bg-red-100'
                  )}
                >
                  {category}
                </Badge>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(date), 'MMM dd')}
                </span>
              </div>
            </div>
            
            {/* Amount and Actions */}
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "text-sm font-bold tabular-nums",
                  type === 'income' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {type === 'income' ? '+' : '-'}₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-400 hover:text-red-500 hover:bg-red-50 h-6 w-6 p-0"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="sr-only">Delete transaction</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this transaction? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => onDelete(id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;