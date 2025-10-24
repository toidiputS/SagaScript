import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { SubscriptionPlan, Subscription, PlanUsage } from "@shared/schema";
import { InlineError, NetworkError } from "./ErrorBoundary";
import { SubscriptionTabSkeleton } from "./LoadingSkeletons";

interface SubscriptionTabProps {
  userPlan: string;
  usageError?: Error;
  onRetryUsage?: () => void;
}

interface SubscriptionData {
  subscription: Subscription;
  plan: SubscriptionPlan;
}

export function SubscriptionTab({ userPlan, usageError, onRetryUsage }: SubscriptionTabProps) {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current subscription details
  const { 
    data: subscriptionData, 
    isLoading: isLoadingSubscription,
    error: subscriptionError,
    refetch: refetchSubscription
  } = useQuery<SubscriptionData>({
    queryKey: ["subscription", "current"],
    queryFn: async () => {
      const response = await fetch("/api/subscriptions/current", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch subscription");
      }
      return response.json();
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch all available plans for comparison
  const { 
    data: allPlans, 
    isLoading: isLoadingPlans,
    error: plansError,
    refetch: refetchPlans
  } = useQuery<SubscriptionPlan[]>({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const response = await fetch("/api/subscription-plans", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch subscription plans");
      }
      return response.json();
    },
    retry: 2,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  // Fetch usage statistics
  const { 
    data: usage,
    isLoading: isLoadingUsage,
    error: usageQueryError,
    refetch: refetchUsage
  } = useQuery<PlanUsage>({
    queryKey: ["plan-usage"],
    queryFn: async () => {
      const response = await fetch("/api/plan-usage", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch plan usage");
      }
      return response.json();
    },
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/subscriptions/cancel", {
        method: "POST",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Canceled",
        description: "Your subscription will be canceled at the end of the current billing period.",
      });
      queryClient.invalidateQueries({ queryKey: ["subscription", "current"] });
      setShowCancelDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive",
      });
    },
  });

  // Upgrade subscription mutation
  const upgradeSubscriptionMutation = useMutation({
    mutationFn: async (planName: string) => {
      const response = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ planName }),
      });
      if (!response.ok) {
        throw new Error("Failed to upgrade subscription");
      }
      return response.json();
    },
    onSuccess: (data) => {
      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        toast({
          title: "Subscription Updated",
          description: "Your subscription has been updated successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ["subscription", "current"] });
        queryClient.invalidateQueries({ queryKey: ["plan-usage"] });
        setShowUpgradeDialog(false);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upgrade subscription",
        variant: "destructive",
      });
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "canceled":
        return "secondary";
      case "past_due":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getUsageColor = (used: number, limit: number) => {
    const percentage = limit === -1 ? 0 : (used / limit) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageWarning = (used: number, limit: number) => {
    if (limit === -1) return null;
    const percentage = (used / limit) * 100;
    if (percentage >= 90) {
      return {
        icon: "ri-error-warning-line",
        message: "Approaching limit",
        color: "text-red-600"
      };
    }
    if (percentage >= 75) {
      return {
        icon: "ri-alert-line",
        message: "High usage",
        color: "text-yellow-600"
      };
    }
    return null;
  };

  const handleUpgradePlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowUpgradeDialog(true);
  };

  const handleConfirmUpgrade = () => {
    if (selectedPlan) {
      upgradeSubscriptionMutation.mutate(selectedPlan.name);
    }
  };

  const handleCancelSubscription = () => {
    cancelSubscriptionMutation.mutate();
  };

  const handleManageBilling = () => {
    // This would typically redirect to a billing portal
    toast({
      title: "Billing Management",
      description: "Billing management portal will be available soon.",
    });
  };

  const handleRetryAll = () => {
    refetchSubscription();
    refetchPlans();
    refetchUsage();
    onRetryUsage?.();
  };

  // Show loading skeleton
  if (isLoadingSubscription || isLoadingPlans) {
    return <SubscriptionTabSkeleton />;
  }

  // Show error state if critical data failed to load
  if ((subscriptionError || plansError) && !subscriptionData && !allPlans) {
    return (
      <div className="space-y-6">
        <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)]">
          <CardContent className="p-8">
            <NetworkError onRetry={handleRetryAll} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Subscription Details */}
      <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <i className="ri-vip-crown-line text-primary"></i>
            Current Subscription
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {subscriptionData ? (
            <>
              {/* Plan Overview */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-primary/5 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-bold capitalize">{subscriptionData.plan.name}</h3>
                    <Badge variant={getStatusBadgeVariant(subscriptionData.subscription.status)}>
                      {subscriptionData.subscription.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{subscriptionData.plan.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      <i className="ri-calendar-line mr-1"></i>
                      {subscriptionData.plan.billingInterval}
                    </span>
                    <span>
                      <i className="ri-money-dollar-circle-line mr-1"></i>
                      {formatPrice(subscriptionData.plan.price)} / {subscriptionData.plan.billingInterval}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {!subscriptionData.subscription.cancelAtPeriodEnd && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setShowUpgradeDialog(true)}>
                        <i className="ri-arrow-up-line mr-2"></i>
                        Change Plan
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleManageBilling}>
                        <i className="ri-settings-line mr-2"></i>
                        Manage Billing
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setShowCancelDialog(true)}
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        <i className="ri-close-line mr-2"></i>
                        Cancel
                      </Button>
                    </>
                  )}
                  {subscriptionData.subscription.cancelAtPeriodEnd && (
                    <Button variant="outline" size="sm" onClick={() => setShowUpgradeDialog(true)}>
                      <i className="ri-refresh-line mr-2"></i>
                      Reactivate
                    </Button>
                  )}
                </div>
              </div>

              {/* Billing Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <i className="ri-calendar-check-line text-primary"></i>
                    Billing Cycle
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Current Period:</span>
                      <span>{formatDate(subscriptionData.subscription.currentPeriodStart.toString())} - {formatDate(subscriptionData.subscription.currentPeriodEnd.toString())}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Billing:</span>
                      <span>{formatDate(subscriptionData.subscription.currentPeriodEnd.toString())}</span>
                    </div>
                    {subscriptionData.subscription.cancelAtPeriodEnd && (
                      <div className="flex justify-between text-yellow-600">
                        <span>Status:</span>
                        <span>Cancels at period end</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <i className="ri-credit-card-line text-primary"></i>
                    Payment Method
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method:</span>
                      <span>{subscriptionData.subscription.paymentMethod || "Not specified"}</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={handleManageBilling}>
                      <i className="ri-edit-line mr-2"></i>
                      Update Payment Method
                    </Button>
                  </div>
                </div>
              </div>

              {/* Plan Features */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <i className="ri-star-line text-primary"></i>
                  Plan Features
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Array.isArray(subscriptionData.plan.features) && subscriptionData.plan.features.map((feature: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <i className="ri-check-line text-green-600"></i>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <i className="ri-information-line text-4xl text-muted-foreground mb-4"></i>
              <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground mb-4">
                You're currently on the free {userPlan} plan.
              </p>
              <Button onClick={() => setShowUpgradeDialog(true)}>
                <i className="ri-vip-crown-line mr-2"></i>
                Choose a Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      {(usage || usageError || usageQueryError) && (
        <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <i className="ri-bar-chart-box-line text-primary"></i>
              Usage & Limits
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isLoadingUsage ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground text-sm">Loading usage data...</p>
              </div>
            ) : (usageError || usageQueryError) && !usage ? (
              <InlineError 
                error={usageError || usageQueryError || "Failed to load usage data"} 
                onRetry={handleRetryAll}
              />
            ) : usage ? (
              <>
                {/* Series Usage */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Series</span>
                  {getUsageWarning(usage.series.used, usage.series.limit) && (
                    <div className="flex items-center gap-1">
                      <i className={`${getUsageWarning(usage.series.used, usage.series.limit)?.icon} text-sm ${getUsageWarning(usage.series.used, usage.series.limit)?.color}`}></i>
                      <span className={`text-xs ${getUsageWarning(usage.series.used, usage.series.limit)?.color}`}>
                        {getUsageWarning(usage.series.used, usage.series.limit)?.message}
                      </span>
                    </div>
                  )}
                </div>
                <span className={`text-sm font-medium ${getUsageColor(usage.series.used, usage.series.limit)}`}>
                  {usage.series.used} / {usage.series.limit === -1 ? "∞" : usage.series.limit}
                </span>
              </div>
              {usage.series.limit !== -1 && (
                <Progress 
                  value={getUsagePercentage(usage.series.used, usage.series.limit)} 
                  className="h-2"
                />
              )}
            </div>

            <Separator />

            {/* AI Prompts Usage */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">AI Prompts</span>
                  {getUsageWarning(usage.aiPrompts.used, usage.aiPrompts.limit) && (
                    <div className="flex items-center gap-1">
                      <i className={`${getUsageWarning(usage.aiPrompts.used, usage.aiPrompts.limit)?.icon} text-sm ${getUsageWarning(usage.aiPrompts.used, usage.aiPrompts.limit)?.color}`}></i>
                      <span className={`text-xs ${getUsageWarning(usage.aiPrompts.used, usage.aiPrompts.limit)?.color}`}>
                        {getUsageWarning(usage.aiPrompts.used, usage.aiPrompts.limit)?.message}
                      </span>
                    </div>
                  )}
                </div>
                <span className={`text-sm font-medium ${getUsageColor(usage.aiPrompts.used, usage.aiPrompts.limit)}`}>
                  {usage.aiPrompts.used} / {usage.aiPrompts.limit === -1 ? "∞" : usage.aiPrompts.limit}
                </span>
              </div>
              {usage.aiPrompts.limit !== -1 && (
                <>
                  <Progress 
                    value={getUsagePercentage(usage.aiPrompts.used, usage.aiPrompts.limit)} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    Resets on {new Date(usage.aiPrompts.resetDate).toLocaleDateString()}
                  </p>
                </>
              )}
            </div>

            <Separator />

            {/* Collaborators Usage */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Collaborators</span>
                  {getUsageWarning(usage.collaborators.used, usage.collaborators.limit) && (
                    <div className="flex items-center gap-1">
                      <i className={`${getUsageWarning(usage.collaborators.used, usage.collaborators.limit)?.icon} text-sm ${getUsageWarning(usage.collaborators.used, usage.collaborators.limit)?.color}`}></i>
                      <span className={`text-xs ${getUsageWarning(usage.collaborators.used, usage.collaborators.limit)?.color}`}>
                        {getUsageWarning(usage.collaborators.used, usage.collaborators.limit)?.message}
                      </span>
                    </div>
                  )}
                </div>
                <span className={`text-sm font-medium ${getUsageColor(usage.collaborators.used, usage.collaborators.limit)}`}>
                  {usage.collaborators.used} / {usage.collaborators.limit === -1 ? "∞" : usage.collaborators.limit}
                </span>
              </div>
              {usage.collaborators.limit !== -1 && (
                <Progress 
                  value={getUsagePercentage(usage.collaborators.used, usage.collaborators.limit)} 
                  className="h-2"
                />
              )}
            </div>

            <Separator />

            {/* Storage Usage */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Storage</span>
                  {getUsageWarning(usage.storage.used, usage.storage.limit) && (
                    <div className="flex items-center gap-1">
                      <i className={`${getUsageWarning(usage.storage.used, usage.storage.limit)?.icon} text-sm ${getUsageWarning(usage.storage.used, usage.storage.limit)?.color}`}></i>
                      <span className={`text-xs ${getUsageWarning(usage.storage.used, usage.storage.limit)?.color}`}>
                        {getUsageWarning(usage.storage.used, usage.storage.limit)?.message}
                      </span>
                    </div>
                  )}
                </div>
                <span className={`text-sm font-medium ${getUsageColor(usage.storage.used, usage.storage.limit)}`}>
                  {usage.storage.used}MB / {usage.storage.limit === -1 ? "∞" : `${usage.storage.limit}MB`}
                </span>
              </div>
              {usage.storage.limit !== -1 && (
                <Progress 
                  value={getUsagePercentage(usage.storage.used, usage.storage.limit)} 
                  className="h-2"
                />
              )}
            </div>
              </>
            ) : (
              <div className="text-center py-8">
                <i className="ri-bar-chart-box-line text-4xl text-muted-foreground mb-2"></i>
                <p className="text-muted-foreground">No usage data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Plan Comparison */}
      {allPlans && allPlans.length > 0 && (
        <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <i className="ri-compare-line text-primary"></i>
              Available Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    subscriptionData?.plan.id === plan.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold capitalize">{plan.name}</h4>
                      {subscriptionData?.plan.id === plan.id && (
                        <Badge variant="default" className="text-xs">Current</Badge>
                      )}
                    </div>
                    <p className="text-2xl font-bold">
                      {formatPrice(plan.price)}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{plan.billingInterval}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    {subscriptionData?.plan.id !== plan.id && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleUpgradePlan(plan)}
                      >
                        {plan.price > (subscriptionData?.plan.price || 0) ? "Upgrade" : "Downgrade"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade/Change Plan Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedPlan ? "Confirm Plan Change" : "Choose a Plan"}
            </DialogTitle>
            <DialogDescription>
              {selectedPlan 
                ? `Are you sure you want to ${selectedPlan.price > (subscriptionData?.plan?.price || 0) ? "upgrade" : "change"} to the ${selectedPlan.name} plan?`
                : "Select a plan to get started with SagaScript."
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg">
                <h4 className="font-semibold capitalize">{selectedPlan.name}</h4>
                <p className="text-2xl font-bold">
                  {formatPrice(selectedPlan.price)}
                  <span className="text-sm font-normal text-muted-foreground">
                    /{selectedPlan.billingInterval}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">{selectedPlan.description}</p>
              </div>
              
              {subscriptionData && (
                <div className="text-sm text-muted-foreground">
                  <p>Current plan: {subscriptionData.plan.name} ({formatPrice(subscriptionData.plan.price)}/{subscriptionData.plan.billingInterval})</p>
                  {selectedPlan.price > subscriptionData.plan.price && (
                    <p className="text-primary">You'll be charged the prorated difference immediately.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {!selectedPlan && allPlans && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {allPlans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-3 border rounded-lg cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={() => setSelectedPlan(plan)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium capitalize">{plan.name}</h4>
                      <p className="text-sm text-muted-foreground">{formatPrice(plan.price)}/{plan.billingInterval}</p>
                    </div>
                    <i className="ri-arrow-right-line text-muted-foreground"></i>
                  </div>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowUpgradeDialog(false);
              setSelectedPlan(null);
            }}>
              Cancel
            </Button>
            {selectedPlan && (
              <Button 
                onClick={handleConfirmUpgrade}
                disabled={upgradeSubscriptionMutation.isPending}
              >
                {upgradeSubscriptionMutation.isPending ? (
                  <>
                    <i className="ri-loader-line mr-2 animate-spin"></i>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="ri-check-line mr-2"></i>
                    Confirm
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.
            </DialogDescription>
          </DialogHeader>
          
          {subscriptionData && (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-800">What happens when you cancel:</h4>
                <ul className="text-sm text-red-700 mt-2 space-y-1">
                  <li>• Your subscription will remain active until {formatDate(subscriptionData.subscription.currentPeriodEnd.toString())}</li>
                  <li>• You'll lose access to premium features after that date</li>
                  <li>• Your data will be preserved and you can reactivate anytime</li>
                  <li>• No further charges will be made</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Subscription
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={cancelSubscriptionMutation.isPending}
            >
              {cancelSubscriptionMutation.isPending ? (
                <>
                  <i className="ri-loader-line mr-2 animate-spin"></i>
                  Canceling...
                </>
              ) : (
                <>
                  <i className="ri-close-line mr-2"></i>
                  Cancel Subscription
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}