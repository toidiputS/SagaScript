
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Badge, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';

type SubscriptionTier = 'apprentice' | 'wordsmith' | 'loremaster';

interface TierInfo {
  name: string;
  description: string;
  price: number;
  icon: string;
  color: string;
  features: string[];
}

const TIER_DISPLAY: Record<SubscriptionTier, TierInfo> = {
  apprentice: {
    name: "The Apprentice",
    description: "Basic series organization and character tracking",
    price: 0,
    icon: "ri-quill-pen-line",
    color: "text-gray-600",
    features: [
      "Basic series outline with up to 3 books",
      "Simple linear timeline for plot events",
      "Limited milestone tracking (10 major plot points)",
      "Basic book-to-book connection tracker",
      "Text-only series planning",
      "Basic character profiles for up to 10 characters",
      "Simple relationship mapping (direct connections only)",
      "Up to 10 location entries",
      "Basic daily word count goals",
      "Simple progress tracking",
      "7-day streak visualization",
      "Basic AI assistance (3 prompts per day)",
      "5GB cloud storage",
      "Email support with 48-hour response time"
    ]
  },
  wordsmith: {
    name: "The Wordsmith",
    description: "Enhanced world-building tools with advanced character management",
    price: 9.99,
    icon: "ri-book-open-line",
    color: "text-blue-600",
    features: [
      "Expanded series planning for unlimited books",
      "Visual timeline with branching capabilities",
      "Advanced milestone system (unlimited plot points)",
      "Comprehensive story arc designer",
      "Unlimited character profiles",
      "Advanced character development tracking",
      "Relationship web visualization",
      "Character consistency alerts",
      "Unlimited location entries",
      "Hierarchical location organization",
      "Customizable writing goals",
      "30-day streak visualization",
      "Enhanced AI continuity checking",
      "25GB cloud storage",
      "Priority email support with 24-hour response time"
    ]
  },
  loremaster: {
    name: "The Loremaster",
    description: "Professional series blueprint with comprehensive features",
    price: 19.99,
    icon: "ri-magic-line",
    color: "text-purple-600",
    features: [
      "Professional series blueprint designer",
      "Multi-dimensional timeline with nested events",
      "Adaptive timeline scaling (days to millennia)",
      "Comprehensive foreshadowing tracker",
      "Visual plot thread mapper",
      "Series pacing analysis",
      "Advanced character psychology profiles",
      "Character arc visualization across books",
      "Dynamic relationship mapping with history",
      "Automatic consistency checking",
      "Comprehensive setting atlas with map integration",
      "Advanced cultural design system",
      "Historical cause-and-effect visualization",
      "Advanced AI writing assistance",
      "Unlimited cloud storage",
      "Priority email support with 12-hour response time"
    ]
  }
};

const SUBSCRIPTION_TIERS: SubscriptionTier[] = ['apprentice', 'wordsmith', 'loremaster'];

// Function to get tier index for comparison
function getTierIndex(tier: SubscriptionTier): number {
  return SUBSCRIPTION_TIERS.indexOf(tier);
}

export default function SubscriptionTiers() {
  const { user } = useAuth();
  const currentTier = (user?.plan || 'apprentice') as SubscriptionTier;
  
  const handleUpgrade = (tier: SubscriptionTier) => {
    // Redirect to payment or upgrade flow
    // This would be integrated with your payment service provider
    console.log(`Upgrade to ${tier}`);
    alert('This feature will be implemented in the near future.');
  };
  
  return (
    <div className="py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Choose Your Writer's Journey
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Select the plan that best fits your creative needs
          </p>
        </div>
        
        <div className="mt-12 grid grid-cols-1 gap-y-6 sm:gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {SUBSCRIPTION_TIERS.map((tier) => {
            const tierInfo = TIER_DISPLAY[tier];
            const isCurrentTier = tier === currentTier;
            const isLowerTier = getTierIndex(tier) < getTierIndex(currentTier);
            
            return (
              <Card 
                key={tier} 
                className={`flex flex-col h-full ${isCurrentTier ? 'border-2 border-primary shadow-lg' : ''}`}
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
                  <ul className="space-y-2 text-sm">
                    {tierInfo.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center">
                        <Check className="h-3.5 w-3.5 mr-2 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant={isCurrentTier ? "outline" : "default"} 
                    className="w-full"
                    disabled={isCurrentTier || isLowerTier}
                    onClick={() => handleUpgrade(tier)}
                  >
                    {isCurrentTier ? 'Current Plan' : isLowerTier ? 'Lower Tier' : 'Upgrade'}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
        
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            All plans include access to the SagaScript core writing platform.
            <br />
            Need a custom enterprise solution? <a href="#" className="text-primary hover:underline">Contact us</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
