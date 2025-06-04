import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, MinusCircle, ArrowRightLeft, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { TransactionType, useMoneyFlow } from '@/contexts/MoneyFlowContext';
import { useAccounts } from '@/contexts/AccountContext';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  category_id: z.string().min(1, 'Category is required'),
  type: z.enum(['income', 'expense', 'transfer']),
  date: z.string().min(1, 'Date is required'),
  from_account_id: z.string().optional(),
  to_account_id: z.string().optional(),
}).refine((data) => {
  // For income transactions, to_account_id is required
  if (data.type === 'income' && !data.to_account_id) {
    return false;
  }
  // For expense transactions, from_account_id is required
  if (data.type === 'expense' && !data.from_account_id) {
    return false;
  }
  // For transfer transactions, both accounts are required and must be different
  if (data.type === 'transfer' && (!data.from_account_id || !data.to_account_id || data.from_account_id === data.to_account_id)) {
    return false;
  }
  return true;
}, {
  message: "Please select appropriate accounts for this transaction type",
  path: ["from_account_id"]
});

type FormData = z.infer<typeof formSchema>;

interface EnhancedTransactionFormProps {
  isDialog?: boolean;
  onClose?: () => void;
}

const EnhancedTransactionForm: React.FC<EnhancedTransactionFormProps> = ({ isDialog = false, onClose }) => {
  const { toast } = useToast();
  const { addTransaction, categories } = useMoneyFlow();
  const { accounts } = useAccounts();
  const [activeType, setActiveType] = useState<TransactionType>('expense');
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      description: '',
      category_id: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      from_account_id: '',
      to_account_id: '',
    },
  });

  const filteredCategories = categories.filter(category => category.type === activeType);

  const handleTypeChange = (type: TransactionType) => {
    setActiveType(type);
    form.setValue('type', type);
    form.setValue('category_id', '');
    form.setValue('from_account_id', '');
    form.setValue('to_account_id', '');
  };

  // Set default accounts when accounts are loaded
  useEffect(() => {
    if (accounts.length > 0 && !form.getValues('from_account_id') && !form.getValues('to_account_id')) {
      const defaultAccount = accounts.find(acc => acc.is_default) || accounts[0];
      if (activeType === 'expense') {
        form.setValue('from_account_id', defaultAccount.id);
      } else if (activeType === 'income') {
        form.setValue('to_account_id', defaultAccount.id);
      }
    }
  }, [accounts, activeType, form]);

  const onSubmit = async (data: FormData) => {
    try {
      // Find the category name for display purposes
      const selectedCategory = categories.find(cat => cat.id === data.category_id);
      
      if (!selectedCategory && data.type !== 'transfer') {
        toast({
          title: 'Error',
          description: 'Selected category not found',
          variant: 'destructive',
        });
        return;
      }

      await addTransaction({
        amount: data.amount,
        description: data.description,
        category: selectedCategory?.name || 'Transfer', // For backward compatibility
        category_id: data.category_id || null,
        type: data.type,
        date: data.date,
        from_account_id: data.from_account_id || null,
        to_account_id: data.to_account_id || null,
      });
      
      const typeLabels = {
        income: 'Income',
        expense: 'Expense',
        transfer: 'Transfer'
      };
      
      toast({
        title: 'Transaction added!',
        description: `${typeLabels[data.type]} of ₹${data.amount} recorded.`,
      });
      
      form.reset({
        amount: undefined,
        description: '',
        category_id: '',
        type: activeType,
        date: new Date().toISOString().split('T')[0],
        from_account_id: activeType === 'expense' ? (accounts.find(acc => acc.is_default) || accounts[0])?.id : '',
        to_account_id: activeType === 'income' ? (accounts.find(acc => acc.is_default) || accounts[0])?.id : '',
      });
      
      if (isDialog && onClose) {
        onClose();
      } else {
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Error submitting transaction:', error);
      toast({
        title: 'Error adding transaction',
        description: 'There was a problem adding your transaction. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const TransactionFormContent = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={activeType === 'expense' ? 'default' : 'outline'}
            className={`flex-1 gap-2 ${
              activeType === 'expense' ? 'bg-flow-red hover:bg-flow-red-dark' : ''
            }`}
            onClick={() => handleTypeChange('expense')}
          >
            <MinusCircle className="h-4 w-4" />
            Expense
          </Button>
          <Button
            type="button"
            variant={activeType === 'income' ? 'default' : 'outline'}
            className={`flex-1 gap-2 ${
              activeType === 'income' ? 'bg-flow-green hover:bg-flow-green-dark' : ''
            }`}
            onClick={() => handleTypeChange('income')}
          >
            <PlusCircle className="h-4 w-4" />
            Income
          </Button>
          <Button
            type="button"
            variant={activeType === 'transfer' ? 'default' : 'outline'}
            className={`flex-1 gap-2 ${
              activeType === 'transfer' ? 'bg-flow-blue hover:bg-flow-blue-dark' : ''
            }`}
            onClick={() => handleTypeChange('transfer')}
          >
            <ArrowRightLeft className="h-4 w-4" />
            Transfer
          </Button>
        </div>

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount (₹)</FormLabel>
              <FormControl>
                <Input
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="What was this for?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Account Selection */}
        {activeType === 'expense' && (
          <FormField
            control={form.control}
            name="from_account_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>From Account</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account to pay from" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{account.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{account.account_type?.name}</Badge>
                            <span className="text-sm">₹{account.balance.toLocaleString()}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {activeType === 'income' && (
          <FormField
            control={form.control}
            name="to_account_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>To Account</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select account to receive money" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{account.name}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{account.account_type?.name}</Badge>
                            <span className="text-sm">₹{account.balance.toLocaleString()}</span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {activeType === 'transfer' && (
          <>
            <FormField
              control={form.control}
              name="from_account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Account</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{account.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{account.account_type?.name}</Badge>
                              <span className="text-sm">₹{account.balance.toLocaleString()}</span>
                            </div>
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
              control={form.control}
              name="to_account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Account</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select destination account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{account.name}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{account.account_type?.name}</Badge>
                              <span className="text-sm">₹{account.balance.toLocaleString()}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Category Selection - Not needed for transfers */}
        {activeType !== 'transfer' && (
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className={`w-full mt-6 ${
            activeType === 'expense' 
              ? 'bg-flow-red hover:bg-flow-red-dark' 
              : activeType === 'income'
              ? 'bg-flow-green hover:bg-flow-green-dark'
              : 'bg-flow-blue hover:bg-flow-blue-dark'
          }`}
        >
          Add {activeType === 'income' ? 'Income' : activeType === 'expense' ? 'Expense' : 'Transfer'}
        </Button>
      </form>
    </Form>
  );

  if (isDialog) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Add New Transaction</h2>
        <TransactionFormContent />
      </div>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Add Transaction</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <TransactionFormContent />
        </DialogContent>
      </Dialog>

      <div className="hidden md:block">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Add New Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionFormContent />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default EnhancedTransactionForm;