import React from 'react';
import { 
  RestrictedFeature, 
  SubscriptionTier, 
  getUpgradeMessage, 
  useFeatureAccess 
} from '@/lib/subscription';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface FeatureGateProps {
  /**
   * The feature that requires a subscription
   */
  feature: RestrictedFeature;
  
  /**
   * The required subscription tier to access this feature
   */
  requiredTier: SubscriptionTier;
  
  /**
   * Whether to render children even if feature is locked (used for UI customization)
   */
  renderChildren?: boolean;
  
  /**
   * Whether to show a tooltip explaining the restriction
   */
  showTooltip?: boolean;
  
  /**
   * Content to render when the feature is accessible
   */
  children: React.ReactNode;
  
  /**
   * Optional numeric count used to check if user has reached a limit 
   * (for features with numerical limits)
   */
  currentCount?: number;
  
  /**
   * Custom message to show in the tooltip
   */
  message?: string;
}

/**
 * FeatureGate component that conditionally renders its children
 * based on the user's subscription tier and feature access
 */
export function FeatureGate({
  feature,
  requiredTier,
  renderChildren = false,
  showTooltip = true,
  message,
  currentCount,
  children
}: FeatureGateProps) {
  const { userTier, canAccess, hasReachedLimit, isTierAtLeast } = useFeatureAccess();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  // Check if user has access to the feature
  const hasAccess = canAccess(feature) && isTierAtLeast(requiredTier);
  
  // For countable features, check if user has reached limit
  const reachedLimit = currentCount !== undefined && hasReachedLimit(feature, currentCount);
  
  // Determine if we should block access
  const blockAccess = !hasAccess || reachedLimit;
  
  // Show upgrade information
  const handleUpgradeClick = () => {
    setLocation('/subscription');
  };
  
  // Default message
  const upgradeMessage = message || getUpgradeMessage(requiredTier);
  
  if (!blockAccess) {
    // User has access, render children normally
    return <>{children}</>;
  }
  
  // User doesn't have access
  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative">
              {renderChildren && children}
              <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-md">
                <Lock className="h-6 w-6 text-muted-foreground" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={handleUpgradeClick}
                >
                  Upgrade
                </Button>
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{upgradeMessage}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  // Simple version without tooltip
  return (
    <div className="relative">
      {renderChildren && children}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-md">
        <Lock className="h-6 w-6 text-muted-foreground" />
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => {
            toast({
              title: "Feature Locked",
              description: upgradeMessage,
              variant: "default"
            });
            setLocation('/subscription');
          }}
        >
          Upgrade
        </Button>
      </div>
    </div>
  );
}

/**
 * Component that displays a message when a user has reached a limit
 */
export function FeatureLimitIndicator({
  feature,
  currentCount,
  requiredTier,
  children
}: {
  feature: RestrictedFeature;
  currentCount: number;
  requiredTier: SubscriptionTier;
  children?: React.ReactNode;
}) {
  const { userTier, getLimit } = useFeatureAccess();
  const [_, setLocation] = useLocation();
  const limit = getLimit(feature);
  
  if (typeof limit !== 'number' || limit < 0) {
    // Unlimited
    return <>{children}</>;
  }
  
  return (
    <div className="flex items-center text-sm text-muted-foreground">
      <span>
        {currentCount} / {limit} {children}
      </span>
      {currentCount >= limit && (
        <Button 
          variant="link" 
          size="sm" 
          className="text-xs ml-2"
          onClick={() => setLocation('/subscription')}
        >
          Upgrade for more
        </Button>
      )}
    </div>
  );
}