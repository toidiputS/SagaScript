import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/dashboard/stats-card";
import BadgeShowcase from "@/components/dashboard/badge-showcase";
import { UserStats, RecentActivity } from "@shared/schema";
import { InlineError } from "./ErrorBoundary";
import { StatsCardSkeleton } from "./LoadingSkeletons";

interface OverviewTabProps {
  userStats?: UserStats;
  recentActivity?: RecentActivity[];
  isLoadingUserStats: boolean;
  isLoadingActivity: boolean;
  statsError?: Error;
  activityError?: Error;
  onRetryStats?: () => void;
  onRetryActivity?: () => void;
}

export function OverviewTab({
  userStats,
  recentActivity = [],
  isLoadingUserStats,
  isLoadingActivity,
  statsError,
  activityError,
  onRetryStats,
  onRetryActivity,
}: OverviewTabProps) {
  // Calculate trend data (mock for now - would come from API in real implementation)
  const getTrendData = (current: number, previous: number): { value: number; type: 'increase' | 'decrease'; text: string; } | undefined => {
    if (previous === 0) return undefined;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(change)),
      type: change >= 0 ? 'increase' : 'decrease' as const,
      text: 'from last month'
    };
  };

  // Mock previous month data for trend calculation
  const previousMonthWords = userStats ? Math.max(0, userStats.totalWords - 2500) : 0;
  const previousStreak = userStats ? Math.max(0, userStats.currentStreak - 2) : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Writing Statistics Summary Cards */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">Writing Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {isLoadingUserStats ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : statsError && !userStats ? (
          <div className="col-span-full">
            <InlineError 
              error={statsError} 
              onRetry={onRetryStats}
            />
          </div>
        ) : (
          <>
            <StatsCard
              title="Total Words"
              value={userStats?.totalWords?.toLocaleString() || "0"}
              icon="ri-quill-pen-line"
              iconBg="bg-primary/10"
              iconColor="text-primary"
              trend={userStats ? getTrendData(userStats.totalWords, previousMonthWords) : undefined}
              aria-label={`Total words written: ${userStats?.totalWords?.toLocaleString() || "0"}`}
            />
            
            <StatsCard
              title="Current Streak"
              value={`${userStats?.currentStreak || 0} days`}
              icon="ri-fire-line"
              iconBg="bg-orange-100 dark:bg-orange-900/20"
              iconColor="text-orange-600 dark:text-orange-400"
              trend={userStats ? getTrendData(userStats.currentStreak, previousStreak) : undefined}
              streakDays={userStats?.currentStreak ? Math.min(userStats.currentStreak, 7) : 0}
              aria-label={`Current writing streak: ${userStats?.currentStreak || 0} days`}
            />
            
            <StatsCard
              title="Series Created"
              value={userStats?.totalSeries?.toString() || "0"}
              icon="ri-book-line"
              iconBg="bg-green-100 dark:bg-green-900/20"
              iconColor="text-green-600 dark:text-green-400"
              aria-label={`Total series created: ${userStats?.totalSeries?.toString() || "0"}`}
            />
          </>
        )}
        </div>
      </section>

      {/* Recent Activity and Quick Access Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity Card */}
        <Card className="rounded-[15px] sm:rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
          <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2" id="recent-activity-heading">
              <i className="ri-time-line text-primary" aria-hidden="true"></i>
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            {isLoadingActivity ? (
              <div className="text-center py-4" role="status" aria-live="polite">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" aria-hidden="true"></div>
                <p className="text-muted-foreground text-sm">Loading activity...</p>
              </div>
            ) : activityError && recentActivity.length === 0 ? (
              <InlineError 
                error={activityError} 
                onRetry={onRetryActivity}
                className="py-4"
              />
            ) : recentActivity.length > 0 ? (
              <div className="space-y-3" role="list" aria-labelledby="recent-activity-heading">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-2 sm:gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors touch-manipulation" role="listitem">
                    <div className="flex-shrink-0 mt-1">
                      <i className={`${getActivityIcon(activity.type)} text-primary text-sm`} aria-hidden="true"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm text-foreground">{activity.description}</p>
                      <time 
                        className="text-[10px] sm:text-xs text-muted-foreground"
                        dateTime={new Date(activity.timestamp).toISOString()}
                      >
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </time>
                    </div>
                    {activity.relatedTitle && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs min-h-[32px] touch-manipulation focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        aria-label={`Continue working on ${activity.relatedTitle}`}
                      >
                        Continue
                      </Button>
                    )}
                  </div>
                ))}
                {recentActivity.length > 5 && (
                  <div className="text-center pt-2">
                    <Button variant="ghost" size="sm" className="text-xs text-muted-foreground">
                      View all activity
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="ri-file-list-line text-4xl text-muted-foreground mb-2"></i>
                <p className="text-muted-foreground">No recent activity</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your recent writing sessions will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="rounded-[15px] sm:rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
          <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2" id="quick-actions-heading">
              <i className="ri-rocket-line text-primary" aria-hidden="true"></i>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <nav className="space-y-2 sm:space-y-3" aria-labelledby="quick-actions-heading">
              <Button className="w-full justify-start min-h-[44px] touch-manipulation focus:ring-2 focus:ring-primary focus:ring-offset-2" variant="ghost">
                <i className="ri-add-line mr-2" aria-hidden="true"></i>
                Create New Series
              </Button>
              <Button className="w-full justify-start min-h-[44px] touch-manipulation focus:ring-2 focus:ring-primary focus:ring-offset-2" variant="ghost">
                <i className="ri-book-open-line mr-2" aria-hidden="true"></i>
                Continue Writing
              </Button>
              <Button className="w-full justify-start min-h-[44px] touch-manipulation focus:ring-2 focus:ring-primary focus:ring-offset-2" variant="ghost">
                <i className="ri-user-add-line mr-2" aria-hidden="true"></i>
                Add Character
              </Button>
              <Button className="w-full justify-start min-h-[44px] touch-manipulation focus:ring-2 focus:ring-primary focus:ring-offset-2" variant="ghost">
                <i className="ri-map-pin-line mr-2" aria-hidden="true"></i>
                Create Location
              </Button>
            </nav>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <BadgeShowcase
          title="Recent Achievements"
          maxShown={6}
          className="rounded-[15px] sm:rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300"
        />
        
        {/* Writing Goals Progress */}
        <Card className="rounded-[15px] sm:rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
          <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2" id="writing-goals-heading">
              <i className="ri-target-line text-primary" aria-hidden="true"></i>
              Writing Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
            <div className="space-y-4" aria-labelledby="writing-goals-heading">
              {/* Daily Goal Progress */}
              <div className="space-y-2" role="group" aria-labelledby="daily-goal-label">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" id="daily-goal-label">Daily Word Goal</span>
                  <span className="text-xs text-muted-foreground" aria-label="250 out of 500 words completed">250 / 500 words</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2" role="progressbar" aria-valuenow={50} aria-valuemin={0} aria-valuemax={100} aria-labelledby="daily-goal-label">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: '50%' }}
                    aria-hidden="true"
                  ></div>
                </div>
              </div>
              
              {/* Weekly Goal Progress */}
              <div className="space-y-2" role="group" aria-labelledby="weekly-goal-label">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium" id="weekly-goal-label">Weekly Chapter Goal</span>
                  <span className="text-xs text-muted-foreground" aria-label="2 out of 3 chapters completed">2 / 3 chapters</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2" role="progressbar" aria-valuenow={67} aria-valuemin={0} aria-valuemax={100} aria-labelledby="weekly-goal-label">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: '67%' }}
                    aria-hidden="true"
                  ></div>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full mt-4 min-h-[44px] touch-manipulation focus:ring-2 focus:ring-primary focus:ring-offset-2">
                <i className="ri-settings-line mr-2" aria-hidden="true"></i>
                Manage Goals
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function to get appropriate icon for activity type
function getActivityIcon(type: RecentActivity['type']): string {
  switch (type) {
    case 'chapter_edited':
      return 'ri-edit-line';
    case 'character_added':
      return 'ri-user-add-line';
    case 'achievement_earned':
      return 'ri-award-line';
    case 'book_completed':
      return 'ri-book-mark-line';
    case 'series_created':
      return 'ri-book-line';
    default:
      return 'ri-information-line';
  }
}