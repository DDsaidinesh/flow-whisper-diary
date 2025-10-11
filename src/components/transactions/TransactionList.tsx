import React, { useState } from 'react';
import { format } from 'date-fns';
import { Trash2, ArrowUpRight, ArrowDownLeft, CreditCard, ArrowRightLeft } from 'lucide-react';
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

const TransactionList: React.FC = () => {
  const { transactions, deleteTransaction, accounts } = useMoneyFlow();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType =
      filterType === 'all' ||
      transaction.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Helper function to get account name
  const getAccountName = (accountId?: string) => {
    if (!accountId) return null;
    const account = accounts.find(acc => acc.id === accountId);
    return account?.name || 'Unknown Account';
  };

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg mb-2">No transactions yet</p>
            <p className="text-sm text-muted-foreground">Add your first transaction to get started!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-primary/20">
      <CardHeader className="pb-4 space-y-4">
        <CardTitle className="text-lg font-semibold">Recent Transactions</CardTitle>
        <div className="flex flex-col gap-3">
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Select
            value={filterType}
            onValueChange={setFilterType}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
              <SelectItem value="transfer">Transfer</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 pb-4">
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {filteredTransactions.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No transactions found</p>
          ) : (
            filteredTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onDelete={deleteTransaction}
                getAccountName={getAccountName}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

interface TransactionItemProps {
  transaction: Transaction;
  onDelete: (id: string) => void;
  getAccountName: (accountId?: string) => string | null;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction, 
  onDelete, 
  getAccountName 
}) => {
  const { id, amount, description, category, type, date, from_account_id, to_account_id } = transaction;
  
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const getTransactionIcon = () => {
    if (type === 'income') {
      return <ArrowUpRight className="h-5 w-5" />;
    } else if (type === 'transfer') {
      return <ArrowRightLeft className="h-5 w-5" />;
    } else {
      return <ArrowDownLeft className="h-5 w-5" />;
    }
  };

  const getAccountInfo = () => {
    if (type === 'income' && to_account_id) {
      return `to ${getAccountName(to_account_id)}`;
    } else if (type === 'expense' && from_account_id) {
      return `from ${getAccountName(from_account_id)}`;
    } else if (type === 'transfer' && from_account_id && to_account_id) {
      return `${getAccountName(from_account_id)} → ${getAccountName(to_account_id)}`;
    }
    return null;
  };
  
  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      {/* Transaction Icon */}
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5",
          type === 'income' ? 'bg-green-100 text-green-600' : 
          type === 'transfer' ? 'bg-blue-100 text-blue-600' : 
          'bg-red-100 text-red-600'
        )}
      >
        {getTransactionIcon()}
      </div>
      
      {/* Transaction Details */}
      <div className="flex-grow min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-grow">
            <h4 className="font-medium text-gray-900 truncate">{description}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-500">
                {format(new Date(date), 'MMM dd, yyyy')}
              </span>
              {getAccountInfo() && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs text-gray-400">{getAccountInfo()}</span>
                </>
              )}
            </div>
            <div className="mt-2 flex items-center">
              <Badge 
                className={cn(
                  "text-xs inline-block max-w-fit",
                  type === 'income' ? 'bg-green-100 text-green-700 border-green-200' : 
                  type === 'transfer' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                  'bg-red-100 text-red-700 border-red-200'
                )}
              >
                {category}
              </Badge>
            </div>
          </div>
          
          {/* Amount and Delete Button */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right min-w-[100px]">
              <span
                className={cn(
                  "text-lg font-semibold block",
                  type === 'income' ? 'text-green-600' : 
                  type === 'transfer' ? 'text-blue-600' :
                  'text-red-600'
                )}
              >
                {type === 'income' ? '+' : type === 'transfer' ? '' : '-'}₹{formatAmount(amount)}
              </span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(id)}
              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 shrink-0"
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