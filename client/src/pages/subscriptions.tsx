import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/simple-auth';
import Sidebar from '@/components/layout/sidebar';
import MobileNav from '@/components/layout/mobile-menu';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SubscriptionsPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => apiRequest('GET', '/api/subscription-plans', {}),
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load subscription plans",
        variant: "destructive"
      });
    }
  });

  return (
    <div className="bg-neutral-50 text-neutral-800 font-sans min-h-screen flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 pt-4 md:pt-0">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <MobileNav />

          {/* Page header */}
          <header className="md:flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">Subscription Plans</h1>
              <p className="text-neutral-600 mt-1">Choose the plan that best fits your writing journey</p>
            </div>
          </header>

          {/* Subscription Plans */}
          <div className="grid gap-6 md:grid-cols-3 my-8">
            {isLoading ? (
              <p>Loading subscription plans...</p>
            ) : (
              plans && plans.map((plan) => (
                <Card key={plan.id} className={`border ${user?.plan === plan.name.toLowerCase() ? 'border-primary' : 'border-border'}`}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{plan.name}</CardTitle>
                      {user?.plan === plan.name.toLowerCase() && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                          Current Plan
                        </Badge>
                      )}
                    </div>
                    <CardDescription>${plan.price}/month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full"
                      variant={user?.plan === plan.name.toLowerCase() ? "outline" : "default"}
                      disabled={user?.plan === plan.name.toLowerCase()}
                    >
                      {user?.plan === plan.name.toLowerCase() ? 'Current Plan' : 'Select Plan'}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Alternative subscription page with a different layout
export function SubscriptionPlansAlternative() {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => apiRequest('GET', '/api/subscription-plans', {}),
  });

  return (
    <div className="bg-neutral-50 text-neutral-800 font-sans min-h-screen flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 pt-4 md:pt-0">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <MobileNav />

          {/* Page header */}
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">Subscription Plans</h1>
            <p className="text-neutral-500 mt-1">Choose the plan that works best for you</p>
          </header>

          {/* Plans grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8">
            {plans && plans.map((plan: any) => (
                <Card key={plan.id || plan.name} className={plan.name === 'Premium' ? 'border-primary' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <div className="text-2xl font-bold mt-2">${plan.price}/mo</div>
                      </div>
                      {plan.name === 'Premium' && (
                        <Badge className="bg-primary text-white">Popular</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <CardDescription className="mb-4">{plan.description}</CardDescription>
                    <ul className="space-y-2 mb-6">
                      {plan.features?.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-green-500">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full"
                      variant={user?.plan === plan.name.toLowerCase() ? "outline" : "default"}
                      disabled={user?.plan === plan.name.toLowerCase()}
                    >
                      {user?.plan === plan.name.toLowerCase() ? 'Current Plan' : 'Select Plan'}
                    </Button>
                  </CardContent>
                </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}