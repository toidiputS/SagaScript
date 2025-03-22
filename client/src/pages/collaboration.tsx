import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useFeatureAccess } from '@/lib/subscription';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { 
  Users, 
  UserPlus, 
  BookOpen, 
  Mail, 
  Check, 
  X, 
  Clock, 
  Plus, 
  Globe, 
  LockIcon, 
  Loader2, 
  MessageSquare,
  Share2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

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

interface CollaborationInvite {
  id: number;
  collaborativeSeriesId: number;
  inviterId: number;
  inviteeEmail: string;
  inviteeId?: number;
  role: string;
  status: string;
  inviteCode: string;
  expiresAt: string;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

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
}

// Create Series Form Schema
const createSeriesSchema = z.object({
  name: z.string().min(3, { message: "Series name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  isPublic: z.boolean().default(false),
});

// Invite Form Schema
const inviteSchema = z.object({
  inviteeEmail: z.string().email({ message: "Please enter a valid email address" }),
  role: z.enum(["viewer", "editor", "admin"], {
    required_error: "Please select a role",
  }),
  message: z.string().optional(),
});

export default function CollaborationPage() {
  const { canAccess } = useFeatureAccess();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my-series');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<CollaborativeSeries | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Define queries
  const { 
    data: collaborativeSeries = [], 
    isLoading: seriesLoading,
    error: seriesError 
  } = useQuery<CollaborativeSeries[]>({
    queryKey: ['/api/collaboration/series'],
    enabled: canAccess('communityCollaboration')
  });
  
  // Fetch pending invites for the current user
  const {
    data: pendingInvites = [],
    isLoading: invitesLoading,
    error: invitesError
  } = useQuery<CollaborationInvite[]>({
    queryKey: ['/api/collaboration/pending-invites'],
    enabled: canAccess('communityCollaboration')
  });

  // Define mutations
  const createSeriesMutation = useMutation({
    mutationFn: (data: z.infer<typeof createSeriesSchema>) => 
      apiRequest('POST', '/api/collaboration/series', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/series'] });
      setCreateDialogOpen(false);
      toast({
        title: "Series created",
        description: "Your collaborative series has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating series",
        description: error.message || "Failed to create collaborative series.",
        variant: "destructive"
      });
    }
  });

  const inviteCollaboratorMutation = useMutation({
    mutationFn: (data: z.infer<typeof inviteSchema> & { seriesId: number }) => 
      apiRequest('POST', `/api/collaboration/series/${data.seriesId}/invites`, {
        inviteeEmail: data.inviteeEmail,
        role: data.role,
        message: data.message
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/series'] });
      setInviteDialogOpen(false);
      toast({
        title: "Invitation sent",
        description: "Your invitation has been sent successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error sending invitation",
        description: error.message || "Failed to send invitation.",
        variant: "destructive"
      });
    }
  });
  
  const acceptInviteMutation = useMutation({
    mutationFn: (inviteId: number) => 
      apiRequest('POST', `/api/collaboration/invites/${inviteId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/pending-invites'] });
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/series'] });
      toast({
        title: "Invitation accepted",
        description: "You have joined the collaborative series.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error accepting invitation",
        description: error.message || "Failed to accept invitation.",
        variant: "destructive"
      });
    }
  });
  
  const declineInviteMutation = useMutation({
    mutationFn: (inviteId: number) => 
      apiRequest('POST', `/api/collaboration/invites/${inviteId}/decline`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/pending-invites'] });
      toast({
        title: "Invitation declined",
        description: "The invitation has been declined.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error declining invitation",
        description: error.message || "Failed to decline invitation.",
        variant: "destructive"
      });
    }
  });

  // Create form
  const createForm = useForm<z.infer<typeof createSeriesSchema>>({
    resolver: zodResolver(createSeriesSchema),
    defaultValues: {
      name: "",
      description: "",
      isPublic: false,
    },
  });

  // Invite form
  const inviteForm = useForm<z.infer<typeof inviteSchema>>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      inviteeEmail: "",
      role: "viewer",
      message: "",
    },
  });

  // Form submission handlers
  const onCreateSubmit = (values: z.infer<typeof createSeriesSchema>) => {
    createSeriesMutation.mutate(values);
  };

  const onInviteSubmit = (values: z.infer<typeof inviteSchema>) => {
    if (!selectedSeries) return;
    inviteCollaboratorMutation.mutate({
      ...values,
      seriesId: selectedSeries.id
    });
  };

  const handleInvite = (series: CollaborativeSeries) => {
    setSelectedSeries(series);
    setInviteDialogOpen(true);
    inviteForm.reset();
  };

  // Check if community collaboration feature is accessible
  if (!canAccess('communityCollaboration')) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Feature not available</AlertTitle>
          <AlertDescription>
            Community collaboration is only available on the Loremaster tier and above.
            Please upgrade your subscription to access this feature.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Collaborative Writing</CardTitle>
            <CardDescription>
              Work together with other writers on shared series and novels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <Users className="mr-3 h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Invite co-authors and editors</h3>
                  <p className="text-sm text-muted-foreground">
                    Collaborate with other writers on shared universe creation
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <MessageSquare className="mr-3 h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Real-time feedback</h3>
                  <p className="text-sm text-muted-foreground">
                    Get comments and suggestions from your collaborators
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Share2 className="mr-3 h-5 w-5 text-muted-foreground" />
                <div>
                  <h3 className="font-medium">Role-based permissions</h3>
                  <p className="text-sm text-muted-foreground">
                    Assign viewing, editing or administrative roles to team members
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline" asChild>
              <a href="/subscription">Upgrade Your Plan</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const isLoading = seriesLoading || invitesLoading;
  const error = seriesError || invitesError;
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading collaboration data</AlertTitle>
          <AlertDescription>
            {(error as Error).message || "Failed to load collaborative series."}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const ownedSeries = collaborativeSeries.filter(series => series.ownerId === user?.id);
  const contributingSeries = collaborativeSeries.filter(series => series.ownerId !== user?.id);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collaborative Writing</h1>
          <p className="text-muted-foreground">
            Create and manage collaborative writing projects
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Series
        </Button>
      </div>

      <Tabs defaultValue="my-series" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="my-series" className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            <span>My Series</span>
            <Badge className="ml-2" variant="secondary">{ownedSeries.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="contributing" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span>Contributing</span>
            <Badge className="ml-2" variant="secondary">{contributingSeries.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="invites" className="flex items-center">
            <Mail className="mr-2 h-4 w-4" />
            <span>Invites</span>
            <Badge className="ml-2" variant="secondary">{pendingInvites.length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-series" className="space-y-4">
          {ownedSeries.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No series yet</h3>
              <p className="text-muted-foreground mb-4">
                Create a collaborative series to start working with others
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Series
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ownedSeries.map(series => (
                <Card key={series.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="truncate">{series.name}</CardTitle>
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
                    </div>
                    <CardDescription className="line-clamp-2">
                      {series.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="text-sm text-muted-foreground mb-2">
                      Created {new Date(series.createdAt).toLocaleDateString()}
                    </div>
                    {/* Show collaborators count or placeholder */}
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">0 collaborators</span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/series/${series.id}`}>Open</a>
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => handleInvite(series)}
                    >
                      <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                      Invite
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="contributing" className="space-y-4">
          {contributingSeries.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Not contributing yet</h3>
              <p className="text-muted-foreground">
                You aren't collaborating on any series yet. When someone invites you,
                they will appear here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contributingSeries.map(series => (
                <Card key={series.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="truncate">{series.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {series.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="text-sm text-muted-foreground mb-2">
                      {/* Display owner info */}
                      Owner: {series.ownerId === user?.id ? 'You' : 'Another user'}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">Collaborating</span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={`/series/${series.id}`}>Open</a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invites" className="space-y-4">
          {pendingInvites.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No pending invites</h3>
              <p className="text-muted-foreground">
                You don't have any pending collaboration invites
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pendingInvites.map(invite => (
                <Card key={invite.id} className="flex flex-col">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>Collaboration Invite</CardTitle>
                      <Badge>{invite.role}</Badge>
                    </div>
                    {invite.message && (
                      <CardDescription className="mt-2">
                        "{invite.message}"
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <UserCircle2 className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">From: User #{invite.inviterId}</span>
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">Series ID: {invite.collaborativeSeriesId}</span>
                      </div>
                      <div className="flex items-center">
                        <CalendarClock className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="text-sm">
                          Expires: {new Date(invite.expiresAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t pt-4 flex justify-between">
                    <Button variant="outline" size="sm">
                      Decline
                    </Button>
                    <Button size="sm">
                      Accept
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Series Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Collaborative Series</DialogTitle>
            <DialogDescription>
              Create a new series to collaborate with other writers
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-6">
              <FormField
                control={createForm.control}
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
                control={createForm.control}
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
                control={createForm.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Public Series</FormLabel>
                      <FormDescription>
                        Make this series discoverable by other users
                      </FormDescription>
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
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createSeriesMutation.isPending}
                >
                  {createSeriesMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Series"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Invite Collaborator Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invite Collaborator</DialogTitle>
            <DialogDescription>
              {selectedSeries && `Invite someone to collaborate on "${selectedSeries.name}"`}
            </DialogDescription>
          </DialogHeader>
          <Form {...inviteForm}>
            <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="space-y-6">
              <FormField
                control={inviteForm.control}
                name="inviteeEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="collaborator@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Your collaborator will receive an invitation email
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={inviteForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Collaboration Role</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="viewer">Viewer (read-only)</SelectItem>
                        <SelectItem value="editor">Editor (can edit content)</SelectItem>
                        <SelectItem value="admin">Admin (manage series)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      This determines what the collaborator can do in the series
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={inviteForm.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personal Message (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add a personal message to your invitation"
                        className="resize-none"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInviteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={inviteCollaboratorMutation.isPending}
                >
                  {inviteCollaboratorMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Invitation"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}