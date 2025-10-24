import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./use-auth";
import { apiRequest } from "@/lib/queryClient";
import { User, UserPreferences } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useUser() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (updates: Partial<Pick<User, 'displayName' | 'email' | 'bio' | 'location' | 'website' | 'socialLinks' | 'preferences'>>) => {
      const res = await apiRequest("PUT", "/api/profile", updates);
      return res.json() as Promise<User>;
    },
    onSuccess: (updatedUser) => {
      // Update both user and profile queries
      queryClient.setQueryData(["/api/user"], updatedUser);
      queryClient.setQueryData(["/api/profile"], updatedUser);
      toast({
        title: "Account Updated",
        description: "Your account information has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update account information",
        variant: "destructive",
      });
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: UserPreferences) => {
      const res = await apiRequest("PUT", "/api/user/preferences", { preferences });
      return res.json() as Promise<{ preferences: UserPreferences }>;
    },
    onSuccess: (data) => {
      // Update the user data with new preferences
      if (user) {
        const updatedUser = { ...user, preferences: data.preferences };
        queryClient.setQueryData(["/api/user"], updatedUser);
        queryClient.setQueryData(["/api/profile"], updatedUser);
      }
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been successfully saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update preferences",
        variant: "destructive",
      });
    },
  });

  return {
    user,
    updateUser: updateUserMutation.mutate,
    isUpdatingUser: updateUserMutation.isPending,
    updatePreferences: updatePreferencesMutation.mutate,
    isUpdatingPreferences: updatePreferencesMutation.isPending,
  };
}