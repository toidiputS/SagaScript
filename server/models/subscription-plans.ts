
import { SubscriptionPlan, InsertSubscriptionPlan } from '@shared/schema';
import { storage } from '../storage';

// Initialize subscription plans based on the Saga Script Life Subscription tiers
export async function initializeSubscriptionPlans() {
  const existingPlans = await storage.getSubscriptionPlans();
  
  // Only initialize if no plans exist
  if (existingPlans.length === 0) {
    const plans: InsertSubscriptionPlan[] = [
      {
        name: "apprentice",
        description: "Basic series outline with limited features",
        price: 0, // Free tier
        billingInterval: "monthly",
        features: [
          "Basic series outline with up to 3 books",
          "Simple linear timeline for plot events",
          "Limited milestone tracking (10 major plot points)",
          "Basic character profiles for up to 10 characters",
          "Up to 10 location entries",
          "Basic daily word count goals",
          "5GB cloud storage"
        ],
        limits: {
          maxSeries: 1,
          maxBooksPerSeries: 3,
          maxCharactersPerSeries: 10,
          maxLocationsPerSeries: 10,
          aiSuggestions: true,
          aiSuggestionsLimit: 3
        }
      },
      {
        name: "wordsmith",
        description: "Expanded series planning with advanced character features",
        price: 999, // $9.99
        billingInterval: "monthly",
        features: [
          "Expanded series planning for unlimited books",
          "Visual timeline with branching capabilities",
          "Unlimited character profiles",
          "Hierarchical location organization",
          "Customizable writing goals",
          "25GB cloud storage",
          "Enhanced continuity checking"
        ],
        limits: {
          maxSeries: 5,
          maxBooksPerSeries: -1, // unlimited
          maxCharactersPerSeries: -1, // unlimited
          maxLocationsPerSeries: -1, // unlimited
          aiSuggestions: true,
          aiSuggestionsLimit: 50,
          worldBuildingAdvanced: true,
          relationshipMapping: true
        }
      },
      {
        name: "loremaster",
        description: "Professional series blueprint with comprehensive features",
        price: 1999, // $19.99
        billingInterval: "monthly",
        features: [
          "Professional series blueprint designer",
          "Multi-dimensional timeline with nested events",
          "Advanced character psychology profiles",
          "Comprehensive setting atlas with map integration",
          "Advanced cultural design system",
          "Character arc visualization across books",
          "Series pacing analysis"
        ],
        limits: {
          maxSeries: -1, // unlimited
          maxBooksPerSeries: -1, // unlimited
          maxCharactersPerSeries: -1, // unlimited
          maxLocationsPerSeries: -1, // unlimited
          aiSuggestions: true,
          aiSuggestionsLimit: 200,
          worldBuildingAdvanced: true,
          relationshipMapping: true,
          timelineManagement: true,
          multimediaIntegration: true
        }
      }
    ];
    
    // Create each plan
    for (const plan of plans) {
      await storage.createSubscriptionPlan(plan);
    }
    
    console.log('[Initialization] Subscription plans created');
  }
}
