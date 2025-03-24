import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapControls } from './map-controls';
import { apiRequest } from '@/lib/api';
import { mapGenerationSchema, type MapGenerationFormValues } from '@/shared/schema';
import { WorldMapContext } from './world-map-context';

interface MapGenerationResult {
  id: string;
  imageUrl: string;
  prompt: string;
  description: string;
  style: string;
  artStyle: string;
  createdAt: string;
}

interface StylesResponse {
  mapStyles: Array<{ value: string; label: string }>;
  artStyles: Array<{ value: string; label: string }>;
}

export function WorldMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMap, setCurrentMap] = useState<MapGenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [styles, setStyles] = useState<StylesResponse>({ mapStyles: [], artStyles: [] });
  const { toast } = useToast();

  const { data: recentMaps } = useQuery<MapGenerationResult[]>({
    queryKey: ['/api/maps/recent'],
    enabled: !currentMap,
    onSuccess: (data) => {
      if (data && data.length > 0) {
        setCurrentMap(data[0]);
      }
    }
  });

  const { data: styleData } = useQuery<StylesResponse>({
    queryKey: ['/api/map-styles'],
    onSuccess: (data) => {
      setStyles(data);
    }
  });

  const form = useForm<MapGenerationFormValues>({
    resolver: zodResolver(mapGenerationSchema),
    defaultValues: {
      description: '',
      style: '',
      artStyle: '',
    },
  });

  const { mutate: generateMap, isLoading: isGenerating } = useMutation({
    mutationFn: (values: MapGenerationFormValues) => apiRequest('/api/maps', { method: 'POST', body: values }),
    onSuccess: (data) => {
      setCurrentMap(data);
      setIsLoading(false);
      toast({
        title: 'Map generated successfully!',
        description: 'Your map has been generated and is ready to view.'
      });
    },
    onError: (err) => {
      toast({
        title: 'Error generating map',
        description: 'There was an error generating your map. Please try again later.',
        variant: 'destructive'
      });
    }
  });

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleFullscreenClick = () => {
    if (mapContainerRef.current) {
      if (!document.fullscreenElement) {
        mapContainerRef.current.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div ref={mapContainerRef} className="relative w-full bg-slate-200 overflow-hidden">
      <div className="p-4">
        <h2 className="text-xl font-bold text-slate-800">World Map</h2>
      </div>

      <div className="p-4 flex flex-col">
        <Card>
          <CardHeader>
            <CardTitle>Generate New Map</CardTitle>
            <CardDescription>Create a new map for your world.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(generateMap)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <Textarea placeholder="Describe your world..." {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Map Style</FormLabel>
                      <Select {...field}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a map style" />
                        </SelectTrigger>
                        <SelectContent>
                          {styles.mapStyles.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
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
                      <Select {...field}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an art style" />
                        </SelectTrigger>
                        <SelectContent>
                          {styles.artStyles.map((style) => (
                            <SelectItem key={style.value} value={style.value}>
                              {style.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isGenerating}>
                  {isGenerating ? 'Generating...' : 'Generate Map'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {currentMap && (
          <div className="mt-4">
            <img src={currentMap.imageUrl} alt="Generated Map" className="w-full h-auto" />
          </div>
        )}
      </div>

      <MapControls
        onEditClick={handleEditClick}
        onFullscreenClick={handleFullscreenClick}
        isEditing={isEditing}
      />
    </div>
  );
}

export { setIsLoading, setGeneratedMap } from './world-map-context';