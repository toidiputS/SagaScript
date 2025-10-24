import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserStats } from "@shared/schema";
import { WritingStatsChart } from "@/components/profile/WritingStatsChart";
import { useWritingStats } from "@/hooks/use-writing-stats";
import { InlineError } from "./ErrorBoundary";
import { StatisticsTabSkeleton, StatsCardSkeleton, CenteredLoading } from "./LoadingSkeletons";

interface StatisticsTabProps {
  userStats?: UserStats;
  isLoadingUserStats: boolean;
  statsError?: Error;
  onRetryStats?: () => void;
}

type PeriodType = 'day' | 'week' | 'month' | 'year';

export function StatisticsTab({ userStats, isLoadingUserStats, statsError, onRetryStats }: StatisticsTabProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('week');
  
  // Fetch writing statistics for the selected period
  const { 
    detailedStats: writingStats, 
    isLoadingDetailed: isLoadingStats,
    detailedError: detailedStatsError,
    refreshStats
  } = useWritingStats(selectedPeriod);

  const handlePeriodChange = (period: PeriodType) => {
    setSelectedPeriod(period);
  };

  const handleRetryStats = () => {
    onRetryStats?.();
    refreshStats();
  };

  // Show full skeleton if initial load is failing
  if (isLoadingUserStats && !userStats && statsError) {
    return <StatisticsTabSkeleton />;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Period Selector */}
      <Card className="rounded-[15px] sm:rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
        <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2" id="statistics-heading">
              <i className="ri-bar-chart-line text-primary" aria-hidden="true"></i>
              Writing Statistics
            </CardTitle>
            <div className="flex items-center gap-2">
              <label htmlFor="period-select" className="text-sm font-medium sr-only">
                Select time period
              </label>
              <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
                <SelectTrigger className="w-32 sm:w-36" id="period-select" aria-label="Select time period for statistics">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
          {isLoadingStats ? (
            <div role="status" aria-live="polite">
              <CenteredLoading message="Loading statistics..." />
            </div>
          ) : detailedStatsError && !writingStats ? (
            <InlineError 
              error={detailedStatsError} 
              onRetry={handleRetryStats}
            />
          ) : (
            <div role="img" aria-labelledby="statistics-heading" aria-describedby="chart-description">
              <div id="chart-description" className="sr-only">
                Interactive chart showing writing statistics for the selected {selectedPeriod}ly period
              </div>
              <WritingStatsChart 
                data={writingStats || []} 
                period={selectedPeriod}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Comprehensive Metrics Display */}
      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="sr-only">Detailed Writing Metrics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {isLoadingUserStats ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : statsError && !userStats ? (
          <div className="col-span-full">
            <InlineError 
              error={statsError} 
              onRetry={handleRetryStats}
            />
          </div>
        ) : (
          <>
            {/* Total Statistics Cards */}
            <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <i className="ri-book-line text-primary text-xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {userStats?.totalSeries || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Series Created</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <i className="ri-book-open-line text-green-600 dark:text-green-400 text-xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {userStats?.totalBooks || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Books Written</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <i className="ri-file-text-line text-blue-600 dark:text-blue-400 text-xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {userStats?.totalChapters || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Chapters Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <i className="ri-quill-pen-line text-purple-600 dark:text-purple-400 text-xl"></i>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {userStats?.totalWords.toLocaleString() || "0"}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Words</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
        </div>
      </section>

      {/* Writing Streak Analysis */}
      <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <i className="ri-fire-line text-primary"></i>
            Writing Streak Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingUserStats ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground text-sm">Loading streak data...</p>
            </div>
          ) : userStats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Current Streak */}
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {userStats.currentStreak}
                </div>
                <div className="text-sm font-medium mb-1">Current Streak</div>
                <div className="text-xs text-muted-foreground">
                  {userStats.currentStreak === 1 ? 'day' : 'days'} in a row
                </div>
                {/* Streak visualization */}
                <div className="flex justify-center mt-3 gap-1">
                  {Array.from({ length: Math.min(userStats.currentStreak, 7) }).map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  ))}
                  {userStats.currentStreak > 7 && (
                    <div className="text-xs text-orange-500 ml-1">+{userStats.currentStreak - 7}</div>
                  )}
                </div>
              </div>

              {/* Longest Streak */}
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                  {userStats.longestStreak}
                </div>
                <div className="text-sm font-medium mb-1">Longest Streak</div>
                <div className="text-xs text-muted-foreground">
                  Personal best record
                </div>
                {userStats.currentStreak === userStats.longestStreak && userStats.currentStreak > 0 && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-medium">
                    🔥 New Record!
                  </div>
                )}
              </div>

              {/* Total Writing Days */}
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {userStats.totalWritingDays}
                </div>
                <div className="text-sm font-medium mb-1">Total Writing Days</div>
                <div className="text-xs text-muted-foreground">
                  Since {new Date(userStats.joinDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="ri-fire-line text-4xl text-muted-foreground mb-2"></i>
              <p className="text-muted-foreground">No streak data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Average Writing Session Data */}
      <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <i className="ri-time-line text-primary"></i>
            Session Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingUserStats ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground text-sm">Loading session data...</p>
            </div>
          ) : userStats ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary/5 rounded-lg">
                <div className="text-2xl font-bold text-primary mb-1">
                  {userStats.averageWordsPerDay}
                </div>
                <div className="text-sm text-muted-foreground">Avg Words/Day</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  {Math.round(userStats.averageWordsPerDay / 2)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Words/Session</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                  45m
                </div>
                <div className="text-sm text-muted-foreground">Avg Session Time</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  2.3
                </div>
                <div className="text-sm text-muted-foreground">Sessions/Day</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <i className="ri-time-line text-4xl text-muted-foreground mb-2"></i>
              <p className="text-muted-foreground">No session data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Writing Patterns and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Insights */}
        <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <i className="ri-lightbulb-line text-primary"></i>
              Productivity Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUserStats ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground text-sm">Loading insights...</p>
              </div>
            ) : userStats ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    <i className="ri-calendar-line text-primary"></i>
                    <span className="text-sm font-medium">Most Productive Day</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Monday</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <i className="ri-time-line text-green-600 dark:text-green-400"></i>
                    <span className="text-sm font-medium">Peak Writing Time</span>
                  </div>
                  <span className="text-sm text-muted-foreground">2:00 PM - 4:00 PM</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <i className="ri-speed-line text-orange-600 dark:text-orange-400"></i>
                    <span className="text-sm font-medium">Average Session</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(userStats.averageWordsPerDay / 2)} words
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <i className="ri-trophy-line text-purple-600 dark:text-purple-400"></i>
                    <span className="text-sm font-medium">Best Month</span>
                  </div>
                  <span className="text-sm text-muted-foreground">This Month</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="ri-lightbulb-line text-4xl text-muted-foreground mb-2"></i>
                <p className="text-muted-foreground">No insights available yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start writing to see your productivity patterns
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Writing Patterns */}
        <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <i className="ri-line-chart-line text-primary"></i>
              Writing Patterns
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingUserStats ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-muted-foreground text-sm">Loading patterns...</p>
              </div>
            ) : userStats ? (
              <div className="space-y-4">
                {/* Weekly Activity Heatmap */}
                <div>
                  <h4 className="text-sm font-medium mb-3">Weekly Activity</h4>
                  <div className="grid grid-cols-7 gap-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">{day}</div>
                        <div 
                          className={`h-8 rounded ${
                            index === 1 || index === 3 || index === 5 
                              ? 'bg-primary/80' 
                              : index === 2 || index === 4 
                                ? 'bg-primary/40' 
                                : 'bg-muted'
                          }`}
                        ></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consistency Score */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Consistency Score</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round((userStats.currentStreak / 30) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min((userStats.currentStreak / 30) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on your {userStats.currentStreak}-day writing streak
                  </p>
                </div>

                {/* Writing Velocity */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Writing Velocity</span>
                    <span className="text-sm text-muted-foreground">
                      {userStats.averageWordsPerDay} words/day
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min((userStats.averageWordsPerDay / 1000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Target: 1000 words/day
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <i className="ri-line-chart-line text-4xl text-muted-foreground mb-2"></i>
                <p className="text-muted-foreground">No patterns available yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Write consistently to see your patterns emerge
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}