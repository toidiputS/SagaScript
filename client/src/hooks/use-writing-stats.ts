import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { apiRequest } from "@/lib/queryClient";
import { WritingStatsWithPeriod, UserStats } from "@shared/schema";
import { useRetry } from "./use-retry";
import { useOffline } from "./use-offline";

// Define the shape of the basic stats object
type WritingStats = {
  totalWordCount: number;
  charactersCreated: number;
  achievementsCount: number;
  currentStreak: number;
};

type Period = 'day' | 'week' | 'month' | 'year';

export function useWritingStats(period?: Period, startDate?: string, endDate?: string) {
  const { isAuthenticated } = useAuth();
  const { executeWithRetry } = useRetry({
    maxAttempts: 3,
    delay: 1000,
    backoff: true,
  });
  
  // Offline support for different data types
  const { cacheData: cacheBasicStats, getCachedData: getCachedBasicStats } = useOffline({
    cacheKey: "basic_writing_stats",
    ttl: 1000 * 60 * 10, // 10 minutes
  });
  const { cacheData: cacheDetailedStats, getCachedData: getCachedDetailedStats } = useOffline({
    cacheKey: `detailed_stats_${period}_${startDate}_${endDate}`,
    ttl: 1000 * 60 * 5, // 5 minutes
  });
  const { cacheData: cacheUserStats, getCachedData: getCachedUserStats } = useOffline({
    cacheKey: "user_stats",
    ttl: 1000 * 60 * 10, // 10 minutes
  });
  
  // Basic stats query with retry and offline support
  const { data, isLoading, error, refetch } = useQuery<WritingStats>({
    queryKey: ['/api/user-stats'],
    queryFn: async () => {
      return executeWithRetry(async () => {
        const res = await apiRequest("GET", "/api/user-stats");
        const data = await res.json() as WritingStats;
        cacheBasicStats(data);
        return data;
      });
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false,
    placeholderData: () => getCachedBasicStats(),
  });

  // Detailed writing statistics with retry and offline support
  const {
    data: detailedStats,
    isLoading: isLoadingDetailed,
    error: detailedError,
    refetch: refetchDetailed,
  } = useQuery<WritingStatsWithPeriod[]>({
    queryKey: ['/api/writing-stats', { period, startDate, endDate }],
    queryFn: async () => {
      return executeWithRetry(async () => {
        const params = new URLSearchParams();
        if (period) params.append('period', period);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        const url = `/api/writing-stats${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await apiRequest("GET", url);
        const data = await res.json() as WritingStatsWithPeriod[];
        cacheDetailedStats(data);
        return data;
      });
    },
    enabled: isAuthenticated && !!period,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
    retry: false,
    placeholderData: () => getCachedDetailedStats(),
  });

  // Comprehensive user statistics with retry and offline support
  const {
    data: userStats,
    isLoading: isLoadingUserStats,
    error: userStatsError,
    refetch: refetchUserStats,
  } = useQuery<UserStats>({
    queryKey: ['/api/user/stats'],
    queryFn: async () => {
      return executeWithRetry(async () => {
        const res = await apiRequest("GET", "/api/user/stats");
        const data = await res.json() as UserStats;
        cacheUserStats(data);
        return data;
      });
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: false,
    placeholderData: () => getCachedUserStats(),
  });
  
  // Refresh stats function that can be called when needed
  // e.g., after finishing a writing session
  const refreshStats = () => {
    refetch();
    refetchDetailed();
    refetchUserStats();
  };
  
  return {
    // Backwards compatibility
    stats: data,
    isLoading,
    error,
    refreshStats,
    
    // New detailed stats
    detailedStats,
    isLoadingDetailed,
    detailedError,
    
    // Comprehensive user stats
    userStats,
    isLoadingUserStats,
    userStatsError,
    
    // Error states
    hasBasicStatsError: !!error,
    hasDetailedStatsError: !!detailedError,
    hasUserStatsError: !!userStatsError,
    
    // Cached data indicators
    isUsingCachedBasicStats: !isLoading && !!getCachedBasicStats() && !data,
    isUsingCachedDetailedStats: !isLoadingDetailed && !!getCachedDetailedStats() && !detailedStats,
    isUsingCachedUserStats: !isLoadingUserStats && !!getCachedUserStats() && !userStats,
  };
}
