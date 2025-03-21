import { Chapter } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, MoreHorizontal, BookOpen } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useLocation } from "wouter";

interface ChapterCardProps {
  chapter: Chapter;
  bookId: number;
  seriesId: number;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ChapterCard({ chapter, bookId, seriesId, onEdit, onDelete }: ChapterCardProps) {
  const [_, setLocation] = useLocation();

  // Calculate excerpt to show
  const excerpt = chapter.content 
    ? chapter.content.substring(0, 120) + (chapter.content.length > 120 ? "..." : "")
    : "No content yet. Click to start writing.";

  // Format date
  const formattedDate = chapter.updatedAt
    ? formatDistanceToNow(new Date(chapter.updatedAt), { addSuffix: true })
    : "Not started";

  // Handle click to edit the chapter
  const handleEditClick = () => {
    setLocation(`/chapter-editor?id=${chapter.id}&bookId=${bookId}&seriesId=${seriesId}`);
  };

  // Get status class
  const getStatusBadgeVariant = () => {
    switch (chapter.status) {
      case "completed": return "success";
      case "draft": return "secondary";
      case "revision": return "warning";
      default: return "default";
    }
  };

  // Format status text
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");
  };

  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg line-clamp-1">{chapter.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow pb-2">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{excerpt}</p>
        <div className="flex items-center space-x-2 mt-auto">
          <Badge variant="outline">
            {chapter.wordCount || 0} words
          </Badge>
          <Badge variant={getStatusBadgeVariant() as any}>
            {formatStatus(chapter.status || "in_progress")}
          </Badge>
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t flex justify-between items-center">
        <span className="text-xs text-muted-foreground">Updated {formattedDate}</span>
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={handleEditClick}>
            <Edit className="h-4 w-4 mr-1" />
            <span>Edit</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}