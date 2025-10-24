import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BadgeIcon } from "@/components/ui/badge-icon";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Achievement, UserAchievement } from "@shared/schema";
import { OptimizedBadgeIcon } from "@/components/ui/optimized-image";

interface AchievementWithProgress extends Achievement {
  isEarned: boolean;
  earnedAt?: string;
  progress?: number;
}

interface AchievementsTabProps {
  isLoading?: boolean;
}

// Achievement categories for filtering
const ACHIEVEMENT_CATEGORIES = [
  { id: "all", label: "All", icon: "ri-award-line" },
  { id: "writing", label: "Writing", icon: "ri-quill-pen-line" },
  { id: "streak", label: "Streaks", icon: "ri-fire-line" },
  { id: "completion", label: "Completion", icon: "ri-checkbox-circle-line" },
  { id: "social", label: "Social", icon: "ri-group-line" },
  { id: "milestone", label: "Milestones", icon: "ri-flag-line" },
];

// Map achievement types to categories
const getAchievementCategory = (type: string): string => {
  if (type.includes("streak")) return "streak";
  if (type.includes("word") || type.includes("chapter") || type.includes("book")) return "writing";
  if (type.includes("complete")) return "completion";
  if (type.includes("social") || type.includes("share")) return "social";
  return "milestone";
};

// Map achievement types to badge variants
const getAchievementVariant = (type: string) => {
  if (type.includes("streak")) return "streak";
  if (type.includes("word")) return "words";
  if (type.includes("chapter")) return "chapters";
  if (type.includes("character")) return "characters";
  if (type.includes("location")) return "locations";
  if (type.includes("book")) return "books";
  return "default";
};

// Get motivational progress message based on achievement type
const getProgressMessage = (type: string, progress: number): string => {
  if (progress >= 80) {
    return "You're almost there! Keep up the great work!";
  } else if (progress >= 50) {
    return "Great progress! You're halfway to unlocking this achievement.";
  } else if (progress >= 25) {
    return "Good start! Keep writing to make more progress.";
  } else {
    if (type.includes("streak")) {
      return "Write consistently to build your streak and unlock this achievement.";
    } else if (type.includes("word")) {
      return "Keep writing to increase your word count and earn this achievement.";
    } else if (type.includes("chapter")) {
      return "Complete more chapters to unlock this achievement.";
    } else if (type.includes("character")) {
      return "Create more characters to earn this achievement.";
    } else if (type.includes("location")) {
      return "Add more locations to your world to unlock this achievement.";
    } else if (type.includes("book")) {
      return "Complete more books to earn this achievement.";
    }
    return "Keep writing and creating to unlock this achievement!";
  }
};

