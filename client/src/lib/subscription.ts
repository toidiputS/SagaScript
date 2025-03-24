
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
    name: 'The Wordsmith',
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

// Subscription tier list
export const SUBSCRIPTION_TIERS: SubscriptionTier[] = ['apprentice', 'wordsmith', 'loremaster', 'legendary'];

// Types for subscription features
export type SubscriptionTier = 'apprentice' | 'wordsmith' | 'loremaster' | 'legendary';
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
  | 'customFeatureDevelopment'
  | 'cloudStorage'
  | 'exportFormats'
  | 'backupFrequency'
  | 'platformAccess';

// Feature limits by tier 
export const TIER_LIMITS: Record<SubscriptionTier, Record<RestrictedFeature, number | boolean | string>> = {
  apprentice: {
    maxSeries: 1,
    maxBooksPerSeries: 3,
    maxCharactersPerSeries: 10,
    maxLocationsPerSeries: 10,
    aiSuggestions: true,
    aiSuggestionsLimit: 3,
    worldBuildingAdvanced: false,
    relationshipMapping: false,
    writingChallenges: false,
    timelineManagement: false,
    multimediaIntegration: false,
    communityCollaboration: false,
    customVoices: false,
    prioritySupport: false,
    priorityFeatures: false,
    customFeatureDevelopment: false,
    cloudStorage: 5, // 5GB
    exportFormats: 'basic', // TXT, DOC
    backupFrequency: 'weekly',
    platformAccess: 'web'
  },
  wordsmith: {
    maxSeries: -1, // unlimited
    maxBooksPerSeries: -1, // unlimited
    maxCharactersPerSeries: -1, // unlimited
    maxLocationsPerSeries: -1, // unlimited
    aiSuggestions: true,
    aiSuggestionsLimit: 100,
    worldBuildingAdvanced: true,
    relationshipMapping: true,
    writingChallenges: true,
    timelineManagement: true,
    multimediaIntegration: true,
    communityCollaboration: true,
    customVoices: true,
    prioritySupport: true,
    priorityFeatures: false,
    customFeatureDevelopment: false,
    cloudStorage: 25, // 25GB
    exportFormats: 'advanced', // Including EPUB
    backupFrequency: 'daily',
    platformAccess: 'web_mobile',
    characterDevelopmentTracking: true,
    characterConsistencyAlerts: true,
    customCharacterTemplates: true,
    hierarchicalLocationOrganization: true,
    culturalFrameworkTemplates: true,
    historicalEventTimeline: true,
    tagBasedCrossReferencing: true,
    customizableWritingGoals: true,
    detailedProgressAnalytics: true,
    thirtyDayStreakVisualization: true,
    writingPacePredictions: true,
    expandedAchievementSystem: true,
    socialSharingMilestones: true,
    enhancedContinuityChecking: true,
    contextAwareWritingSuggestions: true,
    characterVoiceConsistencyTips: true,
    plotDevelopmentPrompts: true,
    basicResearchIntegration: true,
    imageInspirationBoards: true,
    basicTextToSpeech: true,
    priorityEmailSupport: true
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
    customFeatureDevelopment: false,
    cloudStorage: 50, // 50GB
    exportFormats: 'advanced', // All formats
    backupFrequency: 'daily',
    platformAccess: 'all'
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
    customFeatureDevelopment: true,
    cloudStorage: 100, // 100GB
    exportFormats: 'premium', // All formats + specialized
    backupFrequency: 'realtime',
    platformAccess: 'all'
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

// Get the limit for a specific feature
export function getFeatureLimit(userTier: SubscriptionTier, feature: RestrictedFeature): number | boolean | string {
  return TIER_LIMITS[userTier][feature];
}

// React hook to check feature access
import { useSimpleAuth } from "@/contexts/simple-auth";

// Import the context rather than a hook
import { useSimpleAuth } from "@/contexts/simple-auth";

export function useFeatureAccess() {
  const { user } = useSimpleAuth();
  
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
