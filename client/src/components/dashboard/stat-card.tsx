import { TrendingUp, Users, Award, BookIcon, File } from "lucide-react";

type StatCardProps = {
  title: string;
  value: number | string;
  icon: "document" | "users" | "award" | "book";
  change?: number;
  period?: string;
  changeType?: "percentage" | "new";
  progress?: number;
  nextMilestone?: string;
};

export default function StatCard({
  title,
  value,
  icon,
  change,
  period,
  changeType = "percentage",
  progress,
  nextMilestone,
}: StatCardProps) {
  // Format the value properly
  const formattedValue = typeof value === 'number' ? value.toLocaleString() : value;
  
  return (
    <div className="bg-card rounded-xl shadow-card p-5 border border-border transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
          <p className="text-2xl font-mono font-semibold mt-1 text-foreground">{formattedValue}</p>
        </div>
        <div className="p-2 bg-primary/10 dark:bg-primary/20 spooky:bg-primary/30 rounded-lg text-primary">
          {icon === "document" && <File className="h-6 w-6" />}
          {icon === "users" && <Users className="h-6 w-6" />}
          {icon === "award" && <Award className="h-6 w-6" />}
          {icon === "book" && <BookIcon className="h-6 w-6" />}
        </div>
      </div>
      
      {change !== undefined && (
        <div className="flex items-center mt-3">
          <span className="text-secondary dark:text-secondary/90 spooky:text-secondary/90 text-sm font-medium flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            {changeType === "percentage" ? `${change}% increase` : `${change} ${changeType}`}
          </span>
          {period && <span className="text-muted-foreground text-sm ml-2">{period}</span>}
        </div>
      )}
      
      {progress !== undefined && (
        <div className="mt-3">
          <div className="w-full bg-muted dark:bg-muted/50 spooky:bg-muted/30 rounded-full h-2">
            <div className="bg-accent h-2 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
          {nextMilestone && (
            <p className="text-muted-foreground text-sm mt-1">{nextMilestone}</p>
          )}
        </div>
      )}
    </div>
  );
}
