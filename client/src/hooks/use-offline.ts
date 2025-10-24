import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface OfflineData {
  [key: string]: {
    data: any;
    timestamp: number;
    ttl?: number; // Time to live in milliseconds
  };
}

interface UseOfflineOptions {
  cacheKey: string;
  ttl?: number; // Default TTL in milliseconds
  enableNotifications?: boolean;
}

export function useOffline(options: UseOfflineOptions) {
  const { cacheKey, ttl = 1000 * 60 * 5, enableNotifications = true } = options; // Default 5 minutes TTL
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (enableNotifications) {
        toast({
          title: "Back online",
          description: "Your connection has been restored",
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      if (enableNotifications) {
        toast({
          title: "You're offline",
          description: "Some features may not be available",
          variant: "destructive",
        });
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [enableNotifications, toast]);

  // Cache data to localStorage
  const cacheData = useCallback((data: any, customTtl?: number) => {
    try {
      const offlineData: OfflineData = JSON.parse(
        localStorage.getItem("offline_cache") || "{}"
      );

      offlineData[cacheKey] = {
        data,
        timestamp: Date.now(),
        ttl: customTtl || ttl,
      };

      localStorage.setItem("offline_cache", JSON.stringify(offlineData));
    } catch (error) {
      console.warn("Failed to cache data:", error);
    }
  }, [cacheKey, ttl]);

  // Get cached data
  const getCachedData = useCallback(() => {
    try {
      const offlineData: OfflineData = JSON.parse(
        localStorage.getItem("offline_cache") || "{}"
      );

      const cached = offlineData[cacheKey];
      if (!cached) return null;

      // Check if data has expired
      const isExpired = Date.now() - cached.timestamp > (cached.ttl || ttl);
      if (isExpired) {
        // Remove expired data
        delete offlineData[cacheKey];
        localStorage.setItem("offline_cache", JSON.stringify(offlineData));
        return null;
      }

      return cached.data;
    } catch (error) {
      console.warn("Failed to get cached data:", error);
      return null;
    }
  }, [cacheKey, ttl]);

  // Clear cached data
  const clearCache = useCallback(() => {
    try {
      const offlineData: OfflineData = JSON.parse(
        localStorage.getItem("offline_cache") || "{}"
      );
      delete offlineData[cacheKey];
      localStorage.setItem("offline_cache", JSON.stringify(offlineData));
    } catch (error) {
      console.warn("Failed to clear cache:", error);
    }
  }, [cacheKey]);

  // Clear all cached data
  const clearAllCache = useCallback(() => {
    try {
      localStorage.removeItem("offline_cache");
    } catch (error) {
      console.warn("Failed to clear all cache:", error);
    }
  }, []);

  // Get cache info
  const getCacheInfo = useCallback(() => {
    try {
      const offlineData: OfflineData = JSON.parse(
        localStorage.getItem("offline_cache") || "{}"
      );
      const cached = offlineData[cacheKey];
      
      if (!cached) return null;

      const age = Date.now() - cached.timestamp;
      const remaining = (cached.ttl || ttl) - age;
      const isExpired = remaining <= 0;

      return {
        age,
        remaining: Math.max(0, remaining),
        isExpired,
        timestamp: cached.timestamp,
      };
    } catch (error) {
      console.warn("Failed to get cache info:", error);
      return null;
    }
  }, [cacheKey, ttl]);

  return {
    isOnline,
    isOffline: !isOnline,
    cacheData,
    getCachedData,
    clearCache,
    clearAllCache,
    getCacheInfo,
  };
}

// Hook for offline-aware data fetching
export function useOfflineQuery<T>(
  queryFn: () => Promise<T>,
  options: UseOfflineOptions & {
    fallbackData?: T;
    refetchOnReconnect?: boolean;
  }
) {
  const {
    fallbackData,
    refetchOnReconnect = true,
    ...offlineOptions
  } = options;

  const [data, setData] = useState<T | null>(fallbackData || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const {
    isOnline,
    cacheData,
    getCachedData,
  } = useOffline(offlineOptions);

  const fetchData = useCallback(async (useCache = false) => {
    if (!isOnline && !useCache) {
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
        return cachedData;
      }
      
      const offlineError = new Error("No internet connection and no cached data available");
      setError(offlineError);
      throw offlineError;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await queryFn();
      setData(result);
      
      // Cache the successful result
      if (isOnline) {
        cacheData(result);
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      
      // Try to use cached data as fallback
      if (!isOnline) {
        const cachedData = getCachedData();
        if (cachedData) {
          setData(cachedData);
          return cachedData;
        }
      }
      
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, queryFn, getCachedData, cacheData]);

  // Refetch when coming back online
  useEffect(() => {
    if (isOnline && refetchOnReconnect && data === null && !isLoading) {
      fetchData();
    }
  }, [isOnline, refetchOnReconnect, data, isLoading, fetchData]);

  // Initial load with cached data
  useEffect(() => {
    if (!data && !isLoading) {
      const cachedData = getCachedData();
      if (cachedData) {
        setData(cachedData);
      } else if (isOnline) {
        fetchData();
      }
    }
  }, [data, isLoading, getCachedData, fetchData, isOnline]);

  return {
    data,
    isLoading,
    error,
    refetch: () => fetchData(false),
    isOnline,
  };
}