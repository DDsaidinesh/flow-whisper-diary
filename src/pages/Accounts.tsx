import React, { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, Wallet, CreditCard, Building, Landmark, PiggyBank } from 'lucide-react';
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
  DialogFooter,
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
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Define account types that match your database
type AccountType = 'checking' | 'savings' | 'investment' | 'credit' | 'loan' | 'cash' | 'wallet';

interface NewAccountData {
  name: string;
  type: AccountType;
  initial_balance: number;
  currency: string;
  description?: string;
  color?: string;
  account_number?: string;
}

// DB account type shape
interface DBAccountType {
  id: string;
  name: string;
  category: 'asset' | 'liability' | 'equity';
  is_system?: boolean;
}
const Accounts: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { accounts, defaultAccount } = useMoneyFlow();
const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
const [newAccount, setNewAccount] = useState<NewAccountData>({
  name: '',
  type: 'checking',
  initial_balance: 0,
  currency: 'INR',
  description: '',
  color: '#2196f3',
});
const [accountTypes, setAccountTypes] = useState<DBAccountType[]>([]);

React.useEffect(() => {
  const loadTypes = async () => {
    if (!user) { setAccountTypes([]); return; }
    const { data, error } = await supabase
      .from('account_types')
      .select('id,name,category,is_system')
      .or(`is_system.eq.true,user_id.eq.${user.id}`)
      .order('is_system', { ascending: false })
      .order('name');
    if (!error && data) setAccountTypes(data as DBAccountType[]);
  };
  loadTypes();
}, [user]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const typesMap = React.useMemo(() => new Map(accountTypes.map(t => [t.id, t])), [accountTypes]);

  const totalAssets = accounts
    .filter((account) => typesMap.get(account.account_type_id)?.category === 'asset')
    .reduce((sum, account) => sum + account.balance, 0);

  const totalLiabilities = accounts
    .filter((account) => typesMap.get(account.account_type_id)?.category === 'liability')
    .reduce((sum, account) => sum + account.balance, 0);

  const netWorth = totalAssets - totalLiabilities;

  const resolveTypeMeta = (type: AccountType): { name: string; category: 'asset' | 'liability' | 'equity' } => {
    switch (type) {
      case 'checking': return { name: 'Checking', category: 'asset' };
      case 'savings': return { name: 'Savings', category: 'asset' };
      case 'investment': return { name: 'Investment', category: 'asset' };
      case 'credit': return { name: 'Credit Card', category: 'liability' };
      case 'loan': return { name: 'Loan', category: 'liability' };
      case 'cash': return { name: 'Cash', category: 'asset' };
      case 'wallet': return { name: 'Wallet', category: 'asset' };
      default: return { name: 'Account', category: 'asset' };
    }
  };

  const getOrCreateAccountType = async (type: AccountType): Promise<string> => {
    if (!user) throw new Error('Not authenticated');
    const meta = resolveTypeMeta(type);
    const { data: existing } = await supabase
      .from('account_types')
      .select('id')
      .eq('name', meta.name)
      .or(`is_system.eq.true,user_id.eq.${user.id}`)
      .maybeSingle();

    if (existing?.id) return existing.id;

    const { data, error } = await supabase
      .from('account_types')
      .insert([{ name: meta.name, category: meta.category, user_id: user.id, is_system: false }])
      .select('id')
      .single();
    if (error) throw error;
    return data.id as string;
  };

  const handleAddAccount = async () => {
    if (!user) return;

    try {
      const accountTypeId = await getOrCreateAccountType(newAccount.type);
      const { data, error } = await supabase
        .from('accounts')
        .insert([{
          user_id: user.id,
          name: newAccount.name,
          account_type_id: accountTypeId,
          balance: newAccount.initial_balance,
          initial_balance: newAccount.initial_balance,
          currency: newAccount.currency,
          description: newAccount.description,
          color: newAccount.color,
          account_number: newAccount.account_number,
          is_active: true,
          is_default: accounts.length === 0,
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Account created!',
        description: `Successfully created ${newAccount.name} account.`,
      });

      setNewAccount({
        name: '',
        type: 'checking',
        initial_balance: 0,
        currency: 'INR',
        description: '',
        color: '#2196f3',
      });
      setIsAddDialogOpen(false);
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast({
        title: 'Error',
        description: 'Failed to create account. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return <Building className="h-5 w-5" />;
      case 'savings':
        return <PiggyBank className="h-5 w-5" />;
      case 'investment':
        return <TrendingUp className="h-5 w-5" />;
      case 'credit':
        return <CreditCard className="h-5 w-5" />;
      case 'loan':
        return <Landmark className="h-5 w-5" />;
      case 'cash':
      case 'wallet':
        return <Wallet className="h-5 w-5" />;
      default:
        return <Wallet className="h-5 w-5" />;
    }
  };

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'checking':
        return 'bg-blue-100 text-blue-700';
      case 'savings':
        return 'bg-green-100 text-green-700';
      case 'investment':
        return 'bg-purple-100 text-purple-700';
      case 'credit':
        return 'bg-orange-100 text-orange-700';
      case 'loan':
        return 'bg-red-100 text-red-700';
      case 'cash':
      case 'wallet':
        return 'bg-gray-100 text-gray-700';
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
          netWorth >= 0 ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                netWorth >= 0 ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <Wallet className={`h-5 w-5 ${
                  netWorth >= 0 ? 'text-green-600' : 'text-red-600'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Net Worth</p>
                <p className={`text-xl font-bold ${
                  netWorth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(netWorth)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Assets */}
        <Card className="border-l-4 border-l-blue-500 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Assets</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(totalAssets)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Liabilities */}
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Liabilities</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(totalLiabilities)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Accounts */}
        <Card className="border-l-4 border-l-gray-500 bg-gray-50">
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
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Account</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Account Name</Label>
                    <Input
                      id="name"
                      value={newAccount.name}
                      onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                      placeholder="e.g., Main Bank Account"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="type">Account Type</Label>
                    <Select
                      value={newAccount.type}
                      onValueChange={(value: AccountType) => setNewAccount({ ...newAccount, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select account type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking Account</SelectItem>
                        <SelectItem value="savings">Savings Account</SelectItem>
                        <SelectItem value="investment">Investment Account</SelectItem>
                        <SelectItem value="credit">Credit Card</SelectItem>
                        <SelectItem value="loan">Loan</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="wallet">Digital Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="balance">Initial Balance</Label>
                    <Input
                      id="balance"
                      type="number"
                      value={newAccount.initial_balance}
                      onChange={(e) => setNewAccount({ ...newAccount, initial_balance: parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={newAccount.description}
                      onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
                      placeholder="Add a description for this account"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="account_number">Account Number (Optional)</Label>
                    <Input
                      id="account_number"
                      value={newAccount.account_number}
                      onChange={(e) => setNewAccount({ ...newAccount, account_number: e.target.value })}
                      placeholder="Last 4 digits of account number"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddAccount}>
                    Add Account
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => {
              const typeObj = accountTypes.find(t => t.id === account.account_type_id);
              const typeName = typeObj?.name || 'Account';
              const normalizedType = typeName.toLowerCase();
              return (
                <Card key={account.id} className="relative overflow-hidden">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getAccountColor(normalizedType)}`}>
                          {getAccountIcon(normalizedType)}
                        </div>
                        <div>
                          <h3 className="font-medium">{account.name}</h3>
                          <p className="text-sm text-gray-500">{typeName}</p>
                        </div>
                      </div>
                    </div>
                    {account.is_default && (
                      <Badge variant="outline" className="ml-2">Default</Badge>
                    )}
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-bold">
                      {formatCurrency(account.balance)}
                    </p>
                    {account.description && (
                      <p className="text-sm text-gray-500 mt-2">{account.description}</p>
                    )}
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {!account.is_default && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Accounts;