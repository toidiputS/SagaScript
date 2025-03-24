import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Check, Zap } from 'lucide-react';
import { SUBSCRIPTION_TIERS, getTierIndex, type SubscriptionTier } from '@/lib/subscription';

// Define tier info type
type TierInfo = {
  name: string;
  description: string;
  price: number;
  icon: string;
  color: string;
  features: string[];
}

// Tier display information with detailed features
const TIER_DISPLAY: Record<SubscriptionTier, TierInfo> = {
  apprentice: {
    name: "The Apprentice",
    description: "Basic series organization and character tracking",
    price: 0,
    icon: "ri-quill-pen-line",
    color: "text-gray-600",
    features: [
      // Series Architecture System
      "// Series Architecture System",
      "Expanded series planning for unlimited books",
      "Visual timeline with branching capabilities",
      "Advanced milestone system (unlimited plot points)",
      "Comprehensive story arc designer",
      "Book-to-book link visualization",

      // Character Evolution Engine
      "// Character Evolution Engine",
      "Unlimited character profiles",
      "Advanced character development tracking",
      "Relationship web visualization",
      "Character consistency alerts",
      "Voice pattern documentation",
      "Custom character templates by genre",

      // World-Building Hub
      "// World-Building Hub",
      "Unlimited location entries",
      "Hierarchical location organization",
      "Cultural framework templates",
      "Historical event timeline",
      "Basic rule system documentation",
      "Tag-based cross-referencing",

      // Productivity & Motivation
      "// Productivity & Motivation",
      "Customizable writing goals",
      "Detailed progress analytics",
      "30-day streak visualization",
      "Writing pace predictions",
      "Expanded achievement system",
      "Social sharing of milestones",

      // AI Writing Companion
      "// AI Writing Companion",
      "Enhanced continuity checking",
      "Context-aware writing suggestions",
      "Character voice consistency tips",
      "Plot development prompts",
      "Basic research integration",

      // Multimedia & Technical
      "// Multimedia & Technical",
      "25GB cloud storage",
      "Web and mobile app access",
      "Daily backups with 30-day history",
      "Advanced export formats (including EPUB)",
      "Image inspiration boards",
      "Basic text-to-speech for dialogue",
      "Community forum full access",
      "Priority email support with 24-hour response time",
      "Limited continuity prompts (3 per day)",
      "Simple character name suggestions",
      "Generic writing prompts",

      // Multimedia & Technical
      "// Multimedia & Technical",
      "5GB cloud storage",
      "Web access only",
      "Weekly backups",
      "Basic export formats (TXT, DOC)",
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
      "// Series Architecture System",
      "Expanded series planning for unlimited books",
      "Visual timeline with branching capabilities",
      "Advanced milestone system (unlimited plot points)",
      "Comprehensive story arc designer",

      "// Character Evolution Engine",
      "Unlimited character profiles",
      "Advanced character development tracking",
      "Relationship web visualization",
      "Character consistency alerts",

      "// World-Building Hub",
      "Unlimited location entries",
      "Detailed map integration",
      "Advanced world-building templates",
      "Multi-layered world elements",

      "// Productivity & Motivation",
      "Custom writing goals and schedules",
      "Detailed progress analytics",
      "30-day streak visualization",
      "Personalized writing challenges",

      "// AI Writing Companion",
      "Advanced AI writing assistance",
      "Enhanced continuity checking",
      "Character voice consistency tools",
      "Contextual writing suggestions",

      "// Multimedia & Technical",
      "20GB cloud storage",
      "Web and mobile access",
      "Daily backups",
      "Expanded export formats",
      "Priority email support with 24-hour response time"
    ]
  },
  loremaster: {
    name: "The Loremaster",
    description: "Comprehensive timeline and continuity management",
    price: 19.99,
    icon: "ri-map-2-line",
    color: "text-purple-600",
    features: [
      "// Series Architecture System",
      "Multi-series universe planning",
      "Dynamic interactive timelines",
      "Conflict management system",
      "Plot hole detection algorithms",

      "// Character Evolution Engine",
      "Character psychology profiling",
      "Dynamic relationship tracking over time",
      "Character arc visualization",
      "Multi-dimensional character development",

      "// World-Building Hub",
      "Advanced world-building ecosystem",
      "Interactive maps with multiple layers",
      "Cultural and language creation tools",
      "Ecosystem and economy simulators",

      "// Productivity & Motivation",
      "Community writing challenges",
      "Comprehensive analytics dashboard",
      "90-day streak visualization",
      "Team collaboration features",

      "// AI Writing Companion",
      "Premium AI writing tools",
      "Story structure analysis",
      "World consistency enforcement",
      "Dialogue enhancement suggestions",

      "// Multimedia & Technical",
      "50GB cloud storage",
      "All platform access",
      "Hourly backups",
      "Professional publishing formats",
      "Live chat support with quick response time"
    ]
  },
  legendary: {
    name: "The Legendary",
    description: "All features unlocked with priority support",
    price: 49.99,
    icon: "ri-sword-line",
    color: "text-amber-600",
    features: [
      "// Everything in Loremaster, plus:",
      "Early access to all new features",
      "Custom feature development",
      "Dedicated support manager",
      "Unlimited AI usage",
      "100GB cloud storage",
      "Real-time collaborative editing",
      "White-label publishing tools",
      "Exclusive author workshops",
      "Professional consultation sessions"
    ]
  }
};

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

        <div className="mt-12 grid grid-cols-1 gap-y-6 sm:gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
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
                  {/* Group features by category */}
                  {(() => {
                    const features = tierInfo.features;
                    // Extract categories from comments
                    const categories = new Map<string, string[]>();
                    let currentCategory = "Features";

                    features.forEach((feat: string, index: number) => {
                      // Use the comment before the feature as the category name
                      if (feat.startsWith('//')) {
                        currentCategory = feat.replace('//', '').trim();
                      } else {
                        if (!categories.has(currentCategory)) {
                          categories.set(currentCategory, []);
                        }
                        categories.get(currentCategory)!.push(feat);
                      }
                    });

                    // Display features grouped by category
                    return Array.from(categories.entries()).map(([category, feats]: [string, string[]], catIndex: number) => (
                      <div key={catIndex} className="mb-4">
                        <h3 className="text-sm font-semibold text-primary mb-2 flex items-center">
                          {category === 'AI Writing Companion' && <Zap className="h-3.5 w-3.5 mr-1.5" />}
                          {category}
                        </h3>
                        <ul className="space-y-1.5">
                          {feats.map((feature, featIndex) => (
                            <li key={featIndex} className="flex items-start">
                              <Check className="h-4 w-4 mr-2 text-green-500 mt-0.5" />
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ));
                  })()}
                </CardContent>
                <CardFooter className="mt-auto">
                  {isCurrentTier ? (
                    <Button className="w-full" variant="outline" disabled>
                      Current Plan
                    </Button>
                  ) : isLowerTier ? (
                    <Button className="w-full" variant="outline" disabled>
                      Lower Tier
                    </Button>
                  ) : (
                    <Button 
                      className="w-full" 
                      onClick={() => handleUpgrade(tier)}
                      disabled={tier === 'apprentice'}
                      variant={isCurrentTier ? "outline" : "default"}
                    >
                      {tier === 'apprentice' ? 'Free Plan' : 'Upgrade Plan'}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}