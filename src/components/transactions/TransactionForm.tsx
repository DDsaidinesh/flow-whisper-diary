import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, MinusCircle, Plus, Wallet, TrendingUp, TrendingDown, Calendar, Tag, DollarSign } from 'lucide-react';
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

const formSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  category_id: z.string().min(1, 'Category is required'),
  type: z.enum(['income', 'expense']),
  date: z.string().min(1, 'Date is required'),
});

type FormData = z.infer<typeof formSchema>;

interface TransactionFormProps {
  isDialog?: boolean;
  onClose?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ isDialog = false, onClose }) => {
  const { toast } = useToast();
  const { addTransaction, categories } = useMoneyFlow();
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
    },
  });

  const filteredCategories = categories.filter(category => category.type === activeType);

  const handleTypeChange = (type: TransactionType) => {
    setActiveType(type);
    form.setValue('type', type);
    form.setValue('category_id', '');
  };

  const onSubmit = async (data: FormData) => {
    try {
      const selectedCategory = categories.find(cat => cat.id === data.category_id);
      
      if (!selectedCategory) {
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
        category: selectedCategory.name,
        category_id: data.category_id,
        type: data.type,
        date: data.date,
      });
      
      toast({
        title: '✅ Transaction Added!',
        description: `${data.type === 'income' ? 'Income' : 'Expense'} of ₹${data.amount} recorded successfully.`,
      });
      
      form.reset({
        amount: undefined,
        description: '',
        category_id: '',
        type: activeType,
        date: new Date().toISOString().split('T')[0],
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

  // Quick amount buttons for mobile
  const quickAmounts = [50, 100, 200, 500, 1000, 2000];

  const setQuickAmount = (amount: number) => {
    form.setValue('amount', amount);
  };

  if (isDialog) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Add Transaction
          </h2>
          <p className="text-sm text-gray-500 mt-1">Track your money flow</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Type Selection with Enhanced Design */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant={activeType === 'expense' ? 'default' : 'outline'}
                className={`h-16 flex flex-col gap-2 transition-all duration-300 ${
                  activeType === 'expense' 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg scale-105' 
                    : 'hover:bg-red-50 hover:border-red-200'
                }`}
                onClick={() => handleTypeChange('expense')}
              >
                <TrendingDown className="h-5 w-5" />
                <span className="text-sm font-medium">Expense</span>
              </Button>
              <Button
                type="button"
                variant={activeType === 'income' ? 'default' : 'outline'}
                className={`h-16 flex flex-col gap-2 transition-all duration-300 ${
                  activeType === 'income' 
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg scale-105' 
                    : 'hover:bg-green-50 hover:border-green-200'
                }`}
                onClick={() => handleTypeChange('income')}
              >
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium">Income</span>
              </Button>
            </div>

            {/* Amount Field with Quick Buttons */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-base font-medium">
                    <DollarSign className="h-4 w-4" />
                    Amount (₹)
                  </FormLabel>
                  <FormControl>
                    <div className="space-y-3">
                      <Input
                        placeholder="Enter amount"
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        className="h-14 text-lg text-center font-medium"
                        {...field}
                        value={field.value || ''}
                      />
                      {/* Quick Amount Buttons */}
                      <div className="grid grid-cols-3 gap-2">
                        {quickAmounts.map((amount) => (
                          <Button
                            key={amount}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-10 text-xs hover:bg-blue-50 hover:border-blue-200"
                            onClick={() => setQuickAmount(amount)}
                          >
                            ₹{amount}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-base font-medium">
                    <Tag className="h-4 w-4" />
                    Description
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="What was this for?" 
                      className="h-12 text-base" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category */}
            <FormField
              control={form.control}
              name="category_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-base font-medium">
                    <Wallet className="h-4 w-4" />
                    Category
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-12 text-base">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="py-3">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color || '#6b7280' }}
                            />
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

            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-base font-medium">
                    <Calendar className="h-4 w-4" />
                    Date
                  </FormLabel>
                  <FormControl>
                    <Input type="date" className="h-12 text-base" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button 
              type="submit" 
              className={`w-full h-14 text-lg font-medium transition-all duration-300 ${
                activeType === 'expense' 
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl' 
                  : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {activeType === 'income' ? '+ Add Income' : '- Add Expense'}
            </Button>
          </form>
        </Form>
      </div>
    );
  }

  return (
    <>
      {/* Floating Action Button for Mobile */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            size="lg"
            className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl md:hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-4 border-white z-50 transition-all duration-300 hover:scale-110"
          >
            <Plus className="h-8 w-8" />
            <span className="sr-only">Add Transaction</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center pb-4">
            <DialogTitle className="text-xl font-bold">Add New Transaction</DialogTitle>
          </DialogHeader>
          <TransactionForm isDialog={true} onClose={() => setIsOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Desktop Version */}
      <div className="hidden md:block">
        <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Add New Transaction
            </CardTitle>
            <p className="text-sm text-gray-500">Track your money flow</p>
          </CardHeader>
          <CardContent>
            <TransactionForm isDialog={true} />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default TransactionForm;