import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Info, RefreshCw, Loader2 } from "lucide-react";
import { useFeatureAccess } from "@/lib/subscription";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Suggestion {
  type: string;
  content: string;
  icon: React.ReactNode;
  id?: string;
}

export default function AISuggestions() {
  const { canAccess, getLimit } = useFeatureAccess();
  const hasAIAccess = canAccess('aiSuggestions');
  const remainingSuggestions = getLimit('aiSuggestionsLimit') as number;
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch suggestions from the API
  const { data: apiSuggestions, isLoading } = useQuery({
    queryKey: ['/api/ai/suggestions'],
    queryFn: async () => {
      try {
        // Get the first series for the user
        const seriesResponse = await apiRequest('GET', '/api/series');
        const seriesData = await seriesResponse.json();

        if (seriesData && seriesData.length > 0) {
          const firstSeries = seriesData[0];
          const params = new URLSearchParams();
          params.append('seriesId', firstSeries.id.toString());

          console.log("Fetching AI suggestions for series:", firstSeries.id);
          const response = await apiRequest('GET', `/api/ai/suggestions?${params}`);
          const suggestions = await response.json();
          console.log("AI suggestions received:", suggestions);
          return suggestions;
        }
        return [];
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        return [];
      }
    },
    enabled: hasAIAccess,
    refetchOnWindowFocus: false,
  });

  // Default suggestions if API call fails or while loading
  const defaultSuggestions: Suggestion[] = [
    {
      type: "insight",
      content: "Based on your story, Captain Merida might have a backstory conflict with Elena's family. Consider exploring this in Chapter 4.",
      icon: <Lightbulb className="h-5 w-5 text-amber-500" />
    },
    {
      type: "consistency",
      content: "Potential consistency issue: Eye color for Soren changes between Chapter 1 and 3.",
      icon: <Info className="h-5 w-5 text-blue-500" />
    }
  ];

  // Combine API suggestions with default formatting or use defaults
  const suggestions: Suggestion[] = apiSuggestions?.length > 0 
    ? apiSuggestions.map((s: any) => ({
        id: s.id,
        type: s.type,
        content: s.content,
        icon: s.type === 'consistency' 
          ? <Info className="h-5 w-5 text-blue-500" /> 
          : <Lightbulb className="h-5 w-5 text-amber-500" />
      })) 
    : defaultSuggestions;

  const handleGenerateMore = async () => {
    try {
      setIsGenerating(true);

      // Get the first series for the user
      const seriesResponse = await apiRequest('GET', '/api/series');
      const seriesData = await seriesResponse.json();

      if (seriesData && seriesData.length > 0) {
        const firstSeries = seriesData[0];

        // Force a refetch of suggestions with the series ID
        await queryClient.refetchQueries({ 
          queryKey: ['/api/ai/suggestions'],
          type: 'active',
        });

        toast({
          title: "New insights generated",
          description: "Fresh writing suggestions are ready for you",
        });
      } else {
        toast({
          title: "No series found",
          description: "Create a series first to get AI suggestions",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating more suggestions:", error);
      toast({
        title: "Error generating suggestions",
        description: "Unable to generate new suggestions at this time",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-foreground text-xl font-serif">Writer's Companion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!hasAIAccess ? (
          <div className="text-center p-4 border border-dashed rounded-md bg-muted/50">
            <p className="text-foreground mb-2">Upgrade your plan to access AI writing suggestions</p>
            <Button variant="outline" size="sm">Upgrade</Button>
          </div>
        ) : (
          <>
            {suggestions.map((suggestion: Suggestion, index: number) => (
              <div 
                key={index} 
                className="p-4 rounded-md bg-card border" 
                data-component={suggestion.type}
              >
                <div className="flex items-start space-x-2">
                  <div className="mt-1">{suggestion.icon}</div>
                  <p className="text-foreground">{suggestion.content}</p>
                </div>
              </div>
            ))}

            <Button 
              variant="secondary" 
              className="w-full mt-4 text-foreground" 
              onClick={handleGenerateMore}
              disabled={isGenerating || remainingSuggestions <= 0 || isLoading}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Insights...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate More Insights
                  {remainingSuggestions > 0 && (
                    <span className="ml-2 text-xs opacity-70">
                      ({remainingSuggestions} remaining today)
                    </span>
                  )}
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}