import { queryClient } from "./queryClient";
import { apiRequest } from "./queryClient";
import { UserProfile, UserStats, RecentActivity } from "@shared/schema";

/**
 * Preloads critical profile data to improve perceived performance
 */
export class ProfilePreloader {
  private static instance: ProfilePreloader;
  private preloadPromises: Map<string, Promise<any>> = new Map();

  static getInstance(): ProfilePreloader {
    if (!ProfilePreloader.instance) {
      ProfilePreloader.instance = new ProfilePreloader();
    }
    return ProfilePreloader.instance;
  }

  /**
   * Preload profile data when user navigates to profile page
   */
  async preloadProfileData(): Promise<void> {
    const promises = [
      this.preloadProfile(),
      this.preloadUserStats(),
      this.preloadRecentActivity(),
    ];

    // Start all preloads concurrently
    await Promise.allSettled(promises);
  }

  /**
   * Preload basic profile information
   */
  private async preloadProfile(): Promise<UserProfile | null> {
    const key = "/api/profile";
    
    if (this.preloadPromises.has(key)) {
      return this.preloadPromises.get(key);
    }

    const promise = this.fetchAndCache<UserProfile>(key);
    this.preloadPromises.set(key, promise);
    
    return promise;
  }

  /**
   * Preload user statistics
   */
  private async preloadUserStats(): Promise<UserStats | null> {
    const key = "/api/user/stats";
    
    if (this.preloadPromises.has(key)) {
      return this.preloadPromises.get(key);
    }

    const promise = this.fetchAndCache<UserStats>(key);
    this.preloadPromises.set(key, promise);
    
    return promise;
  }

  /**
   * Preload recent activity
   */
  private async preloadRecentActivity(): Promise<RecentActivity[] | null> {
    const key = "/api/profile/recent-activity";
    
    if (this.preloadPromises.has(key)) {
      return this.preloadPromises.get(key);
    }

    const promise = this.fetchAndCache<RecentActivity[]>(key);
    this.preloadPromises.set(key, promise);
    
    return promise;
  }

  /**
   * Preload tab-specific data based on the active tab
   */
  async preloadTabData(tab: string): Promise<void> {
    switch (tab) {
      case 'statistics':
        await this.preloadWritingStats();
        break;
      case 'achievements':
        await Promise.allSettled([
          this.preloadAchievements(),
          this.preloadUserAchievements(),
        ]);
        break;
      case 'subscription':
        await Promise.allSettled([
          this.preloadSubscription(),
          this.preloadPlanUsage(),
        ]);
        break;
      default:
        // No additional preloading needed for overview and settings
        break;
    }
  }

  /**
   * Preload writing statistics
   */
  private async preloadWritingStats(): Promise<any> {
    const key = "/api/writing-stats?period=week";
    
    if (this.preloadPromises.has(key)) {
      return this.preloadPromises.get(key);
    }

    const promise = this.fetchAndCache(key);
    this.preloadPromises.set(key, promise);
    
    return promise;
  }

  /**
   * Preload achievements data
   */
  private async preloadAchievements(): Promise<any> {
    const key = "/api/achievements";
    
    if (this.preloadPromises.has(key)) {
      return this.preloadPromises.get(key);
    }

    const promise = this.fetchAndCache(key);
    this.preloadPromises.set(key, promise);
    
    return promise;
  }

  /**
   * Preload user achievements
   */
  private async preloadUserAchievements(): Promise<any> {
    const key = "/api/user-achievements";
    
    if (this.preloadPromises.has(key)) {
      return this.preloadPromises.get(key);
    }

    const promise = this.fetchAndCache(key);
    this.preloadPromises.set(key, promise);
    
    return promise;
  }

  /**
   * Preload subscription data
   */
  private async preloadSubscription(): Promise<any> {
    const key = "/api/user/subscription";
    
    if (this.preloadPromises.has(key)) {
      return this.preloadPromises.get(key);
    }

    const promise = this.fetchAndCache(key);
    this.preloadPromises.set(key, promise);
    
    return promise;
  }

  /**
   * Preload plan usage data
   */
  private async preloadPlanUsage(): Promise<any> {
    const key = "/api/user/usage";
    
    if (this.preloadPromises.has(key)) {
      return this.preloadPromises.get(key);
    }

    const promise = this.fetchAndCache(key);
    this.preloadPromises.set(key, promise);
    
    return promise;
  }

  /**
   * Generic fetch and cache method
   */
  private async fetchAndCache<T>(queryKey: string): Promise<T | null> {
    try {
      // Check if data is already in cache
      const cachedData = queryClient.getQueryData<T>([queryKey]);
      if (cachedData) {
        return cachedData;
      }

      // Fetch data
      const response = await apiRequest("GET", queryKey);
      const data = await response.json() as T;

      // Cache the data
      queryClient.setQueryData([queryKey], data, {
        updatedAt: Date.now(),
      });

      return data;
    } catch (error) {
      console.warn(`Failed to preload ${queryKey}:`, error);
      return null;
    }
  }

  /**
   * Clear preload promises cache
   */
  clearCache(): void {
    this.preloadPromises.clear();
  }

  /**
   * Prefetch images for better perceived performance
   */
  async prefetchImages(imageUrls: string[]): Promise<void> {
    const prefetchPromises = imageUrls.map(url => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Don't fail the whole process
        img.src = url;
      });
    });

    await Promise.allSettled(prefetchPromises);
  }

  /**
   * Preload critical resources for the profile page
   */
  async preloadCriticalResources(): Promise<void> {
    // Preload common achievement badge icons
    const commonBadgeIcons = [
      '/api/achievements/icons/first-words.svg',
      '/api/achievements/icons/streak-starter.svg',
      '/api/achievements/icons/chapter-master.svg',
      '/api/achievements/icons/book-author.svg',
    ];

    await this.prefetchImages(commonBadgeIcons);
  }
}

// Export singleton instance
export const profilePreloader = ProfilePreloader.getInstance();

// Hook for easy integration with React components
export function useProfilePreloader() {
  return {
    preloadProfileData: profilePreloader.preloadProfileData.bind(profilePreloader),
    preloadTabData: profilePreloader.preloadTabData.bind(profilePreloader),
    preloadCriticalResources: profilePreloader.preloadCriticalResources.bind(profilePreloader),
  };
}