import React, { useEffect, useState } from 'react';
import { Check, X, Loader2, ArrowRight, Zap } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
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
import { loadStripe } from '@stripe/stripe-js';
import { useLocation } from 'wouter';

// Type for a feature item
interface FeatureItem {
  feature: string;
  value: string | boolean | number;
}

export default function SubscriptionPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  
  // Check for Stripe success/cancel parameters
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    if (query.get('subscription') === 'success') {
      toast({
        title: 'Subscription successful!',
        description: 'Your subscription has been activated.',
        variant: 'default'
      });
      
      // Clean URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Refresh user data
      refreshUser();
    } else if (query.get('canceled') === 'true') {
      toast({
        title: 'Subscription canceled',
        description: 'Your subscription process was canceled.',
        variant: 'destructive'
      });
      
      // Clean URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  
  const currentTier = (user?.plan || 'apprentice') as SubscriptionTier;
  
  // Comprehensive subscription features based on tier from specification
  const tierFeatures = {
    apprentice: [
      { feature: '// Series Architecture', value: true },
      { feature: 'Series', value: '1 series' },
      { feature: 'Books per series', value: '3 books' },
      { feature: 'Simple linear timeline', value: true },
      { feature: 'Plot points', value: '10 major plot points' },
      
      { feature: '// Character Development', value: true },
      { feature: 'Characters per series', value: '10 characters' },
      { feature: 'Simple relationship mapping', value: 'Direct connections only' },
      { feature: 'Character trait tracking', value: 'Basic' },
      
      { feature: '// World-Building', value: true },
      { feature: 'Locations per series', value: '5 locations' },
      { feature: 'Basic world rules', value: true },
      { feature: 'Simple cultural notes', value: true },
      
      { feature: '// Productivity', value: true },
      { feature: 'Daily word count goals', value: 'Basic' },
      { feature: 'Streak visualization', value: '7-day' },
      { feature: 'Basic achievement badges', value: true },
      
      { feature: '// AI Assistant', value: true },
      { feature: 'AI assistance', value: 'Limited (10/month)' },
      { feature: 'Spelling and grammar', value: true },
      { feature: 'Character name suggestions', value: true },
      
      { feature: '// Platform & Support', value: true },
      { feature: 'Cloud storage', value: '5GB' },
      { feature: 'Export formats', value: 'TXT, DOC' },
      { feature: 'Support', value: '48-hour email response' },
    ],
    wordsmith: [
      { feature: '// Series Architecture', value: true },
      { feature: 'Series', value: '5 series' },
      { feature: 'Books per series', value: 'Unlimited' },
      { feature: 'Visual timeline', value: 'With branching' },
      { feature: 'Plot points', value: 'Unlimited' },
      { feature: 'Story arc designer', value: true },
      
      { feature: '// Character Development', value: true },
      { feature: 'Characters per series', value: 'Unlimited' },
      { feature: 'Advanced character development', value: true },
      { feature: 'Relationship web', value: 'Visual' },
      { feature: 'Character consistency alerts', value: true },
      { feature: 'Custom character templates', value: 'By genre' },
      
      { feature: '// World-Building', value: true },
      { feature: 'Locations per series', value: 'Unlimited' },
      { feature: 'Hierarchical location organization', value: true },
      { feature: 'Cultural framework templates', value: true },
      { feature: 'Historical event timeline', value: true },
      
      { feature: '// Productivity', value: true },
      { feature: 'Customizable writing goals', value: true },
      { feature: 'Detailed progress analytics', value: true },
      { feature: 'Streak visualization', value: '30-day' },
      { feature: 'Writing pace predictions', value: true },
      { feature: 'Social sharing of milestones', value: true },
      
      { feature: '// AI Assistant', value: true },
      { feature: 'AI assistance', value: 'Standard (50/month)' },
      { feature: 'Context-aware suggestions', value: true },
      { feature: 'Plot development prompts', value: true },
      { feature: 'Basic research integration', value: true },
      
      { feature: '// Platform & Support', value: true },
      { feature: 'Cloud storage', value: '25GB' },
      { feature: 'Access', value: 'Web and mobile' },
      { feature: 'Export formats', value: 'Including EPUB' },
      { feature: 'Support', value: '24-hour priority email' },
    ],
    loremaster: [
      { feature: '// Series Architecture', value: true },
      { feature: 'Series', value: 'Unlimited' },
      { feature: 'Professional series blueprint', value: true },
      { feature: 'Multi-dimensional timeline', value: 'With nested events' },
      { feature: 'Foreshadowing tracker', value: 'Comprehensive' },
      { feature: 'Visual plot thread mapper', value: true },
      { feature: 'Series pacing analysis', value: true },
      
      { feature: '// Character Development', value: true },
      { feature: 'Advanced psychology profiles', value: true },
      { feature: 'Character arc visualization', value: 'Across books' },
      { feature: 'Dynamic relationship mapping', value: 'With history' },
      { feature: 'Automatic consistency checking', value: true },
      { feature: 'Voice pattern analysis', value: true },
      { feature: 'Emotional journey mapping', value: true },
      
      { feature: '// World-Building', value: true },
      { feature: 'Setting atlas with maps', value: true },
      { feature: 'Advanced cultural design', value: true },
      { feature: 'Historical cause-effect visualization', value: true },
      { feature: 'Full searchable encyclopedia', value: true },
      
      { feature: '// Productivity', value: true },
      { feature: 'AI-assisted goal recommendations', value: true },
      { feature: 'Comprehensive analytics', value: true },
      { feature: 'Streak history', value: 'Unlimited' },
      { feature: 'Genre-specific challenges', value: true },
      { feature: 'Community accountability', value: true },
      
      { feature: '// AI Assistant', value: true },
      { feature: 'AI assistance', value: 'Advanced (200/month)' },
      { feature: 'Comprehensive continuity analysis', value: true },
      { feature: 'Context-aware scene suggestions', value: true },
      { feature: 'Plot hole detection', value: true },
      { feature: 'Theme consistency analysis', value: true },
      
      { feature: '// Collaboration & Tools', value: true },
      { feature: 'Cloud storage', value: '100GB' },
      { feature: 'Platform access', value: 'Web, mobile, desktop' },
      { feature: 'Version history', value: 'Complete' },
      { feature: 'Advanced TTS for characters', value: true },
      { feature: 'Collaboration tools', value: 'For editors and beta readers' },
      { feature: 'Support', value: 'Priority with live chat' },
    ],
    legendary: [
      { feature: '// Advanced Series Management', value: true },
      { feature: 'Multi-series universe management', value: true },
      { feature: 'Quantum timeline system', value: 'Alternate storylines' },
      { feature: 'Professional story structures', value: true },
      { feature: 'Advanced narrative tension mapping', value: true },
      { feature: 'Cross-series continuity', value: true },
      
      { feature: '// Advanced Character Systems', value: true },
      { feature: 'Professional psychology system', value: true },
      { feature: 'Family/dynasty tracking', value: 'Across generations' },
      { feature: 'AI-powered consistency engine', value: true },
      { feature: 'Advanced dialogue patterns', value: 'By context' },
      { feature: 'Multi-perspective development', value: true },
      
      { feature: '// Professional World-Building', value: true },
      { feature: 'Professional worldbuilding suite', value: true },
      { feature: 'Economic & political systems', value: true },
      { feature: 'Language & terminology management', value: true },
      { feature: 'Scientific/magic system tools', value: true },
      { feature: 'Interactive world visualization', value: true },
      
      { feature: '// Enterprise AI & Analytics', value: true },
      { feature: 'AI assistance', value: 'Unlimited' },
      { feature: 'Enterprise-grade AI assistant', value: true },
      { feature: 'Deep narrative structure analysis', value: true },
      { feature: 'Multi-book thematic analysis', value: true },
      { feature: 'Publisher-ready evaluation', value: true },
      { feature: 'Custom AI for your style', value: true },
      
      { feature: '// Professional Services', value: true },
      { feature: 'Cloud storage', value: 'Unlimited' },
      { feature: 'White-glove data migration', value: true },
      { feature: 'Dedicated support specialist', value: true },
      { feature: 'Custom feature development', value: true },
      { feature: 'API access', value: 'For custom integrations' },
      { feature: 'Marketing tools', value: 'For series promotion' },
    ]
  };

  // Create Stripe checkout session
  const createCheckoutSession = useMutation({
    mutationFn: async (tier: SubscriptionTier) => {
      return await apiRequest('POST', '/api/subscriptions', { planName: tier });
    },
    onSuccess: async (data) => {
      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      setIsLoading(prev => ({...prev, [error.message]: false}));
      toast({
        title: 'Error creating checkout session',
        description: error.message || 'An error occurred while setting up the payment process.',
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
    
    // Set loading state for this tier
    setIsLoading(prev => ({...prev, [tier]: true}));
    
    // Create Stripe checkout session and redirect
    createCheckoutSession.mutate(tier);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-10 text-center max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Subscription Plans</h1>
        <p className="text-muted-foreground mt-2 mb-6">
          Choose the right plan to enhance your writing journey
        </p>
        
        <div className="text-sm text-center bg-primary/5 p-4 rounded-lg">
          <p className="mb-2"><strong>Find your ideal writing companion:</strong></p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
              <span className="text-green-500 font-semibold">Apprentice (Free)</span>
              <p>Perfect for casual writers exploring their creativity</p>
            </div>
            <div>
              <span className="text-blue-500 font-semibold">Wordsmith ($9.99)</span> 
              <p>For dedicated writers refining their craft</p>
            </div>
            <div>
              <span className="text-purple-500 font-semibold">Loremaster ($19.99)</span>
              <p>For serious authors building complex universes</p>
            </div>
            <div>
              <span className="text-amber-500 font-semibold">Legendary ($49.99)</span>
              <p>For professional writers demanding the ultimate toolkit</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const tierInfo = TIER_DISPLAY[tier];
          const isCurrentTier = tier === currentTier;
          const isLowerTier = getTierIndex(tier) < getTierIndex(currentTier);
          
          return (
            <Card 
              key={tier} 
              className={`flex flex-col subscription-tier-card ${isCurrentTier ? 'border-2 border-primary shadow-lg' : ''}`}
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
                {/* Group features by category */}
                {(() => {
                  const features = tierFeatures[tier];
                  // Extract categories from comments
                  const categories = new Map<string, FeatureItem[]>();
                  let currentCategory = "Features";
                  
                  features.forEach((feat: FeatureItem, index: number) => {
                    // Use the comment before the feature as the category name
                    if (index > 0 && features[index-1].feature.startsWith('//')) {
                      currentCategory = features[index-1].feature.replace('//', '').trim();
                    }
                    
                    if (!feat.feature.startsWith('//')) {
                      if (!categories.has(currentCategory)) {
                        categories.set(currentCategory, []);
                      }
                      categories.get(currentCategory)!.push(feat);
                    }
                  });
                  
                  // Display features grouped by category
                  return Array.from(categories.entries()).map(([category, feats]: [string, FeatureItem[]], catIndex: number) => (
                    <div key={catIndex} className="mb-4">
                      <h3 className="text-sm font-semibold text-primary mb-2 flex items-center">
                        {category === 'AI Assistant' && <Zap className="h-3.5 w-3.5 mr-1.5" />}
                        {category === 'Character Development' && <ArrowRight className="h-3.5 w-3.5 mr-1.5" />}
                        {category}
                      </h3>
                      <ul className="space-y-1.5">
                        {feats.map((feat: FeatureItem, index: number) => (
                          <li key={index} className="flex items-start text-sm">
                            {typeof feat.value === 'boolean' ? (
                              <Check className="h-4 w-4 mr-2 text-green-500 shrink-0" />
                            ) : (
                              <span className="h-4 w-4 mr-2 flex items-center justify-center shrink-0 text-primary">•</span>
                            )}
                            <span>
                              <span className="font-medium">{feat.feature}: </span>
                              {typeof feat.value === 'boolean' ? '' : feat.value}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ));
                })()}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  variant={isCurrentTier ? "outline" : "default"}
                  disabled={isCurrentTier || isLowerTier || createCheckoutSession.isPending || isLoading[tier]}
                  onClick={() => handleUpgrade(tier)}
                >
                  {isLoading[tier] || (createCheckoutSession.isPending && createCheckoutSession.variables === tier) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Processing...
                    </>
                  ) : isCurrentTier 
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
        <h2 className="font-bold text-xl mb-4">Your Subscription</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                <strong>Current Plan:</strong> {TIER_DISPLAY[currentTier].name}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {currentTier === 'apprentice' ? 
                  "You're using our free plan with basic features." :
                  `Your ${TIER_DISPLAY[currentTier].name} plan renews monthly at $${TIER_DISPLAY[currentTier].price.toFixed(2)}.`
                }
              </p>
            </div>
            {currentTier !== 'legendary' && (
              <Button 
                variant="default" 
                size="sm"
                className="ml-2"
                onClick={() => handleUpgrade('legendary')}
              >
                <Zap className="mr-2 h-4 w-4" />
                Upgrade to Legendary
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-primary/10">
            <div>
              <h3 className="text-sm font-semibold mb-2">Your Benefits</h3>
              <ul className="space-y-1 text-sm">
                {currentTier === 'apprentice' ? (
                  <>
                    <li className="flex items-center"><Check className="h-3.5 w-3.5 mr-2 text-green-500" /> 1 series with up to 3 books</li>
                    <li className="flex items-center"><Check className="h-3.5 w-3.5 mr-2 text-green-500" /> 10 character profiles</li>
                    <li className="flex items-center"><Check className="h-3.5 w-3.5 mr-2 text-green-500" /> Basic AI writing assistance</li>
                  </>
                ) : currentTier === 'wordsmith' ? (
                  <>
                    <li className="flex items-center"><Check className="h-3.5 w-3.5 mr-2 text-green-500" /> 5 series with unlimited books</li>
                    <li className="flex items-center"><Check className="h-3.5 w-3.5 mr-2 text-green-500" /> Advanced character development</li>
                    <li className="flex items-center"><Check className="h-3.5 w-3.5 mr-2 text-green-500" /> Enhanced AI writing support</li>
                  </>
                ) : currentTier === 'loremaster' ? (
                  <>
                    <li className="flex items-center"><Check className="h-3.5 w-3.5 mr-2 text-green-500" /> Unlimited series and books</li>
                    <li className="flex items-center"><Check className="h-3.5 w-3.5 mr-2 text-green-500" /> Advanced timeline management</li>
                    <li className="flex items-center"><Check className="h-3.5 w-3.5 mr-2 text-green-500" /> Collaboration tools for team writing</li>
                  </>
                ) : (
                  <>
                    <li className="flex items-center"><Check className="h-3.5 w-3.5 mr-2 text-green-500" /> All premium features unlocked</li>
                    <li className="flex items-center"><Check className="h-3.5 w-3.5 mr-2 text-green-500" /> Dedicated support specialist</li>
                    <li className="flex items-center"><Check className="h-3.5 w-3.5 mr-2 text-green-500" /> Custom feature development</li>
                  </>
                )}
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-2">Subscription Management</h3>
              <p className="text-sm text-muted-foreground">
                You can manage your payment methods, view billing history, or cancel your subscription anytime from your account settings.
              </p>
              <div className="mt-3">
                <Button variant="outline" size="sm" disabled={true} className="mr-2">
                  Billing History
                </Button>
                <Button variant="outline" size="sm" disabled={true}>
                  Payment Methods
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}