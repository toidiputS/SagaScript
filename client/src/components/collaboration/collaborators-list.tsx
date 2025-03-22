import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Crown, UserMinus, AlertCircle, Loader2, ChevronDown, ShieldAlert, Edit, Eye, Settings } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';

interface Collaborator {
  id: number;
  collaborativeSeriesId: number;
  userId: number;
  role: string;
  permissions: {
    edit: boolean;
    manage: boolean;
    delete: boolean;
    invite: boolean;
    manageCollaborators: boolean;
  };
  user: {
    username: string;
    displayName: string;
  };
  joinedAt?: string;
}

interface CollaboratorsListProps {
  seriesId: number;
  isOwner: boolean;
}

export default function CollaboratorsList({ seriesId, isOwner }: CollaboratorsListProps) {
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState<Collaborator | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch collaborators
  const { 
    data: collaborators = [], 
    isLoading,
    error,
    isError
  } = useQuery<Collaborator[]>({
    queryKey: ['/api/collaboration/series', seriesId, 'collaborators'],
    queryFn: () => 
      apiRequest('GET', `/api/collaboration/series/${seriesId}/collaborators`)
        .then(res => res.json()),
  });

  // Update collaborator role
  const updateRoleMutation = useMutation({
    mutationFn: ({ collaboratorId, role }: { collaboratorId: number; role: string }) => 
      apiRequest('PATCH', `/api/collaboration/collaborators/${collaboratorId}`, {
        role
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/series', seriesId, 'collaborators'] });
      toast({
        title: "Role updated",
        description: "Collaborator role has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating role",
        description: error.message || "Failed to update collaborator role.",
        variant: "destructive"
      });
    }
  });

  // Remove collaborator
  const removeCollaboratorMutation = useMutation({
    mutationFn: (collaboratorId: number) => 
      apiRequest('DELETE', `/api/collaboration/collaborators/${collaboratorId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/series', seriesId, 'collaborators'] });
      setDeleteDialogOpen(false);
      toast({
        title: "Collaborator removed",
        description: "The collaborator has been removed from this series.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error removing collaborator",
        description: error.message || "Failed to remove collaborator.",
        variant: "destructive"
      });
    }
  });

  const handleRemoveCollaborator = (collaborator: Collaborator) => {
    setSelectedCollaborator(collaborator);
    setDeleteDialogOpen(true);
  };

  const handleRoleChange = (collaboratorId: number, newRole: string) => {
    updateRoleMutation.mutate({ collaboratorId, role: newRole });
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading collaborators</AlertTitle>
        <AlertDescription>
          {(error as Error).message || "Failed to load collaborators."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div>
      {collaborators.length === 0 ? (
        <div className="text-center py-6 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">
            No collaborators yet
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Collaborator</TableHead>
              <TableHead>Role</TableHead>
              {isOwner && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {collaborators.map(collaborator => (
              <TableRow key={collaborator.id}>
                <TableCell className="flex items-center space-x-2">
                  <div className="bg-primary/10 h-9 w-9 rounded-full flex items-center justify-center text-primary">
                    {collaborator.user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium flex items-center">
                      {collaborator.user.displayName || collaborator.user.username}
                      {collaborator.role === 'owner' && (
                        <Crown className="h-4 w-4 ml-1 text-amber-500" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      @{collaborator.user.username}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {isOwner && collaborator.userId !== user?.id ? (
                    <Select 
                      defaultValue={collaborator.role}
                      onValueChange={(value) => handleRoleChange(collaborator.id, value)}
                      disabled={updateRoleMutation.isPending}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-2" />
                            Viewer
                          </div>
                        </SelectItem>
                        <SelectItem value="editor">
                          <div className="flex items-center">
                            <Edit className="h-4 w-4 mr-2" />
                            Editor
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center">
                            <Settings className="h-4 w-4 mr-2" />
                            Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant={collaborator.role === 'owner' ? 'default' : 'outline'} className="capitalize">
                      {collaborator.role === 'owner' && <Crown className="h-3 w-3 mr-1" />}
                      {collaborator.role === 'admin' && <ShieldAlert className="h-3 w-3 mr-1" />}
                      {collaborator.role === 'editor' && <Edit className="h-3 w-3 mr-1" />}
                      {collaborator.role === 'viewer' && <Eye className="h-3 w-3 mr-1" />}
                      {collaborator.role}
                    </Badge>
                  )}
                </TableCell>
                {isOwner && (
                  <TableCell className="text-right">
                    {collaborator.userId !== user?.id && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveCollaborator(collaborator)}
                      >
                        <UserMinus className="h-4 w-4" />
                        <span className="sr-only">Remove</span>
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Remove Collaborator Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Collaborator</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {selectedCollaborator?.user.displayName || selectedCollaborator?.user.username} from this series?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (selectedCollaborator) {
                  removeCollaboratorMutation.mutate(selectedCollaborator.id);
                }
              }}
              disabled={removeCollaboratorMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {removeCollaboratorMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Collaborator"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}