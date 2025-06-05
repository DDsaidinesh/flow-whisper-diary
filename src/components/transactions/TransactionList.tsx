import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Trash2, Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
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

const ITEMS_PER_PAGE = 10; // Show 10 transactions per page

const TransactionList: React.FC = () => {
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

  // Paginate transactions
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  if (transactions.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions yet</h3>
            <p className="text-gray-500 mb-4">Start tracking your finances by adding your first transaction</p>
            <Button className="bg-flow-blue hover:bg-flow-blue-dark">
              Add Transaction
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-medium">Transaction History</CardTitle>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="h-4 w-4" />
              <span>
                {filteredTransactions.length} of {transactions.length} transactions
                {filteredTransactions.length > ITEMS_PER_PAGE && (
                  <span className="ml-1">
                    (Page {currentPage} of {totalPages})
                  </span>
                )}
              </span>
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-[150px] h-10">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || filterType !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="h-10 px-3"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-2 sm:px-6">
        {/* Transactions */}
        <div className="space-y-3 min-h-[400px]">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No transactions found</p>
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
              >
                Clear filters
              </Button>
            </div>
          ) : paginatedTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">No transactions on this page</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(1)}
              >
                Go to first page
              </Button>
            </div>
          ) : (
            paginatedTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onDelete={deleteTransaction}
                formatCurrency={formatCurrency}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Page Info */}
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                  {getPaginationRange().map((page, index) => (
                    <React.Fragment key={index}>
                      {page === '...' ? (
                        <span className="px-2 py-1 text-sm text-gray-500">...</span>
                      ) : (
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => goToPage(page as number)}
                          className={cn(
                            "h-8 w-8 p-0 text-sm",
                            currentPage === page && "bg-flow-blue hover:bg-flow-blue-dark"
                          )}
                        >
                          {page}
                        </Button>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                {/* Next Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Jump on Mobile */}
            <div className="mt-3 sm:hidden">
              <div className="flex items-center justify-center gap-2 text-sm">
                <span>Jump to page:</span>
                <Select
                  value={currentPage.toString()}
                  onValueChange={(value) => goToPage(parseInt(value))}
                >
                  <SelectTrigger className="w-20 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <SelectItem key={page} value={page.toString()}>
                        {page}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
  formatCurrency: (amount: number) => string;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction, 
  onDelete, 
  formatCurrency 
}) => {
  const { id, amount, description, category, type, date } = transaction;
  
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors group">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Transaction Type Indicator */}
        <div
          className={cn(
            "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0",
            type === 'income' 
              ? 'bg-flow-green-light text-flow-green' 
              : 'bg-flow-red-light text-flow-red'
          )}
        >
          <span className="text-lg font-semibold">
            {type === 'income' ? '+' : '-'}
          </span>
        </div>
        
        {/* Transaction Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-4">
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                {description}
              </h4>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                <Badge 
                  variant="outline"
                  className={cn(
                    "text-xs w-fit",
                    type === 'income' 
                      ? 'border-flow-green text-flow-green' 
                      : 'border-flow-red text-flow-red'
                  )}
                >
                  {category}
                </Badge>
                <span className="text-xs text-gray-500">
                  {format(new Date(date), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
            
            {/* Amount - Desktop */}
            <div className="hidden sm:flex items-center gap-3">
              <span
                className={cn(
                  "text-lg font-semibold",
                  type === 'income' ? 'text-flow-green' : 'text-flow-red'
                )}
              >
                {type === 'income' ? '+' : '-'}{formatCurrency(amount)}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(id)}
                className="text-gray-400 hover:text-flow-red hover:bg-flow-red-light opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
          
          {/* Amount and Delete Button - Mobile */}
          <div className="flex items-center justify-between mt-2 sm:hidden">
            <span
              className={cn(
                "text-lg font-semibold",
                type === 'income' ? 'text-flow-green' : 'text-flow-red'
              )}
            >
              {type === 'income' ? '+' : '-'}{formatCurrency(amount)}
            </span>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(id)}
              className="text-gray-400 hover:text-flow-red hover:bg-flow-red-light h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionList;