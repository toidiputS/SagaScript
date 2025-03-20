import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Series, Book } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";

interface RecentActivity {
  description: string;
  time: string;
  icon: string;
  iconColor: string;
}

interface SeriesWithActivities extends Series {
  recentActivities?: RecentActivity[];
}

export function useSeries() {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const [currentSeries, setCurrentSeries] = useState<SeriesWithActivities | null>(null);

  // Fetch all user series
  const { data: allSeries = [] } = useQuery<Series[]>({
    queryKey: ['/api/series'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/series');
      return res.json() as Promise<Series[]>;
    },
    enabled: isAuthenticated
  });

  // Set the first series as current if none is selected
  useEffect(() => {
    if (allSeries.length > 0 && !currentSeries) {
      // Add mock recent activities for demonstration
      const seriesWithActivities: SeriesWithActivities = {
        ...allSeries[0],
        recentActivities: [
          {
            description: "Edited chapter \"The Storm Breaks\"",
            time: "3 hours ago",
            icon: "ri-edit-line",
            iconColor: "text-primary"
          },
          {
            description: "Added character \"Captain Merida\"",
            time: "Yesterday",
            icon: "ri-user-add-line",
            iconColor: "text-secondary"
          },
          {
            description: "Achieved \"7-day Writing Streak\"",
            time: "2 days ago",
            icon: "ri-medal-line",
            iconColor: "text-warning"
          }
        ]
      };
      
      setCurrentSeries(seriesWithActivities);
    }
  }, [allSeries, currentSeries]);

  // Fetch current book for the series
  const fetchCurrentBook = async (): Promise<Book | null> => {
    if (!currentSeries) return null;
    
    try {
      const books = await apiRequest(
        'GET', 
        `/api/series/${currentSeries.id}/books`
      ).then(res => res.json());
      
      return books.find((book: Book) => book.position === currentSeries.currentBook) || null;
    } catch (error) {
      console.error("Error fetching current book:", error);
      return null;
    }
  };

  // Change the current series
  const changeCurrentSeries = (seriesId: number) => {
    const selectedSeries = allSeries.find(series => series.id === seriesId);
    if (selectedSeries) {
      // Add mock recent activities for demonstration
      const seriesWithActivities: SeriesWithActivities = {
        ...selectedSeries,
        recentActivities: [
          {
            description: "Edited chapter \"The Storm Breaks\"",
            time: "3 hours ago",
            icon: "ri-edit-line",
            iconColor: "text-primary"
          },
          {
            description: "Added character \"Captain Merida\"",
            time: "Yesterday",
            icon: "ri-user-add-line",
            iconColor: "text-secondary"
          },
          {
            description: "Achieved \"7-day Writing Streak\"",
            time: "2 days ago",
            icon: "ri-medal-line",
            iconColor: "text-warning"
          }
        ]
      };
      
      setCurrentSeries(seriesWithActivities);
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/chapters'] });
    }
  };

  return {
    allSeries,
    currentSeries,
    fetchCurrentBook,
    changeCurrentSeries
  };
}
