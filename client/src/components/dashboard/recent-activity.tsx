import React from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  FileText, 
  Users, 
  Award,
  Eye
} from "lucide-react";

export default function RecentActivity() {
  // In a real implementation, this would be an API call
  // For now, we'll use static activities to match the design
  
  const recentActivities = [
    {
      id: 1,
      type: "writing",
      title: "Writing Session Completed",
      description: "You wrote 2,345 words in \"The Chronicles of Eldoria: Book 2\"",
      timestamp: "2 hours ago",
      metadata: {
        chapter: "Chapter 14",
        progress: "+12% from average"
      }
    },
    {
      id: 2,
      type: "character",
      title: "Character Updated",
      description: "You updated the background story for \"Thorne Ironheart\"",
      timestamp: "Yesterday"
    },
    {
      id: 3,
      type: "achievement",
      title: "Achievement Unlocked",
      description: "You unlocked the \"Prolific Worldbuilder\" achievement",
      timestamp: "2 days ago",
      metadata: {
        xp: "+50 XP gained"
      }
    }
  ];

  // Helper to get icon based on activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "writing":
        return <FileText className="h-5 w-5" />;
      case "character":
        return <Users className="h-5 w-5" />;
      case "achievement":
        return <Award className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Helper to get background color based on activity type
  const getActivityBg = (type: string) => {
    switch (type) {
      case "writing":
        return "bg-primary/10 text-primary";
      case "character":
        return "bg-secondary/10 text-secondary";
      case "achievement":
        return "bg-accent/10 text-accent";
      default:
        return "bg-neutral-100 text-neutral-600";
    }
  };

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-heading font-semibold text-neutral-800">Recent Activity</h2>
        <a href="#" className="text-primary text-sm font-medium hover:underline">View All</a>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden border border-neutral-200">
        <ul className="divide-y divide-neutral-200">
          {recentActivities.map((activity) => (
            <li key={activity.id} className="p-4 flex items-start hover:bg-neutral-50 transition-colors">
              <div className={`p-2 ${getActivityBg(activity.type)} rounded-lg mr-4 flex-shrink-0`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{activity.title}</h3>
                    <p className="text-sm text-neutral-500 mt-1">{activity.description}</p>
                  </div>
                  <span className="text-xs text-neutral-500">{activity.timestamp}</span>
                </div>
                {activity.metadata && (
                  <div className="mt-2 flex items-center">
                    {activity.metadata.chapter && (
                      <span className="text-xs bg-primary/5 px-2 py-0.5 rounded-full text-primary mr-2">
                        {activity.metadata.chapter}
                      </span>
                    )}
                    {activity.metadata.progress && (
                      <span className="text-xs text-secondary">
                        {activity.metadata.progress}
                      </span>
                    )}
                    {activity.metadata.xp && (
                      <span className="text-xs bg-accent/10 px-2 py-0.5 rounded-full text-accent">
                        {activity.metadata.xp}
                      </span>
                    )}
                    {activity.type === "character" && (
                      <button className="text-xs text-primary flex items-center hover:underline">
                        <Eye className="h-3 w-3 mr-1" />
                        View Changes
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
