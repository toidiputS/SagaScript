import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TimelineEvent } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TimelineEventCardProps {
  event: TimelineEvent;
  onEdit: (event: TimelineEvent) => void;
  onDelete: (eventId: number) => void;
}

export default function TimelineEventCard({ event, onEdit, onDelete }: TimelineEventCardProps) {
  const getEventTypeColor = (eventType: string): string => {
    switch (eventType) {
      case 'plot':
        return 'bg-blue-500';
      case 'character':
        return 'bg-green-500';
      case 'world':
        return 'bg-amber-500';
      default:
        return 'bg-neutral-500';
    }
  };

  const getImportanceClass = (importance: string): string => {
    switch (importance) {
      case 'major':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'minor':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <Card className={`border-l-4 ${event.color ? `border-l-[${event.color}]` : 'border-l-primary'}`}>
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.eventType)}`}></div>
            <CardTitle className="text-lg">{event.title}</CardTitle>
          </div>
          {event.date && <div className="text-sm text-muted-foreground">{event.date}</div>}
        </div>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(event)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(event.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{event.description || "No description provided"}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {event.isPlotPoint && (
            <Badge variant="outline" className="bg-primary-50 text-primary border-primary">
              Plot Point
            </Badge>
          )}
          <Badge variant="outline" className={getImportanceClass(event.importance)}>
            {event.importance.charAt(0).toUpperCase() + event.importance.slice(1)} Importance
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}