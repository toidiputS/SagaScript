
import { SubscriptionPlan, InsertSubscriptionPlan } from '@shared/schema';
import { storage } from '../storage';

// Initialize subscription plans based on the Saga Script Life Subscription tiers
export async function initializeSubscriptionPlans(force = false) {
  const existingPlans = await storage.getSubscriptionPlans();
  
  // Initialize if no plans exist or if forced
  if (existingPlans.length === 0 || force) {
    // If forced and plans exist, delete existing plans first
    if (force && existingPlans.length > 0) {
      console.log('[Initialization] Forcing re-creation of subscription plans');
      for (const plan of existingPlans) {
        await storage.deleteSubscriptionPlan(plan.id);
      }
    }
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
      },
      {
        name: "legendary",
        description: "Enterprise-grade series planning system with all premium features",
        price: 4999, // $49.99
        billingInterval: "monthly",
        features: [
          "Complete series architecture system",
          "Advanced AI writing assistant with unlimited suggestions",
          "Custom character and location art generation",
          "Detailed fantasy map generator with multiple styles",
          "Cross-series universe building tools",
          "Collaborative writing environment for teams",
          "Priority feature development and support",
          "100GB cloud storage with automated backups",
          "Advanced analytics and writing pattern insights"
        ],
        limits: {
          maxSeries: -1, // unlimited
          maxBooksPerSeries: -1, // unlimited
          maxCharactersPerSeries: -1, // unlimited
          maxLocationsPerSeries: -1, // unlimited
          aiSuggestions: true,
          aiSuggestionsLimit: -1, // unlimited
          worldBuildingAdvanced: true,
          relationshipMapping: true,
          timelineManagement: true,
          multimediaIntegration: true,
          aiImageGeneration: true,
          fantasyMapGeneration: true,
          collaborativeWriting: true,
          advancedAnalytics: true
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
