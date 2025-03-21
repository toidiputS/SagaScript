import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Character, CharacterRelationship, InsertCharacter } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useCharacters(seriesId?: number) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch characters for a series
  const { 
    data: characters,
    isLoading: isLoadingCharacters,
    error: charactersError 
  } = useQuery({
    queryKey: ['/api/series', seriesId, 'characters'],
    queryFn: async () => {
      if (!seriesId) return [];
      const res = await apiRequest('GET', `/api/series/${seriesId}/characters`);
      return res.json() as Promise<Character[]>;
    },
    enabled: !!seriesId
  });

  // Fetch character relationships for a series
  const { 
    data: relationships,
    isLoading: isLoadingRelationships,
    error: relationshipsError 
  } = useQuery({
    queryKey: ['/api/series', seriesId, 'character-relationships'],
    queryFn: async () => {
      if (!seriesId) return [];
      const res = await apiRequest('GET', `/api/series/${seriesId}/character-relationships`);
      return res.json() as Promise<CharacterRelationship[]>;
    },
    enabled: !!seriesId
  });

  // Add a new character
  const addCharacterMutation = useMutation({
    mutationFn: async (character: Omit<InsertCharacter, 'bookAppearances'> & { bookAppearances: number[] }) => {
      // Ensure bookAppearances is a valid JSON array
      const characterToAdd = {
        ...character,
        bookAppearances: Array.isArray(character.bookAppearances) ? character.bookAppearances : []
      };
      
      const res = await apiRequest('POST', '/api/characters', characterToAdd);
      return res.json() as Promise<Character>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', seriesId, 'characters'] });
      toast({
        title: "Character added",
        description: "The character has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding character",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  // Update an existing character
  const updateCharacterMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number, updates: Partial<Character> }) => {
      // Handle bookAppearances properly if it's being updated
      let updatesToSend = updates;
      
      if (updates.bookAppearances !== undefined) {
        updatesToSend = {
          ...updates,
          bookAppearances: Array.isArray(updates.bookAppearances) ? updates.bookAppearances : []
        };
      }
      
      const res = await apiRequest('PUT', `/api/characters/${id}`, updatesToSend);
      return res.json() as Promise<Character>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', seriesId, 'characters'] });
      toast({
        title: "Character updated",
        description: "The character has been updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating character",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  // Delete a character
  const deleteCharacterMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/characters/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', seriesId, 'characters'] });
      toast({
        title: "Character deleted",
        description: "The character has been deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting character",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  // Add a new relationship between characters
  const addRelationshipMutation = useMutation({
    mutationFn: async (relationship: { 
      sourceCharacterId: number, 
      targetCharacterId: number, 
      relationshipType: string, 
      description?: string 
    }) => {
      const res = await apiRequest('POST', '/api/character-relationships', relationship);
      return res.json() as Promise<CharacterRelationship>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/series', seriesId, 'character-relationships'] });
      toast({
        title: "Relationship added",
        description: "The character relationship has been added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding relationship",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  });

  return {
    characters,
    isLoadingCharacters,
    charactersError,
    relationships,
    isLoadingRelationships,
    relationshipsError,
    addCharacter: addCharacterMutation.mutate,
    isAddingCharacter: addCharacterMutation.isPending,
    updateCharacter: updateCharacterMutation.mutate,
    isUpdatingCharacter: updateCharacterMutation.isPending,
    deleteCharacter: deleteCharacterMutation.mutate,
    isDeletingCharacter: deleteCharacterMutation.isPending,
    addRelationship: addRelationshipMutation.mutate,
    isAddingRelationship: addRelationshipMutation.isPending
  };
}
