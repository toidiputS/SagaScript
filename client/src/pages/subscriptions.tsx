
import React from 'react';
import MainLayout from '@/components/layout/main-layout';
import SubscriptionTiers from '@/components/subscription/SubscriptionTiers';
import { useAuth } from '@/hooks/useAuth';

export default function SubscriptionsPage() {
  const { user } = useAuth();
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">SagaScript Subscriptions</h1>
        
        {user ? (
          <>
            <div className="mb-8 p-4 bg-muted rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Your Current Plan: {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}</h2>
              <p className="text-muted-foreground">
                Manage your subscription and explore other plans below.
              </p>
            </div>
            
            <SubscriptionTiers />
          </>
        ) : (
          <div className="p-8 text-center">
            <p className="text-lg mb-4">Please log in to view and manage your subscription.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

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
    <div className="bg-neutral-50 text-neutral-800 font-sans min-h-screen flex">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 pt-4 md:pt-0">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <MobileNav />
          
          {/* Page header */}
          <header className="mb-6">
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">Subscription Plans</h1>
            <p className="text-neutral-600 mt-1">Choose the perfect plan for your writing journey</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {isLoading ? (
              <p>Loading subscription plans...</p>
            ) : (
              plans?.map((plan) => (
                <Card key={plan.id} className={`overflow-hidden ${plan.name === 'Premium' ? 'border-primary' : ''}`}>
                  <CardHeader className={`${plan.name === 'Premium' ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
                    <CardTitle className="flex justify-between items-center">
                      <span>{plan.name}</span>
                      {plan.name === 'Premium' && <Badge>Popular</Badge>}
                    </CardTitle>
                    <div className="mt-3">
                      <span className="text-3xl font-bold">${plan.price}</span>
                      <span className="text-sm opacity-80">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <CardDescription className="mb-4">{plan.description}</CardDescription>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 text-green-500">✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={plan.name === 'Premium' ? 'default' : 'outline'}
                      onClick={() => {
                        // In a real app, this would handle subscription/payment
                        toast({
                          title: "Subscription Selection",
                          description: `You selected the ${plan.name} plan.`,
                        });
                      }}
                    >
                      {user?.plan === plan.name.toLowerCase() ? 'Current Plan' : 'Subscribe'}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="mt-10 bg-neutral-100 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-3">Current Subscription</h2>
            <p className="mb-4">You are currently on the <strong>{user?.plan || 'Free'}</strong> plan.</p>
            <Button variant="outline" size="sm">Manage Subscription</Button>
          </div>
        </div>
      </main>
    </div>
  );
}
