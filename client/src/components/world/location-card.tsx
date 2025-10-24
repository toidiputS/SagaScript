import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import LocationForm from "./location-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Location } from "@shared/schema";

interface LocationCardProps {
  location: Location;
}

export default function LocationCard({ location }: LocationCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Delete location mutation
  const deleteLocationMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/locations/${location.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', location.seriesId, 'locations'] });
      toast({
        title: "Location deleted",
        description: "The location has been deleted successfully",
      });
    }
  });

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: async (data: Partial<Location>) => {
      const res = await apiRequest('PUT', `/api/locations/${location.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', location.seriesId, 'locations'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Location updated",
        description: "The location has been updated successfully",
      });
    }
  });

  // Handle location delete
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this location? This action cannot be undone.")) {
      deleteLocationMutation.mutate();
    }
  };

  // Format book appearances
  const formatBookAppearances = () => {
    if (!location.bookAppearances || (location.bookAppearances as any[]).length === 0) {
      return "None";
    }

    const books = location.bookAppearances as number[];
    if (books.length === 1) {
      return `Book ${books[0]}`;
    } else if (books.length === 2) {
      return `Books ${books[0]} and ${books[1]}`;
    } else {
      return `Books ${books.join(", ")}`;
    }
  };

  return (
    <div className="rounded-[30px] bg-card overflow-hidden shadow-[10px_10px_20px_rgba(33,150,243,0.12),-10px_-10px_20px_rgba(66,165,245,0.08)] hover:shadow-[15px_15px_25px_rgba(33,150,243,0.18),-15px_-15px_25px_rgba(66,165,245,0.12)] transition-shadow duration-300">
      <div className="relative">
        {location.image ? (
          <img 
            src={location.image}
            alt={location.name}
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-muted flex items-center justify-center text-muted-foreground">
            <i className="ri-map-pin-line text-4xl"></i>
          </div>
        )}
        {location.importance === "main" && (
          <div className="absolute top-2 right-2">
            <div className="px-2 py-1 bg-primary/80 backdrop-blur-sm rounded-md text-xs font-medium text-primary-foreground">
              Main Setting
            </div>
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-serif font-bold text-xl text-card-foreground">{location.name}</h3>
            <p className="text-muted-foreground text-sm">{location.locationType || "Location"}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-card-foreground line-clamp-3">
          {location.description || "No description provided."}
        </p>
        <div className="mt-4 text-xs text-muted-foreground">
          Appears in: {formatBookAppearances()}
        </div>
        <div className="mt-5 flex justify-between">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="link" className="text-primary hover:text-primary-dark text-sm font-medium p-0">
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Location: {location.name}</DialogTitle>
              </DialogHeader>
              <LocationForm
                initialData={location}
                onSubmit={(data) => {
                  updateLocationMutation.mutate(data);
                }}
                isSubmitting={updateLocationMutation.isPending}
                mode="edit"
              />
            </DialogContent>
          </Dialog>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-1.5 rounded hover:bg-muted text-muted-foreground h-auto"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <i className="ri-edit-line"></i>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1.5 rounded hover:bg-muted text-muted-foreground h-auto">
                  <i className="ri-more-2-fill"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <i className="ri-edit-line mr-2"></i> Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={deleteLocationMutation.isPending}
                  className="text-red-600"
                >
                  <i className="ri-delete-bin-line mr-2"></i> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
