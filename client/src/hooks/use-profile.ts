import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { apiRequest } from "@/lib/queryClient";
import { UserProfile, UserPreferences, RecentActivity } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useRetry } from "./use-retry";
import { useOffline } from "./use-offline";

export function useProfile() {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { executeWithRetry } = useRetry({
    maxAttempts: 3,
    delay: 1000,
    backoff: true,
  });
  const { cacheData: cacheProfile, getCachedData: getCachedProfile } = useOffline({
    cacheKey: "profile_data",
    ttl: 1000 * 60 * 10, // 10 minutes
  });
  const { cacheData: cacheActivity, getCachedData: getCachedActivity } = useOffline({
    cacheKey: "recent_activity",
    ttl: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch comprehensive profile data with retry and offline support
  const {
    data: profile,
    isLoading,
    error,
    refetch: refreshProfile,
  } = useQuery<UserProfile>({
    queryKey: ["/api/profile"],
    queryFn: async () => {
      return executeWithRetry(async () => {
        const res = await apiRequest("GET", "/api/profile");
        const data = await res.json() as UserProfile;
        cacheProfile(data);
        return data;
      });
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false, // We handle retries manually
    placeholderData: () => getCachedProfile(),
  });

  // Fetch recent activity with retry and offline support
  const {
    data: recentActivity = [],
    isLoading: isLoadingActivity,
    error: activityError,
  } = useQuery<RecentActivity[]>({
    queryKey: ["/api/profile/recent-activity"],
    queryFn: async () => {
      return executeWithRetry(async () => {
        const res = await apiRequest("GET", "/api/profile/recent-activity");
        const data = await res.json() as RecentActivity[];
        cacheActivity(data);
        return data;
      });
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
    retry: false, // We handle retries manually
    placeholderData: () => getCachedActivity() || [],
  });

  // Update profile mutation with retry
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<Pick<UserProfile, 'displayName' | 'email' | 'bio' | 'location' | 'website' | 'socialLinks'>>) => {
      return executeWithRetry(async () => {
        const res = await apiRequest("PUT", "/api/profile", updates);
        return res.json() as Promise<UserProfile>;
      });
    },
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["/api/profile"], updatedProfile);
      queryClient.setQueryData(["/api/user"], updatedProfile);
      cacheProfile(updatedProfile);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Upload avatar mutation with retry
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      return executeWithRetry(async () => {
        const formData = new FormData();
        formData.append("avatar", file);
        
        const res = await fetch("/api/profile/avatar", {
          method: "POST",
          body: formData,
          credentials: "include",
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`${res.status}: ${errorText || res.statusText}`);
        }
        
        return res.json() as Promise<{ avatarUrl: string }>;
      });
    },
    onSuccess: (data) => {
      // Update the profile data with new avatar
      if (profile) {
        const updatedProfile = { ...profile, avatar: data.avatarUrl };
        queryClient.setQueryData(["/api/profile"], updatedProfile);
        queryClient.setQueryData(["/api/user"], updatedProfile);
        cacheProfile(updatedProfile);
      }
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update preferences mutation with retry
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: UserPreferences) => {
      return executeWithRetry(async () => {
        const res = await apiRequest("PUT", "/api/user/preferences", preferences);
        return res.json() as Promise<UserPreferences>;
      });
    },
    onSuccess: (updatedPreferences) => {
      // Update the profile data with new preferences
      if (profile) {
        const updatedProfile = { ...profile, preferences: updatedPreferences };
        queryClient.setQueryData(["/api/profile"], updatedProfile);
        cacheProfile(updatedProfile);
      }
      toast({
        title: "Preferences updated",
        description: "Your preferences have been successfully saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    profile,
    recentActivity,
    isLoading,
    isLoadingActivity,
    error,
    activityError,
    refreshProfile,
    updateProfile: updateProfileMutation.mutate,
    isUpdatingProfile: updateProfileMutation.isPending,
    uploadAvatar: uploadAvatarMutation.mutate,
    isUploadingAvatar: uploadAvatarMutation.isPending,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
    // Error states
    hasProfileError: !!error,
    hasActivityError: !!activityError,
    // Cached data indicators
    isUsingCachedProfile: !isLoading && !!getCachedProfile() && !profile,
    isUsingCachedActivity: !isLoadingActivity && !!getCachedActivity() && recentActivity.length === 0,
  };
}