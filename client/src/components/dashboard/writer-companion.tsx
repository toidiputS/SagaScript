import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReloadIcon } from "@radix-ui/react-icons";

type InsightType = "suggestion" | "warning" | "tip";

interface Insight {
  type: InsightType;
  content: string;
  icon: string;
}

export default function WriterCompanion() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([
    {
      type: "suggestion",
      content: "Based on your story, Captain Merida might have a backstory conflict with Elena's family. Consider exploring this in Chapter 4.",
      icon: "ri-lightbulb-line text-warning"
    },
    {
      type: "warning",
      content: "Potential consistency issue: Eye color for Soren changes between Chapter 1 and 3.",
      icon: "ri-error-warning-line text-error"
    }
  ]);

  const handleGenerateInsights = () => {
    setIsGenerating(true);
    
    // Simulate generating new insights
    setTimeout(() => {
      const newInsights: Insight[] = [
        {
          type: "suggestion",
          content: "The Storm Islands setting would benefit from more sensory details about the weather conditions.",
          icon: "ri-lightbulb-line text-warning"
        },
        {
          type: "tip",
          content: "Consider developing the relationship between Elena and Soren with more dialogue in quiet moments.",
          icon: "ri-chat-3-line text-primary"
        },
        {
          type: "warning",
          content: "Timeline inconsistency: The journey to the Storm Islands takes 3 days in Chapter 2 but 5 days in Chapter 4.",
          icon: "ri-error-warning-line text-error"
        }
      ];
      
      setInsights(newInsights);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader className="border-b border-neutral-200 px-5 py-4">
        <CardTitle className="font-serif font-bold text-lg text-neutral-800">Writer's Companion</CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {insights.map((insight, index) => (
          <div 
            key={index}
            className="mb-4 p-4 bg-neutral-50 border border-neutral-200 rounded-lg"
          >
            <p className="text-sm text-neutral-700">
              <i className={insight.icon + " mr-1"}></i> 
              {insight.content}
            </p>
          </div>
        ))}
        
        <Button
          variant="outline"
          className="w-full mt-2 flex items-center justify-center text-neutral-700 hover:bg-neutral-100 border border-neutral-300 rounded-md px-4 py-2 text-sm font-medium"
          onClick={handleGenerateInsights}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" /> 
              Generating Insights...
            </>
          ) : (
            <>
              <i className="ri-refresh-line mr-2"></i> Generate More Insights
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
