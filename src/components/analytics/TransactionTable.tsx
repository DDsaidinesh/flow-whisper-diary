
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileSpreadsheet, Search, Calendar, Filter, X, Eraser } from 'lucide-react';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

const TransactionTable = () => {
  const { transactions } = useMoneyFlow();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
    setDateRange({ from: undefined, to: undefined });
  };

  const exportToExcel = () => {
    // Create CSV content
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const csvContent = transactions.map(t => [
      format(new Date(t.date), 'yyyy-MM-dd'),
      t.description,
      t.category,
      t.type,
      t.amount.toString()
    ]);

    // Combine headers and content
    const csv = [headers, ...csvContent]
      .map(row => row.join(','))
      .join('\n');

    // Create and trigger download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'transactions.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || transaction.type === filterType;
    
    const transactionDate = new Date(transaction.date);
    
    // Handle the date range filtering safely
    const matchesDateRange = 
      (!dateRange?.from || transactionDate >= dateRange.from) &&
      (!dateRange?.to || transactionDate <= dateRange.to);
    
    return matchesSearch && matchesType && matchesDateRange;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold">Transaction History</h3>
            <p className="text-muted-foreground">View and manage all your transactions</p>
          </div>
          <Button onClick={exportToExcel} variant="outline">
            <FileSpreadsheet className="mr-2" />
            Export to Excel
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
          
          <Select
            value={filterType}
            onValueChange={(value: "all" | "income" | "expense") => setFilterType(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="income">Income Only</SelectItem>
              <SelectItem value="expense">Expenses Only</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM d, yyyy")} -{" "}
                      {format(dateRange.to, "MMM d, yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM d, yyyy")
                  )
                ) : (
                  <span>Select date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Button 
            variant="outline" 
            size="icon"
            onClick={clearFilters}
            className="shrink-0"
            title="Clear all filters"
          >
            <Eraser className="h-4 w-4" />
            <span className="sr-only">Clear filters</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </span>
        </div>
      </div>
      
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No transactions found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{format(new Date(transaction.date), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell className="text-right">
                    <span className={transaction.type === 'income' ? 'text-flow-green' : 'text-flow-red'}>
                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionTable;
