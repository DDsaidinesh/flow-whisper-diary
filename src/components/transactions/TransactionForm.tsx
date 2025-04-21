import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { TransactionType, CATEGORIES, useMoneyFlow } from '@/contexts/MoneyFlowContext';

const formSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['income', 'expense']),
  date: z.string().min(1, 'Date is required'),
});

type FormData = z.infer<typeof formSchema>;

const TransactionForm: React.FC = () => {
  const { toast } = useToast();
  const { addTransaction } = useMoneyFlow();
  const [activeType, setActiveType] = useState<TransactionType>('expense');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: undefined,
      description: '',
      category: '',
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const handleTypeChange = (type: TransactionType) => {
    setActiveType(type);
    form.setValue('type', type);
    form.setValue('category', ''); // Reset category when type changes
  };

  const onSubmit = (data: FormData) => {
    addTransaction({
      amount: data.amount,
      description: data.description,
      category: data.category,
      type: data.type,
      date: data.date,
    });
    
    toast({
      title: 'Transaction added!',
      description: `${data.type === 'income' ? 'Income' : 'Expense'} of $${data.amount} recorded.`,
    });
    
    form.reset({
      amount: undefined,
      description: '',
      category: '',
      type: activeType,
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Add New Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-4 mb-6">
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
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Amount ($)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0.00"
                        type="number"
                        step="0.01"
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES[activeType].map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
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
                  : 'bg-flow-green hover:bg-flow-green-dark'
              }`}
            >
              Add {activeType === 'income' ? 'Income' : 'Expense'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;