export function AchievementsTab({ isLoading = false }: AchievementsTabProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementWithProgress | null>(null);

  // Fetch all achievements
  const { data: allAchievements = [], isLoading: isLoadingAchievements } = useQuery({
    queryKey: ["achievements"],
    queryFn: async (): Promise<Achievement[]> => {
      const response = await fetch("/api/achievements");
      if (!response.ok) throw new Error("Failed to fetch achievements");
      return response.json();
    },
  });

  // Fetch user achievements
  const { data: userAchievements = [], isLoading: isLoadingUserAchievements } = useQuery({
    queryKey: ["user-achievements"],
    queryFn: async (): Promise<(UserAchievement & { achievement: Achievement })[]> => {
      const response = await fetch("/api/user-achievements");
      if (!response.ok) throw new Error("Failed to fetch user achievements");
      return response.json();
    },
  });

  // Fetch achievement progress
  const { data: achievementProgress = {}, isLoading: isLoadingProgress } = useQuery({
    queryKey: ["achievement-progress"],
    queryFn: async (): Promise<{ [achievementId: number]: number }> => {
      const response = await fetch("/api/achievement-progress");
      if (!response.ok) throw new Error("Failed to fetch achievement progress");
      return response.json();
    },
  });

  // Combine achievements with user progress
  const achievementsWithProgress = useMemo((): AchievementWithProgress[] => {
    return allAchievements.map(achievement => {
      const userAchievement = userAchievements.find(ua => ua.achievementId === achievement.id);
      const progress = achievementProgress[achievement.id] || 0;
      
      return {
        ...achievement,
        isEarned: !!userAchievement,
        earnedAt: userAchievement?.earnedAt ? new Date(userAchievement.earnedAt).toISOString() : undefined,
        progress,
      };
    });
  }, [allAchievements, userAchievements, achievementProgress]);

  // Filter achievements based on category and search
  const filteredAchievements = useMemo(() => {
    return achievementsWithProgress.filter(achievement => {
      const matchesCategory = selectedCategory === "all" || 
        getAchievementCategory(achievement.type) === selectedCategory;
      
      const matchesSearch = searchQuery === "" || 
        achievement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        achievement.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [achievementsWithProgress, selectedCategory, searchQuery]);

  // Group achievements by earned/unearned
  const earnedAchievements = filteredAchievements.filter(a => a.isEarned);
  const unearnedAchievements = filteredAchievements.filter(a => !a.isEarned);

  // Calculate category completion percentages
  const categoryStats = useMemo(() => {
    const stats: { [category: string]: { total: number; earned: number; percentage: number } } = {};
    
    ACHIEVEMENT_CATEGORIES.forEach(category => {
      if (category.id === "all") return;
      
      const categoryAchievements = achievementsWithProgress.filter(a => 
        getAchievementCategory(a.type) === category.id
      );
      const earnedInCategory = categoryAchievements.filter(a => a.isEarned);
      
      stats[category.id] = {
        total: categoryAchievements.length,
        earned: earnedInCategory.length,
        percentage: categoryAchievements.length > 0 
          ? Math.round((earnedInCategory.length / categoryAchievements.length) * 100)
          : 0
      };
    });
    
    return stats;
  }, [achievementsWithProgress]);

  const isLoadingData = isLoading || isLoadingAchievements || isLoadingUserAchievements || isLoadingProgress;

  if (isLoadingData) {
    return <AchievementsTabSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <i className="ri-award-line text-primary"></i>
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{earnedAchievements.length}</div>
              <div className="text-sm text-muted-foreground">Earned</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{allAchievements.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {allAchievements.length > 0 ? Math.round((earnedAchievements.length / allAchievements.length) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>

          {/* Search and filters */}
          <div className="space-y-4">
            <Input
              placeholder="Search achievements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
            
            <div className="flex flex-wrap gap-2">
              {ACHIEVEMENT_CATEGORIES.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="flex items-center gap-2"
                >
                  <i className={category.icon}></i>
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Progress */}
      <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <i className="ri-bar-chart-line text-primary"></i>
            Progress by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ACHIEVEMENT_CATEGORIES.filter(cat => cat.id !== "all").map(category => {
              const stats = categoryStats[category.id] || { total: 0, earned: 0, percentage: 0 };
              return (
                <div key={category.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <i className={category.icon}></i>
                      <span className="font-medium">{category.label}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {stats.earned}/{stats.total}
                    </span>
                  </div>
                  <Progress value={stats.percentage} className="h-2" />
                  <div className="text-xs text-muted-foreground text-right">
                    {stats.percentage}% complete
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <i className="ri-trophy-line text-yellow-500"></i>
              Earned Achievements ({earnedAchievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {earnedAchievements.map(achievement => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onClick={() => setSelectedAchievement(achievement)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unearned Achievements */}
      {unearnedAchievements.length > 0 && (
        <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <i className="ri-lock-line text-muted-foreground"></i>
              In Progress ({unearnedAchievements.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {unearnedAchievements.map(achievement => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                  onClick={() => setSelectedAchievement(achievement)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {filteredAchievements.length === 0 && (
        <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)] hover:shadow-[15px_15px_25px_rgba(59,130,246,0.18),-15px_-15px_25px_rgba(147,197,253,0.12)] transition-shadow duration-300">
          <CardContent className="text-center py-12">
            <i className="ri-search-line text-6xl text-muted-foreground mb-4"></i>
            <h3 className="text-lg font-medium mb-2">No achievements found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Achievement Detail Modal */}
      <AchievementDetailModal
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </div>
  );
}

// Individual achievement card component
interface AchievementCardProps {
  achievement: AchievementWithProgress;
  onClick: () => void;
}

function AchievementCard({ achievement, onClick }: AchievementCardProps) {
  const variant = getAchievementVariant(achievement.type);
  
  return (
    <div
      className="group cursor-pointer transition-transform hover:scale-105"
      onClick={onClick}
    >
      <div className="text-center space-y-2">
        <div className="relative">
          <BadgeIcon
            icon={achievement.icon}
            variant={variant}
            size="xl"
            state={achievement.isEarned ? "earned" : "locked"}
            withBackground
            className="mx-auto"
          />
          {!achievement.isEarned && achievement.progress !== undefined && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="bg-white dark:bg-gray-800 px-2 py-1 rounded-full text-xs border shadow-sm">
                {achievement.progress}%
              </div>
            </div>
          )}
        </div>
        <div className="space-y-1">
          <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
            {achievement.name}
          </h4>
          {achievement.isEarned && achievement.earnedAt && (
            <p className="text-xs text-muted-foreground">
              Earned {new Date(achievement.earnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Achievement detail modal
interface AchievementDetailModalProps {
  achievement: AchievementWithProgress | null;
  onClose: () => void;
}

function AchievementDetailModal({ achievement, onClose }: AchievementDetailModalProps) {
  if (!achievement) return null;

  const variant = getAchievementVariant(achievement.type);

  return (
    <Dialog open={!!achievement} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <BadgeIcon
              icon={achievement.icon}
              variant={variant}
              size="lg"
              state={achievement.isEarned ? "earned" : "locked"}
            />
            {achievement.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {achievement.description}
          </p>
          
          {achievement.isEarned ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <i className="ri-checkbox-circle-fill"></i>
              <span className="font-medium">Earned</span>
              {achievement.earnedAt && (
                <span className="text-sm text-muted-foreground">
                  on {new Date(achievement.earnedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{achievement.progress}%</span>
              </div>
              <Progress value={achievement.progress} className="h-2" />
              
              {/* Progress details */}
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Current Progress:</span>
                  <span className="font-medium">
                    {Math.round(((achievement.progress || 0) / 100) * achievement.requiredValue)} / {achievement.requiredValue}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className="font-medium">
                    {achievement.requiredValue - Math.round(((achievement.progress || 0) / 100) * achievement.requiredValue)}
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                {getProgressMessage(achievement.type, achievement.progress || 0)}
              </p>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="capitalize">
              {getAchievementCategory(achievement.type)}
            </Badge>
            <span>•</span>
            <span>Required: {achievement.requiredValue}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Loading skeleton
function AchievementsTabSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="rounded-[20px]">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="text-center p-4 bg-muted/50 rounded-lg">
                <Skeleton className="h-8 w-12 mx-auto mb-2" />
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
      
      <Card className="rounded-[20px]">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
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