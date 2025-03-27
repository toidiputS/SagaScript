import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/simple-auth";

import WriterCompanion from "@/components/dashboard/writer-companion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, RefreshCw, Lightbulb } from "lucide-react";

export default function AICompanion() {
  const { user } = useAuth();
  const [selectedSeries, setSelectedSeries] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch all series
  const { data: series, isLoading: isLoadingSeries } = useQuery<any[]>({
    queryKey: ['/api/series'],
    retry: false
  });
  
  // Fetch books when a series is selected
  const { data: books, isLoading: isLoadingBooks } = useQuery<any[]>({
    queryKey: ['/api/series', selectedSeries, 'books'],
    queryFn: async () => {
      if (!selectedSeries) return [];
      const response = await fetch(`/api/series/${selectedSeries}/books`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!selectedSeries,
    retry: false
  });

  const handleRefreshSuggestions = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className="bg-background text-foreground font-sans min-h-screen flex">
      <main className="flex-1 pt-4">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {/* Page header */}
          <header className="md:flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground">Writer's Companion AI</h1>
              <p className="text-muted-foreground mt-1">Get personalized suggestions and help with consistency</p>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <Button variant="outline" onClick={handleRefreshSuggestions} disabled={isGenerating}>
                <RefreshCw className="h-5 w-5 mr-2" />
                Refresh Suggestions
              </Button>
            </div>
          </header>

          {/* Series Selector */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-4 mb-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="series-select" className="block text-sm font-medium text-foreground mb-1">
                  Select Series
                </label>
                <Select 
                  onValueChange={(value) => {
                    setSelectedSeries(parseInt(value));
                    setSelectedBook(null); // Reset book when series changes
                  }}
                  value={selectedSeries?.toString()}
                >
                  <SelectTrigger id="series-select" className="w-full">
                    <SelectValue placeholder="Choose a series" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingSeries ? (
                      <SelectItem value="loading" disabled>Loading series...</SelectItem>
                    ) : series && Array.isArray(series) && series.length > 0 ? (
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
                <label htmlFor="book-select" className="block text-sm font-medium text-foreground mb-1">
                  Select Book (Optional)
                </label>
                <Select 
                  onValueChange={(value) => setSelectedBook(parseInt(value))}
                  value={selectedBook?.toString()}
                  disabled={!selectedSeries || isLoadingBooks}
                >
                  <SelectTrigger id="book-select" className="w-full">
                    <SelectValue placeholder="Choose a book" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingBooks ? (
                      <SelectItem value="loading" disabled>Loading books...</SelectItem>
                    ) : books && Array.isArray(books) && books.length > 0 ? (
                      books.map((b: any) => (
                        <SelectItem key={b.id} value={b.id.toString()}>
                          {b.title}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No books available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div>
                <CardTitle className="flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-primary" />
                  AI Writer Assistant
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Get intelligent suggestions and feedback for your writing
                </p>
              </div>
              <div>
                <Button variant="outline" size="sm">
                  <Lightbulb className="h-4 w-4 mr-2 text-primary" />
                  <span>Generate Ideas</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <WriterCompanion 
                seriesId={selectedSeries || undefined} 
                bookId={selectedBook || undefined}
              />
            </CardContent>
          </Card>

          {/* Footer */}
          <footer className="border-t border-border pt-6 pb-12 text-muted-foreground text-sm mt-12">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
              <div className="mb-4 md:mb-0">
                <p>© 2025 SagaScript.Life - The Ultimate Series Author's Companion</p>
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