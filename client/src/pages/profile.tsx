import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useWritingStats } from "@/hooks/use-writing-stats";
import { usePlanUsage } from "@/hooks/use-plan-usage";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { ErrorBoundary, NetworkError, InlineError } from "@/components/profile/ErrorBoundary";
import { ProfileHeaderSkeleton } from "@/components/profile/LoadingSkeletons";
import { useManualRetry } from "@/hooks/use-retry";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useProfilePreloader } from "@/lib/profile-preloader";
import { useLocation } from "wouter";
import { usePerformanceMonitor } from "@/lib/performance-monitor";

export default function ProfilePage() {
  const { user } = useAuth();
  const [location] = useLocation();
  const { preloadProfileData, preloadTabData, preloadCriticalResources } = useProfilePreloader();
  const { markStart, markEnd } = usePerformanceMonitor();
  const { 
    profile, 
    recentActivity,
    isLoading: isLoadingProfile, 
    isLoadingActivity,
    error: profileError,
    activityError,
    uploadAvatar, 
    isUploadingAvatar,
    updateProfile,
    isUpdatingProfile,
    refreshProfile,
    hasProfileError,
    isUsingCachedProfile,
    isUsingCachedActivity
  } = useProfile();
  const { 
    userStats, 
    isLoadingUserStats, 
    userStatsError,
    refreshStats,
    isUsingCachedUserStats
  } = useWritingStats();
  const { 
    usageError,
    refreshUsage,
    isUsingCachedUsage
  } = usePlanUsage();
  const [showEditModal, setShowEditModal] = useState(false);
  const { retry: retryProfileLoad, isRetrying: isRetryingProfile } = useManualRetry();
  const { retry: retryStatsLoad } = useManualRetry();

  // Performance monitoring and preloading on mount
  useEffect(() => {
    markStart('profile-page-load');
    
    if (user) {
      markStart('profile-data-preload');
      preloadProfileData().then(() => {
        markEnd('profile-data-preload');
      });
      
      markStart('critical-resources-preload');
      preloadCriticalResources().then(() => {
        markEnd('critical-resources-preload');
      });
    }
    
    return () => {
      markEnd('profile-page-load');
    };
  }, [user, preloadProfileData, preloadCriticalResources, markStart, markEnd]);

  // Preload tab-specific data when URL changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split("?")[1] || "");
    const activeTab = searchParams.get("tab") || "overview";
    
    if (user && activeTab !== "overview") {
      markStart(`tab-${activeTab}-preload`);
      preloadTabData(activeTab).then(() => {
        markEnd(`tab-${activeTab}-preload`);
      });
    }
  }, [location, user, preloadTabData, markStart, markEnd]);

  const handleUpdateProfile = (updates: Partial<NonNullable<typeof profile>>) => {
    updateProfile(updates);
    setShowEditModal(false);
  };

  const handleRetryProfile = () => {
    retryProfileLoad(async () => {
      await refreshProfile();
    });
  };

  const handleRetryStats = () => {
    retryStatsLoad(async () => {
      await refreshStats();
      await refreshUsage();
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Not authenticated</h2>
          <p className="text-muted-foreground">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  // Check if we're offline and show appropriate message
  const isOffline = !navigator.onLine;
  const isUsingAnyCache = isUsingCachedProfile || isUsingCachedActivity || isUsingCachedUserStats || isUsingCachedUsage;

  return (
    <ErrorBoundary title="Profile Page Error" onRetry={handleRetryProfile}>
      <div className="p-3 sm:p-6">
        {/* Skip to main content link for keyboard navigation */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Skip to main content
        </a>
        <div className="max-w-7xl mx-auto">
          {/* Offline/Cache Notice */}
          {(isOffline || isUsingAnyCache) && (
            <Alert className="mb-4 sm:mb-6">
              <i className={`ri-${isOffline ? 'wifi-off' : 'database'}-line mr-2`}></i>
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span>
                  {isOffline 
                    ? "You're currently offline. Some data may be outdated."
                    : "Showing cached data. Some information may not be current."
                  }
                </span>
                {!isOffline && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRetryProfile}
                    disabled={isRetryingProfile}
                    className="self-start sm:self-auto"
                  >
                    <i className="ri-refresh-line mr-1"></i>
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Profile Header with Error Boundary */}
          <div className="mb-6 sm:mb-8">
            <ErrorBoundary 
              title="Profile Header Error" 
              onRetry={handleRetryProfile}
              fallback={
                hasProfileError && !isOffline ? (
                  <NetworkError onRetry={handleRetryProfile} />
                ) : undefined
              }
            >
              {isLoadingProfile ? (
                <ProfileHeaderSkeleton />
              ) : hasProfileError && !profile && !isOffline ? (
                <InlineError 
                  error={profileError || "Failed to load profile"} 
                  onRetry={handleRetryProfile}
                />
              ) : (
                <ProfileHeader
                  user={user}
                  profile={profile}
                  isLoading={isLoadingProfile}
                  onEditProfile={() => setShowEditModal(true)}
                  onUploadAvatar={uploadAvatar}
                  isUploadingAvatar={isUploadingAvatar}
                />
              )}
            </ErrorBoundary>
          </div>

          {/* Profile Tabs with Error Boundary */}
          <main id="main-content" tabIndex={-1}>
            <ErrorBoundary 
              title="Profile Content Error" 
              onRetry={handleRetryStats}
            >
              <ProfileTabs
              user={user}
              userStats={userStats}
              recentActivity={recentActivity}
              userPlan={user.plan}
              isLoadingUserStats={isLoadingUserStats}
              isLoadingActivity={isLoadingActivity}
              // Pass error states to tabs
              statsError={userStatsError || undefined}
              activityError={activityError || undefined}
              usageError={usageError || undefined}
              onRetryStats={handleRetryStats}
              onRetryActivity={handleRetryProfile}
              onRetryUsage={handleRetryStats}
            />
            </ErrorBoundary>
          </main>

          {/* Edit Profile Modal with Error Boundary */}
          <ErrorBoundary title="Edit Profile Error">
            <EditProfileModal
              user={user}
              profile={profile}
              isOpen={showEditModal}
              onClose={() => setShowEditModal(false)}
              onUpdateProfile={handleUpdateProfile}
              onUploadAvatar={uploadAvatar}
              isUpdating={isUpdatingProfile}
              isUploadingAvatar={isUploadingAvatar}
            />
          </ErrorBoundary>
        </div>
      </div>
    </ErrorBoundary>
  );
}