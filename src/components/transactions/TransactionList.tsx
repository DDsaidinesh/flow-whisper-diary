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
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold mb-4">Recent Transactions</CardTitle>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2 sm:gap-4">
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-auto"
          />
          <Select
            value={filterType}
            onValueChange={setFilterType}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
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
      <CardContent className="px-2 sm:px-6">
        <div className="space-y-4">
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
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
      <div className="flex items-center gap-4 flex-grow min-w-0">
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
            type === 'income' ? 'bg-flow-income-light text-flow-income' : 
            type === 'transfer' ? 'bg-flow-transfer-light text-flow-transfer' : 
            'bg-flow-expense-light text-flow-expense'
          )}
        >
          {getTransactionIcon()}
        </div>
        
        <div className="flex-grow min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
            <div className="min-w-0 flex-grow">
              <h4 className="font-medium text-gray-900 truncate">{description}</h4>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                <span className="text-sm text-gray-500">
                  {format(new Date(date), 'MMM dd, yyyy')}
                </span>
                {getAccountInfo() && (
                  <>
                    <span className="hidden sm:inline text-gray-300">•</span>
                    <span className="text-xs text-gray-400">{getAccountInfo()}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge 
                className={cn(
                  "text-xs",
                  type === 'income' ? 'bg-flow-income-light text-flow-income border-flow-income/20' : 
                  type === 'transfer' ? 'bg-flow-transfer-light text-flow-transfer border-flow-transfer/20' :
                  'bg-flow-expense-light text-flow-expense border-flow-expense/20'
                )}
              >
                {category}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4 shrink-0 ml-4">
        <div className="text-right">
          <span
            className={cn(
              "text-lg font-semibold block",
              type === 'income' ? 'text-flow-income' : 
              type === 'transfer' ? 'text-flow-transfer' :
              'text-flow-expense'
            )}
          >
            {type === 'income' ? '+' : type === 'transfer' ? '' : '-'}₹{formatAmount(amount)}
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(id)}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  );
};

export default TransactionList;