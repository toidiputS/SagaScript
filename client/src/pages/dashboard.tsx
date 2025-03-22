import StatsCard from "@/components/dashboard/stats-card";
import SeriesProgress from "@/components/dashboard/series-progress";
import ChapterList from "@/components/dashboard/chapter-list";
import AISuggestions from "@/components/dashboard/ai-suggestions";
import AchievementsDisplay from "@/components/dashboard/achievements-display";
import BadgeProgression from "@/components/dashboard/badge-progression";
import BadgeShowcase from "@/components/dashboard/badge-showcase";
import { useAuth } from "@/hooks/use-auth";
import { useSeries } from "@/hooks/use-series";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { currentSeries, fetchCurrentBook } = useSeries();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  
  // State for dialog management
  const [isEditSeriesDialogOpen, setIsEditSeriesDialogOpen] = useState(false);
  const [isSeriesMenuOpen, setIsSeriesMenuOpen] = useState(false);
  
  // Form schema for editing series
  const seriesSchema = z.object({
    name: z.string().min(1, "Series name is required"),
    description: z.string().optional(),
  });
  
  // Form for editing series
  const form = useForm({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      name: currentSeries?.name || "",
      description: currentSeries?.description || "",
    }
  });
  
  // Keep form values in sync with currentSeries
  useEffect(() => {
    if (currentSeries) {
      form.reset({
        name: currentSeries.name,
        description: currentSeries.description || "",
      });
    }
  }, [currentSeries, form]);
  
  // Update series mutation
  const updateSeriesMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      if (!currentSeries) return null;
      const res = await apiRequest("PUT", `/api/series/${currentSeries.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series'] });
      queryClient.invalidateQueries({ queryKey: ['/api/current-series'] });
      setIsEditSeriesDialogOpen(false);
      toast({
        title: "Series updated",
        description: "Your series has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
  
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
  
  // Series action handlers
  const handleEditSeries = () => {
    if (!currentSeries) {
      toast({
        title: "No active series",
        description: "Please create or select a series first",
        variant: "destructive"
      });
      return;
    }
    setIsEditSeriesDialogOpen(true);
  };
  
  const handleViewAllBooks = () => {
    if (!currentSeries) return;
    navigate(`/series/${currentSeries.id}`);
  };
  
  const handleCreateNewBook = () => {
    if (!currentSeries) return;
    navigate(`/series/${currentSeries.id}/books/new`);
  };
  
  const handleManageCharacters = () => {
    if (!currentSeries) return;
    navigate('/characters');
  };
  
  const handleManageLocations = () => {
    if (!currentSeries) return;
    navigate('/world');
  };
  
  const handleViewTimeline = () => {
    if (!currentSeries) return;
    navigate('/timeline');
  };

  // Edit Series form submit handler
  const onSubmit = (values: z.infer<typeof seriesSchema>) => {
    updateSeriesMutation.mutate(values);
  };

  return (
    <div className="p-6">
      {/* Edit Series Dialog */}
      <Dialog open={isEditSeriesDialogOpen} onOpenChange={setIsEditSeriesDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Series</DialogTitle>
            <DialogDescription>
              Make changes to your series details here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Series Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter series name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter a brief description of your series" 
                        className="resize-none" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditSeriesDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateSeriesMutation.isPending}
                >
                  {updateSeriesMutation.isPending ? 
                    <span className="flex items-center">
                      <i className="ri-loader-4-line animate-spin mr-2"></i> Saving
                    </span> : 
                    'Save Changes'
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
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
              {currentSeries && (
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-gray-700 spooky:hover:bg-gray-700/80 text-neutral-500 h-auto"
                    onClick={handleEditSeries}
                  >
                    <i className="ri-edit-line"></i>
                  </Button>
                  <DropdownMenu open={isSeriesMenuOpen} onOpenChange={setIsSeriesMenuOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-1.5 rounded hover:bg-neutral-100 dark:hover:bg-gray-700 spooky:hover:bg-gray-700/80 text-neutral-500 h-auto"
                      >
                        <i className="ri-more-2-fill"></i>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleViewAllBooks}>
                        <i className="ri-book-line mr-2"></i> View All Books
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleCreateNewBook}>
                        <i className="ri-add-line mr-2"></i> Add New Book
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleManageCharacters}>
                        <i className="ri-user-line mr-2"></i> Manage Characters
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleManageLocations}>
                        <i className="ri-map-pin-line mr-2"></i> Manage Locations
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleViewTimeline}>
                        <i className="ri-timeline-line mr-2"></i> View Timeline
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
            
            {currentSeries ? (
              <ChapterList series={currentSeries} />
            ) : (
              <div className="p-5 text-center">
                <p className="text-muted-foreground">No active series selected</p>
                <button 
                  onClick={() => navigate('/series')}
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
            <AISuggestions />

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
