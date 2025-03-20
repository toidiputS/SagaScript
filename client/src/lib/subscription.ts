import { useAuth } from '@/hooks/use-auth';

// Define subscription tiers in order of increasing capabilities
export const SUBSCRIPTION_TIERS = ['apprentice', 'wordsmith', 'loremaster', 'legendary'] as const;
export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[number];

// Features that can be restricted by subscription tier
export type RestrictedFeature = 
  | 'maxSeries'
  | 'maxBooksPerSeries'
  | 'maxCharactersPerSeries'
  | 'maxLocationsPerSeries'
  | 'aiSuggestions'
  | 'aiSuggestionsLimit'
  | 'worldBuildingAdvanced'
  | 'relationshipMapping'
  | 'writingChallenges'
  | 'timelineManagement'
  | 'multimediaIntegration'
  | 'communityCollaboration'
  | 'customVoices'
  | 'prioritySupport'
  | 'priorityFeatures'
  | 'customFeatureDevelopment';

// Feature limits by tier 
export const TIER_LIMITS: Record<SubscriptionTier, Record<RestrictedFeature, number | boolean>> = {
  apprentice: {
    maxSeries: 1,
    maxBooksPerSeries: 3,
    maxCharactersPerSeries: 10,
    maxLocationsPerSeries: 5,
    aiSuggestions: true,
    aiSuggestionsLimit: 10,
    worldBuildingAdvanced: false,
    relationshipMapping: false,
    writingChallenges: false,
    timelineManagement: false,
    multimediaIntegration: false,
    communityCollaboration: false,
    customVoices: false,
    prioritySupport: false,
    priorityFeatures: false,
    customFeatureDevelopment: false
  },
  wordsmith: {
    maxSeries: 5,
    maxBooksPerSeries: -1, // unlimited
    maxCharactersPerSeries: -1, // unlimited
    maxLocationsPerSeries: -1, // unlimited
    aiSuggestions: true,
    aiSuggestionsLimit: 50,
    worldBuildingAdvanced: true,
    relationshipMapping: true,
    writingChallenges: true,
    timelineManagement: false,
    multimediaIntegration: false,
    communityCollaboration: false,
    customVoices: false,
    prioritySupport: false,
    priorityFeatures: false,
    customFeatureDevelopment: false
  },
  loremaster: {
    maxSeries: -1, // unlimited
    maxBooksPerSeries: -1, // unlimited
    maxCharactersPerSeries: -1, // unlimited
    maxLocationsPerSeries: -1, // unlimited
    aiSuggestions: true,
    aiSuggestionsLimit: 200,
    worldBuildingAdvanced: true,
    relationshipMapping: true,
    writingChallenges: true,
    timelineManagement: true,
    multimediaIntegration: true,
    communityCollaboration: true,
    customVoices: true,
    prioritySupport: false,
    priorityFeatures: false,
    customFeatureDevelopment: false
  },
  legendary: {
    maxSeries: -1, // unlimited
    maxBooksPerSeries: -1, // unlimited
    maxCharactersPerSeries: -1, // unlimited
    maxLocationsPerSeries: -1, // unlimited
    aiSuggestions: true,
    aiSuggestionsLimit: -1, // unlimited
    worldBuildingAdvanced: true,
    relationshipMapping: true,
    writingChallenges: true,
    timelineManagement: true,
    multimediaIntegration: true,
    communityCollaboration: true,
    customVoices: true,
    prioritySupport: true,
    priorityFeatures: true,
    customFeatureDevelopment: true
  }
};

// Tier display information
export const TIER_DISPLAY: Record<SubscriptionTier, { 
  name: string; 
  description: string;
  price: number;
  icon: string;
  color: string;
}> = {
  apprentice: {
    name: 'Apprentice',
    description: 'Basic series organization and character tracking',
    price: 0,
    icon: 'ri-quill-pen-line',
    color: 'text-green-500'
  },
  wordsmith: {
    name: 'Wordsmith',
    description: 'Enhanced world-building tools with advanced character management',
    price: 9.99,
    icon: 'ri-book-open-line',
    color: 'text-blue-500'
  },
  loremaster: {
    name: 'Loremaster',
    description: 'Comprehensive timeline and multimedia integration',
    price: 19.99,
    icon: 'ri-map-2-line',
    color: 'text-purple-500'
  },
  legendary: {
    name: 'Legendary',
    description: 'All features unlocked with priority support',
    price: 49.99,
    icon: 'ri-sword-line',
    color: 'text-amber-500'
  }
};

// Get tier index for comparison
export function getTierIndex(tier: SubscriptionTier): number {
  return SUBSCRIPTION_TIERS.indexOf(tier);
}

// Check if tier1 is higher or equal to tier2
export function isTierAtLeast(tier1: SubscriptionTier, tier2: SubscriptionTier): boolean {
  return getTierIndex(tier1) >= getTierIndex(tier2);
}

// Check if user can access a specific feature
export function canAccessFeature(userTier: SubscriptionTier, feature: RestrictedFeature): boolean {
  const limit = TIER_LIMITS[userTier][feature];
  return typeof limit === 'boolean' ? limit : limit !== 0;
}

// Check if user has reached a numerical limit
export function hasReachedLimit(
  userTier: SubscriptionTier, 
  feature: RestrictedFeature, 
  currentCount: number
): boolean {
  const limit = TIER_LIMITS[userTier][feature];
  
  // If limit is not a number or is unlimited (-1), user hasn't reached the limit
  if (typeof limit !== 'number' || limit < 0) {
    return false;
  }
  
  return currentCount >= limit;
}

// React hook to check feature access
export function useFeatureAccess() {
  const { user } = useAuth();
  
  const userTier = (user?.plan || 'apprentice') as SubscriptionTier;
  
  return {
    userTier,
    tierInfo: TIER_DISPLAY[userTier],
    canAccess: (feature: RestrictedFeature) => canAccessFeature(userTier, feature),
    hasReachedLimit: (feature: RestrictedFeature, currentCount: number) => 
      hasReachedLimit(userTier, feature, currentCount),
    getLimit: (feature: RestrictedFeature) => TIER_LIMITS[userTier][feature],
    isTierAtLeast: (tier: SubscriptionTier) => isTierAtLeast(userTier, tier)
  };
}

// Get upgrade message based on needed tier
export function getUpgradeMessage(neededTier: SubscriptionTier): string {
  const tierInfo = TIER_DISPLAY[neededTier];
  return `This feature requires the ${tierInfo.name} tier or higher. Please upgrade your subscription to access it.`;
}