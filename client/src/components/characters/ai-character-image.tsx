import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Added import for Textarea
import { useFeatureAccess } from "@/lib/subscription";
import { useToast } from "@/hooks/use-toast";

interface AICharacterImageProps {
  onImageGenerated: (imageUrl: string) => void;
}

export function AICharacterImage({ onImageGenerated }: AICharacterImageProps) {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { canUseFeature } = useFeatureAccess();
  const { toast } = useToast();
  const { canAccess } = useFeatureAccess();

  const hasAccess = canAccess('aiCharacterImages');

  const generateImage = async () => {
    if (!hasAccess) {
      toast({
        title: "Premium Feature",
        description: "AI Character Image generation is available in the Wordsmith plan and higher.",
        variant: "default",
      });
      return;
    }

    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please enter a description for your character.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // This would be replaced with an actual API call in production
      // For demo purposes, we'll simulate a delay and return a placeholder image
      await new Promise(resolve => setTimeout(resolve, 1500));

      // In a real implementation, this would be the URL returned from your image generation API
      const placeholderImages = [
        'https://placehold.co/400x400/3b3b3b/FFF?text=Character+Image',
        'https://placehold.co/400x400/2a4365/FFF?text=AI+Generated',
        'https://placehold.co/400x400/2d3748/FFF?text=Character'
      ];
      const randomImage = placeholderImages[Math.floor(Math.random() * placeholderImages.length)];

      onImageGenerated(randomImage);

      toast({
        title: "Image Generated",
        description: "Your character image has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was a problem generating your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-3 w-full h-full flex flex-col">
      <Label htmlFor="avatarDescription" className="text-lg font-medium">AI Image Generator</Label>
      <div className="flex flex-col gap-3 flex-grow overflow-hidden">
        <Textarea
          id="avatarDescription"
          placeholder="Describe your character in detail..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full flex-grow min-h-[220px] overflow-auto"
          disabled={isGenerating}
        />
        <Button 
          type="button"
          variant="secondary"
          onClick={generateImage}
          disabled={isGenerating}
          className="w-full py-2"
        >
          {isGenerating ? "Generating..." : "Generate Character Image"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {hasAccess 
          ? "Enter a detailed description to generate an AI character image" 
          : "Available in Wordsmith plan and higher"}
      </p>
    </div>
  );
}