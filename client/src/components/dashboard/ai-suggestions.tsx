import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Lightbulb, AlertCircle, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AISuggestions() {
  // In a real implementation, these would be API calls
  // For now, we'll use static suggestions to match the design
  
  const plotSuggestions = [
    {
      id: 1,
      content: "Consider revealing that the prophecy about Lyra is actually about both twins working together, not just her alone.",
      highlight: ["twins", "working together"]
    },
    {
      id: 2,
      content: "Thorne's background as a former elite guard of the Council creates potential for inner conflict when secrets are revealed.",
      highlight: ["inner conflict", "secrets"]
    },
    {
      id: 3,
      content: "The ancient archives beneath Lumenara could contain forgotten magic that becomes crucial in Book 3.",
      highlight: ["forgotten magic", "crucial"]
    }
  ];

  const consistencyIssues = [
    {
      id: 1,
      content: "Kael's eye color changes from amber in Chapter 3 to dark brown in Chapter 12.",
      highlight: ["amber", "dark brown"],
      severity: "warning"
    },
    {
      id: 2,
      content: "Timeline inconsistency: Lyra learns the shield spell after using it in the battle of Lumenara.",
      highlight: ["after"],
      severity: "error"
    },
    {
      id: 3,
      content: "The distance between Lumenara and Shadowvale is described as 3 days travel in Book 1, but 5 days in Book 2.",
      highlight: ["3 days", "5 days"],
      severity: "warning"
    }
  ];

  // Helper to highlight specific words
  const highlightText = (text: string, wordsToHighlight: string[]) => {
    const words = text.split(' ');
    return words.map((word, i) => {
      // Check if this word or phrase should be highlighted
      const shouldHighlight = wordsToHighlight.some(highlight => 
        word.toLowerCase().includes(highlight.toLowerCase()) ||
        (i < words.length - 1 && `${word} ${words[i+1]}`.toLowerCase().includes(highlight.toLowerCase()))
      );
      
      return shouldHighlight ? 
        <span key={i} className="text-primary font-medium">{word} </span> : 
        <span key={i}>{word} </span>;
    });
  };

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-heading font-semibold text-neutral-800">Writer's Companion AI</h2>
        <Button variant="ghost" className="text-primary text-sm font-medium hover:underline flex items-center">
          <RefreshCw className="h-4 w-4 mr-1" />
          Regenerate
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Plot Suggestions */}
        <div className="bg-white rounded-xl shadow-card p-5 border border-neutral-200 transition-shadow hover:shadow-card-hover">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-medium">Plot Development Ideas</h3>
              <p className="text-sm text-neutral-500 mt-1">Based on your character arcs and world building</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Lightbulb className="h-5 w-5" />
            </div>
          </div>
          <ul className="space-y-3">
            {plotSuggestions.map((suggestion) => (
              <li key={suggestion.id} className="flex items-start">
                <div className="bg-primary/10 text-primary p-1 rounded mr-3 mt-0.5">
                  <Lightbulb className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm">
                    {highlightText(suggestion.content, suggestion.highlight)}
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
        </div>

        {/* Consistency Checker */}
        <div className="bg-white rounded-xl shadow-card p-5 border border-neutral-200 transition-shadow hover:shadow-card-hover">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-medium">Consistency Checker</h3>
              <p className="text-sm text-neutral-500 mt-1">Potential continuity issues in your series</p>
            </div>
            <div className="p-2 bg-warning/10 rounded-lg text-warning">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <ul className="space-y-3">
            {consistencyIssues.map((issue) => (
              <li key={issue.id} className="flex items-start">
                <div className="bg-warning/10 text-warning p-1 rounded mr-3 mt-0.5">
                  <AlertCircle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm">
                    {highlightText(issue.content, issue.highlight)}
                  </p>
                  <div className="flex mt-1 space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded hover:bg-warning/20 h-auto border-0"
                    >
                      {issue.severity === "error" ? "Fix in all chapters" : "View details"}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-xs text-neutral-500 hover:text-neutral-700 h-auto p-0.5"
                    >
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
            <Button variant="ghost" className="text-neutral-500 hover:text-neutral-700 text-sm p-0">
              Run new scan
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
