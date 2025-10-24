import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Profile Header Skeleton
export function ProfileHeaderSkeleton() {
  return (
    <Card className="rounded-[30px] bg-card text-card-foreground shadow-[15px_15px_30px_rgba(59,130,246,0.15),-15px_-15px_30px_rgba(147,197,253,0.1)]">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar Skeleton */}
          <Skeleton className="w-24 h-24 rounded-full flex-shrink-0" />
          
          {/* User Info Skeleton */}
          <div className="flex-1 text-center md:text-left space-y-3">
            <Skeleton className="h-8 w-48 mx-auto md:mx-0" />
            <Skeleton className="h-5 w-32 mx-auto md:mx-0" />
            <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-4 w-64 mx-auto md:mx-0" />
          </div>
          
          {/* Quick Actions Skeleton */}
          <div className="flex gap-3">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Stats Card Skeleton
export function StatsCardSkeleton() {
  return (
    <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)]">
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Overview Tab Skeleton
export function OverviewTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      {/* Recent Activity and Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-6 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-2">
                  <Skeleton className="w-4 h-4 mt-1" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="w-16 h-6" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-6 w-28" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievement Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-6 w-40" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="text-center space-y-2">
                  <Skeleton className="w-12 h-12 rounded-lg mx-auto" />
                  <Skeleton className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-6 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
              <Skeleton className="h-8 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Statistics Tab Skeleton
export function StatisticsTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Chart Section */}
      <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)]">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-9 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Streak Analysis */}
      <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center p-4 bg-muted/50 rounded-lg space-y-3">
                <Skeleton className="h-8 w-12 mx-auto" />
                <Skeleton className="h-4 w-24 mx-auto" />
                <Skeleton className="h-3 w-20 mx-auto" />
                <div className="flex justify-center gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Skeleton key={j} className="w-2 h-2 rounded-full" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Session Analytics */}
      <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)]">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-6 w-36" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center p-4 bg-muted/50 rounded-lg space-y-2">
                <Skeleton className="h-6 w-12 mx-auto" />
                <Skeleton className="h-3 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5" />
                <Skeleton className="h-6 w-36" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-4 h-4" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Achievements Tab Skeleton
export function AchievementsTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center p-4 bg-muted/50 rounded-lg space-y-2">
                <Skeleton className="h-8 w-12 mx-auto" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <div className="flex gap-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-20" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress by Category */}
      <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-16 ml-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Grid */}
      <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-16 w-16 rounded-lg mx-auto" />
                <Skeleton className="h-4 w-20 mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Subscription Tab Skeleton
export function SubscriptionTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Tracking */}
      <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-6 w-36" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Billing Information */}
      <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="w-5 h-5" />
            <Skeleton className="h-6 w-40" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Settings Tab Skeleton
export function SettingsTabSkeleton() {
  return (
    <div className="space-y-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5" />
              <Skeleton className="h-6 w-40" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="flex items-center justify-between">
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
            <div className="pt-4">
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Generic loading spinner
export function LoadingSpinner({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  return (
    <div className={`animate-spin rounded-full border-b-2 border-primary ${sizeClasses[size]} ${className}`}></div>
  );
}

// Centered loading state
export function CenteredLoading({ message = "Loading...", className = "" }: { message?: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <div className="text-center space-y-3">
        <LoadingSpinner size="lg" className="mx-auto" />
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </div>
  );
}