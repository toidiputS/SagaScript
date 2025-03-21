import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";
import WriterCompanion from "@/components/dashboard/writer-companion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { AlertCircle, Sparkles, RefreshCw, Lightbulb, CheckCircle, ExternalLink, Brain } from "lucide-react";
import { FeatureGate } from "@/components/ui/feature-gate";

export default function AICompanion() {
  const { user } = useAuth();
  const [selectedSeries, setSelectedSeries] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("writer-companion");
  const [prompt, setPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
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

  // Mock AI suggestions for backwards compatibility - real ones now come from API
  const plotSuggestions = [
    {
      id: 1,
      content: "Consider revealing that the prophecy about your protagonist is actually about both twins working together, not just one alone.",
      type: "plot"
    },
    {
      id: 2,
      content: "The character's background as a former elite guard creates potential for inner conflict when secrets are revealed.",
      type: "character"
    },
    {
      id: 3,
      content: "The ancient archives beneath your main city could contain forgotten magic that becomes crucial in the final book.",
      type: "worldbuilding"
    }
  ];

  // Mock consistency issues - in a real implementation, these would come from an API
  const consistencyIssues = [
    {
      id: 1,
      content: "Your character's eye color changes from amber in Chapter 3 to dark brown in Chapter 12.",
      severity: "warning"
    },
    {
      id: 2,
      content: "Timeline inconsistency: Character learns a skill after using it in an earlier chapter.",
      severity: "error"
    },
    {
      id: 3,
      content: "The distance between two locations is described as 3 days travel in Book 1, but 5 days in Book 2.",
      severity: "warning"
    }
  ];

  // For demonstrating loading state of AI response
  const handleGenerateAI = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setAiResponse("");
    
    // In a real implementation, this would make an API call to generate AI response
    // For now, we'll simulate a delay and return a simple response
    setTimeout(() => {
      setAiResponse(`Here are some ideas related to your prompt: "${prompt}":\n\n1. You could explore the character's internal conflict more deeply by...\n\n2. Consider adding a subplot where...\n\n3. The setting could be enhanced by incorporating elements of...\n\nLet me know if you'd like me to elaborate on any of these suggestions!`);
      setIsGenerating(false);
    }, 2000);
  };

  const handleRefreshSuggestions = () => {
    // In a real implementation, this would trigger a new API call to get fresh suggestions
    // For now, we'll just show a loading state briefly
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1000);
  };

  const handleCheckConsistency = () => {
    // In a real implementation, this would trigger a new scan for consistency issues
    // For now, we'll just show a loading state briefly
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 1000);
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
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900">Writer's Companion AI</h1>
              <p className="text-neutral-600 mt-1">Get personalized suggestions and help with consistency</p>
            </div>
            <div className="flex space-x-3 mt-4 md:mt-0">
              <Button variant="outline" onClick={handleRefreshSuggestions} disabled={isGenerating}>
                <RefreshCw className="h-5 w-5 mr-2" />
                Refresh
              </Button>
            </div>
          </header>

          {/* Series Selector */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-4 mb-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="series-select" className="block text-sm font-medium text-neutral-700 mb-1">
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
                <label htmlFor="book-select" className="block text-sm font-medium text-neutral-700 mb-1">
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
              
              <div className="flex items-end">
                <Tabs 
                  className="w-full" 
                  value={activeTab} 
                  onValueChange={setActiveTab}
                >
                  <TabsList className="grid grid-cols-3 w-full">
                    <TabsTrigger value="writer-companion">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Writer Assistant
                    </TabsTrigger>
                    <TabsTrigger value="suggestions">
                      <Lightbulb className="w-4 h-4 mr-2" />
                      Ideas
                    </TabsTrigger>
                    <TabsTrigger value="consistency">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Consistency
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </div>

          {/* Main content area */}
          <TabsContent value="writer-companion" className="mt-0">
            <WriterCompanion 
              seriesId={selectedSeries || undefined} 
              bookId={selectedBook || undefined}
            />
          </TabsContent>
          
          <TabsContent value="suggestions" className="mt-0" hidden={activeTab !== "suggestions"}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plot Suggestions */}
              <Card className="border border-neutral-200 shadow-card hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle>Plot Development Ideas</CardTitle>
                    <p className="text-sm text-neutral-500 mt-1">Based on your character arcs and world building</p>
                  </div>
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plotSuggestions.map((suggestion) => (
                      <li key={suggestion.id} className="flex items-start">
                        <div className="bg-primary/10 text-primary p-1 rounded mr-3 mt-0.5">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm">
                            {suggestion.content.split(' ').map((word, i) => 
                              word.toLowerCase() === 'protagonist' || word.toLowerCase() === 'twins' || 
                              word.toLowerCase() === 'forgotten' || word.toLowerCase() === 'magic' || 
                              word.toLowerCase() === 'conflict' || word.toLowerCase() === 'secrets' ? 
                                <span key={i} className="text-primary font-medium">{word} </span> : 
                                <span key={i}>{word} </span>
                            )}
                          </p>
                          <button className="text-xs text-primary mt-1 flex items-center hover:underline">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Add to notes
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-3 border-t border-neutral-200">
                    <Button variant="ghost" className="text-primary hover:text-primary-dark text-sm font-medium p-0">
                      Show more suggestions
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Style Suggestions */}
              <Card className="border border-neutral-200 shadow-card hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle>Writing Style Analysis</CardTitle>
                    <p className="text-sm text-neutral-500 mt-1">Based on your recent writing sessions</p>
                  </div>
                  <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <div className="bg-secondary/10 text-secondary p-1 rounded mr-3 mt-0.5">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm">
                          You use <span className="text-secondary font-medium">strong dialogue</span> to develop characters, which creates memorable interactions.
                        </p>
                        <div className="mt-1 text-xs text-neutral-600 bg-neutral-100 p-1.5 rounded">
                          "I didn't come this far to turn back now," she said, gripping the hilt of her sword.
                        </div>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-secondary/10 text-secondary p-1 rounded mr-3 mt-0.5">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm">
                          Your <span className="text-secondary font-medium">descriptive passages</span> effectively create atmosphere and setting.
                        </p>
                        <button className="text-xs text-secondary mt-1 flex items-center hover:underline">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          See examples
                        </button>
                      </div>
                    </li>
                    <li className="flex items-start">
                      <div className="bg-warning/10 text-warning p-1 rounded mr-3 mt-0.5">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm">
                          Consider reducing <span className="text-warning font-medium">adverb usage</span> in action scenes to improve pacing.
                        </p>
                        <button className="text-xs text-secondary mt-1 flex items-center hover:underline">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Show suggested edits
                        </button>
                      </div>
                    </li>
                  </ul>
                  <div className="mt-4 pt-3 border-t border-neutral-200">
                    <Button variant="ghost" className="text-primary hover:text-primary-dark text-sm font-medium p-0">
                      Generate full style report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="consistency" className="mt-0" hidden={activeTab !== "consistency"}>
            <Card className="border border-neutral-200 shadow-card hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                  <CardTitle>Consistency Checker</CardTitle>
                  <p className="text-sm text-neutral-500 mt-1">Potential continuity issues in your series</p>
                </div>
                <div className="p-2 bg-warning/10 rounded-lg text-warning">
                  <AlertCircle className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {consistencyIssues.map((issue) => (
                    <li key={issue.id} className="flex items-start">
                      <div className={`${issue.severity === 'error' ? 'bg-red-100 text-red-500' : 'bg-warning/10 text-warning'} p-1 rounded mr-3 mt-0.5`}>
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm">
                          {issue.content.split(' ').map((word, i) => 
                            word.toLowerCase() === 'amber' || word.toLowerCase() === 'dark' || 
                            word.toLowerCase() === 'brown' || word.toLowerCase() === '3' || 
                            word.toLowerCase() === '5' ? 
                              <span key={i} className={issue.severity === 'error' ? 'text-red-500 font-medium' : 'text-warning font-medium'}>{word} </span> : 
                              <span key={i}>{word} </span>
                          )}
                        </p>
                        <div className="flex mt-1 space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className={`text-xs ${issue.severity === 'error' ? 'bg-red-50 text-red-500 hover:bg-red-100 border-red-200' : 'bg-warning/10 text-warning hover:bg-warning/20 border-warning/30'}`}
                          >
                            {issue.severity === 'error' ? 'Fix now' : 'View details'}
                          </Button>
                          <Button size="sm" variant="ghost" className="text-xs text-neutral-500 hover:text-neutral-700">
                            Ignore
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-3 border-t border-neutral-200 flex justify-between">
                  <Button variant="ghost" className="text-primary hover:text-primary-dark text-sm font-medium p-0">
                    View all issues (8)
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCheckConsistency} disabled={isGenerating}>
                    {isGenerating ? 'Scanning...' : 'Run new scan'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat" className="mt-0" hidden={activeTab !== "chat"}>
            <Card className="border border-neutral-200 shadow-card hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>Ask the AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <div className="bg-neutral-50 rounded-lg p-4 max-h-80 overflow-y-auto">
                    {!aiResponse && !isGenerating ? (
                      <div className="text-center py-10">
                        <Sparkles className="h-10 w-10 mx-auto text-primary/50 mb-3" />
                        <h3 className="text-lg font-medium text-neutral-700">How can I help with your story?</h3>
                        <p className="text-neutral-500 mt-2">Ask me about plot ideas, character development, world-building, or writing techniques.</p>
                      </div>
                    ) : isGenerating ? (
                      <div className="flex items-center justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                        <span className="ml-3 text-neutral-600">Generating response...</span>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <div className="bg-primary/5 rounded p-3 mb-4">
                          <p className="text-neutral-700 font-medium">Your prompt:</p>
                          <p className="text-neutral-600">{prompt}</p>
                        </div>
                        <div>
                          <p className="text-neutral-700 font-medium">AI response:</p>
                          {aiResponse.split('\n\n').map((paragraph, index) => (
                            <p key={index} className="mb-3">{paragraph}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex flex-col space-y-2">
                      <Textarea 
                        placeholder="Ask for plot suggestions, character development ideas, or writing advice..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-24"
                      />
                      <div className="flex justify-between">
                        <div className="text-xs text-neutral-500">
                          Try: "Help me develop a compelling antagonist" or "How can I improve this dialogue scene?"
                        </div>
                        <Button 
                          onClick={handleGenerateAI}
                          disabled={isGenerating || !prompt.trim()}
                          className="ml-auto"
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          {isGenerating ? "Generating..." : "Generate"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

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
