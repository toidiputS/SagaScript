import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Loader2, RefreshCw, Lightbulb, Sparkles, MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { FeatureGate } from '@/components/ui/feature-gate';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Types for suggestions
type SuggestionType = 
  | 'plotIdea' 
  | 'characterDevelopment' 
  | 'dialogue' 
  | 'consistency' 
  | 'worldBuilding' 
  | 'sceneDescription'
  | 'conflict';

interface WritingSuggestion {
  id: string;
  type: SuggestionType;
  content: string;
  seriesId?: number;
  bookId?: number;
  chapterId?: number;
  characterId?: number;
  locationId?: number;
  createdAt: Date;
}

interface WriterCompanionProps {
  seriesId?: number;
  bookId?: number;
  chapterId?: number;
  onInsertSuggestion?: (text: string) => void;
}

export default function WriterCompanion({
  seriesId,
  bookId,
  chapterId,
  onInsertSuggestion
}: WriterCompanionProps) {
  const { toast } = useToast();
  const [customPrompt, setCustomPrompt] = useState('');
  const [activeTab, setActiveTab] = useState<'suggestions' | 'analysis'>('suggestions');

  // Fetch writing suggestions
  const { 
    data: suggestions, 
    isLoading: isLoadingSuggestions,
    error: suggestionsError,
    refetch: refetchSuggestions
  } = useQuery({
    queryKey: ['/api/ai/suggestions', seriesId, bookId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (seriesId) params.append('seriesId', seriesId.toString());
      if (bookId) params.append('bookId', bookId.toString());
      
      const response = await fetch(`/api/ai/suggestions?${params}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch suggestions');
      }
      return response.json() as Promise<WritingSuggestion[]>;
    },
    enabled: !!seriesId,
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Fetch writing analysis if chapter ID exists
  const {
    data: analysis,
    isLoading: isLoadingAnalysis,
    error: analysisError,
    refetch: refetchAnalysis
  } = useQuery({
    queryKey: ['/api/ai/analyze', chapterId],
    queryFn: async () => {
      const response = await apiRequest('POST', '/api/ai/analyze', { chapterId });
      return response.json() as Promise<{ analysis: string }>;
    },
    enabled: !!chapterId && activeTab === 'analysis',
    refetchOnWindowFocus: false,
    retry: false,
  });

  // Generate a single suggestion based on type
  const generateSuggestionMutation = useMutation({
    mutationFn: async ({ type }: { type: SuggestionType }) => {
      if (!seriesId) {
        throw new Error('Series ID is required');
      }
      
      const response = await apiRequest('POST', '/api/ai/suggestion', {
        type,
        seriesId,
        bookId
      });
      
      return response.json() as Promise<WritingSuggestion>;
    },
    onSuccess: (newSuggestion) => {
      queryClient.setQueryData<WritingSuggestion[]>(
        ['/api/ai/suggestions', seriesId, bookId],
        (oldSuggestions) => {
          if (!oldSuggestions) return [newSuggestion];
          return [...oldSuggestions, newSuggestion];
        }
      );
      
      toast({
        title: 'New suggestion generated',
        description: 'Your new writing suggestion is ready.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to generate suggestion',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Submit custom prompt for analysis
  const submitCustomPromptMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('POST', '/api/ai/analyze', { content: prompt });
      return response.json() as Promise<{ analysis: string }>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['/api/ai/analyze', 'custom'], data);
      setCustomPrompt('');
      toast({
        title: 'Analysis complete',
        description: 'Your writing has been analyzed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Analysis failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Handle clicking on a suggestion to insert it
  const handleInsertSuggestion = (text: string) => {
    if (onInsertSuggestion) {
      onInsertSuggestion(text);
      toast({
        title: 'Suggestion inserted',
        description: 'The suggestion has been added to your text.',
      });
    }
  };

  // Generate a suggestion of a specific type
  const handleGenerateSuggestion = (type: SuggestionType) => {
    generateSuggestionMutation.mutate({ type });
  };

  // Submit custom prompt for analysis
  const handleSubmitCustomPrompt = () => {
    if (customPrompt.length < 100) {
      toast({
        title: 'Text too short',
        description: 'Please provide at least 100 characters for meaningful analysis.',
        variant: 'destructive'
      });
      return;
    }
    
    submitCustomPromptMutation.mutate(customPrompt);
  };

  // Display error states
  if (suggestionsError && activeTab === 'suggestions') {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Writer Companion</CardTitle>
          <CardDescription>Intelligent writing assistance</CardDescription>
        </CardHeader>
        <CardContent>
          <FeatureGate feature="aiSuggestions" requiredTier="apprentice">
            <div className="p-4 bg-destructive/10 rounded-md text-center">
              <p className="text-destructive font-medium mb-2">
                {(suggestionsError as Error).message || 'Failed to load AI suggestions'}
              </p>
              <Button variant="outline" size="sm" onClick={() => refetchSuggestions()}>
                <RefreshCw className="mr-2 h-4 w-4" /> Try Again
              </Button>
            </div>
          </FeatureGate>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Sparkles className="w-5 h-5 mr-2 text-primary" />
          Writer Companion
        </CardTitle>
        <CardDescription>AI-powered writing assistance</CardDescription>
      </CardHeader>
      
      <FeatureGate feature="aiSuggestions" requiredTier="apprentice">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'suggestions' | 'analysis')} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="suggestions">
              <Lightbulb className="w-4 h-4 mr-2" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="analysis">
              <MessageSquare className="w-4 h-4 mr-2" />
              Analysis
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggestions" className="space-y-4">
            <CardContent className="space-y-4">
              {isLoadingSuggestions ? (
                <div className="py-8 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : suggestions && suggestions.length > 0 ? (
                <div className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <div 
                      key={suggestion.id} 
                      className="p-3 border rounded-md hover:bg-accent transition-colors cursor-pointer"
                      onClick={() => handleInsertSuggestion(suggestion.content)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs font-medium text-muted-foreground capitalize bg-secondary/50 px-2 py-0.5 rounded">
                          {suggestion.type.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </div>
                      </div>
                      <p className="text-sm">{suggestion.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    {seriesId 
                      ? "No suggestions yet. Generate some ideas for your story!" 
                      : "Select a series to get AI-powered writing suggestions."}
                  </p>
                  {seriesId && (
                    <Button onClick={() => refetchSuggestions()}>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Suggestions
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
            
            {seriesId && (
              <CardFooter className="flex flex-wrap gap-2 justify-start border-t pt-4">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleGenerateSuggestion('plotIdea')}
                  disabled={generateSuggestionMutation.isPending}
                >
                  Plot Idea
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleGenerateSuggestion('characterDevelopment')}
                  disabled={generateSuggestionMutation.isPending}
                >
                  Character
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleGenerateSuggestion('dialogue')}
                  disabled={generateSuggestionMutation.isPending}
                >
                  Dialogue
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleGenerateSuggestion('worldBuilding')}
                  disabled={generateSuggestionMutation.isPending}
                >
                  World
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleGenerateSuggestion('conflict')}
                  disabled={generateSuggestionMutation.isPending}
                >
                  Conflict
                </Button>
              </CardFooter>
            )}
          </TabsContent>
          
          <TabsContent value="analysis">
            <CardContent className="space-y-4">
              {chapterId ? (
                <>
                  {isLoadingAnalysis ? (
                    <div className="py-8 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : analysisError ? (
                    <div className="p-4 bg-destructive/10 rounded-md text-center">
                      <p className="text-destructive font-medium mb-2">
                        {(analysisError as Error).message || 'Failed to analyze writing'}
                      </p>
                      <Button variant="outline" size="sm" onClick={() => refetchAnalysis()}>
                        <RefreshCw className="mr-2 h-4 w-4" /> Try Again
                      </Button>
                    </div>
                  ) : analysis ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <h3 className="text-lg font-medium mb-2">Writing Analysis</h3>
                      <div className="whitespace-pre-line">{analysis.analysis}</div>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-muted-foreground mb-4">
                        Click the button below to analyze your current chapter.
                      </p>
                      <Button onClick={() => refetchAnalysis()}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Analyze Writing
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-2">
                    Paste your text below for a professional writing analysis:
                  </div>
                  <Textarea
                    placeholder="Enter at least 100 characters of your writing for analysis..."
                    className="min-h-[150px]"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {customPrompt.length < 100 
                        ? `Minimum 100 characters (${customPrompt.length}/100)`
                        : `${customPrompt.length} characters`}
                    </div>
                    <Button 
                      onClick={handleSubmitCustomPrompt}
                      disabled={customPrompt.length < 100 || submitCustomPromptMutation.isPending}
                    >
                      {submitCustomPromptMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Analyze
                    </Button>
                  </div>
                  
                  {submitCustomPromptMutation.data && (
                    <div className="mt-6 p-4 bg-card rounded-md border">
                      <h3 className="text-lg font-medium mb-2">Analysis Results</h3>
                      <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-line">
                        {submitCustomPromptMutation.data.analysis}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </FeatureGate>
    </Card>
  );
}