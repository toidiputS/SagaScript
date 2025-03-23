import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import SubscriptionTiers from '@/components/subscription/SubscriptionTiers';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/layout/sidebar';
import MobileNav from '@/components/layout/mobile-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SubscriptionsPage() {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['/api/subscriptions/plans'],
    queryFn: () => apiRequest('GET', '/api/subscriptions/plans', {}),
  });

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">SagaScript Subscriptions</h1>

        {user ? (
          <>
            <div className="mb-8 p-4 bg-muted rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Your Current Plan: {user.plan || 'Free'}</h2>
              <p className="text-muted-foreground">
                Manage your subscription and explore other plans below.
              </p>
            </div>

            <SubscriptionTiers />
          </>
        ) : (
          <div className="text-center p-8 bg-muted rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Sign in to manage subscriptions</h2>
            <p className="mb-6">Please sign in to view and manage your subscription options.</p>
            <Button>Sign In</Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

// Alternative subscription page with a different layout
export function SubscriptionPlansAlternative() {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: plans, isLoading } = useQuery({
    queryKey: ['/api/subscriptions/plans'],
    queryFn: () => apiRequest('GET', '/api/subscriptions/plans', {}),
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