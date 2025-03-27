import { useState, useEffect } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Save, BookOpen, Clock, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useLocation, useRoute } from "wouter";
import { Chapter, Book } from "@shared/schema";

export default function ChapterEditor() {
  const [location, setLocation] = useLocation();
  const params = new URLSearchParams(location.split("?")[1]);
  const chapterId = params.get("id") ? parseInt(params.get("id")!) : undefined;
  const bookId = params.get("bookId") ? parseInt(params.get("bookId")!) : undefined;
  const seriesId = params.get("seriesId") ? parseInt(params.get("seriesId")!) : undefined;

  const [chapter, setChapter] = useState<Partial<Chapter>>({
    bookId: bookId || undefined,
    title: "",
    content: "",
    wordCount: 0,
    status: "in_progress",
  });

  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0); // Added character count state
  const [originalWordCount, setOriginalWordCount] = useState(0);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Calculate initial word count and character count
    if (chapter.content) {
      countWords(chapter.content);
    }
  }, [chapter.content]);

  // Get chapter data if editing existing chapter
  const { data: chapterData, isLoading: isLoadingChapter } = useQuery<Chapter>({
    queryKey: ['/api/chapters', chapterId],
    queryFn: async () => {
      if (!chapterId) return {} as Chapter;
      const res = await apiRequest('GET', `/api/chapters/${chapterId}`);
      return res.json();
    },
    enabled: !!chapterId,
  });

  // Get book data for context
  const { data: bookData } = useQuery<Book>({
    queryKey: ['/api/books', bookId],
    queryFn: async () => {
      if (!bookId) return {} as Book;
      const res = await apiRequest('GET', `/api/books/${bookId}`);
      return res.json();
    },
    enabled: !!bookId,
  });

  useEffect(() => {
    if (chapterData && chapterId) {
      setChapter(chapterData);
      setOriginalWordCount(chapterData.wordCount || 0);
      countWords(chapterData.content || "");
    }
  }, [chapterData, chapterId]);

  // Word count function, updated to include character count
  const countWords = (text: string) => {
    if (!text) {
      setWordCount(0);
      setCharCount(0); // Added character count reset
      return;
    }

    // Remove extra whitespace and count words
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);

    // Count characters
    const characters = text.length;
    setCharCount(characters); // Set character count

    // Update chapter state with new word count
    setChapter(prev => ({
      ...prev,
      wordCount: words.length
    }));
  };

  // Handle content change
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setChapter(prev => ({
      ...prev,
      content: newContent
    }));

    countWords(newContent);
    setIsUnsaved(true);
  };

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChapter(prev => ({
      ...prev,
      title: e.target.value
    }));
    setIsUnsaved(true);
  };

  // Save chapter mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Chapter>) => {
      if (chapterId) {
        // Update existing chapter
        const res = await apiRequest('PUT', `/api/chapters/${chapterId}`, data);
        return res.json();
      } else {
        // Create new chapter
        const res = await apiRequest('POST', `/api/chapters`, data);
        return res.json();
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/books', bookId, 'chapters'] });
      setLastSaved(new Date());
      setIsUnsaved(false);

      if (!chapterId) {
        // Redirect to the new chapter if we just created one
        setLocation(`/chapter-editor?id=${data.id}&bookId=${bookId}&seriesId=${seriesId}`);
        toast({
          title: "Chapter created",
          description: "Your chapter has been created successfully",
        });
      } else {
        toast({
          title: "Chapter saved",
          description: "Your changes have been saved",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error saving chapter",
        description: error.message || "An error occurred while saving",
        variant: "destructive",
      });
    }
  });

  // Auto save timer
  useEffect(() => {
    let autoSaveTimer: NodeJS.Timeout;

    if (autoSaveEnabled && isUnsaved && chapter.title && chapter.content) {
      autoSaveTimer = setTimeout(() => {
        handleSave();
      }, 30000); // Auto save after 30 seconds of inactivity
    }

    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [chapter, isUnsaved, autoSaveEnabled]);

  // Handle save
  const handleSave = () => {
    if (!chapter.title) {
      toast({
        title: "Title required",
        description: "Please enter a title for your chapter",
        variant: "destructive",
      });
      return;
    }

    if (!bookId) {
      toast({
        title: "Book required",
        description: "A chapter must be associated with a book. Please select a book first.",
        variant: "destructive",
      });
      return;
    }

    // Ensure bookId is provided as a number
    const chapterToSave = {
      ...chapter,
      bookId: Number(bookId), // Always include bookId as a number
      wordCount: wordCount || 0,
    };

    saveMutation.mutate(chapterToSave);
  };

  // Handle back navigation
  const handleBack = () => {
    if (isUnsaved) {
      if (confirm("You have unsaved changes. Save before leaving?")) {
        handleSave();
      }
    }
    setLocation(bookId ? `/series?id=${seriesId}` : "/");
  };

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return "Never saved";

    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 minute ago";
    if (diffMins < 60) return `${diffMins} minutes ago`;

    const hours = Math.floor(diffMins / 60);
    if (hours === 1) return "1 hour ago";
    if (hours < 24) return `${hours} hours ago`;

    return lastSaved.toLocaleString();
  };

  // Calculate writing progress
  const calculateProgress = () => {
    if (originalWordCount === 0) return wordCount;
    return wordCount - originalWordCount;
  };

  const progress = calculateProgress();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b p-4 bg-card">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={handleBack} className="h-9 w-9 p-0">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>

            <div>
              <Input
                value={chapter.title || ""}
                onChange={handleTitleChange}
                placeholder="Chapter Title"
                className="text-xl font-medium border-none shadow-none focus-visible:ring-0 p-0 h-auto"
              />
              <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                <BookOpen className="h-3 w-3" />
                <span>{bookData?.title || "Untitled Book"}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs flex items-center text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              <span>
                {lastSaved ? `Last saved: ${formatLastSaved()}` : "Not saved yet"}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoSaveEnabled(!autoSaveEnabled)}
              className={`text-xs ${autoSaveEnabled ? 'bg-primary/10' : ''}`}
            >
              {autoSaveEnabled ? "Auto-save On" : "Auto-save Off"}
            </Button>

            <Button 
              onClick={handleSave} 
              disabled={saveMutation.isPending || !isUnsaved}
              className="text-white"
              size="sm"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main editor area */}
      <div className="flex-grow flex">
        <div className="max-w-4xl mx-auto w-full p-4 md:p-8 flex flex-col">
          {/* Status badges */}
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline">
              {chapter.status === "completed" ? "Completed" : chapter.status === "draft" ? "Draft" : "In Progress"}
            </Badge>
            <Badge variant={progress >= 0 ? "secondary" : "destructive"}>
              {progress >= 0 ? `+${progress}` : progress} words
            </Badge>
            <Badge variant="outline">{wordCount} total words</Badge>
          </div>

          {/* Editor */}
          <div className="flex-grow">
            <Textarea
              value={chapter.content || ""}
              onChange={handleContentChange}
              placeholder="Start writing your chapter here..."
              className="w-full h-full min-h-[calc(100vh-250px)] resize-none p-4 text-lg leading-relaxed focus-visible:ring-0"
            />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="hidden lg:block w-72 border-l p-4 bg-card">
          <h3 className="font-medium mb-3">Chapter Details</h3>
          <Separator className="mb-4" />

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Status</h4>
              <select
                value={chapter.status || "in_progress"}
                onChange={(e) => {
                  setChapter(prev => ({ ...prev, status: e.target.value }));
                  setIsUnsaved(true);
                }}
                className="w-full p-2 rounded-md border text-sm"
              >
                <option value="in_progress">In Progress</option>
                <option value="draft">Draft</option>
                <option value="revision">Revision</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Word Count</h4>
              <Card>
                <CardContent className="p-3 text-sm">
                  <div className="flex justify-between">
                    <span>Words:</span>
                    <span className="font-medium">{wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Characters:</span>
                    <span className="font-medium">{charCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Previous:</span>
                    <span>{originalWordCount}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Change:</span>
                    <span className={progress >= 0 ? "text-green-600" : "text-red-600"}>
                      {progress >= 0 ? `+${progress}` : progress}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Writing Tips</h4>
              <Card>
                <CardContent className="p-3 text-sm">
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>Use descriptive language to paint a vivid picture</li>
                    <li>Show, don't tell - let readers experience the story</li>
                    <li>Maintain consistent character voices</li>
                    <li>Take breaks to refresh your perspective</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}