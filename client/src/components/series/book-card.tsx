import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ChapterForm from "./chapter-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Book, Chapter } from "@shared/schema";

interface BookCardProps {
  book: Book;
  seriesId: number;
}

export default function BookCard({ book, seriesId }: BookCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAddChapterDialogOpen, setIsAddChapterDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedBook, setEditedBook] = useState(book);

  // Fetch chapters for this book
  const { data: chapters = [] } = useQuery<Chapter[]>({
    queryKey: ['/api/books', book.id, 'chapters'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/books/${book.id}/chapters`);
      return res.json() as Promise<Chapter[]>;
    }
  });

  // Update book mutation
  const updateBookMutation = useMutation({
    mutationFn: async (data: Partial<Book>) => {
      const res = await apiRequest('PUT', `/api/books/${book.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', seriesId, 'books'] });
      setIsEditMode(false);
      toast({
        title: "Book updated",
        description: "The book has been updated successfully",
      });
    },
    onError: (error: any) => {
      console.error("Error updating book:", error);
      toast({
        title: "Error updating book",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });

  // Delete book mutation
  const deleteBookMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/books/${book.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', seriesId, 'books'] });
      toast({
        title: "Book deleted",
        description: "The book has been deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error("Error deleting book:", error);
      toast({
        title: "Error deleting book",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });

  // Handle book update
  const handleSaveEdit = () => {
    updateBookMutation.mutate({
      title: editedBook.title,
      description: editedBook.description,
      status: editedBook.status,
    });
  };

  // Handle book delete
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this book? This action cannot be undone.")) {
      deleteBookMutation.mutate();
    }
  };

  // Calculate completion percentage
  const completionPercentage = chapters.length > 0
    ? Math.round((chapters.filter(c => c.status === "completed").length / chapters.length) * 100)
    : 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        {isEditMode ? (
          <div className="space-y-2">
            <input
              className="w-full font-bold text-xl border-b border-neutral-200 focus:outline-none focus:border-primary"
              value={editedBook.title}
              onChange={(e) => setEditedBook({...editedBook, title: e.target.value})}
            />
            <textarea
              className="w-full text-sm text-neutral-600 border border-neutral-200 rounded-md p-2 focus:outline-none focus:border-primary"
              value={editedBook.description || ""}
              onChange={(e) => setEditedBook({...editedBook, description: e.target.value})}
              rows={3}
            />
            <select
              className="w-full border border-neutral-200 rounded-md p-1 text-sm focus:outline-none focus:border-primary"
              value={editedBook.status}
              onChange={(e) => setEditedBook({...editedBook, status: e.target.value})}
            >
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="planning">Planning</option>
              <option value="revision">Revision</option>
            </select>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{book.title}</CardTitle>
                <CardDescription>
                  Book {book.position}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <i className="ri-more-2-fill"></i>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditMode(true)}>
                    <i className="ri-edit-line mr-2"></i> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <i className="ri-delete-bin-line mr-2"></i> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-foreground mt-2">
              {book.description || "No description provided"}
            </p>
          </>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <Badge variant={book.status === "completed" ? "default" : "outline"}>
            {book.status ? book.status.charAt(0).toUpperCase() + book.status.slice(1).replace("_", " ") : "In Progress"}
          </Badge>
          <span className="text-sm text-foreground opacity-80">
            {(book.wordCount || 0).toLocaleString()} words
          </span>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs font-medium mb-1">
            <span className="text-foreground">Progress</span>
            <span className="text-foreground">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} />
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium text-foreground">Chapters</h4>
            <span className="text-xs text-foreground opacity-75">
              {chapters.length} total
            </span>
          </div>

          <div className="mt-2 space-y-1 max-h-28 overflow-y-auto pr-1">
            {chapters.length > 0 ? (
              chapters.map((chapter) => (
                <div 
                  key={chapter.id} 
                  className="flex justify-between items-center text-sm hover:bg-gray-100 p-1 rounded cursor-pointer"
                  onClick={() => {
                    // Navigate to chapter editor
                    window.location.href = `/chapter-editor?id=${chapter.id}&bookId=${book.id}&seriesId=${seriesId}`;
                  }}
                >
                  <span className="truncate max-w-[70%]">{chapter.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {chapter.wordCount.toLocaleString()}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-xs text-foreground opacity-70 italic">No chapters yet</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {isEditMode ? (
          <div className="flex space-x-2 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => {
                setEditedBook(book);
                setIsEditMode(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1"
              onClick={handleSaveEdit}
              disabled={updateBookMutation.isPending}
            >
              {updateBookMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        ) : (
          <Dialog open={isAddChapterDialogOpen} onOpenChange={setIsAddChapterDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full flex items-center justify-center" variant="outline">
                <i className="ri-add-line mr-2"></i> Add Chapter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Chapter</DialogTitle>
              </DialogHeader>
              <ChapterForm
                bookId={book.id}
                onSuccess={() => {
                  setIsAddChapterDialogOpen(false);
                  queryClient.invalidateQueries({ queryKey: ['/api/books', book.id, 'chapters'] });
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardFooter>
    </Card>
  );
}
