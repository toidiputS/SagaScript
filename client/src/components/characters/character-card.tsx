import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import CharacterForm from "./character-form";
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
import { Badge } from "@/components/ui/badge";
import { Character } from "@shared/schema";

interface CharacterCardProps {
  character: Character;
}

export default function CharacterCard({ character }: CharacterCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Delete character mutation
  const deleteCharacterMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/characters/${character.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', character.seriesId, 'characters'] });
      toast({
        title: "Character deleted",
        description: "The character has been deleted successfully",
      });
    }
  });

  // Toggle character as favorite
  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('PUT', `/api/characters/${character.id}`, {
        isProtagonist: !character.isProtagonist
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', character.seriesId, 'characters'] });
      toast({
        title: character.isProtagonist ? "Removed from main characters" : "Added to main characters",
        description: `${character.name} is now a ${character.isProtagonist ? 'supporting' : 'main'} character`,
      });
    }
  });

  // Handle character delete
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this character? This action cannot be undone.")) {
      deleteCharacterMutation.mutate();
    }
  };

  // Format book appearances
  const formatBookAppearances = () => {
    if (!character.bookAppearances || (character.bookAppearances as any[]).length === 0) {
      return "None";
    }

    const books = character.bookAppearances as number[];
    if (books.length === 1) {
      return `Book ${books[0]}`;
    } else if (books.length === 2) {
      return `Books ${books[0]} and ${books[1]}`;
    } else {
      const bookRange = `${Math.min(...books)}-${Math.max(...books)}`;
      return `Books ${bookRange}`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        {character.avatar ? (
          <img 
            src={character.avatar}
            alt={character.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-neutral-100 flex items-center justify-center text-neutral-400">
            <i className="ri-user-5-line text-4xl"></i>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <button 
            className="p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-neutral-700 hover:bg-white"
            onClick={() => toggleFavoriteMutation.mutate()}
          >
            <i className={`${character.isProtagonist ? 'ri-star-fill text-yellow-500' : 'ri-star-line text-neutral-400 hover:text-yellow-500'}`}></i>
          </button>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-serif font-bold text-xl text-neutral-800">{character.name}</h3>
            <p className="text-neutral-600 text-sm">{character.role || "Character"}</p>
          </div>
          <div>
            <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
              {formatBookAppearances()}
            </Badge>
          </div>
        </div>
        <div className="mt-4 space-y-2 text-sm text-neutral-700">
          {character.age && (
            <div className="flex">
              <span className="w-24 text-neutral-500">Age</span>
              <span>{character.age}</span>
            </div>
          )}
          {character.occupation && (
            <div className="flex">
              <span className="w-24 text-neutral-500">Occupation</span>
              <span>{character.occupation}</span>
            </div>
          )}
          {character.status && (
            <div className="flex">
              <span className="w-24 text-neutral-500">Status</span>
              <span className={character.status.toLowerCase().includes('deceased') ? 'text-error' : ''}>{character.status}</span>
            </div>
          )}
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
                <DialogTitle>Edit Character: {character.name}</DialogTitle>
              </DialogHeader>
              <CharacterForm 
                initialData={character}
                onSubmit={(data) => {
                  // Handle edit submission - this will use the update endpoint
                  const updateCharacterMutation = useMutation({
                    mutationFn: async () => {
                      const res = await apiRequest('PUT', `/api/characters/${character.id}`, data);
                      return res.json();
                    },
                    onSuccess: () => {
                      queryClient.invalidateQueries({ queryKey: ['/api/series', character.seriesId, 'characters'] });
                      setIsEditDialogOpen(false);
                      toast({
                        title: "Character updated",
                        description: "The character has been updated successfully",
                      });
                    }
                  });
                  
                  updateCharacterMutation.mutate();
                }}
                mode="edit"
              />
            </DialogContent>
          </Dialog>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 h-auto">
              <i className="ri-edit-line"></i>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="p-1.5 rounded hover:bg-neutral-100 text-neutral-500 h-auto">
                  <i className="ri-more-2-fill"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <i className="ri-edit-line mr-2"></i> Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => toggleFavoriteMutation.mutate()}
                  disabled={toggleFavoriteMutation.isPending}
                >
                  <i className={`${character.isProtagonist ? 'ri-star-line' : 'ri-star-fill'} mr-2`}></i>
                  {character.isProtagonist ? "Remove from main" : "Mark as main"}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleDelete}
                  disabled={deleteCharacterMutation.isPending}
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
