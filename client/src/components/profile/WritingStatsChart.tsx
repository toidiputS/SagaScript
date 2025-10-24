import { useMemo } from "react";
import { WritingStatsWithPeriod } from "@shared/schema";

interface WritingStatsChartProps {
  data: WritingStatsWithPeriod[];
  period: 'day' | 'week' | 'month' | 'year';
}

export function WritingStatsChart({ data, period }: WritingStatsChartProps) {
  // Process data for visualization
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      // Generate sample data for empty state
      const sampleData = [];
      const now = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        sampleData.push({
          date: date.toISOString().split('T')[0],
          wordsWritten: Math.floor(Math.random() * 500) + 100,
          minutesActive: Math.floor(Math.random() * 120) + 30,
          sessionsCount: Math.floor(Math.random() * 3) + 1,
        });
      }
      
      return sampleData;
    }
    
    return data;
  }, [data]);

  // Calculate max values for scaling
  const maxWords = Math.max(...chartData.map(d => d.wordsWritten));
  const maxMinutes = Math.max(...chartData.map(d => d.minutesActive));

  // Format date based on period
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    
    switch (period) {
      case 'day':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case 'week':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'month':
        return date.toLocaleDateString('en-US', { month: 'short' });
      case 'year':
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart Header with Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-primary/5 rounded-lg">
          <div className="text-2xl font-bold text-primary">
            {chartData.reduce((sum, d) => sum + d.wordsWritten, 0).toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Words</div>
        </div>
        
        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {Math.round(chartData.reduce((sum, d) => sum + d.minutesActive, 0) / 60)}h
          </div>
          <div className="text-sm text-muted-foreground">Time Spent</div>
        </div>
        
        <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {chartData.reduce((sum, d) => sum + d.sessionsCount, 0)}
          </div>
          <div className="text-sm text-muted-foreground">Sessions</div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Words Written Over Time</h3>
        
        <div className="relative">
          {/* Chart Container */}
          <div className="flex items-end justify-between h-64 px-2 py-4 bg-muted/20 rounded-lg">
            {chartData.map((item, index) => {
              const height = maxWords > 0 ? (item.wordsWritten / maxWords) * 200 : 0;
              
              return (
                <div key={index} className="flex flex-col items-center flex-1 mx-1">
                  {/* Bar */}
                  <div className="relative group w-full max-w-12">
                    <div
                      className="bg-gradient-to-t from-primary to-primary/70 rounded-t-md transition-all duration-300 hover:from-primary/80 hover:to-primary/50 cursor-pointer"
                      style={{ height: `${height}px`, minHeight: item.wordsWritten > 0 ? '4px' : '0px' }}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        {item.wordsWritten} words
                        <br />
                        {item.minutesActive} minutes
                      </div>
                    </div>
                  </div>
                  
                  {/* Date Label */}
                  <div className="text-xs text-muted-foreground mt-2 text-center">
                    {formatDate(item.date)}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-64 flex flex-col justify-between py-4 -ml-12">
            <span className="text-xs text-muted-foreground">{maxWords}</span>
            <span className="text-xs text-muted-foreground">{Math.round(maxWords * 0.75)}</span>
            <span className="text-xs text-muted-foreground">{Math.round(maxWords * 0.5)}</span>
            <span className="text-xs text-muted-foreground">{Math.round(maxWords * 0.25)}</span>
            <span className="text-xs text-muted-foreground">0</span>
          </div>
        </div>
      </div>

      {/* Time Spent Chart */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Time Spent Writing</h3>
        
        <div className="relative">
          <div className="flex items-end justify-between h-48 px-2 py-4 bg-muted/20 rounded-lg">
            {chartData.map((item, index) => {
              const height = maxMinutes > 0 ? (item.minutesActive / maxMinutes) * 150 : 0;
              
              return (
                <div key={index} className="flex flex-col items-center flex-1 mx-1">
                  <div className="relative group w-full max-w-12">
                    <div
                      className="bg-gradient-to-t from-green-500 to-green-400 rounded-t-md transition-all duration-300 hover:from-green-600 hover:to-green-500 cursor-pointer"
                      style={{ height: `${height}px`, minHeight: item.minutesActive > 0 ? '4px' : '0px' }}
                    >
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                        {item.minutesActive} minutes
                        <br />
                        {item.sessionsCount} session{item.sessionsCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-2 text-center">
                    {formatDate(item.date)}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="absolute left-0 top-0 h-48 flex flex-col justify-between py-4 -ml-12">
            <span className="text-xs text-muted-foreground">{maxMinutes}m</span>
            <span className="text-xs text-muted-foreground">{Math.round(maxMinutes * 0.75)}m</span>
            <span className="text-xs text-muted-foreground">{Math.round(maxMinutes * 0.5)}m</span>
            <span className="text-xs text-muted-foreground">{Math.round(maxMinutes * 0.25)}m</span>
            <span className="text-xs text-muted-foreground">0</span>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {data && data.length === 0 && (
        <div className="text-center py-8 bg-muted/20 rounded-lg">
          <i className="ri-bar-chart-line text-4xl text-muted-foreground mb-2"></i>
          <h3 className="text-lg font-medium mb-2">No Data Available</h3>
          <p className="text-muted-foreground">
            Start writing to see your statistics appear here.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Charts above show sample data for demonstration.
          </p>
        </div>
      )}
    </div>
  );
}