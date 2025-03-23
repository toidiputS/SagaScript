import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Location } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface WorldMapProps {
  locations: Location[];
  seriesId: number;
}

interface MapMarker {
  id: number;
  x: number;
  y: number;
  name: string;
  type: string;
  color: string;
  icon: string;
}

export default function WorldMap({ locations, seriesId }: WorldMapProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isPlacingMarker, setIsPlacingMarker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Update location mutation for updating map coordinates
  const updateLocationCoordsMutation = useMutation({
    mutationFn: async ({ id, x, y }: { id: number; x: number; y: number }) => {
      const res = await apiRequest('PUT', `/api/locations/${id}`, {
        mapCoordinates: { x, y }
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', seriesId, 'locations'] });
      setIsPlacingMarker(false);
      toast({
        title: "Location placed",
        description: "The location has been placed on the map",
      });
    }
  });

  // Get markers from locations with map coordinates
  const getMarkers = (): MapMarker[] => {
    return locations
      .filter(loc => loc.mapCoordinates)
      .map(loc => {
        // Determine icon and color based on locationType
        let icon = "ri-map-pin-line";
        let color = "#3B82F6"; // default blue

        switch (loc.locationType?.toLowerCase()) {
          case "city":
          case "town":
          case "village":
            icon = "ri-building-line";
            color = "#3B82F6"; // blue
            break;
          case "castle":
          case "fortress":
          case "temple":
            icon = "ri-ancient-gate-line";
            color = "#4F46E5"; // indigo
            break;
          case "forest":
          case "jungle":
          case "natural":
            icon = "ri-plant-line";
            color = "#10B981"; // green
            break;
          case "ocean":
          case "sea":
          case "lake":
          case "river":
            icon = "ri-water-flash-line";
            color = "#0EA5E9"; // sky blue
            break;
          case "mountain":
          case "desert":
            icon = "ri-mountain-line";
            color = "#F59E0B"; // amber
            break;
          case "dungeon":
          case "cave":
            icon = "ri-sword-line";
            color = "#EF4444"; // red
            break;
        }

        return {
          id: loc.id,
          x: (loc.mapCoordinates as any).x,
          y: (loc.mapCoordinates as any).y,
          name: loc.name,
          type: loc.locationType || "Location",
          color,
          icon
        };
      });
  };

  // Handle map click for placing markers
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPlacingMarker || !selectedLocation) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    updateLocationCoordsMutation.mutate({
      id: selectedLocation.id,
      x,
      y
    });
  };

  // Handle zoom in/out
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  // Start placing a marker
  const startPlacingMarker = (location: Location) => {
    setSelectedLocation(location);
    setIsPlacingMarker(true);
    setIsDetailsOpen(false);
    toast({
      title: "Place location",
      description: "Click on the map to place this location"
    });
  };

  // Cancel placing a marker
  const cancelPlacingMarker = () => {
    setIsPlacingMarker(false);
    setSelectedLocation(null);
  };

  // Show location details
  const showLocationDetails = (location: Location) => {
    setSelectedLocation(location);
    setIsDetailsOpen(true);
  };

  return (
    <div className="relative">
      {/* Map container */}
      <div 
        ref={mapRef}
        className="relative overflow-hidden world-map-container" /* Added class for styling */
        onClick={handleMapClick}
        style={{ cursor: isPlacingMarker ? 'crosshair' : 'default' }}
      >
        {/* The map image */}
        <div 
          className="w-full h-96 bg-neutral-100 flex items-center justify-center relative overflow-hidden"
          style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center" }}
        >
          <img 
            src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
            alt="Fantasy world map" 
            className="w-full h-full object-cover"
          />

          {/* Map Markers */}
          {getMarkers().map((marker) => (
            <div 
              key={marker.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ 
                left: `${marker.x}%`, 
                top: `${marker.y}%`,
                zIndex: selectedLocation?.id === marker.id ? 10 : 1
              }}
              onClick={(e) => {
                e.stopPropagation();
                showLocationDetails(locations.find(l => l.id === marker.id)!);
              }}
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-white transition-all hover:scale-110"
                style={{ backgroundColor: marker.color }}
              >
                <i className={marker.icon}></i>
              </div>
              {selectedLocation?.id === marker.id && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow-sm text-xs whitespace-nowrap world-map-label"> {/* Added class for styling */}
                  {marker.name}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Map Controls */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-md p-1 shadow-sm">
        <div className="flex flex-col">
          <button 
            className="p-1.5 hover:bg-neutral-100 rounded map-control-button" /* Added class for styling */
            onClick={handleZoomIn}
          >
            <i className="ri-zoom-in-line"></i>
          </button>
          <button 
            className="p-1.5 hover:bg-neutral-100 rounded map-control-button" 
            onClick={handleZoomOut}
          >
            <i className="ri-zoom-out-line"></i>
          </button>
          <div className="border-t border-neutral-200 my-1"></div>
          <button 
            className="p-1.5 hover:bg-neutral-100 rounded map-control-button" 
            onClick={() => setZoomLevel(1)}
          >
            <i className="ri-compass-3-line"></i>
          </button>
        </div>
      </div>

      {/* Placing marker indicator */}
      {isPlacingMarker && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-md p-2 shadow-sm">
          <div className="flex items-center">
            <div className="mr-2 text-primary">
              <i className="ri-map-pin-line"></i>
            </div>
            <span className="text-sm">Placing: {selectedLocation?.name}</span>
            <button 
              className="ml-2 p-1 hover:bg-neutral-100 rounded map-control-button" {/* Added class for styling */}
              onClick={cancelPlacingMarker}
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
        </div>
      )}

      {/* Place location dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="world-map-title">{selectedLocation?.name}</DialogTitle> {/* Added class for styling */}
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-neutral-700">
              {selectedLocation?.description || "No description provided."}
            </p>
            <div className="text-sm">
              <span className="font-medium">Type:</span> {selectedLocation?.locationType || "Not specified"}
            </div>
            <div className="text-sm">
              <span className="font-medium">Appears in:</span> {selectedLocation?.bookAppearances && (selectedLocation.bookAppearances as number[]).length > 0 
                ? `Book${(selectedLocation.bookAppearances as number[]).length > 1 ? 's' : ''} ${(selectedLocation.bookAppearances as number[]).join(', ')}` 
                : "Not specified"}
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="secondary" className="place-button" {/* Added class for styling */}
                onClick={() => startPlacingMarker(selectedLocation!)}
              >
                <i className="ri-map-pin-line mr-2"></i> Place on Map
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Location placement dropdown */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-md p-2 shadow-sm max-w-xs">
        <p className="text-xs text-neutral-600 mb-2">Place locations on the map:</p>
        <select 
          className="w-full text-sm border border-neutral-200 rounded p-1 location-selector" {/* Added class for styling */}
          value=""
          onChange={(e) => {
            const locId = parseInt(e.target.value);
            if (!isNaN(locId)) {
              const location = locations.find(l => l.id === locId);
              if (location) {
                startPlacingMarker(location);
              }
            }
          }}
        >
          <option value="" disabled>Select a location to place</option>
          {locations
            .filter(loc => !loc.mapCoordinates)
            .map(loc => (
              <option key={loc.id} value={loc.id} className="location-selector"> {/* Added class for styling */}
                {loc.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
}