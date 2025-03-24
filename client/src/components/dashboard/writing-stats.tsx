
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { ArrowUp, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface WritingStats {
  wordsToday: number;
  wordsTodayChange: number;
  currentStreak: number;
  streakDays: string[];
}

export function WritingStatsCards() {
  const { data, isLoading } = useQuery({
    queryKey: ['writing-stats'],
    queryFn: () => apiRequest('GET', '/api/writing-stats') as Promise<WritingStats>,
  });

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <WordsToday 
        count={data?.wordsToday || 0} 
        change={data?.wordsTodayChange || 0} 
        isLoading={isLoading} 
      />
      <CurrentStreak 
        days={data?.currentStreak || 0} 
        streakDays={data?.streakDays || []} 
        isLoading={isLoading} 
      />
    </div>
  );
}

interface WordsTodayProps {
  count: number;
  change: number;
  isLoading: boolean;
}

function WordsToday({ count, change, isLoading }: WordsTodayProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Words Today</CardTitle>
        <div className="h-4 w-4 text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z" />
          </svg>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{isLoading ? '-' : count}</div>
        {change !== 0 && (
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <ArrowUp className={`mr-1 h-3 w-3 ${change > 0 ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
            <span>{Math.abs(change)}% from yesterday</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface CurrentStreakProps {
  days: number;
  streakDays: string[];
  isLoading: boolean;
}

function CurrentStreak({ days, streakDays, isLoading }: CurrentStreakProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
        <Flame className="h-4 w-4 text-amber-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{isLoading ? '-' : days} Days</div>
        <div className="flex mt-2 gap-1">
          {Array(7).fill(0).map((_, i) => (
            <div 
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                streakDays.includes((i + 1).toString()) 
                  ? 'bg-amber-500' 
                  : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
