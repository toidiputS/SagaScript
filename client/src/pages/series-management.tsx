import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusIcon, BookIcon, Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

// Schema for creating or editing a series
const seriesSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  genre: z.string().optional(),
  booksPlanned: z.coerce.number().min(1, "At least one book must be planned").default(1),
});

type SeriesFormValues = z.infer<typeof seriesSchema>;

// Schema for creating or editing a book
const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  position: z.coerce.number().min(1, "Position is required"),
  status: z.string().default("draft"),
});

type BookFormValues = z.infer<typeof bookSchema>;

export default function SeriesManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateSeriesOpen, setIsCreateSeriesOpen] = useState(false);
  const [isCreateBookOpen, setIsCreateBookOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<number | null>(null);
  const [isEditingSeries, setIsEditingSeries] = useState(false);
  const [editingSeries, setEditingSeries] = useState<any>(null);

  // Fetch all series
  const { data: series, isLoading } = useQuery({
    queryKey: ['/api/series'],
  });

  // Create new series mutation
  const createSeriesMutation = useMutation({
    mutationFn: (data: SeriesFormValues) =>
      apiRequest("POST", "/api/series", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series'] });
      toast({
        title: "Success",
        description: "Series created successfully",
      });
      setIsCreateSeriesOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create series",
        variant: "destructive",
      });
    },
  });

  // Edit series mutation
  const editSeriesMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: SeriesFormValues }) =>
      apiRequest("PUT", `/api/series/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series'] });
      toast({
        title: "Success",
        description: "Series updated successfully",
      });
      setIsEditingSeries(false);
      setEditingSeries(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update series",
        variant: "destructive",
      });
    },
  });

  // Delete series mutation
  const deleteSeriesMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest("DELETE", `/api/series/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series'] });
      toast({
        title: "Success",
        description: "Series deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete series",
        variant: "destructive",
      });
    },
  });

  // Create book mutation
  const createBookMutation = useMutation({
    mutationFn: ({ seriesId, data }: { seriesId: number; data: BookFormValues }) =>
      apiRequest("POST", `/api/books`, { ...data, seriesId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', selectedSeries, 'books'] });
      toast({
        title: "Success",
        description: "Book created successfully",
      });
      setIsCreateBookOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create book",
        variant: "destructive",
      });
    },
  });

  // Fetch books for selected series
  const { data: books, isLoading: isLoadingBooks } = useQuery({
    queryKey: ['/api/series', selectedSeries, 'books'],
    enabled: !!selectedSeries,
  });

  // Form for creating a new series
  const seriesForm = useForm<SeriesFormValues>({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      title: "",
      description: "",
      genre: "",
      booksPlanned: 1,
    },
  });

  // Form for editing a series
  const editSeriesForm = useForm<SeriesFormValues>({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      title: "",
      description: "",
      genre: "",
      booksPlanned: 1,
    },
  });

  // Form for creating a new book
  const bookForm = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      position: 1,
      status: "draft",
    },
  });

  const handleCreateSeriesSubmit = (data: SeriesFormValues) => {
    createSeriesMutation.mutate(data);
  };

  const handleEditSeriesSubmit = (data: SeriesFormValues) => {
    if (editingSeries) {
      editSeriesMutation.mutate({ id: editingSeries.id, data });
    }
  };

  const handleCreateBookSubmit = (data: BookFormValues) => {
    if (selectedSeries) {
      createBookMutation.mutate({ seriesId: selectedSeries, data });
    }
  };

  const openEditSeriesDialog = (seriesData: any) => {
    setEditingSeries(seriesData);
    editSeriesForm.reset({
      title: seriesData.title,
      description: seriesData.description || "",
      genre: seriesData.genre || "",
      booksPlanned: seriesData.booksPlanned,
    });
    setIsEditingSeries(true);
  };

  return (
    <div className="bg-neutral-50 text-neutral-800 font-sans min-h-screen flex">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 pt-4 md:pt-0">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <MobileNav />
          
          {/* Page header */}
          <header className="md:flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">Series Management</h1>
              <p className="text-neutral-600 mt-1">Organize and manage your book series</p>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <Dialog open={isCreateSeriesOpen} onOpenChange={setIsCreateSeriesOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    New Series
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Series</DialogTitle>
                    <DialogDescription>
                      Add a new book series to your collection.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...seriesForm}>
                    <form onSubmit={seriesForm.handleSubmit(handleCreateSeriesSubmit)} className="space-y-4">
                      <FormField
                        control={seriesForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Series Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter series title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={seriesForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter a brief description of your series" 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={seriesForm.control}
                          name="genre"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Genre</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g. Fantasy, Sci-Fi" 
                                  {...field} 
                                  value={field.value || ""}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={seriesForm.control}
                          name="booksPlanned"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Books Planned</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min={1} 
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          disabled={createSeriesMutation.isPending}
                        >
                          {createSeriesMutation.isPending ? "Creating..." : "Create Series"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          {/* Edit Series Dialog */}
          <Dialog open={isEditingSeries} onOpenChange={setIsEditingSeries}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Series</DialogTitle>
                <DialogDescription>
                  Make changes to your series.
                </DialogDescription>
              </DialogHeader>
              <Form {...editSeriesForm}>
                <form onSubmit={editSeriesForm.handleSubmit(handleEditSeriesSubmit)} className="space-y-4">
                  <FormField
                    control={editSeriesForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Series Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter series title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editSeriesForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter a brief description of your series" 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editSeriesForm.control}
                      name="genre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Genre</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g. Fantasy, Sci-Fi" 
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editSeriesForm.control}
                      name="booksPlanned"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Books Planned</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={editSeriesMutation.isPending}
                    >
                      {editSeriesMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Create Book Dialog */}
          <Dialog open={isCreateBookOpen} onOpenChange={setIsCreateBookOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Book</DialogTitle>
                <DialogDescription>
                  Add a new book to your series.
                </DialogDescription>
              </DialogHeader>
              <Form {...bookForm}>
                <form onSubmit={bookForm.handleSubmit(handleCreateBookSubmit)} className="space-y-4">
                  <FormField
                    control={bookForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Book Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter book title" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={bookForm.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Book Position</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Order in the series
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bookForm.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="revision">Revision</SelectItem>
                              <SelectItem value="final">Final</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button 
                      type="submit" 
                      disabled={createBookMutation.isPending}
                    >
                      {createBookMutation.isPending ? "Adding..." : "Add Book"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Series List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {isLoading ? (
              <p>Loading series...</p>
            ) : series && series.length > 0 ? (
              series.map((seriesItem: any) => (
                <Card 
                  key={seriesItem.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-5">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-heading font-bold">{seriesItem.title}</h3>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openEditSeriesDialog(seriesItem)}
                          className="text-white hover:bg-white/20 p-1 rounded"
                        >
                          <Pencil size={16} />
                        </button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="text-white hover:bg-white/20 p-1 rounded">
                              <Trash2 size={16} />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your series
                                and all associated books, characters, and locations.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteSeriesMutation.mutate(seriesItem.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                {deleteSeriesMutation.isPending ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <p className="text-primary-light text-sm mt-1">
                      {seriesItem.genre ? `${seriesItem.genre} • ` : ""}
                      {seriesItem.booksPlanned} {seriesItem.booksPlanned === 1 ? 'Book' : 'Books'} Planned
                    </p>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Series Progress</span>
                        <span>{seriesItem.progress}%</span>
                      </div>
                      <div className="w-full bg-primary-light/30 rounded-full h-2">
                        <div 
                          className="bg-white h-2 rounded-full" 
                          style={{ width: `${seriesItem.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Books</h4>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedSeries(seriesItem.id);
                          bookForm.reset({ title: "", position: 1, status: "draft" });
                          setIsCreateBookOpen(true);
                        }}
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add Book
                      </Button>
                    </div>
                    
                    {selectedSeries === seriesItem.id && isLoadingBooks ? (
                      <p className="text-center py-4 text-sm text-neutral-500">Loading books...</p>
                    ) : (
                      <div className="space-y-3">
                        {books && books.length > 0 ? (
                          books.map((book: any) => (
                            <div key={book.id} className="bg-neutral-50 rounded-lg p-4 border border-neutral-200 hover:border-primary/50 transition-colors">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium">Book {book.position}: {book.title}</h4>
                                  <p className="text-neutral-500 text-sm mt-1">{book.wordCount.toLocaleString()} words</p>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  book.status === 'final' ? 'bg-secondary text-white' :
                                  book.status === 'revision' ? 'bg-accent text-white' :
                                  'bg-neutral-200 text-neutral-700'
                                }`}>
                                  {book.status.charAt(0).toUpperCase() + book.status.slice(1)}
                                </span>
                              </div>
                              <div className="mt-3">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-neutral-600">Progress</span>
                                  <span className="text-neutral-600">{book.progress}%</span>
                                </div>
                                <div className="w-full bg-neutral-200 rounded-full h-1.5">
                                  <div 
                                    className={`h-1.5 rounded-full ${
                                      book.status === 'final' ? 'bg-secondary' :
                                      book.status === 'revision' ? 'bg-accent' :
                                      'bg-primary'
                                    }`}
                                    style={{ width: `${book.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="mt-3 pt-3 border-t border-neutral-200 flex justify-between items-center">
                                <span className="text-xs text-neutral-500">
                                  Last edited: {new Date(book.lastEdited).toLocaleDateString()}
                                </span>
                                <button className="text-primary hover:text-primary-dark">
                                  <Pencil size={16} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 border border-dashed border-neutral-300 rounded-lg">
                            <BookIcon className="h-8 w-8 mx-auto text-neutral-400 mb-2" />
                            <p className="text-sm text-neutral-500">No books added yet</p>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => {
                                setSelectedSeries(seriesItem.id);
                                bookForm.reset({ title: "", position: 1, status: "draft" });
                                setIsCreateBookOpen(true);
                              }}
                            >
                              <PlusIcon className="h-4 w-4 mr-1" />
                              Start Book 1
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full bg-white rounded-xl shadow-card overflow-hidden border border-neutral-200 p-8 text-center">
                <h3 className="text-lg font-medium mb-4">You haven't created any series yet</h3>
                <p className="text-neutral-600 mb-6">Start your writing journey by creating your first book series.</p>
                <Button onClick={() => setIsCreateSeriesOpen(true)}>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Your First Series
                </Button>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="border-t border-neutral-200 pt-6 pb-12 text-neutral-500 text-sm">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div className="mb-4 md:mb-0">
                <p>© 2023 Saga Scribe - The Ultimate Series Author's Companion</p>
                <p className="mt-1">Version 1.0.0</p>
              </div>
              <div className="flex flex-wrap gap-4">
                <a href="#" className="hover:text-primary transition-colors">Help & Support</a>
                <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-primary transition-colors">Contact Us</a>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
