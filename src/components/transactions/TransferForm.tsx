import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRightLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';

const transferFormSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  from_account_id: z.string().min(1, 'From account is required'),
  to_account_id: z.string().min(1, 'To account is required'),
  date: z.string().min(1, 'Date is required'),
}).refine(data => data.from_account_id !== data.to_account_id, {
  message: "From and To accounts must be different",
  path: ["to_account_id"],
});

type TransferFormData = z.infer<typeof transferFormSchema>;

interface TransferFormProps {
  onClose?: () => void;
  onComplete?: () => void;
}

const TransferForm: React.FC<TransferFormProps> = ({ onClose, onComplete }) => {
  const { toast } = useToast();
  const { accounts, addTransfer } = useMoneyFlow();
  
  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferFormSchema),
    defaultValues: {
      amount: undefined,
      description: '',
      from_account_id: '',
      to_account_id: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const activeAccounts = accounts.filter(account => account.is_active);

  const onSubmit = async (data: TransferFormData) => {
    try {
      const { amount, description, from_account_id, to_account_id, date } = data;
      
      await addTransfer(from_account_id, to_account_id, amount, description, date);
      
      toast({
        title: 'Transfer completed!',
        description: `Successfully transferred ₹${amount.toLocaleString('en-IN')} between accounts.`,
      });
      
      form.reset();
      
      if (onComplete) {
        onComplete();
      } else if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting transfer:', error);
      toast({
        title: 'Error adding transfer',
        description: 'There was a problem processing your transfer. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
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
                <Input placeholder="What is this transfer for?" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <FormField
            control={form.control}
            name="from_account_id"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>From Account</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source account" />
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

          <FormField
            control={form.control}
            name="to_account_id"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>To Account</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination account" />
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
        </div>

        <Button 
          type="submit" 
          className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
        >
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          Complete Transfer
        </Button>
      </form>
    </Form>
  );
};

export default TransferForm; 