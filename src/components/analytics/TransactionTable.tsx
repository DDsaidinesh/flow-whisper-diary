
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Filter } from 'lucide-react';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TransactionTable = () => {
  const { transactions } = useMoneyFlow();
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

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
    if (filterType === "all") return true;
    return transaction.type === filterType;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Transaction History</h3>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={filterType === "all"}
                onCheckedChange={() => setFilterType("all")}
              >
                All Transactions
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterType === "income"}
                onCheckedChange={() => setFilterType("income")}
              >
                Income Only
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={filterType === "expense"}
                onCheckedChange={() => setFilterType("expense")}
              >
                Expenses Only
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button onClick={exportToExcel} variant="outline">
            <FileSpreadsheet className="mr-2" />
            Export to Excel
          </Button>
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
            {filteredTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{format(new Date(transaction.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell className="text-right">
                  <span className={transaction.type === 'income' ? 'text-flow-green' : 'text-flow-red'}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TransactionTable;
