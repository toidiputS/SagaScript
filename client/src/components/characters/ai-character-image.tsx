
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFeatureAccess } from "@/lib/subscription";
import { useToast } from "@/components/ui/use-toast";

interface AICharacterImageProps {
  onImageGenerated: (imageUrl: string) => void;
}

export function AICharacterImage({ onImageGenerated }: AICharacterImageProps) {
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { canUseFeature } = useFeatureAccess();
  const { toast } = useToast();
  
  const hasAccess = canUseFeature('aiCharacterImages');

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
    <div className="space-y-2">
      <Label htmlFor="avatarDescription">AI Image Generator</Label>
      <div className="flex gap-2">
        <Input
          id="avatarDescription"
          placeholder="Describe your character briefly..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1"
          disabled={isGenerating}
        />
        <Button 
          type="button"
          variant="secondary"
          onClick={generateImage}
          disabled={isGenerating}
        >
          {isGenerating ? "Generating..." : "Generate"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {hasAccess 
          ? "Enter a brief description to generate an AI character image" 
          : "Available in Wordsmith plan and higher"}
      </p>
    </div>
  );
}
