import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BadgeIcon, BadgeContainer } from "@/components/ui/badge-icon";

interface Achievement {
  id: number;
  userId: number;
  achievementId: number;
  earnedAt: string;
  achievement: {
    id: number;
    name: string;
    description: string;
    type: string;
    icon: string;
    requiredValue: number;
    createdAt: string;
  };
}

interface AchievementsDisplayProps {
  achievements?: Achievement[];
}

export default function AchievementsDisplay({ achievements }: AchievementsDisplayProps) {
  // Check if there are no achievements
  if (!achievements || achievements.length === 0) {
    return (
      <Card>
        <CardHeader className="border-b border-border px-5 py-4">
          <CardTitle className="font-serif font-bold text-lg text-foreground">Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">No achievements earned yet</p>
            <Button variant="link" asChild>
              <Link href="/achievements">View Available Achievements</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Sort achievements by earned date, most recent first
  const sortedAchievements = [...achievements].sort((a, b) => 
    new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
  );
  
  // Take only the most recent 3 achievements
  const recentAchievements = sortedAchievements.slice(0, 3);
  
  return (
    <Card>
      <CardHeader className="border-b border-border px-5 py-4">
        <CardTitle className="font-serif font-bold text-lg text-foreground">Recent Achievements</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {recentAchievements.map((item, index) => {
          const isNew = new Date(item.earnedAt).getTime() > Date.now() - 86400000; // 24 hours
          
          return (
            <div 
              key={item.id} 
              className="flex items-center p-3 rounded-lg mb-3 border bg-card/50"
            >
              <BadgeIcon
                variant={item.achievement.type as any}
                state="earned"
                size="md"
                icon={item.achievement.icon}
              />
              <div className="ml-3">
                <p className="font-medium text-foreground flex items-center">
                  {item.achievement.name}
                  {isNew && (
                    <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-950/50 text-yellow-800 dark:text-yellow-300 py-1 px-2 rounded-full font-medium">NEW</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{item.achievement.description}</p>
              </div>
            </div>
          );
        })}
        
        {achievements.length > 3 && (
          <div className="flex items-center justify-center mt-3 mb-2">
            <BadgeContainer>
              {sortedAchievements.slice(3, 7).map(item => (
                <BadgeIcon
                  key={item.id}
                  variant={item.achievement.type as any}
                  state="earned"
                  size="sm"
                  icon={item.achievement.icon}
                  tooltipText={item.achievement.name}
                />
              ))}
              
              {achievements.length > 7 && (
                <div className="flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 spooky:bg-gray-800/50 h-8 w-8 text-sm text-gray-500 dark:text-gray-400">
                  +{achievements.length - 7}
                </div>
              )}
            </BadgeContainer>
          </div>
        )}
        
        <Button 
          variant="link" 
          className="w-full mt-4 text-primary hover:text-primary-dark text-sm font-medium"
          asChild
        >
          <Link href="/achievements">View All Achievements</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
