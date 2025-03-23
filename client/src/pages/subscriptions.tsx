
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
