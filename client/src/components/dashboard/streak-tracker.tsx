import React from "react";
import { Button } from "@/components/ui/button";
import ProgressRing from "@/components/ui/progress-ring";

type StreakTrackerProps = {
  streak: number;
};

export default function StreakTracker({ streak }: StreakTrackerProps) {
  // Generate streak days for display
  // This would normally come from a real API, but for now we'll show the current streak
  const streakDays = Array.from({ length: Math.min(streak, 14) }, (_, i) => i + 1);
  
  return (
    <section className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 spooky:from-primary/30 spooky:to-secondary/30 rounded-xl p-5">
      <div className="flex flex-col md:flex-row md:items-center">
        <div className="flex-1">
          <h2 className="text-xl font-heading font-semibold text-foreground mb-2">
            {streak > 0 
              ? `Impressive Writing Streak!` 
              : `Start Your Writing Streak Today!`}
          </h2>
          <p className="text-muted-foreground mb-3">
            {streak > 0 
              ? `You've written for ${streak} ${streak === 1 ? 'day' : 'days'} in a row. Keep going to unlock the 'Dedicated Author' achievement!` 
              : `Write every day to build momentum and unlock achievements. Your progress is tracked automatically.`}
          </p>
          <div className="flex space-x-2">
            <Button className="px-3 py-1.5 text-sm rounded-lg shadow-sm">
              {streak > 0 ? "Continue Streak" : "Start Streak"}
            </Button>
            <Button variant="outline" className="px-3 py-1.5 text-sm rounded-lg shadow-sm">View Statistics</Button>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center justify-center">
          <div className="flex space-x-1">
            {/* Display streak days */}
            {streak > 0 ? (
              <>
                {streakDays.slice(0, 3).map((day) => (
                  <div key={day} className="relative w-7 h-7">
                    <ProgressRing value={100} size={36} strokeWidth={3} />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-mono">
                      {day}
                    </span>
                  </div>
                ))}
                
                {streak > 3 && (
                  <div className="text-muted-foreground flex items-center">...</div>
                )}
                
                {streak > 3 && (
                  <div className="relative w-7 h-7">
                    <ProgressRing value={100} size={36} strokeWidth={3} />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-mono">
                      {streak}
                    </span>
                  </div>
                )}
                
                {/* Next day (incomplete) */}
                <div className="relative w-7 h-7">
                  <ProgressRing value={0} size={36} strokeWidth={3} />
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-mono text-muted-foreground">
                    {streak + 1}
                  </span>
                </div>
              </>
            ) : (
              // No streak yet, show empty day 1
              <div className="relative w-7 h-7">
                <ProgressRing value={0} size={36} strokeWidth={3} />
                <span className="absolute inset-0 flex items-center justify-center text-xs font-mono text-muted-foreground">
                  1
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
