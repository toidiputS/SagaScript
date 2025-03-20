import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeIcon, BadgeContainer } from "@/components/ui/badge-icon";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";

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

interface BadgeProgressionProps {
  category?: string;
  limit?: number;
  className?: string;
  showViewAll?: boolean;
}

export default function BadgeProgression({ 
  category, 
  limit = 5, 
  className = "",
  showViewAll = true
}: BadgeProgressionProps) {
  // Get achievements and user achievements
  const { data: allAchievements, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['/api/achievements'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/achievements');
      return res.json() as Promise<Achievement[]>;
    }
  });

  const { data: userAchievements, isLoading: isLoadingUserAchievements } = useQuery({
    queryKey: ['/api/user-achievements'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/user-achievements');
      return res.json() as Promise<UserAchievement[]>;
    }
  });

  // Check if the achievement is earned by the user
  const isAchievementEarned = (achievementId: number) => {
    return userAchievements?.some(ua => ua.achievementId === achievementId) || false;
  };

  // Filter achievements by category if provided
  const filteredAchievements = allAchievements?.filter(achievement => 
    !category || achievement.category === category || achievement.type === category
  );

  // Group achievements by type (for different badge categories)
  const groupedAchievements = filteredAchievements?.reduce((groups, achievement) => {
    const type = achievement.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(achievement);
    return groups;
  }, {} as Record<string, Achievement[]>);

  // Sort each group by requiredValue
  if (groupedAchievements) {
    Object.keys(groupedAchievements).forEach(type => {
      groupedAchievements[type].sort((a, b) => a.requiredValue - b.requiredValue);
    });
  }

  // Limit the number of groups to display
  const limitedGroups = groupedAchievements 
    ? Object.entries(groupedAchievements).slice(0, limit)
    : [];

  // For each type, calculate progress towards next badge
  const getProgressForType = (type: string) => {
    if (!groupedAchievements || !groupedAchievements[type] || !userAchievements) {
      return 0;
    }

    // Get all earned badges of this type
    const earnedBadges = groupedAchievements[type].filter(ach => 
      isAchievementEarned(ach.id)
    );
    
    // If all badges are earned, return 100%
    if (earnedBadges.length === groupedAchievements[type].length) {
      return 100;
    }
    
    // Get the next badge to earn (first non-earned)
    const nextBadge = groupedAchievements[type].find(ach => 
      !isAchievementEarned(ach.id)
    );
    
    if (!nextBadge) return 100;
    
    // Get the previous earned badge
    const prevBadge = earnedBadges.length > 0 
      ? earnedBadges.reduce((max, badge) => 
          badge.requiredValue > max.requiredValue ? badge : max, 
          earnedBadges[0]
        )
      : { requiredValue: 0 };
    
    // For simplicity, estimate progress as 0% for now
    // In a real app, you would calculate based on actual user data
    return 0;
  };

  if (isLoadingAchievements || isLoadingUserAchievements) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-serif">Badge Progression</CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  if (!filteredAchievements || filteredAchievements.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-serif">Badge Progression</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-muted-foreground text-center my-8">No achievements found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-serif">Badge Progression</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-6">
          {limitedGroups.map(([type, achievements]) => (
            <div key={type} className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium capitalize">{type}</h3>
                <span className="text-xs text-muted-foreground">
                  {achievements.filter(a => isAchievementEarned(a.id)).length}/{achievements.length}
                </span>
              </div>
              
              <BadgeContainer>
                {achievements.map(achievement => {
                  const earned = isAchievementEarned(achievement.id);
                  return (
                    <BadgeIcon
                      key={achievement.id}
                      variant={type as any}
                      state={earned ? "earned" : "locked"}
                      size="sm"
                      icon={achievement.icon}
                      tooltipText={achievement.name}
                      progress={earned ? 100 : getProgressForType(type)}
                    />
                  );
                })}
              </BadgeContainer>
            </div>
          ))}
        </div>
        
        {showViewAll && (
          <div className="mt-4 text-center">
            <Link href="/achievements" className="text-sm text-primary hover:text-primary-dark font-medium">
              View All Badges
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}