import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import { SUBSCRIPTION_TIERS, getTierIndex, type SubscriptionTier } from '@/lib/subscription';
import { TIER_DISPLAY } from '@/lib/subscription';

export default function SubscriptionTiers() {
  const { user } = useAuth();
  const currentTier = (user?.plan || 'apprentice') as SubscriptionTier;

  const handleUpgrade = async (tier: SubscriptionTier) => {
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planName: tier })
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error starting subscription:', error);
      alert('Failed to start subscription process. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Subscription Plans
        </h1>
        <p className="mt-4 text-xl text-gray-500">
          Choose the plan that best fits your writing journey
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const tierInfo = TIER_DISPLAY[tier];
          const isCurrentTier = tier === currentTier;
          const isLowerTier = getTierIndex(tier) < getTierIndex(currentTier);

          return (
            <Card 
              key={tier}
              className={`flex flex-col h-full transition-shadow hover:shadow-lg ${
                isCurrentTier ? 'ring-2 ring-primary shadow-lg' : ''
              }`}
            >
              <CardHeader className="flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <i className={`${tierInfo.icon} text-2xl ${tierInfo.color}`} />
                  {isCurrentTier && (
                    <Badge variant="outline" className="bg-primary/10">Current Plan</Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">{tierInfo.name}</CardTitle>
                <div className="mt-2 text-3xl font-bold">
                  {tierInfo.price === 0 ? (
                    'Free'
                  ) : (
                    <>
                      ${tierInfo.price}
                      <span className="text-base font-normal text-muted-foreground">/month</span>
                    </>
                  )}
                </div>
                <CardDescription className="mt-2">{tierInfo.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {tierInfo.features?.map((feature, index) => (
                    <li 
                      key={index} 
                      className={feature.startsWith('//') 
                        ? 'font-semibold text-primary mt-6 first:mt-0' 
                        : 'flex items-start gap-2'}
                    >
                      {!feature.startsWith('//') && (
                        <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
                      )}
                      <span>{feature.startsWith('//') ? feature.substring(3) : feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <div className="p-6 mt-auto">
                <Button
                  className="w-full"
                  variant={isCurrentTier ? "outline" : "default"}
                  onClick={() => handleUpgrade(tier)}
                  disabled={isCurrentTier || isLowerTier}
                >
                  {isCurrentTier 
                    ? 'Current Plan'
                    : isLowerTier
                    ? 'Lower Tier'
                    : tier === 'apprentice'
                    ? 'Free Plan'
                    : 'Upgrade Plan'
                  }
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}