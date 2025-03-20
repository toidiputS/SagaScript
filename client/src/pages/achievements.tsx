import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgeIcon, BadgeContainer } from "@/components/ui/badge-icon";
import BadgeProgression from "@/components/dashboard/badge-progression";
import BadgeShowcase from "@/components/dashboard/badge-showcase";

// Achievement types and interfaces
interface Achievement {
  id: number;
  name: string;
  description: string;
  type: string;
  icon: string;
  requiredValue: number;
  category?: string;
  createdAt: string;
}

interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  earnedAt: string;
  achievement: Achievement;
}

export default function AchievementsPage() {
  const { toast } = useToast();

  // Fetch all available achievements
  const { data: allAchievements, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['/api/achievements'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/achievements');
      return res.json() as Promise<Achievement[]>;
    }
  });

  // Fetch user's earned achievements
  const { data: userAchievements, isLoading: isLoadingUserAchievements } = useQuery({
    queryKey: ['/api/user-achievements'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/user-achievements');
      return res.json() as Promise<UserAchievement[]>;
    }
  });

  // Check for new achievements
  const handleCheckAchievements = async () => {
    try {
      const res = await apiRequest('POST', '/api/check-achievements');
      const newAchievements = await res.json();
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/user-achievements'] });
      
      if (newAchievements && newAchievements.length > 0) {
        toast({
          title: "New achievements earned!",
          description: `Congratulations! You've earned ${newAchievements.length} new achievement(s).`,
        });
      } else {
        toast({
          title: "No new achievements",
          description: "Keep writing and creating to unlock more achievements.",
        });
      }
    } catch (error) {
      toast({
        title: "Error checking achievements",
        description: "There was an error checking for new achievements.",
        variant: "destructive",
      });
    }
  };

  // Check if user has earned an achievement
  const isAchievementEarned = (achievementId: number) => {
    return userAchievements?.some(ua => ua.achievementId === achievementId);
  };

  // Get date when achievement was earned
  const getEarnedDate = (achievementId: number) => {
    const userAchievement = userAchievements?.find(ua => ua.achievementId === achievementId);
    if (userAchievement) {
      return new Date(userAchievement.earnedAt).toLocaleDateString();
    }
    return null;
  };

  // Get achievement type color and icon classes
  const getAchievementStyle = (type: string) => {
    const styles = {
      streak: {
        bgClass: "bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-900 spooky:bg-yellow-950/40 spooky:border-yellow-900/70",
        borderClass: "border-yellow-100",
        iconClass: "text-yellow-500 dark:text-yellow-400 spooky:text-yellow-400",
        progressClass: "bg-yellow-500"
      },
      words: {
        bgClass: "bg-blue-50 dark:bg-blue-950 dark:border-blue-900 spooky:bg-blue-950/40 spooky:border-blue-900/70",
        borderClass: "border-blue-100",
        iconClass: "text-blue-500 dark:text-blue-400 spooky:text-blue-400",
        progressClass: "bg-blue-500"
      },
      chapters: {
        bgClass: "bg-green-50 dark:bg-green-950 dark:border-green-900 spooky:bg-green-950/40 spooky:border-green-900/70",
        borderClass: "border-green-100",
        iconClass: "text-green-500 dark:text-green-400 spooky:text-green-400",
        progressClass: "bg-green-500"
      },
      characters: {
        bgClass: "bg-purple-50 dark:bg-purple-950 dark:border-purple-900 spooky:bg-purple-950/40 spooky:border-purple-900/70",
        borderClass: "border-purple-100",
        iconClass: "text-purple-500 dark:text-purple-400 spooky:text-purple-400",
        progressClass: "bg-purple-500"
      },
      locations: {
        bgClass: "bg-red-50 dark:bg-red-950 dark:border-red-900 spooky:bg-red-950/40 spooky:border-red-900/70",
        borderClass: "border-red-100",
        iconClass: "text-red-500 dark:text-red-400 spooky:text-red-400",
        progressClass: "bg-red-500"
      }
    };
    
    return styles[type as keyof typeof styles] || {
      bgClass: "bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 spooky:bg-neutral-900/40 spooky:border-neutral-800/70",
      borderClass: "border-neutral-100",
      iconClass: "text-neutral-500 dark:text-neutral-400 spooky:text-neutral-400",
      progressClass: "bg-neutral-500"
    };
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Achievements Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">Achievements</h1>
            <p className="text-muted-foreground mt-1">Track your writing milestones and accomplishments</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              onClick={handleCheckAchievements}
              className="bg-primary hover:bg-primary-dark text-white"
            >
              <i className="ri-refresh-line mr-2"></i>
              <span>Check for New Achievements</span>
            </Button>
          </div>
        </div>

        {/* Achievements Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold">
                {userAchievements?.length || 0}
              </CardTitle>
              <CardDescription>Achievements Earned</CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold">
                {allAchievements
                  ? Math.round((userAchievements?.length || 0) / allAchievements.length * 100)
                  : 0}%
              </CardTitle>
              <CardDescription>Completion Rate</CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold">
                {userAchievements && userAchievements.length > 0
                  ? new Date(userAchievements[userAchievements.length - 1].earnedAt).toLocaleDateString()
                  : "None"}
              </CardTitle>
              <CardDescription>Latest Achievement</CardDescription>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-3xl font-bold">
                {allAchievements && userAchievements
                  ? allAchievements.length - (userAchievements?.length || 0)
                  : 0}
              </CardTitle>
              <CardDescription>Achievements Remaining</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Achievement Categories with Badge Progression */}
        <div className="mb-8">
          <h2 className="text-xl font-serif font-bold text-foreground mb-4">Achievement Categories</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {['streak', 'words', 'chapters', 'characters', 'locations'].map(type => {
              const typeAchievements = allAchievements?.filter(a => a.type === type) || [];
              const earnedCount = userAchievements?.filter(ua => 
                typeAchievements.some(a => a.id === ua.achievementId)
              ).length || 0;
              
              const percentage = typeAchievements.length 
                ? Math.round((earnedCount / typeAchievements.length) * 100) 
                : 0;
              
              return (
                <Card key={type}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <BadgeIcon 
                        variant={type as any}
                        size="md"
                        icon={type === 'streak' ? 'ri-fire-line' : 
                              type === 'words' ? 'ri-quill-pen-line' :
                              type === 'chapters' ? 'ri-book-mark-line' :
                              type === 'characters' ? 'ri-user-star-line' :
                              'ri-earth-line'} 
                      />
                      <span className="text-sm font-medium">
                        {earnedCount}/{typeAchievements.length}
                      </span>
                    </div>
                    <CardTitle className="mt-2 capitalize">
                      {type}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={percentage} />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Tabbed View with Earned and Available Achievements */}
        <div>
          <Tabs defaultValue="all" className="w-full mb-10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-serif font-bold text-foreground">Achievements</h2>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="earned">Earned</TabsTrigger>
                <TabsTrigger value="unearned">Available</TabsTrigger>
              </TabsList>
            </div>
            
            {isLoadingAchievements || isLoadingUserAchievements ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : allAchievements && allAchievements.length > 0 ? (
              <>
                <TabsContent value="all" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {allAchievements.map(achievement => {
                      const earned = isAchievementEarned(achievement.id);
                      const earnedDate = getEarnedDate(achievement.id);
                      
                      return (
                        <Card key={achievement.id}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <BadgeIcon
                                  variant={achievement.type as any}
                                  state={earned ? "earned" : "locked"}
                                  size="md"
                                  icon={achievement.icon}
                                />
                                <CardTitle className="ml-3 text-base">{achievement.name}</CardTitle>
                              </div>
                              {earned && (
                                <div className="bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 spooky:bg-green-950/70 spooky:text-green-300 text-xs font-medium px-2 py-1 rounded-full">
                                  Earned
                                </div>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-foreground mb-2">{achievement.description}</p>
                            {earned ? (
                              <p className="text-xs text-muted-foreground">Earned on {earnedDate}</p>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                Target: {achievement.requiredValue} {achievement.type}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>
                
                <TabsContent value="earned" className="mt-0">
                  {userAchievements && userAchievements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {userAchievements.map(ua => {
                        const earnedDate = new Date(ua.earnedAt).toLocaleDateString();
                        
                        return (
                          <Card key={ua.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <BadgeIcon
                                    variant={ua.achievement.type as any}
                                    state="earned"
                                    size="md"
                                    icon={ua.achievement.icon}
                                  />
                                  <CardTitle className="ml-3 text-base">{ua.achievement.name}</CardTitle>
                                </div>
                                <div className="bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 spooky:bg-green-950/70 spooky:text-green-300 text-xs font-medium px-2 py-1 rounded-full">
                                  Earned
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-foreground mb-2">{ua.achievement.description}</p>
                              <p className="text-xs text-muted-foreground">Earned on {earnedDate}</p>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-card rounded-lg shadow-sm border border-border p-8 text-center">
                      <div className="text-muted-foreground mb-4">
                        <i className="ri-medal-line text-4xl"></i>
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-foreground">No Achievements Earned Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Keep writing and creating to unlock achievements!
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="unearned" className="mt-0">
                  {allAchievements
                    .filter(achievement => !isAchievementEarned(achievement.id))
                    .length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {allAchievements
                        .filter(achievement => !isAchievementEarned(achievement.id))
                        .map(achievement => (
                          <Card key={achievement.id}>
                            <CardHeader className="pb-2">
                              <div className="flex items-center">
                                <BadgeIcon
                                  variant={achievement.type as any}
                                  state="locked"
                                  size="md"
                                  icon={achievement.icon}
                                />
                                <CardTitle className="ml-3 text-base">{achievement.name}</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-foreground mb-2">{achievement.description}</p>
                              <p className="text-xs text-muted-foreground">
                                Target: {achievement.requiredValue} {achievement.type}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  ) : (
                    <div className="bg-card rounded-lg shadow-sm border border-border p-8 text-center">
                      <div className="text-muted-foreground mb-4">
                        <i className="ri-trophy-line text-4xl"></i>
                      </div>
                      <h3 className="text-lg font-medium mb-2 text-foreground">All Achievements Earned!</h3>
                      <p className="text-muted-foreground mb-4">
                        Congratulations! You've earned all available achievements.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </>
            ) : (
              <div className="bg-card rounded-lg shadow-sm border border-border p-8 text-center">
                <div className="text-muted-foreground mb-4">
                  <i className="ri-medal-line text-4xl"></i>
                </div>
                <h3 className="text-lg font-medium mb-2 text-foreground">No Achievements Available</h3>
                <p className="text-muted-foreground mb-4">
                  Achievements are being created. Check back soon!
                </p>
              </div>
            )}
          </Tabs>
        </div>
      </div>
    </div>
  );
}