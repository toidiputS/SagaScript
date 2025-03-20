import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Info, RefreshCw } from "lucide-react";
import { useFeatureAccess } from "@/lib/subscription";

export default function AISuggestions() {
  const { canAccess, getLimit } = useFeatureAccess();
  const hasAIAccess = canAccess('aiSuggestions');
  const remainingSuggestions = getLimit('aiSuggestionsLimit') as number;

  // Suggestions would typically come from an API in a real implementation
  const suggestions = [
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

  const handleGenerateMore = () => {
    // In a real implementation, this would call an API to get more suggestions
    console.log("Generating more suggestions...");
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
            {suggestions.map((suggestion, index) => (
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
              disabled={remainingSuggestions <= 0}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Generate More Insights
              {remainingSuggestions > 0 && (
                <span className="ml-2 text-xs opacity-70">
                  ({remainingSuggestions} remaining today)
                </span>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}