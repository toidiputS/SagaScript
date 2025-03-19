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
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusIcon, Calendar, Clock, AlertCircle, Award } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const timelineEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.string().optional(),
  seriesId: z.coerce.number().min(1, "Series is required"),
  bookId: z.coerce.number().optional(),
  characters: z.array(z.coerce.number()).default([]),
  locations: z.array(z.coerce.number()).default([]),
});

type TimelineEventFormValues = z.infer<typeof timelineEventSchema>;

export default function Timeline() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("key-events");

  // Fetch all series for the dropdown
  const { data: series, isLoading: isLoadingSeries } = useQuery({
    queryKey: ['/api/series'],
  });

  // Get books for the selected series
  const { data: books } = useQuery({
    queryKey: ['/api/series', selectedSeries, 'books'],
    enabled: !!selectedSeries,
  });

  // Get characters for the selected series
  const { data: characters } = useQuery({
    queryKey: ['/api/series', selectedSeries, 'characters'],
    enabled: !!selectedSeries,
  });

  // Get locations for the selected series
  const { data: locations } = useQuery({
    queryKey: ['/api/series', selectedSeries, 'locations'],
    enabled: !!selectedSeries,
  });

  // Fetch timeline events
  const { data: timelineEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['/api/series', selectedSeries, 'timeline'],
    enabled: !!selectedSeries,
  });

  // Filter events based on book and type
  const filteredEvents = timelineEvents
    ? timelineEvents.filter((event: any) => {
        // Filter by book if selected
        const matchesBook = !selectedBook || event.bookId === selectedBook;
        
        // Filter by type (key-events, character-arcs, etc)
        // This would need more detailed logic in a real app
        return matchesBook;
      })
    : [];

  // Create timeline event mutation
  const createEventMutation = useMutation({
    mutationFn: (data: TimelineEventFormValues) =>
      apiRequest("POST", `/api/series/${data.seriesId}/timeline`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', selectedSeries, 'timeline'] });
      toast({
        title: "Success",
        description: "Timeline event created successfully",
      });
      setIsCreateEventOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create timeline event",
        variant: "destructive",
      });
    },
  });

  // Form for creating a new timeline event
  const form = useForm<TimelineEventFormValues>({
    resolver: zodResolver(timelineEventSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      seriesId: selectedSeries || undefined,
      bookId: undefined,
      characters: [],
      locations: [],
    },
  });

  const onSubmit = (data: TimelineEventFormValues) => {
    createEventMutation.mutate(data);
  };

  // Handle series selection
  const handleSeriesChange = (value: string) => {
    const seriesId = parseInt(value);
    setSelectedSeries(seriesId);
    form.setValue("seriesId", seriesId);
    setSelectedBook(null);
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
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">Timeline</h1>
              <p className="text-neutral-600 mt-1">Track important events in your series</p>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <Dialog open={isCreateEventOpen} onOpenChange={setIsCreateEventOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    New Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create Timeline Event</DialogTitle>
                    <DialogDescription>
                      Add a new event to your series timeline.
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
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Title</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter event title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="e.g. Year 1298 or Jan 5" 
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
                          name="bookId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Book</FormLabel>
                              <Select 
                                onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} 
                                value={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a book" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="">Not specific to a book</SelectItem>
                                  {books?.map((book: any) => (
                                    <SelectItem key={book.id} value={book.id.toString()}>
                                      Book {book.position}: {book.title}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Describe the event and its significance" 
                                {...field} 
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      {characters && characters.length > 0 && (
                        <FormField
                          control={form.control}
                          name="characters"
                          render={() => (
                            <FormItem>
                              <FormLabel>Characters Involved</FormLabel>
                              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                                {characters.map((character: any) => (
                                  <div key={character.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`character-${character.id}`}
                                      onCheckedChange={(checked) => {
                                        const current = form.getValues("characters") || [];
                                        const characterId = character.id;
                                        
                                        if (checked) {
                                          form.setValue("characters", [...current, characterId]);
                                        } else {
                                          form.setValue(
                                            "characters",
                                            current.filter((id) => id !== characterId)
                                          );
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={`character-${character.id}`}
                                      className="text-sm font-medium leading-none truncate peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {character.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      {locations && locations.length > 0 && (
                        <FormField
                          control={form.control}
                          name="locations"
                          render={() => (
                            <FormItem>
                              <FormLabel>Locations</FormLabel>
                              <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                                {locations.map((location: any) => (
                                  <div key={location.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`location-${location.id}`}
                                      onCheckedChange={(checked) => {
                                        const current = form.getValues("locations") || [];
                                        const locationId = location.id;
                                        
                                        if (checked) {
                                          form.setValue("locations", [...current, locationId]);
                                        } else {
                                          form.setValue(
                                            "locations",
                                            current.filter((id) => id !== locationId)
                                          );
                                        }
                                      }}
                                    />
                                    <label
                                      htmlFor={`location-${location.id}`}
                                      className="text-sm font-medium leading-none truncate peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      {location.name}
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
                          disabled={createEventMutation.isPending}
                        >
                          {createEventMutation.isPending ? "Creating..." : "Create Event"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          {/* Series & Book Selector */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 mb-6">
            <div className="grid md:grid-cols-3 gap-4">
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
                <label htmlFor="book-select" className="block text-sm font-medium text-neutral-700 mb-1">
                  Filter by Book
                </label>
                <Select 
                  onValueChange={(value) => setSelectedBook(value ? parseInt(value) : null)}
                  value={selectedBook?.toString() || ""}
                >
                  <SelectTrigger id="book-select" className="w-full">
                    <SelectValue placeholder="All Books" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Books</SelectItem>
                    {books?.map((book: any) => (
                      <SelectItem key={book.id} value={book.id.toString()}>
                        Book {book.position}: {book.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Event Type
                </label>
                <div className="flex space-x-2">
                  <Button 
                    variant={activeFilter === "key-events" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setActiveFilter("key-events")}
                  >
                    Key Events
                  </Button>
                  <Button 
                    variant={activeFilter === "character-arcs" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setActiveFilter("character-arcs")}
                  >
                    Character Arcs
                  </Button>
                  <Button 
                    variant={activeFilter === "plot-lines" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setActiveFilter("plot-lines")}
                  >
                    Plot Lines
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Content */}
          {!selectedSeries ? (
            <div className="bg-white rounded-xl shadow-card overflow-hidden border border-neutral-200 p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-neutral-300 mb-4" />
              <h3 className="text-lg font-medium mb-4">Select a Series to View Timeline</h3>
              <p className="text-neutral-600 mb-6">Choose a series from the dropdown above to manage its timeline.</p>
              {!isLoadingSeries && series && series.length === 0 && (
                <Button asChild>
                  <a href="/series">Create Your First Series</a>
                </Button>
              )}
            </div>
          ) : isLoadingEvents ? (
            <div className="bg-white rounded-xl shadow-card overflow-hidden border border-neutral-200 p-8 text-center">
              <p>Loading timeline events...</p>
            </div>
          ) : (
            <Card className="border border-neutral-200 shadow-card">
              <CardContent className="p-5">
                <div className="mb-4 flex justify-between items-center">
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant={activeFilter === "key-events" ? "default" : "outline"}
                      onClick={() => setActiveFilter("key-events")}
                    >
                      Key Events
                    </Button>
                    <Button 
                      size="sm" 
                      variant={activeFilter === "character-arcs" ? "default" : "outline"}
                      onClick={() => setActiveFilter("character-arcs")}
                    >
                      Character Arcs
                    </Button>
                    <Button 
                      size="sm" 
                      variant={activeFilter === "plot-lines" ? "default" : "outline"}
                      onClick={() => setActiveFilter("plot-lines")}
                    >
                      Plot Lines
                    </Button>
                  </div>
                  <div className="text-sm text-neutral-500">
                    {filteredEvents.length > 0 && (
                      <div>
                        Showing: <span className="font-medium text-neutral-800">
                          {filteredEvents[0].date} — {filteredEvents[filteredEvents.length - 1].date}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline visualization */}
                <div className="relative h-48 overflow-x-auto border-y border-neutral-200 py-4 mb-4">
                  {/* Timeline tracker line */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-200 transform -translate-y-1/2"></div>
                  
                  {filteredEvents.length > 0 ? (
                    <div className="absolute top-0 left-0 right-0 bottom-0">
                      {/* Year markers - would be dynamically generated */}
                      <div className="absolute bottom-0 left-[5%] text-xs text-neutral-500">
                        {filteredEvents[0]?.date || "Start"}
                      </div>
                      <div className="absolute bottom-0 left-[50%] text-xs text-neutral-500">
                        {filteredEvents[Math.floor(filteredEvents.length / 2)]?.date || "Middle"}
                      </div>
                      <div className="absolute bottom-0 left-[95%] text-xs text-neutral-500">
                        {filteredEvents[filteredEvents.length - 1]?.date || "End"}
                      </div>
                      
                      {/* Event markers - would be dynamically positioned */}
                      {filteredEvents.map((event: any, index: number) => {
                        // Calculate position - this is simplified, would be more complex with real timeline data
                        const left = 5 + (index / (filteredEvents.length - 1 || 1)) * 90;
                        const top = index % 2 === 0 ? 15 : 60;
                        
                        return (
                          <div 
                            key={event.id} 
                            className="absolute" 
                            style={{ top: `${top}%`, left: `${left}%` }}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md ${
                              index % 3 === 0 ? 'bg-primary' : 
                              index % 3 === 1 ? 'bg-accent' : 
                              'bg-secondary'
                            }`}></div>
                            <div className={`absolute ${top < 50 ? 'top-full mt-2' : 'bottom-full mb-2'} left-1/2 transform -translate-x-1/2 bg-white p-2 rounded shadow-md w-max max-w-[150px] z-10`}>
                              <h4 className="text-xs font-medium">{event.title}</h4>
                              <p className="text-xs text-neutral-500">{event.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-neutral-500 mb-2">No timeline events found</p>
                      <Button size="sm" onClick={() => setIsCreateEventOpen(true)}>
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Add First Event
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="mt-2 pt-4 flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">{filteredEvents.length} Events</span>
                    <span className="text-neutral-500"> across the timeline</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-primary" 
                    onClick={() => setIsCreateEventOpen(true)}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add New Event
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Events List */}
          {selectedSeries && filteredEvents && filteredEvents.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-heading font-semibold text-neutral-800 mb-4">Timeline Events</h2>
              <div className="bg-white rounded-lg shadow-card border border-neutral-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="px-6 py-3 text-sm font-medium text-neutral-700">Event</th>
                        <th className="px-6 py-3 text-sm font-medium text-neutral-700">Date</th>
                        <th className="px-6 py-3 text-sm font-medium text-neutral-700">Book</th>
                        <th className="px-6 py-3 text-sm font-medium text-neutral-700">Characters</th>
                        <th className="px-6 py-3 text-sm font-medium text-neutral-700">Locations</th>
                        <th className="px-6 py-3 text-sm font-medium text-neutral-700 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200">
                      {filteredEvents.map((event: any, index: number) => {
                        // Find book name
                        const book = books?.find((b: any) => b.id === event.bookId);
                        
                        // Get character names
                        const eventCharacters = event.characters
                          .map((charId: number) => characters?.find((c: any) => c.id === charId)?.name)
                          .filter(Boolean);
                          
                        // Get location names
                        const eventLocations = event.locations
                          .map((locId: number) => locations?.find((l: any) => l.id === locId)?.name)
                          .filter(Boolean);
                        
                        return (
                          <tr key={event.id} className="hover:bg-neutral-50">
                            <td className="px-6 py-4">
                              <div className="flex items-start">
                                <div className={`h-6 w-6 rounded-full ${
                                  index % 3 === 0 ? 'bg-primary' : 
                                  index % 3 === 1 ? 'bg-accent' : 
                                  'bg-secondary'
                                } flex items-center justify-center text-white mr-3 flex-shrink-0 mt-0.5`}>
                                  {index % 3 === 0 ? <Award className="h-3 w-3" /> : 
                                   index % 3 === 1 ? <AlertCircle className="h-3 w-3" /> : 
                                   <Clock className="h-3 w-3" />}
                                </div>
                                <div>
                                  <p className="font-medium">{event.title}</p>
                                  <p className="text-sm text-neutral-600 line-clamp-1">{event.description}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-neutral-600">{event.date || "—"}</span>
                            </td>
                            <td className="px-6 py-4">
                              {book ? (
                                <span className="text-xs bg-neutral-100 px-2 py-0.5 rounded-full text-neutral-700">
                                  Book {book.position}: {book.title}
                                </span>
                              ) : (
                                <span className="text-sm text-neutral-500">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {eventCharacters.length > 0 ? (
                                  eventCharacters.map((name: string, i: number) => (
                                    <span 
                                      key={`${event.id}-char-${i}`}
                                      className="text-xs bg-primary/10 px-2 py-0.5 rounded-full text-primary"
                                    >
                                      {name}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-neutral-500">—</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-1">
                                {eventLocations.length > 0 ? (
                                  eventLocations.map((name: string, i: number) => (
                                    <span 
                                      key={`${event.id}-loc-${i}`}
                                      className="text-xs bg-secondary/10 px-2 py-0.5 rounded-full text-secondary"
                                    >
                                      {name}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-neutral-500">—</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <Button variant="ghost" size="sm">Edit</Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
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
