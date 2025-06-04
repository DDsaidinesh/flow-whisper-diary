import React, { useState } from 'react';
import { Plus, Edit, Trash2, CreditCard, Wallet, TrendingUp, Building, Smartphone, Lock, Home, Car, Gem, Briefcase, CreditCard as CreditCardIcon } from 'lucide-react';
import { useAccounts } from '@/contexts/AccountContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';

// Account form schema
const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  account_type_id: z.string().min(1, 'Account type is required'),
  initial_balance: z.coerce.number(),
  description: z.string().optional(),
  account_number: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  currency: z.string().default('INR'),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false)
});

// Account type form schema
const accountTypeSchema = z.object({
  name: z.string().min(1, 'Account type name is required'),
  category: z.enum(['asset', 'liability', 'equity']),
  description: z.string().optional(),
  color: z.string().optional(),
  icon: z.string().optional(),
  affects_net_worth: z.boolean().default(true),
  is_default: z.boolean().default(false)
});

type AccountFormData = z.infer<typeof accountSchema>;
type AccountTypeFormData = z.infer<typeof accountTypeSchema>;

// Icon mapping for account types
const getAccountTypeIcon = (name: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'Cash': <Wallet className="h-5 w-5" />,
    'Checking Account': <Building className="h-5 w-5" />,
    'Savings Account': <TrendingUp className="h-5 w-5" />,
    'Credit Card': <CreditCardIcon className="h-5 w-5" />,
    'Investment': <TrendingUp className="h-5 w-5" />,
    'Loan': <Home className="h-5 w-5" />,
    'Digital Wallet': <Smartphone className="h-5 w-5" />,
    'Fixed Deposit': <Lock className="h-5 w-5" />,
    'Mutual Fund': <TrendingUp className="h-5 w-5" />,
    'Real Estate': <Home className="h-5 w-5" />,
    'Gold/Jewelry': <Gem className="h-5 w-5" />,
    'Vehicle': <Car className="h-5 w-5" />,
    'Emergency Fund': <CreditCard className="h-5 w-5" />,
    'Business Account': <Briefcase className="h-5 w-5" />,
  };
  
  return iconMap[name] || <Wallet className="h-5 w-5" />;
};

