import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon, MapPinIcon, SearchIcon, MapIcon, Settings2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const locationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.string().optional(),
  seriesId: z.coerce.number().min(1, "Series is required"),
  bookAppearances: z.array(z.string()).default([]),
});

type LocationFormValues = z.infer<typeof locationSchema>;

export default function WorldBuilding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateLocationOpen, setIsCreateLocationOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("atlas");

  // Fetch all series for the dropdown
  const { data: series, isLoading: isLoadingSeries } = useQuery({
    queryKey: ['/api/series'],
  });

  // Get books for the selected series
  const { data: books } = useQuery({
    queryKey: ['/api/series', selectedSeries, 'books'],
    enabled: !!selectedSeries,
  });

  // Fetch locations
  const { data: allLocations, isLoading: isLoadingLocations } = useQuery({
    queryKey: ['/api/series', selectedSeries, 'locations'],
    enabled: !!selectedSeries,
  });

  // Filter locations based on search and type filter
  const locations = allLocations
    ? allLocations.filter((location: any) => {
        const matchesSearch = searchQuery === "" || 
          location.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          (location.description && location.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = !selectedType || location.type === selectedType;
        return matchesSearch && matchesType;
      })
    : [];

  // Extract unique location types for filtering
  const locationTypes = allLocations
    ? [...new Set(allLocations.map((loc: any) => loc.type).filter(Boolean))]
    : [];

  // Create location mutation
  const createLocationMutation = useMutation({
    mutationFn: (data: LocationFormValues) =>
      apiRequest("POST", `/api/series/${data.seriesId}/locations`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', selectedSeries, 'locations'] });
      toast({
        title: "Success",
        description: "Location created successfully",
      });
      setIsCreateLocationOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create location",
        variant: "destructive",
      });
    },
  });

  // Form for creating a new location
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: "",
      description: "",
      type: "",
      seriesId: selectedSeries || undefined,
      bookAppearances: [],
    },
  });

  const onSubmit = (data: LocationFormValues) => {
    createLocationMutation.mutate(data);
  };

  // Handle series selection
  const handleSeriesChange = (value: string) => {
    const seriesId = parseInt(value);
    setSelectedSeries(seriesId);
    form.setValue("seriesId", seriesId);
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
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">World Building</h1>
              <p className="text-neutral-600 mt-1">Create and manage locations for your series</p>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <Dialog open={isCreateLocationOpen} onOpenChange={setIsCreateLocationOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    New Location
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create New Location</DialogTitle>
                    <DialogDescription>
                      Add a new location to your series.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="seriesId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Series</FormLabel>
                            <Select 
                              onValueChange={(value) => handleSeriesChange(value)} 
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a series" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {series?.map((s: any) => (
                                  <SelectItem key={s.id} value={s.id.toString()}>
                                    {s.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter location name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location Type</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g. City, Forest, Castle" 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the location and its significance" 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {books && books.length > 0 && (
                        <FormField
                          control={form.control}
                          name="bookAppearances"
                          render={() => (
                            <FormItem>
                              <FormLabel>Appears in Books</FormLabel>
                              <div className="space-y-2">
                                {books.map((book: any) => (
                                  <div key={book.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`book-${book.id}`}
                                      onCheckedChange={(checked) => {
                                        const current = form.getValues("bookAppearances") || [];
                                        const bookId = book.id.toString();
                                        
                                        if (checked) {
                                          form.setValue("bookAppearances", [...current, bookId]);
                                        } else {
                                          form.setValue(
                                            "bookAppearances",
                                            current.filter((id) => id !== bookId)
                                          );
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={`book-${book.id}`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Book {book.position}: {book.title}
                                    </label>
                                  </div>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      <DialogFooter>
                        <Button 
                          type="submit" 
                          disabled={createLocationMutation.isPending}
                        >
                          {createLocationMutation.isPending ? "Creating..." : "Create Location"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          {/* Series Selector and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 mb-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="series-select" className="block text-sm font-medium text-neutral-700 mb-1">
                  Select Series
                </label>
                <Select 
                  onValueChange={(value) => setSelectedSeries(parseInt(value))}
                  value={selectedSeries?.toString()}
                >
                  <SelectTrigger id="series-select" className="w-full">
                    <SelectValue placeholder="Choose a series" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingSeries ? (
                      <SelectItem value="loading" disabled>Loading series...</SelectItem>
                    ) : series && series.length > 0 ? (
                      series.map((s: any) => (
                        <SelectItem key={s.id} value={s.id.toString()}>
                          {s.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No series available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-neutral-700 mb-1">
                  Search Locations
                </label>
                <div className="relative">
                  <Input
                    id="search"
                    placeholder="Search by name or description"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <SearchIcon className="h-4 w-4 absolute left-3 top-3 text-neutral-400" />
                </div>
              </div>
              <div>
                <label htmlFor="type-filter" className="block text-sm font-medium text-neutral-700 mb-1">
                  Filter by Type
                </label>
                <Select 
                  onValueChange={(value) => setSelectedType(value === "all" ? null : value)}
                  value={selectedType || "all"}
                >
                  <SelectTrigger id="type-filter" className="w-full">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {locationTypes.map((type: string) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="world-building-tabs" className="block text-sm font-medium text-neutral-700 mb-1">
                  View
                </label>
                <Tabs 
                  defaultValue="atlas" 
                  className="w-full" 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                  id="world-building-tabs"
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="atlas" className="flex-1">Atlas</TabsTrigger>
                    <TabsTrigger value="list" className="flex-1">List</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          {/* World Building Content */}
          {!selectedSeries ? (
            <div className="bg-white rounded-xl shadow-card overflow-hidden border border-neutral-200 p-8 text-center">
              <MapIcon className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
              <h3 className="text-lg font-medium mb-4">Select a Series to View Locations</h3>
              <p className="text-neutral-600 mb-6">Choose a series from the dropdown above to manage its world.</p>
              {!isLoadingSeries && series && series.length === 0 && (
                <Button asChild>
                  <a href="/series">Create Your First Series</a>
                </Button>
              )}
            </div>
          ) : isLoadingLocations ? (
            <div className="bg-white rounded-xl shadow-card overflow-hidden border border-neutral-200 p-8 text-center">
              <p>Loading locations...</p>
            </div>
          ) : (
            <>
              <TabsContent value="atlas" className="mt-0" hidden={activeTab !== "atlas"}>
                {/* World Map Preview */}
                <div className="bg-white rounded-lg shadow-card border border-neutral-200 p-4 mb-6 hover:shadow-card-hover transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium">
                      {series?.find((s: any) => s.id === selectedSeries)?.title} - World Map
                    </h3>
                    <button className="text-neutral-400 hover:text-primary">
                      <Settings2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="bg-neutral-100 rounded-md h-64 flex items-center justify-center relative overflow-hidden">
                    {locations.length > 0 ? (
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-800/30 flex items-end">
                        <div className="p-3 w-full">
                          <div className="flex justify-between items-center">
                            <span className="text-white text-xs font-medium">{locations.length} Locations</span>
                            <button className="bg-white/20 backdrop-blur-sm text-white rounded p-1 hover:bg-white/30 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 011.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 011.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center">
                        <MapIcon className="h-10 w-10 text-neutral-300 mb-2" />
                        <h3 className="text-neutral-600 font-medium mb-2">No Locations Created Yet</h3>
                        <p className="text-neutral-500 text-sm mb-3">Add locations to start building your world map</p>
                        <Button size="sm" onClick={() => setIsCreateLocationOpen(true)}>
                          <PlusIcon className="h-4 w-4 mr-1" />
                          Add First Location
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location Cards */}
                {locations.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {locations.map((location: any) => (
                      <Card 
                        key={location.id} 
                        className="overflow-hidden hover:shadow-lg transition-shadow"
                      >
                        <CardHeader className={`p-4 ${
                          location.type === 'city' || location.type === 'capital' ? 'bg-secondary/10' :
                          location.type === 'forest' || location.type === 'nature' ? 'bg-green-100' :
                          location.type === 'castle' || location.type === 'fortress' ? 'bg-accent/10' :
                          'bg-neutral-100'
                        }`}>
                          <div className="flex items-center">
                            <div className={`h-10 w-10 rounded-md flex items-center justify-center text-white mr-3 flex-shrink-0 ${
                              location.type === 'city' || location.type === 'capital' ? 'bg-secondary' :
                              location.type === 'forest' || location.type === 'nature' ? 'bg-green-600' :
                              location.type === 'castle' || location.type === 'fortress' ? 'bg-accent' :
                              'bg-neutral-500'
                            }`}>
                              <MapPinIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{location.name}</CardTitle>
                              <p className="text-sm text-neutral-600 mt-0">
                                {location.type || "Location"}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          {location.description && (
                            <p className="text-sm text-neutral-600 mb-3">{location.description}</p>
                          )}
                          <div>
                            <h4 className="text-sm font-medium text-neutral-700 mb-1">Appears In</h4>
                            <div className="flex flex-wrap gap-2">
                              {location.bookAppearances && location.bookAppearances.length > 0 ? (
                                location.bookAppearances.map((bookId: string) => (
                                  <span 
                                    key={`${location.id}-${bookId}`}
                                    className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-600"
                                  >
                                    Book {bookId}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-neutral-500">No books specified</span>
                              )}
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-neutral-200 flex justify-between items-center">
                            <span className="text-xs bg-secondary/10 px-2 py-0.5 rounded-full text-secondary">
                              {location.keyScenes || 0} Key Scenes
                            </span>
                            <Button variant="ghost" size="sm">Edit</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="list" className="mt-0" hidden={activeTab !== "list"}>
                {locations.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-card overflow-hidden border border-neutral-200">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-neutral-50 border-b border-neutral-200">
                          <tr>
                            <th className="px-6 py-3 text-sm font-medium text-neutral-700">Name</th>
                            <th className="px-6 py-3 text-sm font-medium text-neutral-700">Type</th>
                            <th className="px-6 py-3 text-sm font-medium text-neutral-700">Description</th>
                            <th className="px-6 py-3 text-sm font-medium text-neutral-700">Appearances</th>
                            <th className="px-6 py-3 text-sm font-medium text-neutral-700">Key Scenes</th>
                            <th className="px-6 py-3 text-sm font-medium text-neutral-700 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                          {locations.map((location: any) => (
                            <tr key={location.id} className="hover:bg-neutral-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className={`h-8 w-8 rounded-md flex items-center justify-center text-white mr-3 flex-shrink-0 ${
                                    location.type === 'city' || location.type === 'capital' ? 'bg-secondary' :
                                    location.type === 'forest' || location.type === 'nature' ? 'bg-green-600' :
                                    location.type === 'castle' || location.type === 'fortress' ? 'bg-accent' :
                                    'bg-neutral-500'
                                  }`}>
                                    <MapPinIcon className="h-4 w-4" />
                                  </div>
                                  <span className="font-medium">{location.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  location.type === 'city' || location.type === 'capital' ? 'bg-secondary/10 text-secondary' :
                                  location.type === 'forest' || location.type === 'nature' ? 'bg-green-100 text-green-700' :
                                  location.type === 'castle' || location.type === 'fortress' ? 'bg-accent/10 text-accent' :
                                  'bg-neutral-100 text-neutral-600'
                                }`}>
                                  {location.type || "Location"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-neutral-600 max-w-xs truncate">
                                {location.description || "-"}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {location.bookAppearances && location.bookAppearances.length > 0 ? (
                                    location.bookAppearances.map((bookId: string) => (
                                      <span 
                                        key={`${location.id}-${bookId}`}
                                        className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-600"
                                      >
                                        Book {bookId}
                                      </span>
                                    ))
                                  ) : (
                                    "-"
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-xs bg-secondary/10 px-2 py-0.5 rounded-full text-secondary">
                                  {location.keyScenes || 0}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <Button variant="ghost" size="sm">Edit</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-card overflow-hidden border border-neutral-200 p-8 text-center">
                    <MapPinIcon className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
                    <h3 className="text-lg font-medium mb-4">No Locations Found</h3>
                    <p className="text-neutral-600 mb-6">
                      {searchQuery || selectedType
                        ? "No locations match your search criteria."
                        : "This series doesn't have any locations yet."}
                    </p>
                    <Button onClick={() => setIsCreateLocationOpen(true)}>
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Create Location
                    </Button>
                  </div>
                )}
              </TabsContent>
            </>
          )}

          {/* Footer */}
          <footer className="border-t border-neutral-200 pt-6 pb-12 text-neutral-500 text-sm mt-12">
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
