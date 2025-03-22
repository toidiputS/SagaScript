import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface CollaborationInvite {
  id: number;
  collaborativeSeriesId: number;
  seriesName?: string; // Joined from collaborative series
  inviterId: number;
  inviterName?: string; // Joined from users
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

export default function InvitesList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch pending invites
  const { 
    data: invites = [], 
    isLoading,
    error,
    isError
  } = useQuery<CollaborationInvite[]>({
    queryKey: ['/api/collaboration/invites/pending'],
  });

  // Accept invitation
  const acceptMutation = useMutation({
    mutationFn: (inviteCode: string) => 
      apiRequest('POST', `/api/collaboration/invites/${inviteCode}/accept`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/invites/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/series'] });
      toast({
        title: "Invitation accepted",
        description: "You are now a collaborator on this series.",
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

  // Decline invitation
  const declineMutation = useMutation({
    mutationFn: (inviteCode: string) => 
      apiRequest('POST', `/api/collaboration/invites/${inviteCode}/decline`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/collaboration/invites/pending'] });
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading invitations</AlertTitle>
        <AlertDescription>
          {(error as Error).message || "Failed to load collaboration invitations."}
        </AlertDescription>
      </Alert>
    );
  }

  if (invites.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-muted/10">
        <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No pending invites</h3>
        <p className="text-muted-foreground">
          You don't have any pending collaboration invites
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invites.map(invite => (
        <Card key={invite.id}>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">{invite.seriesName || "Collaborative Series"}</CardTitle>
              <Badge variant="outline" className="capitalize">
                {invite.role}
              </Badge>
            </div>
            <CardDescription>
              Invited by {invite.inviterName || "another user"} on {new Date(invite.createdAt).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invite.message && (
              <div className="bg-muted p-3 rounded-md mb-4 italic text-sm">
                "{invite.message}"
              </div>
            )}
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-4 w-4 mr-2" />
              <span>
                Expires on {new Date(invite.expiresAt).toLocaleDateString()} at {new Date(invite.expiresAt).toLocaleTimeString()}
              </span>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => declineMutation.mutate(invite.inviteCode)}
              disabled={declineMutation.isPending}
            >
              {declineMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4 mr-2" />}
              Decline
            </Button>
            <Button 
              onClick={() => acceptMutation.mutate(invite.inviteCode)}
              disabled={acceptMutation.isPending}
            >
              {acceptMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
              Accept
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}