interface StatsCardProps {
  title: string;
  value: number | string;
  icon: string;
  iconBg: string;
  iconColor: string;
  trend?: {
    value: number;
    type: 'increase' | 'decrease';
    text: string;
  };
  streakDays?: number;
}

export default function StatsCard({
  title,
  value,
  icon,
  iconBg,
  iconColor,
  trend,
  streakDays
}: StatsCardProps) {
  return (
    <div className="rounded-[30px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(33,150,243,0.12),-10px_-10px_20px_rgba(66,165,245,0.08)] hover:shadow-[15px_15px_25px_rgba(33,150,243,0.18),-15px_-15px_25px_rgba(66,165,245,0.12)] transition-shadow duration-300 p-5">
      <div className="flex items-center">
        <div className={`p-3 ${iconBg} rounded-lg`}>
          <i className={`${icon} text-xl ${iconColor}`}></i>
        </div>
        <div className="ml-4">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center text-xs">
          <span className={`${trend.type === 'increase' ? 'text-success' : 'text-error'} flex items-center`}>
            <i className={`${trend.type === 'increase' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} mr-1`}></i>
            {trend.value}%
          </span>
          <span className="ml-2 text-muted-foreground">{trend.text}</span>
        </div>
      )}
      
      {streakDays && (
        <div className="mt-4 grid grid-cols-7 gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full ${i < streakDays ? 'bg-secondary' : 'bg-muted dark:bg-muted/50 spooky:bg-muted/30'}`}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
}
