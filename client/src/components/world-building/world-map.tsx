import React, { useRef, useState, useEffect } from 'react';
import { Loader2, Download, Copy, Image } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

import MapControls from './map-controls';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

// Map generation form schema
const mapGenerationSchema = z.object({
  description: z.string().min(10, "Description must be at least 10 characters"),
  style: z.string().min(1, "Please select a map style"),
  artStyle: z.string().min(1, "Please select an art style"),
});

// Define interfaces
interface MapGenerationFormValues {
  description: string;
  style: string;
  artStyle: string;
}

interface StyleOption {
  value: string;
  label: string;
  description: string;
}

interface StylesResponse {
  mapStyles: StyleOption[];
  artStyles: StyleOption[];
}

interface MapGenerationResult {
  id: string;
  imageUrl: string;
  prompt: string;
  description: string;
  style: string;
  artStyle: string;
  createdAt: string;
}

export function WorldMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMap, setCurrentMap] = useState<MapGenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [styles, setStyles] = useState<StylesResponse>({ mapStyles: [], artStyles: [] });
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

  const { mutate: generateMap, isLoading: isGenerating } = useMutation({
    mutationFn: (values: MapGenerationFormValues) => apiRequest('/api/maps', { method: 'POST', body: values }),
    onSuccess: (data) => {
      setGeneratedMap(data);
      useToast({ title: 'Map generated successfully!', description: 'Your map has been generated and is ready to view.' });
    },
    onError: (err) => {
      useToast({
        title: 'Error generating map',
        description: 'There was an error generating your map. Please try again later.',
        variant: 'destructive'
      })
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

  const { handleSubmit } = form;

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

  const setGeneratedMap = (mapData: MapGenerationResult) => {
    setCurrentMap(mapData);
    setIsLoading(false);
  };


  return (
    <div ref={mapContainerRef} className="relative w-full h-[500px] bg-slate-200 overflow-hidden">
      <div className="p-4">
        <h2 className="text-xl font-bold text-slate-800">World Map</h2>
      </div>

      <div className="p-4 flex flex-col">
        <Card>
          <CardHeader>
            <CardTitle>Generate New Map</CardTitle>
            <CardDescription>
              Create a new map for your world.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit(generateMap)}>
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
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Map'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Map content */}
      <div className="p-4 flex items-center justify-center h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-slate-600">Generating your map...</p>
          </div>
        ) : isEditing ? (
          <div className="bg-white p-4 rounded shadow">
            <p>Edit mode active. Implement your map editing interface here.</p>
          </div>
        ) : currentMap ? (
          <div className="flex flex-col items-center">
            <img
              src={currentMap.imageUrl}
              alt={`Generated ${currentMap.style} map in ${currentMap.artStyle} style`}
              className="max-h-[350px] max-w-full object-contain shadow-lg rounded"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/placeholder-map.png';
              }}
            />
            <p className="mt-2 text-sm text-slate-600">
              {currentMap.description}
            </p>
          </div>
        ) : (
          <div className="text-center text-slate-600">
            <p>No map available. Generate a new map to display here.</p>
            <p className="text-sm mt-2">Use the map generator to create your world</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <MapControls
        onEditClick={handleEditClick}
        onFullscreenClick={handleFullscreenClick}
        isEditing={isEditing}
      />
    </div>
  );
}

export { setIsLoading, setGeneratedMap } from './world-map-context';