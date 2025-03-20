import React from 'react';
import { Check, X } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  SUBSCRIPTION_TIERS, 
  SubscriptionTier, 
  TIER_DISPLAY,
  isTierAtLeast,
  getTierIndex 
} from '@/lib/subscription';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

export default function SubscriptionPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const currentTier = (user?.plan || 'apprentice') as SubscriptionTier;
  
  // Mock subscription features based on tier
  const tierFeatures = {
    apprentice: [
      { feature: 'Series', value: '1 series' },
      { feature: 'Books per series', value: '3 books' },
      { feature: 'Characters per series', value: '10 characters' },
      { feature: 'Locations per series', value: '5 locations' },
      { feature: 'AI assistance', value: 'Limited (10/month)' },
      { feature: 'Core gamification', value: true },
    ],
    wordsmith: [
      { feature: 'Series', value: '5 series' },
      { feature: 'Books per series', value: 'Unlimited' },
      { feature: 'Characters per series', value: 'Unlimited' },
      { feature: 'Locations per series', value: 'Unlimited' },
      { feature: 'AI assistance', value: 'Standard (50/month)' },
      { feature: 'Enhanced world-building', value: true },
      { feature: 'Relationship mapping', value: true },
      { feature: 'Writing challenges', value: true },
    ],
    loremaster: [
      { feature: 'Series', value: 'Unlimited' },
      { feature: 'Books per series', value: 'Unlimited' },
      { feature: 'Characters per series', value: 'Unlimited' },
      { feature: 'Locations per series', value: 'Unlimited' },
      { feature: 'AI assistance', value: 'Advanced (200/month)' },
      { feature: 'Enhanced world-building', value: true },
      { feature: 'Relationship mapping', value: true },
      { feature: 'Writing challenges', value: true },
      { feature: 'Timeline management', value: true },
      { feature: 'Multimedia integration', value: true },
      { feature: 'Collaboration tools', value: true },
      { feature: 'Custom character voices', value: true },
    ],
    legendary: [
      { feature: 'Series', value: 'Unlimited' },
      { feature: 'Books per series', value: 'Unlimited' },
      { feature: 'Characters per series', value: 'Unlimited' },
      { feature: 'Locations per series', value: 'Unlimited' },
      { feature: 'AI assistance', value: 'Unlimited' },
      { feature: 'All Loremaster features', value: true },
      { feature: 'Priority support', value: true },
      { feature: 'Early access to new features', value: true },
      { feature: 'Custom feature development', value: true },
    ]
  };

  // Subscription upgrade logic
  const subscriptionMutation = useMutation({
    mutationFn: async (tier: SubscriptionTier) => {
      return await apiRequest('/api/subscriptions', {
        method: 'POST',
        body: JSON.stringify({ planName: tier })
      });
    },
    onSuccess: async () => {
      // Refresh user data to get updated plan
      await refreshUser();
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      
      toast({
        title: 'Subscription updated',
        description: 'Your subscription has been updated successfully.',
        variant: 'default'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error updating subscription',
        description: error.message || 'An error occurred while updating your subscription.',
        variant: 'destructive'
      });
    }
  });

  const handleUpgrade = (tier: SubscriptionTier) => {
    if (getTierIndex(tier) <= getTierIndex(currentTier)) {
      toast({
        title: "Already subscribed",
        description: `You are already subscribed to the ${TIER_DISPLAY[currentTier].name} tier or higher.`,
        variant: "default"
      });
      return;
    }
    
    // For a real implementation, we would redirect to payment processing here
    
    // For now, just update the subscription in our mock data
    subscriptionMutation.mutate(tier);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
        <p className="text-muted-foreground mt-2">
          Choose the right plan to enhance your writing journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const tierInfo = TIER_DISPLAY[tier];
          const isCurrentTier = tier === currentTier;
          const isLowerTier = getTierIndex(tier) < getTierIndex(currentTier);
          
          return (
            <Card 
              key={tier} 
              className={`flex flex-col ${isCurrentTier ? 'border-2 border-primary shadow-lg' : ''}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <i className={`${tierInfo.icon} text-2xl ${tierInfo.color}`}></i>
                  {isCurrentTier && (
                    <Badge variant="outline" className="bg-primary/10">Current Plan</Badge>
                  )}
                </div>
                <CardTitle className="text-xl">{tierInfo.name}</CardTitle>
                <CardDescription>{tierInfo.description}</CardDescription>
                <div className="mt-2 text-2xl font-bold">
                  {tierInfo.price === 0 ? (
                    'Free'
                  ) : (
                    <>
                      ${tierInfo.price.toFixed(2)}
                      <span className="text-sm font-normal text-muted-foreground">/month</span>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {tierFeatures[tier].map((feat, index) => (
                    <li key={index} className="flex items-start">
                      {typeof feat.value === 'boolean' ? (
                        <Check className="h-5 w-5 mr-2 text-green-500 shrink-0" />
                      ) : (
                        <span className="h-5 w-5 mr-2 flex items-center justify-center shrink-0">•</span>
                      )}
                      <span>
                        <strong>{feat.feature}: </strong>
                        {typeof feat.value === 'boolean' ? '' : feat.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  variant={isCurrentTier ? "outline" : "default"}
                  disabled={isCurrentTier || isLowerTier || subscriptionMutation.isPending}
                  onClick={() => handleUpgrade(tier)}
                >
                  {isCurrentTier 
                    ? 'Current Plan' 
                    : isLowerTier 
                      ? 'Downgrade Not Available' 
                      : `Upgrade to ${tierInfo.name}`}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 bg-primary/5 p-6 rounded-lg">
        <h2 className="font-bold text-xl mb-4">Subscription Information</h2>
        <div className="space-y-4">
          <p>
            <strong>Current Plan:</strong> {TIER_DISPLAY[currentTier].name} 
            {currentTier !== 'legendary' && (
              <Button 
                variant="link" 
                className="ml-2"
                onClick={() => handleUpgrade('legendary')}
              >
                Upgrade to Legendary for all features
              </Button>
            )}
          </p>
          <p className="text-sm text-muted-foreground">
            Subscription management is simplified in this demo. In a production environment, 
            billing information, payment history, and detailed subscription management would be available here.
          </p>
        </div>
      </div>
    </div>
  );
}