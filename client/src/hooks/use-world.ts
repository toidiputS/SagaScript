import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Location, InsertLocation } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useWorld(seriesId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch locations for a series
  const { 
    data: locations,
    isLoading: isLoadingLocations,
    error: locationsError 
  } = useQuery({
    queryKey: ['/api/series', seriesId, 'locations'],
    queryFn: async () => {
      if (!seriesId) return [];
      const res = await apiRequest('GET', `/api/series/${seriesId}/locations`);
      return res.json() as Promise<Location[]>;
    },
    enabled: !!seriesId
  });

  // Add a new location
  const addLocationMutation = useMutation({
    mutationFn: async (location: InsertLocation) => {
      const res = await apiRequest('POST', '/api/locations', location);
      return res.json() as Promise<Location>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', seriesId, 'locations'] });
      toast({
        title: "Location added",
        description: "The location has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding location",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  // Update an existing location
  const updateLocationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: Partial<Location> }) => {
      const res = await apiRequest('PUT', `/api/locations/${id}`, updates);
      return res.json() as Promise<Location>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', seriesId, 'locations'] });
      toast({
        title: "Location updated",
        description: "The location has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating location",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  // Delete a location
  const deleteLocationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/locations/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', seriesId, 'locations'] });
      toast({
        title: "Location deleted",
        description: "The location has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting location",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  return {
    locations,
    isLoadingLocations,
    locationsError,
    addLocation: addLocationMutation.mutate,
    isAddingLocation: addLocationMutation.isPending,
    updateLocation: updateLocationMutation.mutate,
    isUpdatingLocation: updateLocationMutation.isPending,
    deleteLocation: deleteLocationMutation.mutate,
    isDeletingLocation: deleteLocationMutation.isPending
  };
}