const AccountsManagement: React.FC = () => {
  const { 
    accounts, 
    accountTypes, 
    addAccount, 
    updateAccount, 
    deleteAccount,
    addAccountType,
    updateAccountType,
    deleteAccountType,
    calculateNetWorth,
    getAssetAccounts,
    getLiabilityAccounts,
    isLoading
  } = useAccounts();

  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isAccountTypeDialogOpen, setIsAccountTypeDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [editingAccountType, setEditingAccountType] = useState<any>(null);

  const accountForm = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: '',
      account_type_id: '',
      initial_balance: 0,
      description: '',
      account_number: '',
      color: '',
      icon: '',
      currency: 'INR',
      is_active: true,
      is_default: false
    },
  });

  const accountTypeForm = useForm<AccountTypeFormData>({
    resolver: zodResolver(accountTypeSchema),
    defaultValues: {
      name: '',
      category: 'asset',
      description: '',
      color: '',
      icon: '',
      affects_net_worth: true,
      is_default: false
    },
  });

  const onAccountSubmit = async (data: AccountFormData) => {
    try {
      const accountData = {
        name: data.name,
        account_type_id: data.account_type_id,
        initial_balance: data.initial_balance,
        description: data.description,
        account_number: data.account_number,
        color: data.color,
        icon: data.icon,
        currency: data.currency,
        is_active: data.is_active,
        is_default: data.is_default
      };

      if (editingAccount) {
        await updateAccount(editingAccount.id, accountData);
      } else {
        await addAccount(accountData);
      }
      setIsAccountDialogOpen(false);
      accountForm.reset();
      setEditingAccount(null);
    } catch (error) {
      console.error('Error saving account:', error);
    }
  };

  const onAccountTypeSubmit = async (data: AccountTypeFormData) => {
    try {
      const accountTypeData = {
        name: data.name,
        category: data.category,
        description: data.description,
        color: data.color,
        icon: data.icon,
        affects_net_worth: data.affects_net_worth,
        is_default: data.is_default
      };

      if (editingAccountType) {
        await updateAccountType(editingAccountType.id, accountTypeData);
      } else {
        await addAccountType(accountTypeData);
      }
      setIsAccountTypeDialogOpen(false);
      accountTypeForm.reset();
      setEditingAccountType(null);
    } catch (error) {
      console.error('Error saving account type:', error);
    }
  };

  const handleEditAccount = (account: any) => {
    setEditingAccount(account);
    accountForm.reset({
      name: account.name,
      account_type_id: account.account_type_id,
      initial_balance: account.initial_balance,
      description: account.description || '',
      account_number: account.account_number || '',
      color: account.color || '',
      icon: account.icon || '',
      currency: account.currency || 'INR',
      is_active: account.is_active,
      is_default: account.is_default
    });
    setIsAccountDialogOpen(true);
  };

  const handleEditAccountType = (accountType: any) => {
    setEditingAccountType(accountType);
    accountTypeForm.reset({
      name: accountType.name,
      category: accountType.category,
      description: accountType.description || '',
      color: accountType.color || '',
      icon: accountType.icon || '',
      affects_net_worth: accountType.affects_net_worth,
      is_default: accountType.is_default
    });
    setIsAccountTypeDialogOpen(true);
  };

  const netWorth = calculateNetWorth();
  const assetAccounts = getAssetAccounts();
  const liabilityAccounts = getLiabilityAccounts();
  const totalAssets = assetAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p>Loading accounts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Net Worth Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Worth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{netWorth.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totalAssets.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Liabilities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{totalLiabilities.toLocaleString()}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Accounts and Account Types Tabs */}
      <Tabs defaultValue="accounts" className="w-full">
        <TabsList>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="account-types">Account Types</TabsTrigger>
        </TabsList>
        
        <TabsContent value="accounts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Your Accounts</h3>
            <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingAccount(null);
                  accountForm.reset();
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingAccount ? 'Edit Account' : 'Add New Account'}</DialogTitle>
                </DialogHeader>
                <Form {...accountForm}>
                  <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-4">
                    <FormField
                      control={accountForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Main Checking" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={accountForm.control}
                      name="account_type_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Type</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select account type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {accountTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  <div className="flex items-center gap-2">
                                    {getAccountTypeIcon(type.name)}
                                    {type.name}
                                    <Badge variant={type.category === 'asset' ? 'default' : 'secondary'}>
                                      {type.category}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={accountForm.control}
                      name="initial_balance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Initial Balance</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={accountForm.control}
                      name="account_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="****1234" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={accountForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Account description..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => {
                        setIsAccountDialogOpen(false);
                        setEditingAccount(null);
                        accountForm.reset();
                      }}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingAccount ? 'Update' : 'Create'} Account
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Accounts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <Card key={account.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getAccountTypeIcon(account.account_type?.name || '')}
                      <div>
                        <CardTitle className="text-sm">{account.name}</CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {account.account_type?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleEditAccount(account)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-8 w-8">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Account</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{account.name}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteAccount(account.id)}
                              className="bg-destructive text-destructive-foreground"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ₹{account.balance.toLocaleString()}
                  </div>
                  {account.account_number && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {account.account_number}
                    </p>
                  )}
                  {account.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {account.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant={account.account_type?.category === 'asset' ? 'default' : 'secondary'}>
                      {account.account_type?.category}
                    </Badge>
                    {account.is_default && (
                      <Badge variant="outline">Default</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {accounts.length === 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No accounts found. Create your first account to get started!</p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="account-types" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Account Types</h3>
            <Dialog open={isAccountTypeDialogOpen} onOpenChange={setIsAccountTypeDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingAccountType(null);
                  accountTypeForm.reset();
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Account Type
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>{editingAccountType ? 'Edit Account Type' : 'Add New Account Type'}</DialogTitle>
                </DialogHeader>
                <Form {...accountTypeForm}>
                  <form onSubmit={accountTypeForm.handleSubmit(onAccountTypeSubmit)} className="space-y-4">
                    <FormField
                      control={accountTypeForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type Name</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Crypto Wallet" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={accountTypeForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="asset">Asset</SelectItem>
                              <SelectItem value="liability">Liability</SelectItem>
                              <SelectItem value="equity">Equity</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={accountTypeForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Type description..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => {
                        setIsAccountTypeDialogOpen(false);
                        setEditingAccountType(null);
                        accountTypeForm.reset();
                      }}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingAccountType ? 'Update' : 'Create'} Type
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Account Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accountTypes.map((type) => (
              <Card key={type.id} className="relative">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getAccountTypeIcon(type.name)}
                      <div>
                        <CardTitle className="text-sm">{type.name}</CardTitle>
                        <Badge variant={type.category === 'asset' ? 'default' : 'secondary'}>
                          {type.category}
                        </Badge>
                      </div>
                    </div>
                    {!type.is_system && (
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleEditAccountType(type)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Account Type</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{type.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteAccountType(type.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {type.description && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {type.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    {type.is_system && (
                      <Badge variant="outline">System</Badge>
                    )}
                    {type.affects_net_worth && (
                      <Badge variant="outline">Affects Net Worth</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AccountsManagement;