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
import React from 'react';
import { UnifiedWorldMap } from '@/components/world-building/unified-world-map';


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

  // Define types for data
  interface Series {
    id: number;
    title: string;
    description?: string;
  }

  interface Book {
    id: number;
    title: string;
    seriesId: number;
  }

  interface Location {
    id: number;
    name: string;
    description?: string;
    type?: string;
    seriesId: number;
    bookAppearances?: string[];
    keyScenes?: number;
  }

  // Fetch all series for the dropdown
  const { data: series, isLoading: isLoadingSeries } = useQuery<Series[]>({
    queryKey: ['/api/series'],
  });

  // Get books for the selected series
  const { data: books } = useQuery<Book[]>({
    queryKey: ['/api/series', selectedSeries, 'books'],
    enabled: !!selectedSeries,
  });

  // Fetch locations
  const { data: allLocations, isLoading: isLoadingLocations } = useQuery<Location[]>({
    queryKey: ['/api/series', selectedSeries, 'locations'],
    enabled: !!selectedSeries,
  });

  // Filter locations based on search and type filter
  const locations = allLocations
    ? allLocations.filter((location) => {
        const matchesSearch = searchQuery === "" ||
          location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (location.description && location.description.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesType = !selectedType || location.type === selectedType;
        return matchesSearch && matchesType;
      })
    : [];

  // Extract unique location types for filtering
  const locationTypes = allLocations
    ? Array.from(new Set(
      allLocations
        .filter(loc => loc.type)
        .map(loc => loc.type as string)
    ))
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
    <div className="bg-background text-foreground font-sans min-h-screen flex">
      <Sidebar />

      <main className="flex-1 md:ml-64 pt-4 md:pt-0">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          <MobileNav />

          {/* Page header */}
          <header className="md:flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">World Building</h1>
              <p className="text-muted-foreground mt-1">Create and manage locations for your series</p>
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
          <div className="bg-background rounded-lg shadow-sm border border-border p-4 mb-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="series-select" className="block text-sm font-medium text-foreground mb-1">
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
                      series.map((s) => (
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
                <label htmlFor="search" className="block text-sm font-medium text-foreground mb-1">
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
                  <SearchIcon className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
                </div>
              </div>
              <div>
                <label htmlFor="type-filter" className="block text-sm font-medium text-foreground mb-1">
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
                <label htmlFor="world-building-tabs" className="block text-sm font-medium text-foreground mb-1">
                  View
                </label>
                <Tabs
                  defaultValue="atlas"
                  className="w-full"
                  value={activeTab}
                  onValueChange={setActiveTab}
                  id="world-building-tabs"
                >
                  <TabsList className="w-full bg-background border border-input">
                    <TabsTrigger
                      value="atlas"
                      className="flex-1 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
                    >
                      Atlas
                    </TabsTrigger>
                    <TabsTrigger
                      value="list"
                      className="flex-1 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
                    >
                      List
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          {/* World Building Content */}
          {!selectedSeries ? (
            <div className="bg-background rounded-xl shadow-card overflow-hidden border border-border p-8 text-center">
              <MapIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-4 text-foreground">Select a Series to View Locations</h3>
              <p className="text-muted-foreground mb-6">Choose a series from the dropdown above to manage its world.</p>
              {!isLoadingSeries && series && series.length === 0 && (
                <Button asChild>
                  <a href="/series">Create Your First Series</a>
                </Button>
              )}
            </div>
          ) : isLoadingLocations ? (
            <div className="bg-background rounded-xl shadow-card overflow-hidden border border-border p-8 text-center">
              <p className="text-muted-foreground">Loading locations...</p>
            </div>
          ) : (
            <>
              <TabsContent value="atlas" className="mt-0" hidden={activeTab !== "atlas"}>
                <div className="bg-background rounded-lg shadow-md overflow-hidden">
                  <UnifiedWorldMap selectedSeries={selectedSeries} />
                </div>
                {/* Location Cards (rest of the original code) */}
                {locations.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {locations.map((location: any) => (
                      <Card
                        key={location.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow bg-card border-border"
                      >
                        <CardHeader className={`p-4 ${
                          location.type === 'city' || location.type === 'capital' ? 'bg-secondary/10' :
                            location.type === 'forest' || location.type === 'nature' ? 'bg-green-600/10' :
                              location.type === 'castle' || location.type === 'fortress' ? 'bg-accent/10' :
                                'bg-muted'
                        }`}>
                          <div className="flex items-center">
                            <div className={`h-10 w-10 rounded-md flex items-center justify-center text-white mr-3 flex-shrink-0 ${
                              location.type === 'city' || location.type === 'capital' ? 'bg-secondary' :
                                location.type === 'forest' || location.type === 'nature' ? 'bg-green-600' :
                                  location.type === 'castle' || location.type === 'fortress' ? 'bg-accent' :
                                    'bg-muted-foreground'
                            }`}>
                              <MapPinIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <CardTitle className="text-base text-card-foreground">{location.name}</CardTitle>
                              <p className="text-sm text-muted-foreground mt-0">
                                {location.type || "Location"}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4">
                          {location.description && (
                            <p className="text-sm text-muted-foreground mb-3">{location.description}</p>
                          )}
                          <div>
                            <h4 className="text-sm font-medium text-foreground mb-1">Appears In</h4>
                            <div className="flex flex-wrap gap-2">
                              {location.bookAppearances && location.bookAppearances.length > 0 ? (
                                location.bookAppearances.map((bookId: string) => (
                                  <span
                                    key={`${location.id}-${bookId}`}
                                    className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                                  >
                                    Book {bookId}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">No books specified</span>
                              )}
                            </div>
                          </div>
                          <div className="mt-4 pt-3 border-t border-border flex justify-between items-center">
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
                  <div className="bg-background rounded-xl shadow-card overflow-hidden border border-border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead className="bg-muted/50 border-b border-border">
                          <tr>
                            <th className="px-6 py-3 text-sm font-medium text-foreground">Name</th>
                            <th className="px-6 py-3 text-sm font-medium text-foreground">Type</th>
                            <th className="px-6 py-3 text-sm font-medium text-foreground">Description</th>
                            <th className="px-6 py-3 text-sm font-medium text-foreground">Appearances</th>
                            <th className="px-6 py-3 text-sm font-medium text-foreground">Key Scenes</th>
                            <th className="px-6 py-3 text-sm font-medium text-foreground text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {locations.map((location: any) => (
                            <tr key={location.id} className="hover:bg-muted/50">
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <div className={`h-8 w-8 rounded-md flex items-center justify-center text-white mr-3 flex-shrink-0 ${
                                    location.type === 'city' || location.type === 'capital' ? 'bg-secondary' :
                                      location.type === 'forest' || location.type === 'nature' ? 'bg-green-600' :
                                        location.type === 'castle' || location.type === 'fortress' ? 'bg-accent' :
                                          'bg-muted-foreground'
                                  }`}>
                                    <MapPinIcon className="h-4 w-4" />
                                  </div>
                                  <span className="font-medium text-foreground">{location.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  location.type === 'city' || location.type === 'capital' ? 'bg-secondary/10 text-secondary' :
                                    location.type === 'forest' || location.type === 'nature' ? 'bg-green-600/10 text-green-700' :
                                      location.type === 'castle' || location.type === 'fortress' ? 'bg-accent/10 text-accent' :
                                        'bg-muted text-muted-foreground'
                                }`}>
                                  {location.type || "Location"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-muted-foreground max-w-xs truncate">
                                {location.description || "-"}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1">
                                  {location.bookAppearances && location.bookAppearances.length > 0 ? (
                                    location.bookAppearances.map((bookId: string) => (
                                      <span
                                        key={`${location.id}-${bookId}`}
                                        className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground"
                                      >
                                        Book {bookId}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-muted-foreground">-</span>
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
                  <div className="bg-background rounded-xl shadow-card overflow-hidden border border-border p-8 text-center">
                    <MapPinIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-4 text-foreground">No Locations Found</h3>
                    <p className="text-muted-foreground mb-6">
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
          <footer className="border-t border-border pt-6 pb-12 text-muted-foreground text-sm mt-12">
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