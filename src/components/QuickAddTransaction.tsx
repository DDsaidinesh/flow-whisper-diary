import React, { useState } from 'react';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QuickAddTransactionProps {
  onClose: () => void;
}

const QuickAddTransaction: React.FC<QuickAddTransactionProps> = ({ onClose }) => {
  const { addTransaction, categories } = useMoneyFlow();
  const { toast } = useToast();
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickAmounts = [50, 100, 200, 500, 1000, 2000];
  const filteredCategories = categories.filter(cat => cat.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description || !category) {
      toast({
        title: 'Please fill all fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const selectedCategory = categories.find(cat => cat.name === category && cat.type === type);
      
      await addTransaction({
        amount: parseFloat(amount),
        description,
        category,
        category_id: selectedCategory?.id || '',
        type,
        date: new Date().toISOString().split('T')[0],
      });

      toast({
        title: 'Transaction added!',
        description: `${type === 'income' ? 'Income' : 'Expense'} of ₹${amount} recorded.`,
      });

      onClose();
    } catch (error) {
      toast({
        title: 'Error adding transaction',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Add Transaction</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selection */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={type === 'expense' ? 'default' : 'outline'}
                onClick={() => setType('expense')}
                className={`h-12 flex items-center gap-2 ${
                  type === 'expense' ? 'bg-red-600 hover:bg-red-700' : 'border-red-200 text-red-600'
                }`}
              >
                <Minus className="h-4 w-4" />
                Expense
              </Button>
              <Button
                type="button"
                variant={type === 'income' ? 'default' : 'outline'}
                onClick={() => setType('income')}
                className={`h-12 flex items-center gap-2 ${
                  type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'border-green-200 text-green-600'
                }`}
              >
                <Plus className="h-4 w-4" />
                Income
              </Button>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="h-12 text-lg text-center"
                step="0.01"
              />
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAmount(quickAmount.toString())}
                    className="text-xs"
                  >
                    ₹{quickAmount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Input
                placeholder="What was this for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-12"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {filteredCategories.map((cat) => (
                  <Button
                    key={cat.id}
                    type="button"
                    variant={category === cat.name ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategory(cat.name)}
                    className={`text-xs ${
                      category === cat.name
                        ? type === 'income' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                        : ''
                    }`}
                  >
                    {cat.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className={`w-full h-12 text-lg ${
                type === 'income' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {isLoading ? 'Adding...' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickAddTransaction;