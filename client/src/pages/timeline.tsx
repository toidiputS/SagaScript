import { useSeries } from "@/hooks/use-series";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Chapter } from "@shared/schema";

export default function TimelinePage() {
  const { allSeries, currentSeries, changeCurrentSeries } = useSeries();

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

  // Handle series selection change
  const handleSeriesChange = (seriesId: string) => {
    changeCurrentSeries(parseInt(seriesId));
  };

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
                value={currentSeries?.id.toString()} 
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
            
            <Button className="bg-primary hover:bg-primary-dark text-white">
              <i className="ri-add-line mr-2"></i>
              <span>Add Event</span>
            </Button>
          </div>
        </div>

        {/* Timeline view options */}
        <div className="border-b border-neutral-200 mb-6">
          <Tabs defaultValue="chronological">
            <TabsList className="flex">
              <TabsTrigger value="chronological" className="px-4 py-2">Chronological</TabsTrigger>
              <TabsTrigger value="narrative" className="px-4 py-2">Narrative</TabsTrigger>
              <TabsTrigger value="character" className="px-4 py-2">Character-Based</TabsTrigger>
            </TabsList>
          </Tabs>
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
        ) : isLoadingBooks ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : books && books.length > 0 ? (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[150px] top-0 bottom-0 w-0.5 bg-neutral-200 z-0"></div>

            {/* Timeline events */}
            <div className="relative z-10 space-y-8">
              {books.map((book, bookIndex) => (
                <div key={book.id} className="relative">
                  <div className="flex">
                    <div className="w-[150px] pr-8 pt-2 font-medium text-neutral-700 text-right">
                      Book {book.position}
                    </div>
                    <div className="flex-grow pl-8">
                      <div className="absolute left-[150px] w-3 h-3 rounded-full bg-primary -ml-1.5 mt-3"></div>
                      <Card className="mb-6">
                        <CardHeader className="pb-2">
                          <CardTitle>{book.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-neutral-600 mb-3">
                            {book.description || "No description provided"}
                          </p>
                          <div className="text-xs text-neutral-500">
                            Status: {book.status === "completed" ? "Completed" : "In Progress"}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Placeholder for chapter events */}
                      <div className="pl-6 space-y-4 mb-4">
                        {/* We would fetch chapters here in a real implementation */}
                        {[1, 2, 3].map((chapterNum) => (
                          <div key={chapterNum} className="relative">
                            <div className="absolute -left-3 w-2 h-2 rounded-full bg-neutral-400 mt-1.5"></div>
                            <div className="text-sm font-medium text-neutral-700 mb-1">
                              Chapter {chapterNum}: {chapterNum === 1 ? "Introduction" : chapterNum === 2 ? "Rising Action" : "Climax"}
                            </div>
                            <div className="text-xs text-neutral-600">
                              {chapterNum === 1 
                                ? "The main characters are introduced and the setting is established." 
                                : chapterNum === 2 
                                  ? "Conflicts begin to emerge as characters pursue their goals."
                                  : "The main conflict reaches its peak as characters are forced to make difficult choices."}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 text-center">
            <div className="text-neutral-500 mb-4">
              <i className="ri-time-line text-4xl"></i>
            </div>
            <h3 className="text-lg font-medium mb-2">No Books Available</h3>
            <p className="text-neutral-600 mb-4">Add books to your series to start building a timeline</p>
            <Button 
              onClick={() => window.location.href = '/series'}
              className="bg-primary hover:bg-primary-dark text-white"
            >
              <i className="ri-add-line mr-2"></i> Add Books
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
export default function Timeline() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Timeline</h1>
      <p>Timeline feature coming soon...</p>
    </div>
  );
}
