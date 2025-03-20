import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Bookmark, Edit2, Trash2, Flag } from "lucide-react";
import { TimelineEvent } from "@shared/schema";
import { Badge } from "@/components/ui/badge";

interface TimelineEventCardProps {
  event: TimelineEvent;
  onEdit: (event: TimelineEvent) => void;
  onDelete: (eventId: number) => void;
}

export default function TimelineEventCard({ event, onEdit, onDelete }: TimelineEventCardProps) {
  // Choose color based on event importance
  const getImportanceColor = () => {
    switch (event.importance) {
      case "major":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  // Choose icon based on event type
  const getEventTypeIcon = () => {
    switch (event.eventType) {
      case "character":
        return <Bookmark className="h-4 w-4 mr-1" />;
      case "world":
        return <Flag className="h-4 w-4 mr-1" />;
      default:
        return <Clock className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <Card className="shadow-sm hover:shadow transition-shadow duration-200 border-l-4" 
      style={{ borderLeftColor: event.color || "#6366f1" }}>
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-lg font-semibold text-foreground">
            {event.title}
          </CardTitle>
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            {event.date && (
              <span className="flex items-center mr-3">
                <Clock className="h-3.5 w-3.5 mr-1 opacity-70" />
                {event.date}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-1">
          <Badge variant="outline" className={`${getImportanceColor()} text-xs`}>
            {event.importance === "major" ? "Major" : event.importance === "medium" ? "Medium" : "Minor"}
          </Badge>
          {event.isPlotPoint && (
            <Badge variant="secondary" className="text-xs">
              Plot Point
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <p className="text-sm text-foreground">
          {event.description || "No description provided."}
        </p>
      </CardContent>
      
      <CardFooter className="pt-1 justify-between">
        <div className="flex items-center text-xs text-muted-foreground">
          <span className="flex items-center">
            {getEventTypeIcon()}
            {event.eventType === "character" ? "Character Event" : 
             event.eventType === "world" ? "World Event" : "Plot Event"}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(event)}>
            <Edit2 className="h-3.5 w-3.5" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(event.id)}>
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}