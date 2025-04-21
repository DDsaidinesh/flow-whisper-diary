
import React from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet, Download } from 'lucide-react';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';

const TransactionTable = () => {
  const { transactions } = useMoneyFlow();

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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Transaction History</h3>
        <Button onClick={exportToExcel} variant="outline">
          <FileSpreadsheet className="mr-2" />
          Export to Excel
        </Button>
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
            {transactions.map((transaction) => (
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
