import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target, DollarSign, PieChart, BarChart } from 'lucide-react';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';
import { useAccounts } from '@/contexts/AccountContext';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  recommendation: string;
  severity: 'success' | 'warning' | 'error' | 'info';
  metric?: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ 
  icon, 
  title, 
  description, 
  recommendation, 
  severity, 
  metric 
}) => {
  const severityColors = {
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    error: 'border-red-200 bg-red-50',
    info: 'border-blue-200 bg-blue-50',
  };

  const iconColors = {
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600',
    info: 'text-blue-600',
  };

  return (
    <Card className={cn('border-l-4', severityColors[severity])}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className={cn('p-2 rounded-full', iconColors[severity])}>
            {icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">{title}</h3>
              {metric && (
                <Badge variant={severity === 'success' ? 'default' : 'secondary'}>
                  {metric}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-3">{description}</p>
            <Alert>
              <AlertDescription className="text-sm">
                <strong>Recommendation:</strong> {recommendation}
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FinancialInsights: React.FC = () => {
  const { transactions, getIncome, getExpenses } = useMoneyFlow();
  const { accounts, calculateNetWorth, getAssetAccounts, getLiabilityAccounts } = useAccounts();

  // Calculate key metrics
  const netWorth = calculateNetWorth();
  const totalIncome = getIncome();
  const totalExpenses = getExpenses();
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
  
  const assetAccounts = getAssetAccounts();
  const liabilityAccounts = getLiabilityAccounts();
  const totalAssets = assetAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiabilities = liabilityAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

  // Emergency fund calculation (3-6 months of expenses)
  const monthlyExpenses = totalExpenses;
  const emergencyFundTarget = monthlyExpenses * 6;
  const cashAccounts = accounts.filter(acc => 
    acc.account_type?.name === 'Cash' || 
    acc.account_type?.name === 'Savings Account' ||
    acc.account_type?.name === 'Emergency Fund'
  );
  const emergencyFund = cashAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const emergencyFundRatio = emergencyFundTarget > 0 ? (emergencyFund / emergencyFundTarget) * 100 : 0;

  // Investment analysis
  const investmentAccounts = accounts.filter(acc => 
    acc.account_type?.name?.includes('Investment') ||
    acc.account_type?.name?.includes('Mutual Fund') ||
    acc.account_type?.name?.includes('Fixed Deposit')
  );
  const totalInvestments = investmentAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const investmentRatio = totalAssets > 0 ? (totalInvestments / totalAssets) * 100 : 0;

  // Account diversification
  const accountTypes = new Set(accounts.map(acc => acc.account_type?.name)).size;
  const diversificationScore = Math.min(accountTypes * 20, 100); // Max 5 types = 100%

  // Transaction patterns
  const recentTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return transactionDate >= thirtyDaysAgo;
  });

  const highExpenseTransactions = recentTransactions
    .filter(t => t.type === 'expense' && t.amount > 5000)
    .length;

  // Generate insights
  const insights: InsightCardProps[] = [
    // Savings Rate Analysis
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: 'Savings Rate Performance',
      description: `Your current savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of your income.`,
      recommendation: savingsRate >= 20 
        ? 'Excellent! Consider increasing investments or exploring higher-yield savings options.'
        : savingsRate >= 10
        ? 'Good start! Try to increase your savings rate by reducing discretionary expenses or finding additional income sources.'
        : 'Focus on creating a budget and cutting unnecessary expenses. Start with a goal of saving 10% of your income.',
      severity: savingsRate >= 20 ? 'success' : savingsRate >= 10 ? 'warning' : 'error',
      metric: `${savingsRate.toFixed(1)}%`
    },

    // Emergency Fund Analysis
    {
      icon: <Target className="h-5 w-5" />,
      title: 'Emergency Fund Status',
      description: `You have ₹${emergencyFund.toLocaleString()} in emergency funds. The recommended amount is 3-6 months of expenses (₹${emergencyFundTarget.toLocaleString()}).`,
      recommendation: emergencyFundRatio >= 100
        ? 'Great! You have adequate emergency funds. Consider investing any excess in higher-yield options.'
        : emergencyFundRatio >= 50
        ? 'You\'re halfway there! Continue building your emergency fund before making major investments.'
        : 'Priority: Build your emergency fund first. Aim for ₹' + (emergencyFundTarget - emergencyFund).toLocaleString() + ' more.',
      severity: emergencyFundRatio >= 100 ? 'success' : emergencyFundRatio >= 50 ? 'warning' : 'error',
      metric: `${emergencyFundRatio.toFixed(0)}%`
    },

    // Debt Management
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      title: 'Debt Management',
      description: `Your debt-to-asset ratio is ${debtToAssetRatio.toFixed(1)}%. A ratio below 30% is considered healthy.`,
      recommendation: debtToAssetRatio <= 30
        ? 'Excellent debt management! You have a healthy balance between assets and liabilities.'
        : debtToAssetRatio <= 50
        ? 'Your debt levels are manageable. Consider paying down high-interest debt first.'
        : 'Focus on debt reduction. Consider debt consolidation or the debt snowball method to reduce liabilities.',
      severity: debtToAssetRatio <= 30 ? 'success' : debtToAssetRatio <= 50 ? 'warning' : 'error',
      metric: `${debtToAssetRatio.toFixed(1)}%`
    },

    // Investment Analysis
    {
      icon: <BarChart className="h-5 w-5" />,
      title: 'Investment Allocation',
      description: `${investmentRatio.toFixed(1)}% of your assets are in investments. Young investors should typically have 60-80% in growth investments.`,
      recommendation: investmentRatio >= 60
        ? 'Good investment allocation! Ensure your portfolio is well-diversified across different asset classes.'
        : investmentRatio >= 30
        ? 'Consider increasing your investment allocation for long-term growth, especially in equity mutual funds or ETFs.'
        : 'After building your emergency fund, prioritize increasing investments for wealth building and inflation protection.',
      severity: investmentRatio >= 60 ? 'success' : investmentRatio >= 30 ? 'warning' : 'info',
      metric: `${investmentRatio.toFixed(1)}%`
    },

    // Account Diversification
    {
      icon: <PieChart className="h-5 w-5" />,
      title: 'Account Diversification',
      description: `You have ${accountTypes} different types of accounts. Diversification helps optimize returns and manage risk.`,
      recommendation: accountTypes >= 5
        ? 'Excellent diversification! Ensure each account serves a specific purpose in your financial strategy.'
        : accountTypes >= 3
        ? 'Good diversification. Consider adding investment accounts or specialized savings accounts.'
        : 'Increase diversification by adding different account types like investment accounts, high-yield savings, or retirement accounts.',
      severity: accountTypes >= 5 ? 'success' : accountTypes >= 3 ? 'warning' : 'info',
      metric: `${accountTypes} types`
    },

    // Spending Patterns
    ...(highExpenseTransactions > 5 ? [{
      icon: <DollarSign className="h-5 w-5" />,
      title: 'Large Transaction Alert',
      description: `You had ${highExpenseTransactions} high-value transactions (>₹5,000) in the last 30 days.`,
      recommendation: 'Review these large expenses to ensure they align with your budget and financial goals. Consider if any could be reduced or eliminated.',
      severity: 'warning' as const,
      metric: `${highExpenseTransactions} large txns`
    }] : []),

    // Net Worth Trend
    {
      icon: netWorth >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />,
      title: 'Net Worth Status',
      description: `Your current net worth is ₹${Math.abs(netWorth).toLocaleString()}. This represents your total financial position.`,
      recommendation: netWorth >= 100000
        ? 'Strong financial position! Focus on growing your net worth through smart investments and continued savings.'
        : netWorth >= 0
        ? 'Positive net worth is great! Continue building assets and minimizing liabilities to increase your wealth.'
        : 'Focus on reducing debt and building assets. Create a plan to move from negative to positive net worth.',
      severity: netWorth >= 100000 ? 'success' : netWorth >= 0 ? 'warning' : 'error',
      metric: `₹${Math.abs(netWorth).toLocaleString()}`
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Insights</h2>
          <p className="text-muted-foreground">
            Personalized recommendations based on your financial data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-green-600">
            {insights.filter(i => i.severity === 'success').length} Good
          </Badge>
          <Badge variant="outline" className="text-yellow-600">
            {insights.filter(i => i.severity === 'warning').length} Needs Attention
          </Badge>
          <Badge variant="outline" className="text-red-600">
            {insights.filter(i => i.severity === 'error').length} Critical
          </Badge>
        </div>
      </div>

      {/* Overall Financial Health Score */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-blue-600" />
            Overall Financial Health Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-blue-600">
                {Math.round(
                  (insights.filter(i => i.severity === 'success').length / insights.length) * 100
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {insights.length} financial factors
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>{insights.filter(i => i.severity === 'success').length} Strengths</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>{insights.filter(i => i.severity === 'warning').length} Improvements</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>{insights.filter(i => i.severity === 'error').length} Critical Areas</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <InsightCard key={index} {...insight} />
        ))}
      </div>

      {/* Quick Action Items */}
      <Card>
        <CardHeader>
          <CardTitle>Priority Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights
              .filter(insight => insight.severity === 'error')
              .slice(0, 3)
              .map((insight, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-red-200 bg-red-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <p className="font-medium text-red-900">{insight.title}</p>
                    <p className="text-sm text-red-700">{insight.recommendation}</p>
                  </div>
                </div>
              ))}
            
            {insights.filter(insight => insight.severity === 'error').length === 0 && (
              <div className="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">Great job!</p>
                  <p className="text-sm text-green-700">
                    You don't have any critical financial issues. Keep up the good work!
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialInsights;