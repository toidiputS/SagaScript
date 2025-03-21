import { useState } from "react";
import { useSeries } from "@/hooks/use-series";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Character, Location, TimelineEvent } from "@shared/schema";
import TimelineEventCard from "@/components/timeline/timeline-event-card";
import TimelineEventDialog from "@/components/timeline/timeline-event-dialog";
import TimelineDragAndDrop from "@/components/timeline/timeline-drag-and-drop";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, GripVertical } from "lucide-react";

export default function TimelinePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { allSeries, currentSeries, changeCurrentSeries } = useSeries();
  const [viewMode, setViewMode] = useState<"chronological" | "narrative" | "character">("chronological");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | undefined>(undefined);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(null);

  // Fetch books for current series
  const { data: books, isLoading: isLoadingBooks } = useQuery({
    queryKey: ['/api/series', currentSeries?.id, 'books'],
    queryFn: async () => {
      if (!currentSeries) return [];
      const res = await apiRequest('GET', `/api/series/${currentSeries.id}/books`);
      return res.json() as Promise<Book[]>;
    },
    enabled: !!currentSeries
  });

  // Fetch timeline events for current series
  const { data: timelineEvents, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['/api/series', currentSeries?.id, 'timeline'],
    queryFn: async () => {
      if (!currentSeries) return [];
      const res = await apiRequest('GET', `/api/series/${currentSeries.id}/timeline`);
      return res.json() as Promise<TimelineEvent[]>;
    },
    enabled: !!currentSeries
  });

  // Fetch characters for character-based view
  const { data: characters, isLoading: isLoadingCharacters } = useQuery({
    queryKey: ['/api/series', currentSeries?.id, 'characters'],
    queryFn: async () => {
      if (!currentSeries) return [];
      const res = await apiRequest('GET', `/api/series/${currentSeries.id}/characters`);
      return res.json() as Promise<Character[]>;
    },
    enabled: !!currentSeries && viewMode === "character"
  });

  // Fetch character-specific timeline if a character is selected
  const { data: characterEvents } = useQuery({
    queryKey: ['/api/characters', selectedCharacterId, 'timeline'],
    queryFn: async () => {
      if (!selectedCharacterId) return [];
      const res = await apiRequest('GET', `/api/characters/${selectedCharacterId}/timeline`);
      return res.json() as Promise<TimelineEvent[]>;
    },
    enabled: !!selectedCharacterId && viewMode === "character"
  });

  // Fetch locations for the timeline event dialog
  const { data: locations } = useQuery({
    queryKey: ['/api/series', currentSeries?.id, 'locations'],
    queryFn: async () => {
      if (!currentSeries) return [];
      try {
        const res = await apiRequest('GET', `/api/series/${currentSeries.id}/locations`);
        return res.json() as Promise<Location[]>;
      } catch (error) {
        // Locations might not be implemented yet, return empty array
        return [];
      }
    },
    enabled: !!currentSeries && isDialogOpen
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const res = await apiRequest('DELETE', `/api/timeline-events/${eventId}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', currentSeries?.id, 'timeline'] });
      if (selectedCharacterId) {
        queryClient.invalidateQueries({ queryKey: ['/api/characters', selectedCharacterId, 'timeline'] });
      }
      toast({
        title: "Event deleted",
        description: "The timeline event has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete timeline event: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Reorder mutation for drag-and-drop
  const reorderMutation = useMutation({
    mutationFn: async (events: { id: number, position: number }[]) => {
      const res = await apiRequest('POST', '/api/timeline-events/reorder', { events });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', currentSeries?.id, 'timeline'] });
      toast({
        title: "Timeline updated",
        description: "Event order has been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to reorder events: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle series selection change
  const handleSeriesChange = (seriesId: string) => {
    changeCurrentSeries(parseInt(seriesId));
    setSelectedCharacterId(null);
  };

  // Handle adding a new event
  const handleAddEvent = () => {
    setSelectedEvent(undefined);
    setDialogMode("create");
    setIsDialogOpen(true);
  };

  // Handle editing an event
  const handleEditEvent = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setDialogMode("edit");
    setIsDialogOpen(true);
  };

  // Handle deleting an event
  const handleDeleteEvent = (eventId: number) => {
    if (confirm("Are you sure you want to delete this timeline event?")) {
      deleteMutation.mutate(eventId);
    }
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedEvent(undefined);
  };

  // Handle character selection for character-based view
  const handleCharacterChange = (characterId: string) => {
    setSelectedCharacterId(characterId ? parseInt(characterId) : null);
  };

  // Handle timeline event reordering
  const handleEventReorder = (reorderedEvents: TimelineEvent[]) => {
    // Prepare events for the API - just need id and position
    const events = reorderedEvents.map((event, index) => ({
      id: event.id,
      position: index + 1
    }));
    
    // Send the updated positions to the server
    reorderMutation.mutate(events);
  };

  // Get events based on current view mode
  const getEventsToDisplay = () => {
    if (viewMode === "character" && selectedCharacterId && characterEvents) {
      return characterEvents;
    }
    return timelineEvents || [];
  };

  // Sort events based on view mode
  const getSortedEvents = () => {
    const events = getEventsToDisplay();
    if (!events || events.length === 0) return [];

    switch (viewMode) {
      case "chronological":
        return [...events].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
      case "narrative":
        return [...events].sort((a, b) => a.position - b.position);
      case "character":
        return events; // Already filtered by character
      default:
        return events;
    }
  };

  // Group events by book for narrative view
  const groupEventsByBook = () => {
    const events = getSortedEvents();
    const grouped: Record<number, TimelineEvent[]> = {};
    
    events.forEach(event => {
      const bookId = event.bookId || 0; // Group null/undefined bookId as 0
      if (!grouped[bookId]) {
        grouped[bookId] = [];
      }
      grouped[bookId].push(event);
    });
    
    return grouped;
  };

  // Organize events by book for display
  const getBookEvents = () => {
    const groupedEvents = groupEventsByBook();
    const result: {book: Book | null, events: TimelineEvent[]}[] = [];
    
    // Add events with no associated book first
    if (groupedEvents[0]) {
      result.push({
        book: null,
        events: groupedEvents[0]
      });
    }
    
    // Add events grouped by book
    books?.forEach(book => {
      if (groupedEvents[book.id]) {
        result.push({
          book,
          events: groupedEvents[book.id]
        });
      }
    });
    
    return result;
  };

  // Loading state
  const isLoading = isLoadingBooks || isLoadingEvents || 
    (viewMode === "character" && isLoadingCharacters);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Timeline Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-neutral-800">Timeline</h1>
            <p className="text-neutral-600 mt-1">Chart the chronology of your story</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            {allSeries && allSeries.length > 0 && (
              <Select 
                value={currentSeries?.id?.toString()} 
                onValueChange={handleSeriesChange}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select series" />
                </SelectTrigger>
                <SelectContent>
                  {allSeries.map((series) => (
                    <SelectItem key={series.id} value={series.id.toString()}>
                      {series.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <Button 
              onClick={handleAddEvent}
              disabled={!currentSeries}
              className="bg-primary hover:bg-primary-dark text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Add Event</span>
            </Button>
          </div>
        </div>

        {/* Timeline view options */}
        <div className="border-b border-neutral-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 pb-4">
            <Tabs 
              defaultValue="chronological"
              value={viewMode}
              onValueChange={(value) => setViewMode(value as any)}
            >
              <TabsList className="flex">
                <TabsTrigger value="chronological" className="px-4 py-2">Chronological</TabsTrigger>
                <TabsTrigger value="narrative" className="px-4 py-2">Narrative</TabsTrigger>
                <TabsTrigger value="character" className="px-4 py-2">Character-Based</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Character selector shown only when in character view mode */}
            {viewMode === "character" && characters && characters.length > 0 && (
              <Select value={selectedCharacterId?.toString() || ""} onValueChange={handleCharacterChange}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select character" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Characters</SelectItem>
                  {characters.map((character) => (
                    <SelectItem key={character.id} value={character.id.toString()}>
                      {character.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Timeline Content */}
        {!currentSeries ? (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
            <div className="text-neutral-500 mb-4">
              <i className="ri-time-line text-4xl"></i>
            </div>
            <h3 className="text-lg font-medium mb-2">No Series Selected</h3>
            <p className="text-neutral-600 mb-4">Please select a series to view its timeline</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : timelineEvents && timelineEvents.length > 0 ? (
          <div className="relative">
            {/* Chronological or Character view */}
            {(viewMode === "chronological" || viewMode === "character") && (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-[150px] top-0 bottom-0 w-0.5 bg-neutral-200 z-0"></div>

                {/* Timeline events */}
                <div className="relative z-10 space-y-8">
                  {getSortedEvents().map((event) => (
                    <div key={event.id} className="relative">
                      <div className="flex">
                        <div className="w-[150px] pr-8 pt-2 font-medium text-neutral-700 text-right">
                          {event.date || "Undated"}
                        </div>
                        <div className="flex-grow pl-8">
                          <div className="absolute left-[150px] w-3 h-3 rounded-full bg-primary -ml-1.5 mt-3"></div>
                          <div className="mb-6">
                            <TimelineEventCard 
                              event={event} 
                              onEdit={handleEditEvent} 
                              onDelete={handleDeleteEvent} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Narrative view (grouped by book) */}
            {viewMode === "narrative" && (
              <div className="relative">
                {/* Drag-and-drop instructions for narrative view */}
                <div className="text-sm bg-amber-50 border border-amber-200 rounded-md p-3 mb-6 flex items-center">
                  <GripVertical className="h-5 w-5 mr-2 text-amber-500" />
                  <div>
                    <span className="font-medium">Drag & Drop Enabled:</span> In Narrative view, you can reorder events by dragging them to arrange your story's flow.
                    Events will maintain their positions when you return to this view.
                  </div>
                </div>
                
                {/* Timeline line */}
                <div className="absolute left-[150px] top-0 bottom-0 w-0.5 bg-neutral-200 z-0"></div>

                {/* Timeline events grouped by book */}
                <div className="relative z-10 space-y-12">
                  {getBookEvents().map((bookGroup, index) => (
                    <div key={bookGroup.book?.id || `no-book-${index}`} className="relative">
                      <div className="flex">
                        <div className="w-[150px] pr-8 pt-2 font-medium text-neutral-700 text-right">
                          {bookGroup.book 
                            ? `Book ${bookGroup.book.position}: ${bookGroup.book.title}` 
                            : "General Events"}
                        </div>
                        <div className="flex-grow pl-8">
                          <div className="absolute left-[150px] w-3 h-3 rounded-full bg-primary -ml-1.5 mt-3"></div>
                          
                          {bookGroup.book && (
                            <Card className="mb-6">
                              <CardHeader className="pb-2">
                                <CardTitle>{bookGroup.book.title}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm text-neutral-600 mb-3">
                                  {bookGroup.book.description || "No description provided"}
                                </p>
                                <div className="text-xs text-neutral-500">
                                  Status: {bookGroup.book.status === "completed" ? "Completed" : "In Progress"}
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Book's timeline events with drag-and-drop */}
                          <div className="pl-6 mb-6">
                            {viewMode === "narrative" && (
                              <div className="text-xs text-neutral-600 mb-2 flex items-center">
                                <GripVertical className="h-3 w-3 mr-1" />
                                <span>Drag to reorder events</span>
                              </div>
                            )}
                            <TimelineDragAndDrop
                              events={bookGroup.events}
                              onEventReorder={handleEventReorder}
                              onEdit={handleEditEvent}
                              onDelete={handleDeleteEvent}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
            <div className="text-neutral-500 mb-4">
              <i className="ri-time-line text-4xl"></i>
            </div>
            <h3 className="text-lg font-medium mb-2">No Timeline Events</h3>
            <p className="text-neutral-600 mb-4">
              Add events to start building your story timeline
            </p>
            <Button 
              onClick={handleAddEvent}
              className="bg-primary hover:bg-primary-dark text-white"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add First Event
            </Button>
          </div>
        )}
      </div>

      {/* Timeline Event Dialog */}
      {isDialogOpen && currentSeries && (
        <TimelineEventDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          event={selectedEvent}
          seriesId={currentSeries.id}
          books={books || []}
          characters={characters || []}
          locations={locations || []}
          mode={dialogMode}
        />
      )}
    </div>
  );
}
