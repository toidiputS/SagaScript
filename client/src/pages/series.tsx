import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useSeries } from "@/hooks/use-series";
import { useToast } from "@/hooks/use-toast";
import BookCard from "@/components/series/book-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { type Series, type InsertSeries, type Book } from "@shared/schema";

export default function SeriesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { allSeries, currentSeries, changeCurrentSeries } = useSeries();
  const [isCreatingNewSeries, setIsCreatingNewSeries] = useState(false);
  const [newSeriesData, setNewSeriesData] = useState({
    title: "",
    description: "",
    totalBooks: 3,
  });
  const [isCreatingNewBook, setIsCreatingNewBook] = useState(false);
  const [newBookData, setNewBookData] = useState({
    title: "",
    description: "",
  });

  // Fetch books for current series
  const { data: books = [], isLoading: isLoadingBooks } = useQuery<Book[]>({
    queryKey: ['/api/series', currentSeries?.id, 'books'],
    queryFn: async () => {
      if (!currentSeries) return [];
      const res = await apiRequest('GET', `/api/series/${currentSeries.id}/books`);
      return res.json() as Promise<Book[]>;
    },
    enabled: !!currentSeries
  });

  // Create new series mutation
  const createSeriesMutation = useMutation({
    mutationFn: async (data: Omit<InsertSeries, "userId">) => {
      const res = await apiRequest('POST', '/api/series', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series'] });
      setIsCreatingNewSeries(false);
      setNewSeriesData({ title: "", description: "", totalBooks: 3 });
      toast({
        title: "Series created",
        description: "Your new series has been created successfully",
      });
    },
    onError: (error: any) => {
      console.error("Error creating series:", error);
      toast({
        title: "Error creating series",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  });

  // Create new book mutation
  const createBookMutation = useMutation({
    mutationFn: async (data: { seriesId: number, title: string, description: string, position: number }) => {
      const res = await apiRequest('POST', '/api/books', data);
      return res.json();
    },
    onSuccess: () => {
      if (currentSeries) {
        queryClient.invalidateQueries({ queryKey: ['/api/series', currentSeries.id, 'books'] });
      }
      setIsCreatingNewBook(false);
      setNewBookData({ title: "", description: "" });
      toast({
        title: "Book created",
        description: "Your new book has been created successfully",
      });
    }
  });

  // Handle creating a new series
  const handleCreateSeries = () => {
    if (!newSeriesData.title) {
      toast({
        title: "Missing information",
        description: "Please provide a title for your series",
        variant: "destructive",
      });
      return;
    }

    createSeriesMutation.mutate({
      title: newSeriesData.title,
      description: newSeriesData.description,
      totalBooks: newSeriesData.totalBooks,
      currentBook: 1,
      coverImage: null,
    });
  };

  // Handle creating a new book
  const handleCreateBook = () => {
    if (!currentSeries) {
      toast({
        title: "No series selected",
        description: "Please select a series first",
        variant: "destructive",
      });
      return;
    }

    if (!newBookData.title) {
      toast({
        title: "Missing information",
        description: "Please provide a title for your book",
        variant: "destructive",
      });
      return;
    }

    const position = books.length + 1;

    createBookMutation.mutate({
      seriesId: currentSeries.id,
      title: newBookData.title,
      description: newBookData.description,
      position,
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Series Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-neutral-800">Series</h1>
            <p className="text-neutral-600 mt-1">Manage your book series and chapters</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Dialog open={isCreatingNewSeries} onOpenChange={setIsCreatingNewSeries}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-dark text-white">
                  <i className="ri-add-line mr-2"></i>
                  <span>New Series</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Series</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="title" className="text-sm font-medium">Title</label>
                    <Input
                      id="title"
                      placeholder="Enter series title..."
                      value={newSeriesData.title}
                      onChange={(e) => setNewSeriesData({...newSeriesData, title: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-medium">Description</label>
                    <Textarea
                      id="description"
                      placeholder="Enter description..."
                      value={newSeriesData.description}
                      onChange={(e) => setNewSeriesData({...newSeriesData, description: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="totalBooks" className="text-sm font-medium">Total Books</label>
                    <Input
                      id="totalBooks"
                      type="number"
                      min="1"
                      value={newSeriesData.totalBooks}
                      onChange={(e) => setNewSeriesData({...newSeriesData, totalBooks: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button 
                    onClick={handleCreateSeries} 
                    disabled={createSeriesMutation.isPending}
                  >
                    {createSeriesMutation.isPending ? "Creating..." : "Create Series"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Series Selection */}
        {allSeries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allSeries.map((series: Series) => (
              <Card 
                key={series.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  currentSeries?.id === series.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => changeCurrentSeries(series.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle>{series.title}</CardTitle>
                  <CardDescription>
                    Book {series.currentBook} of {series.totalBooks}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-neutral-600 line-clamp-2">
                    {series.description || "No description provided"}
                  </p>
                </CardContent>
                <CardFooter>
                  <div className="w-full">
                    <div className="flex justify-between text-xs text-neutral-500 mb-1">
                      <span>Progress</span>
                      <span>{Math.round((series.currentBook / series.totalBooks) * 100)}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full"
                        style={{
                          width: `${Math.round((series.currentBook / series.totalBooks) * 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
            <div className="text-neutral-500 mb-4">
              <i className="ri-book-open-line text-4xl"></i>
            </div>
            <h3 className="text-lg font-medium mb-2">No Series Yet</h3>
            <p className="text-neutral-600 mb-4">Create your first series to start organizing your books and chapters</p>
            <Button 
              onClick={() => setIsCreatingNewSeries(true)}
              className="bg-primary hover:bg-primary-dark text-white"
            >
              <i className="ri-add-line mr-2"></i> Create First Series
            </Button>
          </div>
        )}

        {/* Books Section - Only show if a series is selected */}
        {currentSeries && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-serif font-bold text-neutral-800">
                Books in {currentSeries.title}
              </h2>
              <Dialog open={isCreatingNewBook} onOpenChange={setIsCreatingNewBook}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary-dark text-white">
                    <i className="ri-add-line mr-2"></i>
                    <span>Add Book</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Book</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="bookTitle" className="text-sm font-medium">Title</label>
                      <Input
                        id="bookTitle"
                        placeholder="Enter book title..."
                        value={newBookData.title}
                        onChange={(e) => setNewBookData({...newBookData, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="bookDescription" className="text-sm font-medium">Description</label>
                      <Textarea
                        id="bookDescription"
                        placeholder="Enter description..."
                        value={newBookData.description}
                        onChange={(e) => setNewBookData({...newBookData, description: e.target.value})}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button 
                      onClick={handleCreateBook} 
                      disabled={createBookMutation.isPending}
                    >
                      {createBookMutation.isPending ? "Creating..." : "Add Book"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {isLoadingBooks ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : books.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book) => (
                  <BookCard key={book.id} book={book} seriesId={currentSeries.id} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
                <div className="text-neutral-500 mb-4">
                  <i className="ri-book-line text-4xl"></i>
                </div>
                <h3 className="text-lg font-medium mb-2">No Books Yet</h3>
                <p className="text-neutral-600 mb-4">Add your first book to this series</p>
                <Button 
                  onClick={() => setIsCreatingNewBook(true)}
                  className="bg-primary hover:bg-primary-dark text-white"
                >
                  <i className="ri-add-line mr-2"></i> Add First Book
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
