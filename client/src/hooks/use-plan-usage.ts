import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { apiRequest } from "@/lib/queryClient";
import { PlanUsage, SubscriptionPlan, Subscription } from "@shared/schema";
import { useRetry } from "./use-retry";
import { useOffline } from "./use-offline";

export function usePlanUsage() {
  const { isAuthenticated } = useAuth();
  const { executeWithRetry } = useRetry({
    maxAttempts: 3,
    delay: 1000,
    backoff: true,
  });

  // Offline support
  const { cacheData: cacheUsage, getCachedData: getCachedUsage } = useOffline({
    cacheKey: "plan_usage",
    ttl: 1000 * 60 * 10, // 10 minutes
  });
  const { cacheData: cacheSubscription, getCachedData: getCachedSubscription } = useOffline({
    cacheKey: "subscription",
    ttl: 1000 * 60 * 30, // 30 minutes
  });
  const { cacheData: cachePlan, getCachedData: getCachedPlan } = useOffline({
    cacheKey: "subscription_plan",
    ttl: 1000 * 60 * 60, // 1 hour
  });

  // Fetch current plan usage statistics with retry and offline support
  const {
    data: usage,
    isLoading: isLoadingUsage,
    error: usageError,
    refetch: refreshUsage,
  } = useQuery<PlanUsage>({
    queryKey: ["/api/user/usage"],
    queryFn: async () => {
      return executeWithRetry(async () => {
        const res = await apiRequest("GET", "/api/user/usage");
        const data = await res.json() as PlanUsage;
        cacheUsage(data);
        return data;
      });
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false,
    placeholderData: () => getCachedUsage(),
  });

  // Fetch current subscription details with retry and offline support
  const {
    data: subscription,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
  } = useQuery<Subscription>({
    queryKey: ["/api/user/subscription"],
    queryFn: async () => {
      return executeWithRetry(async () => {
        const res = await apiRequest("GET", "/api/user/subscription");
        const data = await res.json() as Subscription;
        cacheSubscription(data);
        return data;
      });
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: false,
    retry: false,
    placeholderData: () => getCachedSubscription(),
  });

  // Fetch subscription plan details with retry and offline support
  const {
    data: plan,
    isLoading: isLoadingPlan,
    error: planError,
  } = useQuery<SubscriptionPlan>({
    queryKey: ["/api/subscription-plans", subscription?.planId],
    queryFn: async () => {
      return executeWithRetry(async () => {
        if (!subscription?.planId) throw new Error("No subscription plan ID");
        const res = await apiRequest("GET", `/api/subscription-plans/${subscription.planId}`);
        const data = await res.json() as SubscriptionPlan;
        cachePlan(data);
        return data;
      });
    },
    enabled: isAuthenticated && !!subscription?.planId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    retry: false,
    placeholderData: () => getCachedPlan(),
  });

  // Calculate usage percentages
  const usagePercentages = usage ? {
    series: usage.series.limit > 0 ? (usage.series.used / usage.series.limit) * 100 : 0,
    aiPrompts: usage.aiPrompts.limit > 0 ? (usage.aiPrompts.used / usage.aiPrompts.limit) * 100 : 0,
    collaborators: usage.collaborators.limit > 0 ? (usage.collaborators.used / usage.collaborators.limit) * 100 : 0,
    storage: usage.storage.limit > 0 ? (usage.storage.used / usage.storage.limit) * 100 : 0,
  } : null;

  // Check if approaching limits (>80%)
  const approachingLimits = usagePercentages ? {
    series: usagePercentages.series > 80,
    aiPrompts: usagePercentages.aiPrompts > 80,
    collaborators: usagePercentages.collaborators > 80,
    storage: usagePercentages.storage > 80,
  } : null;

  // Check if at limits (>=100%)
  const atLimits = usagePercentages ? {
    series: usagePercentages.series >= 100,
    aiPrompts: usagePercentages.aiPrompts >= 100,
    collaborators: usagePercentages.collaborators >= 100,
    storage: usagePercentages.storage >= 100,
  } : null;

  const isLoading = isLoadingUsage || isLoadingSubscription || isLoadingPlan;
  const error = usageError || subscriptionError || planError;

  return {
    usage,
    subscription,
    plan,
    usagePercentages,
    approachingLimits,
    atLimits,
    isLoading,
    isLoadingUsage,
    isLoadingSubscription,
    isLoadingPlan,
    error,
    usageError,
    subscriptionError,
    planError,
    refreshUsage,
    
    // Error states
    hasUsageError: !!usageError,
    hasSubscriptionError: !!subscriptionError,
    hasPlanError: !!planError,
    
    // Cached data indicators
    isUsingCachedUsage: !isLoadingUsage && !!getCachedUsage() && !usage,
    isUsingCachedSubscription: !isLoadingSubscription && !!getCachedSubscription() && !subscription,
    isUsingCachedPlan: !isLoadingPlan && !!getCachedPlan() && !plan,
  };
}