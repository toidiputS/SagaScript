import React, { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

// UI Components
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Download, 
  Copy, 
  Image, 
  Edit, 
  Save
} from 'lucide-react';

// Map generation form schema
const mapGenerationSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  style: z.string().min(1, 'Please select a map style'),
  artStyle: z.string().min(1, 'Please select an art style'),
  seriesId: z.number().optional(),
  locationId: z.number().optional(),
});

type MapGenerationFormValues = z.infer<typeof mapGenerationSchema>;

interface MapStyle {
  value: string;
  label: string;
  description: string;
}

interface ArtStyle {
  value: string;
  label: string;
  description: string;
}

interface StylesResponse {
  mapStyles: MapStyle[];
  artStyles: ArtStyle[];
}

interface MapGenerationResult {
  id: string;
  imageUrl: string;
  prompt: string;
  description: string;
  style: string;
  artStyle: string;
  seriesId?: number;
  locationId?: number;
  createdAt: string;
}

export function DirectMapGenerator({ seriesId }: { seriesId: number }) {
  const { toast } = useToast();
  const [generatedMap, setGeneratedMap] = useState<MapGenerationResult | null>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Default styles to use if the API call fails
  const defaultMapStyles = [
    { value: 'fantasy', label: 'Fantasy', description: 'Medieval-inspired world with magical elements' },
    { value: 'sci-fi', label: 'Sci-Fi', description: 'Futuristic worlds with advanced technology' },
    { value: 'historical', label: 'Historical', description: 'Based on historical periods and cartography' },
    { value: 'modern', label: 'Modern', description: 'Contemporary settings with current geography' },
    { value: 'post-apocalyptic', label: 'Post-Apocalyptic', description: 'World after a catastrophic event' }
  ];
  
  const defaultArtStyles = [
    { value: 'ink-and-parchment', label: 'Ink & Parchment', description: 'Traditional hand-drawn style on aged paper' },
    { value: 'watercolor', label: 'Watercolor', description: 'Artistic watercolor painting with gentle colors' },
    { value: 'isometric', label: 'Isometric', description: '3D-like perspective with raised elements' },
    { value: 'topographical', label: 'Topographical', description: 'Elevation-focused with contour lines' }
  ];

  // Fetch map styles and art styles
  const { data: styles, isLoading: stylesLoading } = useQuery<StylesResponse>({
    queryKey: ['/api/ai/map-styles'],
    retry: 1,
  });
  
  // Use default styles if the API call fails or is loading
  const effectiveStyles = {
    mapStyles: styles?.mapStyles || defaultMapStyles,
    artStyles: styles?.artStyles || defaultArtStyles
  };

  // Form setup
  const form = useForm<MapGenerationFormValues>({
    resolver: zodResolver(mapGenerationSchema),
    defaultValues: {
      description: 'A fantasy world with mountains in the north, forests in the center, and a coastline to the east with a major port city.',
      style: effectiveStyles.mapStyles[0]?.value || 'fantasy',
      artStyle: effectiveStyles.artStyles[0]?.value || 'ink-and-parchment',
      seriesId: seriesId,
    },
  });

  // Set seriesId when it changes
  React.useEffect(() => {
    form.setValue('seriesId', seriesId);
  }, [seriesId, form]);

  // Generate map mutation
  const generateMapMutation = useMutation({
    mutationFn: async (data: MapGenerationFormValues) => {
      try {
        const response = await apiRequest('POST', '/api/ai/generate-map', data);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.message || 
            'There was an error generating your map.'
          );
        }
        const result = await response.json();
        return result as MapGenerationResult;
      } catch (error: any) {
        // Add additional context to the error if needed
        if (error.message.includes('content_policy_violation') || 
            error.message.includes('content that violates')) {
          throw new Error(
            'Your map description may contain content that can\'t be generated. ' +
            'Try using simpler language or different terms.'
          );
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      setGeneratedMap(data);
      toast({
        title: 'Map Generated!',
        description: 'Your fantasy map has been created successfully.',
      });
      
      // Scroll to the map if available
      setTimeout(() => {
        if (mapContainerRef.current) {
          mapContainerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    },
    onError: (error: any) => {
      console.error('Map generation error:', error);
      
      // Extract helpful information from the error
      let errorMessage = error.message;
      
      // Show a more user-friendly toast
      toast({
        title: 'Map Generation Failed',
        description: errorMessage || 'There was an error generating your map. Try a different description.',
        variant: 'destructive',
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: MapGenerationFormValues) => {
    generateMapMutation.mutate(values);
  };

  // Download generated map
  const downloadMap = () => {
    if (!generatedMap?.imageUrl) return;
    
    const link = document.createElement('a');
    link.href = generatedMap.imageUrl;
    link.download = `fantasy-map-${generatedMap.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Map Downloaded',
      description: 'Your map has been saved to your device.',
    });
  };

  // Copy image URL to clipboard
  const copyImageUrl = () => {
    if (!generatedMap?.imageUrl) return;
    
    navigator.clipboard.writeText(generatedMap.imageUrl);
    
    toast({
      title: 'URL Copied',
      description: 'Image URL has been copied to clipboard.',
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Form */}
      <div className="bg-card border border-border rounded-lg p-4" ref={formContainerRef}>
        <h3 className="text-lg font-semibold mb-4">Create Your World Map</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Map Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your world in detail. Include geography, key locations, and any special features..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="style"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Map Style</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={stylesLoading || generateMapMutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {effectiveStyles.mapStyles.map((style) => (
                          <SelectItem
                            key={style.value}
                            value={style.value}
                          >
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="artStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Art Style</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={stylesLoading || generateMapMutation.isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select art style" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {effectiveStyles.artStyles.map((style) => (
                          <SelectItem
                            key={style.value}
                            value={style.value}
                          >
                            {style.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={generateMapMutation.isPending}
            >
              {generateMapMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Map...
                </>
              ) : (
                "Generate Fantasy Map"
              )}
            </Button>
          </form>
        </Form>
      </div>

      {/* Map Preview */}
      <div 
        className="relative bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-center"
        ref={mapContainerRef}
      >
        <h3 className="text-lg font-semibold mb-4 self-start">Map Preview</h3>
        
        {generateMapMutation.isPending ? (
          <div className="flex flex-col items-center justify-center h-64 w-full">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
            <p className="mt-4 text-center text-muted-foreground">
              Generating your fantasy map...<br />
              This may take a moment
            </p>
          </div>
        ) : generatedMap ? (
          <div className="w-full">
            <div className="relative">
              <img 
                src={generatedMap.imageUrl} 
                alt="Generated fantasy map" 
                className="w-full h-auto rounded-md border border-border"
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={downloadMap}
                  className="bg-white/70 hover:bg-white/90"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={copyImageUrl}
                  className="bg-white/70 hover:bg-white/90"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <h4 className="font-medium">{generatedMap.style} map in {generatedMap.artStyle} style</h4>
              <div className="text-sm text-muted-foreground mt-1">
                {generatedMap.description.length > 120 
                  ? `${generatedMap.description.substring(0, 120)}...` 
                  : generatedMap.description}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 w-full border-2 border-dashed border-border rounded-md">
            <Image className="h-16 w-16 text-muted-foreground" />
            <p className="mt-4 text-center text-muted-foreground">
              Submit the form to generate your fantasy map
            </p>
          </div>
        )}
      </div>
    </div>
  );
}