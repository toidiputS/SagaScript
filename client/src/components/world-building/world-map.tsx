
import React, { useRef, useState, useEffect } from 'react';
import { MapControls } from './map-controls';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

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
  
  // Fetch the most recent map if available
  const { data: recentMaps } = useQuery<MapGenerationResult[]>({
    queryKey: ['/api/maps/recent'],
    enabled: !currentMap,
    onSuccess: (data) => {
      if (data && data.length > 0) {
        setCurrentMap(data[0]);
      }
    }
  });
  
  // Handle edit mode
  const handleEditClick = () => {
    setIsEditing(!isEditing);
    console.log('Edit mode:', !isEditing);
    // Additional edit mode logic here
  };
  
  // Handle fullscreen
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

  // Function to update the current map
  const setGeneratedMap = (mapData: MapGenerationResult) => {
    setCurrentMap(mapData);
    setIsLoading(false);
  };
  
  return (
    <div ref={mapContainerRef} className="relative w-full h-[500px] bg-slate-200 overflow-hidden">
      <div className="p-4">
        <h2 className="text-xl font-bold text-slate-800">World Map</h2>
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
