import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeIcon, BadgeContainer } from "@/components/ui/badge-icon";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface Achievement {
  id: number;
  name: string;
  description: string;
  type: string;
  icon: string;
  requiredValue: number;
  category: string;
  createdAt: string;
}

interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  earnedAt: string;
  achievement: Achievement;
}

interface BadgeShowcaseProps {
  title?: string;
  className?: string;
  maxShown?: number;
  includeCategories?: string[];
  excludeCategories?: string[];
}

export default function BadgeShowcase({
  title = "My Badges",
  className = "",
  maxShown = 8,
  includeCategories,
  excludeCategories,
}: BadgeShowcaseProps) {
  // Get user achievements
  const { data: userAchievements, isLoading } = useQuery({
    queryKey: ['/api/user-achievements'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/user-achievements');
      return res.json() as Promise<UserAchievement[]>;
    }
  });

  // Filter achievements by category if needed
  const filteredAchievements = userAchievements?.filter(ua => {
    if (includeCategories && !includeCategories.includes(ua.achievement.type) && 
      !includeCategories.includes(ua.achievement.category)) {
      return false;
    }
    if (excludeCategories && (excludeCategories.includes(ua.achievement.type) || 
      excludeCategories.includes(ua.achievement.category))) {
      return false;
    }
    return true;
  });

  // Sort achievements by earned date (most recent first)
  const sortedAchievements = filteredAchievements?.sort((a, b) => 
    new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
  );
  
  // Limit the number of achievements shown
  const displayedAchievements = sortedAchievements?.slice(0, maxShown);

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-serif">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!userAchievements || userAchievements.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-serif">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-muted-foreground text-center my-4 text-sm">
            No badges earned yet. Complete achievements to earn badges!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <BadgeContainer>
          {displayedAchievements?.map(userAchievement => (
            <BadgeIcon
              key={userAchievement.id}
              variant={userAchievement.achievement.type as any}
              state="earned"
              size="md"
              icon={userAchievement.achievement.icon}
              tooltipText={`${userAchievement.achievement.name}: ${userAchievement.achievement.description}`}
            />
          ))}
          
          {displayedAchievements && userAchievements.length > maxShown && (
            <div className="flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 spooky:bg-gray-800/50 h-10 w-10 text-sm text-gray-500 dark:text-gray-400">
              +{userAchievements.length - maxShown}
            </div>
          )}
        </BadgeContainer>
        
        {displayedAchievements && displayedAchievements.length > 0 && (
          <div className="mt-3 text-xs text-muted-foreground">
            Latest badge: {displayedAchievements[0].achievement.name} ({new Date(displayedAchievements[0].earnedAt).toLocaleDateString()})
          </div>
        )}
      </CardContent>
    </Card>
  );
}