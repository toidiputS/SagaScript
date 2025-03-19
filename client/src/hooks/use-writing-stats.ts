import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

// Define the shape of the stats object
type WritingStats = {
  totalWordCount: number;
  charactersCreated: number;
  achievementsCount: number;
  currentStreak: number;
};

export function useWritingStats() {
  const { user } = useAuth();
  
  const { data, isLoading, error, refetch } = useQuery<WritingStats>({
    queryKey: ['/api/user-stats'],
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
  
  // Refresh stats function that can be called when needed
  // e.g., after finishing a writing session
  const refreshStats = () => {
    return refetch();
  };
  
  return {
    stats: data,
    isLoading,
    error,
    refreshStats
  };
}
