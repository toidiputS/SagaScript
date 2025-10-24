import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { lazy, Suspense } from "react";

import { OverviewTab } from "./OverviewTab";
import { ErrorBoundary } from "./ErrorBoundary";
import { CenteredLoading } from "./LoadingSkeletons";
import { UserStats, RecentActivity, User } from "@shared/schema";

// Lazy load tab components for code splitting
const StatisticsTab = lazy(() => import("./StatisticsTab").then(module => ({ default: module.StatisticsTab })));
const AchievementsTab = lazy(() => import("./AchievementsTab").then(module => ({ default: module.AchievementsTab })));
const SubscriptionTab = lazy(() => import("./SubscriptionTab").then(module => ({ default: module.SubscriptionTab })));
const SettingsTab = lazy(() => import("./SettingsTab").then(module => ({ default: module.SettingsTab })));

interface ProfileTabsProps {
  user?: User;
  userStats?: UserStats;
  recentActivity?: RecentActivity[];
  userPlan: string;
  isLoadingUserStats: boolean;
  isLoadingActivity: boolean;
  // Error handling props
  statsError?: Error;
  activityError?: Error;
  usageError?: Error;
  onRetryStats?: () => void;
  onRetryActivity?: () => void;
  onRetryUsage?: () => void;
}

export function ProfileTabs({
  user,
  userStats,
  recentActivity,
  userPlan,
  isLoadingUserStats,
  isLoadingActivity,
  statsError,
  activityError,
  usageError,
  onRetryStats,
  onRetryActivity,
  onRetryUsage,
}: ProfileTabsProps) {
  const [location, setLocation] = useLocation();
  
  // Extract tab from URL search params
  const searchParams = new URLSearchParams(location.split("?")[1] || "");
  const activeTab = searchParams.get("tab") || "overview";

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    if (value === "overview") {
      newSearchParams.delete("tab");
    } else {
      newSearchParams.set("tab", value);
    }
    
    const newSearch = newSearchParams.toString();
    const basePath = location.split("?")[0];
    setLocation(basePath + (newSearch ? `?${newSearch}` : ""));
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList 
        className="grid w-full grid-cols-5 mb-6 sm:mb-8 h-auto p-1 bg-muted/50 rounded-2xl" 
        role="tablist"
        aria-label="Profile navigation tabs"
      >
        <TabsTrigger 
          value="overview" 
          className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-1 sm:px-2 py-2 sm:py-3 text-xs sm:text-sm rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 min-h-[44px] touch-manipulation"
          aria-label="Overview tab"
        >
          <i className="ri-dashboard-line text-base sm:text-lg"></i>
          <span className="text-[10px] sm:text-sm font-medium">Overview</span>
        </TabsTrigger>
        <TabsTrigger 
          value="statistics" 
          className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-1 sm:px-2 py-2 sm:py-3 text-xs sm:text-sm rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 min-h-[44px] touch-manipulation"
          aria-label="Statistics tab"
        >
          <i className="ri-bar-chart-line text-base sm:text-lg"></i>
          <span className="text-[10px] sm:text-sm font-medium">Stats</span>
        </TabsTrigger>
        <TabsTrigger 
          value="achievements" 
          className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-1 sm:px-2 py-2 sm:py-3 text-xs sm:text-sm rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 min-h-[44px] touch-manipulation"
          aria-label="Achievements tab"
        >
          <i className="ri-award-line text-base sm:text-lg"></i>
          <span className="text-[10px] sm:text-sm font-medium">Awards</span>
        </TabsTrigger>
        <TabsTrigger 
          value="subscription" 
          className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-1 sm:px-2 py-2 sm:py-3 text-xs sm:text-sm rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 min-h-[44px] touch-manipulation"
          aria-label="Subscription tab"
        >
          <i className="ri-vip-crown-line text-base sm:text-lg"></i>
          <span className="text-[10px] sm:text-sm font-medium">Plan</span>
        </TabsTrigger>
        <TabsTrigger 
          value="settings" 
          className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-1 sm:px-2 py-2 sm:py-3 text-xs sm:text-sm rounded-xl data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all duration-200 min-h-[44px] touch-manipulation"
          aria-label="Settings tab"
        >
          <i className="ri-settings-line text-base sm:text-lg"></i>
          <span className="text-[10px] sm:text-sm font-medium">Settings</span>
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-4 sm:space-y-6 focus:outline-none" tabIndex={-1}>
        <ErrorBoundary title="Overview Tab Error" onRetry={onRetryStats}>
          <OverviewTab
            userStats={userStats}
            recentActivity={recentActivity}
            isLoadingUserStats={isLoadingUserStats}
            isLoadingActivity={isLoadingActivity}
            statsError={statsError}
            activityError={activityError}
            onRetryStats={onRetryStats}
            onRetryActivity={onRetryActivity}
          />
        </ErrorBoundary>
      </TabsContent>

      {/* Statistics Tab */}
      <TabsContent value="statistics" className="space-y-4 sm:space-y-6 focus:outline-none" tabIndex={-1}>
        <ErrorBoundary title="Statistics Tab Error" onRetry={onRetryStats}>
          <Suspense fallback={<CenteredLoading message="Loading statistics..." />}>
            <StatisticsTab
              userStats={userStats}
              isLoadingUserStats={isLoadingUserStats}
              statsError={statsError}
              onRetryStats={onRetryStats}
            />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      {/* Achievements Tab */}
      <TabsContent value="achievements" className="space-y-4 sm:space-y-6 focus:outline-none" tabIndex={-1}>
        <ErrorBoundary title="Achievements Tab Error">
          <Suspense fallback={<CenteredLoading message="Loading achievements..." />}>
            <AchievementsTab />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      {/* Subscription Tab */}
      <TabsContent value="subscription" className="space-y-4 sm:space-y-6 focus:outline-none" tabIndex={-1}>
        <ErrorBoundary title="Subscription Tab Error" onRetry={onRetryUsage}>
          <Suspense fallback={<CenteredLoading message="Loading subscription..." />}>
            <SubscriptionTab 
              userPlan={userPlan} 
              usageError={usageError}
              onRetryUsage={onRetryUsage}
            />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>

      {/* Settings Tab */}
      <TabsContent value="settings" className="space-y-4 sm:space-y-6 focus:outline-none" tabIndex={-1}>
        <ErrorBoundary title="Settings Tab Error">
          <Suspense fallback={<CenteredLoading message="Loading settings..." />}>
            <SettingsTab user={user} />
          </Suspense>
        </ErrorBoundary>
      </TabsContent>
    </Tabs>
  );
}