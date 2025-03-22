import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  UserPlus, 
  Globe, 
  LockIcon, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Users, 
  BookOpen, 
  Loader2 
} from 'lucide-react';

// Types
interface CollaborativeSeries {
  id: number;
  name: string;
  description: string;
  ownerId: number;
  coverImage?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CollaborativeSeriesCardProps {
  series: CollaborativeSeries;
  onInvite: (series: CollaborativeSeries) => void;
}

// Edit Series Form Schema
const editSeriesSchema = z.object({
  name: z.string().min(3, { message: "Series name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  isPublic: z.boolean(),
});

export default function CollaborativeSeriesCard({ series, onInvite }: CollaborativeSeriesCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const isOwner = series.ownerId === user?.id;

  // Define mutations
  const updateSeriesMutation = useMutation({
    mutationFn: (data: z.infer<typeof editSeriesSchema>) => 
      apiRequest('PATCH', `/api/collaboration/series/${series.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/series'] });
      setEditDialogOpen(false);
      toast({
        title: "Series updated",
        description: "Your collaborative series has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating series",
        description: error.message || "Failed to update collaborative series.",
        variant: "destructive"
      });
    }
  });

  const deleteSeriesMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', `/api/collaboration/series/${series.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/series'] });
      setDeleteDialogOpen(false);
      toast({
        title: "Series deleted",
        description: "Your collaborative series has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting series",
        description: error.message || "Failed to delete collaborative series.",
        variant: "destructive"
      });
    }
  });

  // Edit form
  const editForm = useForm<z.infer<typeof editSeriesSchema>>({
    resolver: zodResolver(editSeriesSchema),
    defaultValues: {
      name: series.name,
      description: series.description,
      isPublic: series.isPublic,
    },
  });

  // Form submission handlers
  const onEditSubmit = (values: z.infer<typeof editSeriesSchema>) => {
    updateSeriesMutation.mutate(values);
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="truncate">{series.name}</CardTitle>
          <div className="flex items-center gap-2">
            {series.isPublic ? (
              <Badge variant="outline" className="flex items-center">
                <Globe className="h-3 w-3 mr-1" />
                Public
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center">
                <LockIcon className="h-3 w-3 mr-1" />
                Private
              </Badge>
            )}
            
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditDialogOpen(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Series
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onInvite(series)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Collaborators
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Series
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        <CardDescription className="line-clamp-2">
          {series.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="text-sm text-muted-foreground mb-2">
          Created {new Date(series.createdAt).toLocaleDateString()}
        </div>
        <div className="flex items-center">
          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">Collaborative project</span>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <a href={`/series/${series.id}`}>
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            Open
          </a>
        </Button>
        {isOwner && (
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => onInvite(series)}
          >
            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
            Invite
          </Button>
        )}
      </CardFooter>

      {/* Edit Series Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Collaborative Series</DialogTitle>
            <DialogDescription>
              Update the details of your collaborative series
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Series Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter series name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your collaborative series"
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Public Series</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Make this series discoverable by other users
                      </div>
                    </div>
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="accent-primary h-5 w-5"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={updateSeriesMutation.isPending}
                >
                  {updateSeriesMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              collaborative series "{series.name}" and remove all collaborator access.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteSeriesMutation.mutate();
              }}
              disabled={deleteSeriesMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSeriesMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Series"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}