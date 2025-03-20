import StatsCard from "@/components/dashboard/stats-card";
import SeriesProgress from "@/components/dashboard/series-progress";
import ChapterList from "@/components/dashboard/chapter-list";
import WriterCompanion from "@/components/dashboard/writer-companion";
import AchievementsDisplay from "@/components/dashboard/achievements-display";
import BadgeProgression from "@/components/dashboard/badge-progression";
import BadgeShowcase from "@/components/dashboard/badge-showcase";
import { useAuth } from "@/hooks/use-auth";
import { useSeries } from "@/hooks/use-series";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const { user } = useAuth();
  const { currentSeries, fetchCurrentBook } = useSeries();
  const { toast } = useToast();
  
  // Fetch writing stats for today
  const { data: todayStats } = useQuery({
    queryKey: ['/api/writing-stats', 'day'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/writing-stats?period=day');
      return res.json();
    }
  });
  
  // Fetch user achievements
  const { data: userAchievements } = useQuery({
    queryKey: ['/api/user-achievements'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/user-achievements');
      return res.json();
    }
  });
  
  // Calculate words written today
  const wordsToday = todayStats?.reduce((sum, stat) => sum + stat.wordsWritten, 0) || 0;
  
  // Get current streak
  const currentStreak = 7; // For demo purposes

  // Start writing handler
  const handleStartWriting = () => {
    if (!currentSeries) {
      toast({
        title: "No active series",
        description: "Please create or select a series first",
        variant: "destructive"
      });
      return;
    }
    
    fetchCurrentBook();
    toast({
      title: "Ready to write",
      description: "Opening your current chapter",
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
              Welcome back, {user?.displayName?.split(' ')[0] || 'Author'}
            </h1>
            <p className="text-muted-foreground mt-1">Your writing journey continues today</p>
          </div>
          <div className="mt-4 md:mt-0">
            <button 
              onClick={handleStartWriting}
              className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md font-medium flex items-center"
            >
              <i className="ri-quill-pen-line mr-2"></i>
              <span>Start Writing</span>
            </button>
          </div>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard 
            title="Words Today" 
            value={wordsToday}
            icon="ri-quill-pen-line"
            iconBg="bg-primary/10"
            iconColor="text-primary"
            trend={{
              value: 14,
              type: "increase",
              text: "from yesterday"
            }}
          />
          
          <StatsCard 
            title="Current Streak" 
            value={`${currentStreak} Days`}
            icon="ri-fire-line"
            iconBg="bg-secondary/10"
            iconColor="text-secondary"
            streakDays={7}
          />
          
          {currentSeries && (
            <SeriesProgress 
              title="Series Progress"
              series={currentSeries}
            />
          )}
        </div>

        {/* Badge Progression */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          <BadgeShowcase 
            title="Your Badges" 
            maxShown={6}
          />
        </div>
        
        {/* Current Project & Companion */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Project */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 spooky:bg-gray-800/90 rounded-lg shadow-sm border border-neutral-200 dark:border-gray-700 spooky:border-gray-700/70 overflow-hidden">
            <div className="border-b border-neutral-200 dark:border-gray-700 spooky:border-gray-700/70 px-5 py-4 flex justify-between items-center">
              <h2 className="font-serif font-bold text-lg text-foreground">Current Project</h2>
              <div className="flex space-x-2">
                <button className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-gray-700 spooky:hover:bg-gray-700/80 text-neutral-500">
                  <i className="ri-edit-line"></i>
                </button>
                <button className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-gray-700 spooky:hover:bg-gray-700/80 text-neutral-500">
                  <i className="ri-more-2-fill"></i>
                </button>
              </div>
            </div>
            
            {currentSeries ? (
              <ChapterList series={currentSeries} />
            ) : (
              <div className="p-5 text-center">
                <p className="text-muted-foreground">No active series selected</p>
                <button 
                  onClick={() => window.location.href = '/series'}
                  className="mt-4 text-primary hover:text-primary-dark flex items-center justify-center text-sm font-medium mx-auto"
                >
                  <i className="ri-add-line mr-1"></i> Create New Series
                </button>
              </div>
            )}
          </div>

          {/* AI Companion & Achievements */}
          <div className="lg:col-span-1 space-y-6">
            {/* AI Companion */}
            <WriterCompanion />

            {/* Badge Progression */}
            <BadgeProgression 
              limit={3}
              showViewAll={true}
            />
            
            {/* Recent Achievements */}
            <AchievementsDisplay achievements={userAchievements} />
          </div>
        </div>
      </div>
    </div>
  );
}
