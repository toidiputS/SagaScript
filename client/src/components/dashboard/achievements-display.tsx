import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

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
  // Color mappings based on achievement types
  const typeColorMap = {
    streak: {
      bgClass: "bg-yellow-50",
      borderClass: "border-yellow-100",
      bgIconClass: "bg-yellow-100",
      iconColorClass: "text-yellow-500"
    },
    chapters: {
      bgClass: "bg-blue-50",
      borderClass: "border-blue-100",
      bgIconClass: "bg-blue-100",
      iconColorClass: "text-blue-500"
    },
    characters: {
      bgClass: "bg-green-50",
      borderClass: "border-green-100",
      bgIconClass: "bg-green-100",
      iconColorClass: "text-green-500"
    },
    locations: {
      bgClass: "bg-purple-50",
      borderClass: "border-purple-100",
      bgIconClass: "bg-purple-100",
      iconColorClass: "text-purple-500"
    },
    words: {
      bgClass: "bg-red-50",
      borderClass: "border-red-100",
      bgIconClass: "bg-red-100",
      iconColorClass: "text-red-500"
    }
  };
  
  // Get default styling if achievement type is not in map
  const getColorClasses = (type: string) => {
    return typeColorMap[type as keyof typeof typeColorMap] || {
      bgClass: "bg-gray-50",
      borderClass: "border-gray-100",
      bgIconClass: "bg-gray-100",
      iconColorClass: "text-gray-500"
    };
  };
  
  // Check if there are no achievements
  if (!achievements || achievements.length === 0) {
    return (
      <Card>
        <CardHeader className="border-b border-neutral-200 px-5 py-4">
          <CardTitle className="font-serif font-bold text-lg text-neutral-800">Recent Achievements</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="text-center py-6">
            <p className="text-neutral-500 mb-4">No achievements earned yet</p>
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
      <CardHeader className="border-b border-neutral-200 px-5 py-4">
        <CardTitle className="font-serif font-bold text-lg text-neutral-800">Recent Achievements</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {recentAchievements.map((item, index) => {
          const { bgClass, borderClass, bgIconClass, iconColorClass } = getColorClasses(item.achievement.type);
          const isNew = new Date(item.earnedAt).getTime() > Date.now() - 86400000; // 24 hours
          
          return (
            <div 
              key={item.id} 
              className={`flex items-center p-3 ${bgClass} rounded-lg mb-3 ${borderClass} border`}
            >
              <div className={`p-2 ${bgIconClass} rounded-full`}>
                <i className={`${item.achievement.icon} ${iconColorClass}`}></i>
              </div>
              <div className="ml-3">
                <p className="font-medium text-neutral-800">{item.achievement.name}</p>
                <p className="text-xs text-neutral-600">{item.achievement.description}</p>
              </div>
              {isNew && (
                <div className="ml-auto">
                  <span className="text-xs text-yellow-600 font-medium">NEW</span>
                </div>
              )}
            </div>
          );
        })}
        
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
