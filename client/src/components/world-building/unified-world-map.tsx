import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  Download, 
  Copy, 
  Image, 
  Edit, 
  Maximize, 
  Minimize,
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

export function UnifiedWorldMap({ selectedSeries }: { selectedSeries?: number | null }) {
  console.log("Debug: UnifiedWorldMap rendering with selectedSeries =", selectedSeries);
  
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'generator' | 'history'>('generator');
  const [generatedMap, setGeneratedMap] = useState<MapGenerationResult | null>(null);
  const [mapHistory, setMapHistory] = useState<MapGenerationResult[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Fetch map styles and art styles
  const { data: styles, isLoading: stylesLoading, isError: stylesError } = useQuery<StylesResponse>({
    queryKey: ['/api/ai/map-styles'],
    retry: 1,
  });
  
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
  
  // Use default styles if the API call fails or is loading
  const effectiveStyles = {
    mapStyles: styles?.mapStyles || defaultMapStyles,
    artStyles: styles?.artStyles || defaultArtStyles
  };

  // Fetch map history
  useEffect(() => {
    // In a real implementation, we would fetch the user's map history from the API
    // For now, we'll just use the local state
    // This would be an API call like: apiRequest('GET', '/api/maps/history')
  }, []);

  // Form setup
  const form = useForm<MapGenerationFormValues>({
    resolver: zodResolver(mapGenerationSchema),
    defaultValues: {
      description: '',
      style: effectiveStyles.mapStyles[0]?.value || 'fantasy',
      artStyle: effectiveStyles.artStyles[0]?.value || 'ink-and-parchment',
      seriesId: selectedSeries || undefined,
    },
  });

  // Set seriesId when selectedSeries changes
  useEffect(() => {
    if (selectedSeries) {
      form.setValue('seriesId', selectedSeries);
    }
  }, [selectedSeries, form]);

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
      setMapHistory((prev) => [data, ...prev]);
      toast({
        title: 'Map Generated!',
        description: 'Your fantasy map has been created successfully.',
      });
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

  // Example map descriptions
  const exampleDescriptions = [
    'A coastal kingdom with a central mountain range, dense forests in the north, and a desert in the south. The capital city sits by a large river delta.',
    'A sci-fi space station with multiple levels, docking bays, residential areas, and a central command hub.',
    'An ancient island civilization with volcanic mountains, tropical forests, and ruins of a fallen empire scattered throughout the landscape.',
    'A post-apocalyptic city with flooded districts, overgrown skyscrapers, and nomadic settlements built upon the ruins of the old world.',
  ];

  // Handle form submission
  const onSubmit = (values: MapGenerationFormValues) => {
    generateMapMutation.mutate(values);
  };

  // Load a sample description
  const loadSampleDescription = (index: number) => {
    form.setValue('description', exampleDescriptions[index]);
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

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!mapContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      mapContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Map controls component
  const MapControls = () => {
    return (
      <div className="absolute top-2 right-2 flex space-x-2 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsEditing(!isEditing)}
          title={isEditing ? "Exit Edit Mode" : "Edit Map"}
          className="bg-white/50 hover:bg-white/80 text-gray-800"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleFullscreen}
          title="Toggle Fullscreen"
          className="bg-white/50 hover:bg-white/80 text-gray-800"
        >
          {isFullscreen ? (
            <Minimize className="h-4 w-4" />
          ) : (
            <Maximize className="h-4 w-4" />
          )}
        </Button>
        {generatedMap && (
          <>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={downloadMap}
              title="Download Map"
              className="bg-white/50 hover:bg-white/80 text-gray-800"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={copyImageUrl}
              title="Copy Image URL"
              className="bg-white/50 hover:bg-white/80 text-gray-800"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    );
  };

  return (
    <div ref={mapContainerRef} className="bg-background rounded-lg shadow-sm overflow-hidden border border-border">
      <Tabs defaultValue="generator" onValueChange={(value) => setActiveView(value as 'generator' | 'history')}>
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-bold">World Map</h2>
          <TabsList>
            <TabsTrigger value="generator">Map Generator</TabsTrigger>
            <TabsTrigger value="history">Map History</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="generator" className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map Generation Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Generate a New Map</CardTitle>
                  <CardDescription>
                    Describe your world and choose a style for your map.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
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

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="style"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Map Style</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                disabled={stylesLoading}
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
                                disabled={stylesLoading}
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

                      <div>
                        <Button
                          type="submit"
                          className="w-full"
                          disabled={generateMapMutation.isPending}
                        >
                          {generateMapMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating Map...
                            </>
                          ) : (
                            "Generate Map"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col">
                  <Separator className="my-2" />
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="examples">
                      <AccordionTrigger>Need inspiration?</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2">
                          {exampleDescriptions.map((desc, index) => (
                            <Button
                              key={index}
                              variant="ghost"
                              className="text-left text-sm w-full justify-start"
                              onClick={() => loadSampleDescription(index)}
                            >
                              {desc.substring(0, 70)}...
                            </Button>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardFooter>
              </Card>
              
              {/* Style descriptions */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Map Styles</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    {effectiveStyles.mapStyles.map((style) => (
                      <div key={style.value}>
                        <span className="font-semibold">{style.label}:</span>{' '}
                        {style.description}
                      </div>
                    ))}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Art Styles</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    {effectiveStyles.artStyles.map((style) => (
                      <div key={style.value}>
                        <span className="font-semibold">{style.label}:</span>{' '}
                        {style.description}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Map Preview */}
            <div className="relative">
              <Card className="h-full flex flex-col">
                <CardHeader>
                  <CardTitle>Map Preview</CardTitle>
                  <CardDescription>
                    {generatedMap
                      ? `${generatedMap.style} map in ${generatedMap.artStyle} style`
                      : "Your generated map will appear here"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col items-center justify-center p-4 relative">
                  {!generatedMap && !generateMapMutation.isPending && (
                    <div className="text-center p-8 border-2 border-dashed rounded-lg w-full h-full flex flex-col items-center justify-center">
                      <Image className="h-16 w-16 mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        Use the form on the left to generate a map
                      </p>
                    </div>
                  )}
                  
                  {generateMapMutation.isPending && (
                    <div className="text-center p-8 border-2 border-dashed rounded-lg w-full h-full flex flex-col items-center justify-center">
                      <Loader2 className="h-16 w-16 mb-4 animate-spin text-primary" />
                      <p className="text-muted-foreground">
                        Generating your map...
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        This may take up to a minute
                      </p>
                    </div>
                  )}
                  
                  {generatedMap && !generateMapMutation.isPending && (
                    <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
                      <img
                        src={generatedMap.imageUrl}
                        alt="Generated Fantasy Map"
                        className="max-w-full max-h-[500px] object-contain rounded-md shadow-md"
                      />
                      <MapControls />
                    </div>
                  )}
                </CardContent>
                
                {generatedMap && (
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={downloadMap}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" onClick={copyImageUrl}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy URL
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="history" className="p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Your Generated Maps</h3>
            <p className="text-muted-foreground">
              View and reuse maps you've previously generated
            </p>
          </div>
          
          {mapHistory.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">
                You haven't generated any maps yet. Create your first map to see it here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mapHistory.map((map) => (
                <Card key={map.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <img
                      src={map.imageUrl}
                      alt={`Map: ${map.description.substring(0, 20)}...`}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                      <div className="text-white">
                        <p className="text-sm font-medium truncate">
                          {map.style} - {map.artStyle}
                        </p>
                        <p className="text-xs opacity-80 truncate">
                          {new Date(map.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <CardFooter className="p-3 flex justify-between">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setGeneratedMap(map)}
                    >
                      View
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = map.imageUrl;
                        link.download = `map-${map.id}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}