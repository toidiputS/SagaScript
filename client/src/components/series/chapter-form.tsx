import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ChapterFormProps {
  bookId: number;
  onSuccess: () => void;
  initialData?: {
    title: string;
    content?: string;
    status: string;
    wordCount: number;
  };
  mode?: "create" | "edit";
  chapterId?: number;
}

export default function ChapterForm({ 
  bookId, 
  onSuccess, 
  initialData = { title: "", content: "", status: "in_progress", wordCount: 0 }, 
  mode = "create",
  chapterId
}: ChapterFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(initialData);

  // Create or update chapter mutation
  const chapterMutation = useMutation({
    mutationFn: async () => {
      if (mode === "create") {
        const res = await apiRequest('POST', '/api/chapters', {
          bookId,
          title: formData.title,
          content: formData.content,
          wordCount: formData.wordCount,
          status: formData.status
        });
        return res.json();
      } else if (mode === "edit" && chapterId) {
        const res = await apiRequest('PUT', `/api/chapters/${chapterId}`, {
          title: formData.title,
          content: formData.content,
          wordCount: formData.wordCount,
          status: formData.status
        });
        return res.json();
      }
    },
    onSuccess: () => {
      toast({
        title: mode === "create" ? "Chapter created" : "Chapter updated",
        description: mode === "create" 
          ? "The chapter has been created successfully" 
          : "The chapter has been updated successfully",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  // Calculate word count when content changes
  const calculateWordCount = (text: string) => {
    const words = text.trim().split(/\s+/);
    return text.trim() === "" ? 0 : words.length;
  };

  // Handle content change
  const handleContentChange = (value: string) => {
    const wordCount = calculateWordCount(value);
    setFormData({
      ...formData,
      content: value,
      wordCount
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a title for the chapter",
        variant: "destructive",
      });
      return;
    }
    
    chapterMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Chapter Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="Enter chapter title"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Begin writing your chapter..."
          rows={8}
        />
        <div className="text-xs text-neutral-500 text-right">
          {formData.wordCount} words
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({...formData, status: value})}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="revision">Revision</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={chapterMutation.isPending}
        >
          {chapterMutation.isPending
            ? (mode === "create" ? "Creating..." : "Updating...")
            : (mode === "create" ? "Create Chapter" : "Update Chapter")
          }
        </Button>
      </div>
    </form>
  );
}
