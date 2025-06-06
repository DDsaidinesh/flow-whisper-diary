import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, MinusCircle, Plus, ArrowRightLeft } from 'lucide-react';
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
import TransferForm from './TransferForm';

const formSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  category_id: z.string().min(1, 'Category is required'),
  type: z.enum(['income', 'expense', 'transfer']),
  date: z.string().min(1, 'Date is required'),
  account_id: z.string().min(1, 'Account is required'),
});

type FormData = z.infer<typeof formSchema>;

interface TransactionFormProps {
  isDialog?: boolean;
  onClose?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ isDialog = false, onClose }) => {
  const { toast } = useToast();
  const { addTransaction, categories, accounts, defaultAccount } = useMoneyFlow();
  const [activeType, setActiveType] = useState<TransactionType>('expense');
  const [showTransfer, setShowTransfer] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      description: '',
      category_id: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      account_id: defaultAccount?.id || '',
    },
  });

  // Update account_id when defaultAccount changes
  useEffect(() => {
    if (defaultAccount) {
      form.setValue('account_id', defaultAccount.id);
    }
  }, [defaultAccount, form]);

  const filteredCategories = categories.filter(category => category.type === activeType);
  const activeAccounts = accounts.filter(account => account.is_active);

  const handleTypeChange = (type: TransactionType) => {
    setActiveType(type);
    if (type === 'transfer') {
      setShowTransfer(true);
      setIsOpen(false); // Close the dialog if it's open
      if (isDialog && onClose) {
        onClose(); // Close the dialog if in dialog mode
      }
    } else {
      setShowTransfer(false);
      form.setValue('type', type);
      form.setValue('category_id', '');
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      // Find the category name for display purposes
      const selectedCategory = categories.find(cat => cat.id === data.category_id);
      
      if (!selectedCategory) {
        toast({
          title: 'Error',
          description: 'Selected category not found',
          variant: 'destructive',
        });
        return;
      }

      // Find the selected account
      const selectedAccount = accounts.find(acc => acc.id === data.account_id) || defaultAccount;
      
      if (!selectedAccount) {
        toast({
          title: 'Error',
          description: 'No account selected. Please select an account.',
          variant: 'destructive',
        });
        return;
      }

      // Prepare transaction data
      const transactionData = {
        amount: data.amount,
        description: data.description,
        category_id: data.category_id,
        type: data.type,
        date: data.date,
        from_account_id: data.type === 'expense' ? selectedAccount.id : undefined,
        to_account_id: data.type === 'income' ? selectedAccount.id : undefined,
      };

      await addTransaction(transactionData);
      
      toast({
        title: 'Transaction added!',
        description: `${data.type.charAt(0).toUpperCase() + data.type.slice(1)} of ₹${data.amount.toLocaleString('en-IN')} recorded successfully.`,
      });
      
      form.reset({
        amount: undefined,
        description: '',
        category_id: '',
        type: activeType,
        date: new Date().toISOString().split('T')[0],
        account_id: defaultAccount?.id || '',
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

  const FormContent = () => (
    <div>
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
            activeType === 'transfer' ? 'bg-purple-600 hover:bg-purple-700' : ''
          }`}
          onClick={() => handleTypeChange('transfer')}
        >
          <ArrowRightLeft className="h-4 w-4" />
          Transfer
        </Button>
      </div>

      {showTransfer ? (
        <TransferForm onClose={onClose} onComplete={() => {
          setShowTransfer(false);
          setActiveType('expense');
          if (isDialog && onClose) {
            onClose();
          } else {
            setIsOpen(false);
          }
        }} />
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="flex-1">
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
                name="date"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                          <div className="flex items-center gap-2">
                            {category.color && (
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: category.color }}
                              />
                            )}
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Account Selection - Show for all transaction types */}
            <FormField
              control={form.control}
              name="account_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {activeAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              {account.color && (
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: account.color }}
                                />
                              )}
                              {account.name}
                              {account.is_default && (
                                <span className="text-xs text-muted-foreground">(Default)</span>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground ml-2">
                              ₹{account.balance.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              Add {activeType.charAt(0).toUpperCase() + activeType.slice(1)}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );

  if (isDialog) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Add New Transaction</h2>
        <FormContent />
      </div>
    );
  }

  return (
    <>
      {/* Mobile FAB */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            size="lg"
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden z-50"
          >
            <Plus className="h-6 w-6" />
            <span className="sr-only">Add Transaction</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto px-1">
            <FormContent />
          </div>
        </DialogContent>
      </Dialog>

      {/* Desktop Form */}
      <div className="hidden md:block">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg font-medium">Add New Transaction</CardTitle>
          </CardHeader>
          <CardContent>
            <FormContent />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default TransactionForm;