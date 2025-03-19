import { useState } from "react";
import { type Series } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useDragDrop } from "@/hooks/use-drag-drop";
import { useToast } from "@/hooks/use-toast";

interface ChapterListProps {
  series: Series;
}

export default function ChapterList({ series }: ChapterListProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [newChapterTitle, setNewChapterTitle] = useState("");
  
  // Fetch current book
  const { data: currentBook, isLoading: isLoadingBook } = useQuery({
    queryKey: ['/api/books', series.currentBook],
    queryFn: async () => {
      if (!series) return null;
      
      const books = await apiRequest(
        'GET', 
        `/api/series/${series.id}/books`
      ).then(res => res.json());
      
      return books.find((book) => book.position === series.currentBook);
    }
  });
  
  // Fetch chapters for current book
  const { data: chapters, isLoading: isLoadingChapters } = useQuery({
    queryKey: ['/api/chapters', currentBook?.id],
    queryFn: async () => {
      if (!currentBook) return [];
      
      const res = await apiRequest(
        'GET',
        `/api/books/${currentBook.id}/chapters`
      );
      return res.json();
    },
    enabled: !!currentBook
  });
  
  // Setup drag and drop for chapters
  const { draggedItem, draggedOverItem, handleDragStart, handleDragEnter, handleDragEnd } = useDragDrop();
  
  // Add new chapter mutation
  const addChapterMutation = useMutation({
    mutationFn: async (title: string) => {
      if (!currentBook) throw new Error("No current book selected");
      
      const res = await apiRequest(
        'POST',
        `/api/chapters`,
        {
          bookId: currentBook.id,
          title,
          position: chapters?.length ? chapters.length + 1 : 1,
          wordCount: 0,
          status: "in_progress"
        }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chapters', currentBook?.id] });
      setNewChapterTitle("");
      toast({
        title: "Chapter added",
        description: "New chapter has been added to your book",
      });
    }
  });
  
  // Reorder chapters mutation
  const reorderChaptersMutation = useMutation({
    mutationFn: async (reorderedChapters: { id: number, position: number }[]) => {
      const res = await apiRequest(
        'POST',
        `/api/chapters/reorder`,
        { chapters: reorderedChapters }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chapters', currentBook?.id] });
    }
  });
  
  // Handle adding a new chapter
  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapterTitle.trim()) return;
    
    addChapterMutation.mutate(newChapterTitle);
  };
  
  if (isLoadingBook) {
    return (
      <div className="p-5">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (!currentBook) {
    return (
      <div className="p-5">
        <div className="text-center py-8">
          <p className="text-neutral-600 mb-4">No book selected for this series</p>
          <button
            className="bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-md font-medium"
          >
            Create First Book
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-5">
      <div className="flex items-center mb-4">
        <div className="w-16 h-24 bg-neutral-200 rounded-md flex items-center justify-center text-neutral-500">
          <i className="ri-book-2-line text-2xl"></i>
        </div>
        <div className="ml-4">
          <h3 className="font-serif font-bold text-xl text-neutral-800">{currentBook.title}</h3>
          <p className="text-neutral-600 text-sm">Book {series.currentBook} of {series.totalBooks}</p>
          <div className="mt-2 flex items-center">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {currentBook.status === "completed" ? "Completed" : "In Progress"}
            </span>
            <span className="ml-2 text-sm text-neutral-500">
              Last edited {new Date(currentBook.updatedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Book Structure */}
      <div className="mt-6">
        <h4 className="font-medium text-neutral-700 mb-3">Book Structure</h4>
        
        {isLoadingChapters ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : chapters && chapters.length > 0 ? (
          chapters.map((chapter, index) => (
            <div 
              key={chapter.id} 
              className="mb-4 last:mb-0"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={() => {
                if (draggedItem !== null && draggedOverItem !== null) {
                  const reorderedChapters = [...chapters];
                  const [movedItem] = reorderedChapters.splice(draggedItem, 1);
                  reorderedChapters.splice(draggedOverItem, 0, movedItem);
                  
                  // Update positions
                  const chaptersWithNewPositions = reorderedChapters.map((ch, idx) => ({
                    id: ch.id,
                    position: idx + 1
                  }));
                  
                  reorderChaptersMutation.mutate(chaptersWithNewPositions);
                }
                handleDragEnd();
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <i className="ri-drag-move-2-line text-neutral-400 mr-2 cursor-move"></i>
                  <span className="font-medium">{chapter.title}</span>
                </div>
                <div className="text-sm text-neutral-500">{chapter.wordCount.toLocaleString()} words</div>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full" 
                  style={{ 
                    width: chapter.status === "completed" 
                      ? "100%" 
                      : chapter.wordCount > 0 
                        ? "75%" 
                        : "10%" 
                  }}
                ></div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-neutral-500 text-sm">No chapters yet. Add your first chapter below.</p>
        )}

        <form onSubmit={handleAddChapter} className="mt-4 flex">
          <input
            type="text"
            value={newChapterTitle}
            onChange={(e) => setNewChapterTitle(e.target.value)}
            placeholder="New chapter title"
            className="flex-1 border border-neutral-300 rounded-l-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary-dark text-sm font-medium"
            disabled={addChapterMutation.isPending}
          >
            {addChapterMutation.isPending ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <i className="ri-add-line"></i>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
