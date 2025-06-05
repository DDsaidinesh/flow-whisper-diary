import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, Wallet, CreditCard } from 'lucide-react';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Mock accounts data - in a real app, this would come from your database
interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'credit' | 'loan';
  balance: number;
  isAsset: boolean;
}

const Accounts: React.FC = () => {
  const { getBalance, getIncome, getExpenses } = useMoneyFlow();
  const [accounts, setAccounts] = useState<Account[]>([
    {
      id: '1',
      name: 'Main Bank Account',
      type: 'checking',
      balance: getBalance(), // Use actual balance from transactions
      isAsset: true,
    },
    {
      id: '2',
      name: 'Adhi Investment',
      type: 'investment',
      balance: 0,
      isAsset: true,
    }
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'checking' as Account['type'],
    balance: 0,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate totals based on actual transaction data
  const actualBalance = getBalance(); // This is Income - Expenses from transactions
  const totalIncome = getIncome();
  const totalExpenses = getExpenses();
  
  // Update the main account balance to reflect actual transactions
  useEffect(() => {
    setAccounts(prevAccounts => 
      prevAccounts.map(account => 
        account.id === '1' 
          ? { ...account, balance: actualBalance }
          : account
      )
    );
  }, [actualBalance]);

  const totalAssets = accounts
    .filter(account => account.isAsset)
    .reduce((sum, account) => sum + Math.max(0, account.balance), 0);

  const totalLiabilities = accounts
    .filter(account => !account.isAsset)
    .reduce((sum, account) => sum + Math.abs(Math.min(0, account.balance)), 0);

  // Net Worth = Assets - Liabilities (which should equal our transaction balance)
  const netWorth = totalAssets - totalLiabilities;

  const handleAddAccount = () => {
    const account: Account = {
      id: Date.now().toString(),
      name: newAccount.name,
      type: newAccount.type,
      balance: newAccount.balance,
      isAsset: ['checking', 'savings', 'investment'].includes(newAccount.type),
    };
    
    setAccounts([...accounts, account]);
    setNewAccount({ name: '', type: 'checking', balance: 0 });
    setIsAddDialogOpen(false);
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(accounts.filter(account => account.id !== id));
  };

  const getAccountIcon = (type: Account['type']) => {
    switch (type) {
      case 'checking':
        return <Wallet className="h-5 w-5" />;
      case 'savings':
        return <TrendingUp className="h-5 w-5" />;
      case 'investment':
        return <TrendingUp className="h-5 w-5" />;
      case 'credit':
        return <CreditCard className="h-5 w-5" />;
      case 'loan':
        return <TrendingDown className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  const getAccountColor = (type: Account['type']) => {
    switch (type) {
      case 'checking':
        return 'bg-flow-blue-light text-flow-blue';
      case 'savings':
        return 'bg-flow-green-light text-flow-green';
      case 'investment':
        return 'bg-purple-100 text-purple-700';
      case 'credit':
        return 'bg-orange-100 text-orange-700';
      case 'loan':
        return 'bg-flow-red-light text-flow-red';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Accounts</h1>
        <p className="text-gray-600">
          Manage your financial accounts, track balances, and organize your money across different account types.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Worth */}
        <Card className={`border-l-4 ${
          netWorth >= 0 ? 'border-l-flow-green bg-flow-green-light/20' : 'border-l-flow-red bg-flow-red-light/20'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                netWorth >= 0 ? 'bg-flow-green-light' : 'bg-flow-red-light'
              }`}>
                <Wallet className={`h-5 w-5 ${
                  netWorth >= 0 ? 'text-flow-green' : 'text-flow-red'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Net Worth</p>
                <p className={`text-xl font-bold ${
                  netWorth >= 0 ? 'text-flow-green' : 'text-flow-red'
                }`}>
                  {formatCurrency(netWorth)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Assets */}
        <Card className="border-l-4 border-l-flow-blue bg-flow-blue-light/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-flow-blue-light">
                <TrendingUp className="h-5 w-5 text-flow-blue" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Assets</p>
                <p className="text-xl font-bold text-flow-blue">
                  {formatCurrency(totalAssets)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Liabilities */}
        <Card className="border-l-4 border-l-orange-400 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-orange-100">
                <TrendingDown className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Liabilities</p>
                <p className="text-xl font-bold text-orange-600">
                  {formatCurrency(totalLiabilities)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Accounts */}
        <Card className="border-l-4 border-l-gray-400 bg-gray-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-gray-100">
                <Wallet className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Accounts</p>
                <p className="text-xl font-bold text-gray-700">
                  {accounts.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts Section */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg font-medium">Your Accounts</CardTitle>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-flow-blue hover:bg-flow-blue-dark">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Account</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="account-name">Account Name</Label>
                    <Input
                      id="account-name"
                      placeholder="e.g., Main Checking Account"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="account-type">Account Type</Label>
                    <Select
                      value={newAccount.type}
                      onValueChange={(value: Account['type']) => setNewAccount({...newAccount, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking Account</SelectItem>
                        <SelectItem value="savings">Savings Account</SelectItem>
                        <SelectItem value="investment">Investment Account</SelectItem>
                        <SelectItem value="credit">Credit Card</SelectItem>
                        <SelectItem value="loan">Loan Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="account-balance">Current Balance</Label>
                    <Input
                      id="account-balance"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newAccount.balance || ''}
                      onChange={(e) => setNewAccount({...newAccount, balance: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleAddAccount} 
                    disabled={!newAccount.name}
                    className="w-full"
                  >
                    Add Account
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="accounts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="accounts">Accounts</TabsTrigger>
              <TabsTrigger value="account-types">Account Types</TabsTrigger>
            </TabsList>
            
            <TabsContent value="accounts" className="space-y-4">
              {accounts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Wallet className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts yet</h3>
                  <p className="text-gray-500 mb-4">Add your first account to start tracking your finances</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accounts.map((account) => (
                    <Card key={account.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${getAccountColor(account.type)}`}>
                              {getAccountIcon(account.type)}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{account.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {account.type}
                                </Badge>
                                <Badge variant={account.isAsset ? "default" : "destructive"} className="text-xs">
                                  {account.isAsset ? 'asset' : 'liability'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className={`text-lg font-bold ${
                                account.balance >= 0 ? 'text-flow-green' : 'text-flow-red'
                              }`}>
                                {formatCurrency(account.balance)}
                              </p>
                            </div>
                            
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-flow-red hover:text-flow-red-dark"
                                onClick={() => handleDeleteAccount(account.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="account-types" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { type: 'checking', name: 'Checking Account', description: 'For daily transactions and expenses' },
                  { type: 'savings', name: 'Savings Account', description: 'For saving money and earning interest' },
                  { type: 'investment', name: 'Investment Account', description: 'For stocks, bonds, and other investments' },
                  { type: 'credit', name: 'Credit Card', description: 'For credit purchases and building credit' },
                  { type: 'loan', name: 'Loan Account', description: 'For tracking loans and debts' },
                ].map((item) => (
                  <Card key={item.type} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${getAccountColor(item.type as Account['type'])}`}>
                          {getAccountIcon(item.type as Account['type'])}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-600">{item.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Accounts;