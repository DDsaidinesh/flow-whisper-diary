import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, TrendingUp, PieChart, Shield, Smartphone, BarChart3, CreditCard, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMoneyFlow } from '@/contexts/MoneyFlowContext';
import { useToast } from '@/hooks/use-toast';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { migrateLocalData } = useMoneyFlow();
  const { toast } = useToast();

  const handleMigration = async () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please log in first to migrate your data',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    try {
      await migrateLocalData();
    } catch (error: any) {
      toast({
        title: 'Migration failed',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-white/10 backdrop-blur-sm border-white/20">
              <Star className="h-4 w-4 mr-2 text-yellow-500" />
              India's Most Trusted Expense Tracker
            </div>

            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent leading-tight">
                Take Control of Your
                <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Financial Future
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Track expenses, understand spending patterns, and achieve your financial goals with India's smartest money management app.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button 
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')} 
                size="lg" 
                className="h-14 px-8 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start Tracking Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              {!isAuthenticated && (
                <Button 
                  onClick={() => navigate('/login')} 
                  variant="outline" 
                  size="lg" 
                  className="h-14 px-8 text-lg border-2 hover:bg-gray-50 transition-all duration-300"
                >
                  Already have an account?
                </Button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">10K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">₹50Cr+</div>
                <div className="text-sm text-gray-600">Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">4.8★</div>
                <div className="text-sm text-gray-600">User Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything you need to manage money
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Powerful features designed specifically for Indian users to track, analyze, and optimize their financial habits.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Smartphone className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Mobile-First Design</h3>
                <p className="text-gray-600 leading-relaxed">
                  Optimized for mobile usage with quick entry, voice notes, and instant categorization perfect for busy Indian lifestyles.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group bg-gradient-to-br from-purple-50 to-pink-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="inline-flex items-center justify-center p-3 bg-purple-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <PieChart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Smart Analytics</h3>
                <p className="text-gray-600 leading-relaxed">
                  Beautiful charts and insights that help you understand your spending patterns and make informed financial decisions.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="inline-flex items-center justify-center p-3 bg-green-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Bank-Level Security</h3>
                <p className="text-gray-600 leading-relaxed">
                  Your financial data is protected with enterprise-grade encryption and secure cloud storage you can trust.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* App Preview Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Built for the way Indians manage money
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  From street food to EMIs, from cash to UPI - track all your expenses in one place with categories that make sense for Indian spending habits.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-gray-700">Instant expense tracking with quick shortcuts</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-gray-700">Support for multiple currencies (₹, $, €)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-gray-700">Offline mode for areas with poor connectivity</span>
                  </div>
                </div>

                <Button 
                  onClick={() => navigate('/register')} 
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Started Free
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>

              {/* App mockup placeholder */}
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 shadow-2xl">
                  <div className="bg-white rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Today's Expenses</h3>
                      <span className="text-sm text-gray-500">₹1,247</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <CreditCard className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Lunch</div>
                            <div className="text-sm text-gray-500">Food & Dining</div>
                          </div>
                        </div>
                        <span className="font-semibold text-red-600">-₹250</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Freelance Payment</div>
                            <div className="text-sm text-gray-500">Income</div>
                          </div>
                        </div>
                        <span className="font-semibold text-green-600">+₹5,000</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Uber Ride</div>
                            <div className="text-sm text-gray-500">Transportation</div>
                          </div>
                        </div>
                        <span className="font-semibold text-blue-600">-₹180</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to take control of your finances?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of Indians who are already making smarter financial decisions with MoneyFlow.
            </p>
            <Button 
              onClick={() => navigate('/register')} 
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Start Your Financial Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;