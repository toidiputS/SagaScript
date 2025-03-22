import { Router } from 'express';
import { randomBytes } from 'crypto';
import { storage } from '../storage';
import { z } from 'zod';
import { insertCollaborativeSeriesSchema, insertCollaboratorSchema, insertCollaborationInviteSchema, insertCommentSchema, insertFeedbackRequestSchema, insertFeedbackResponseSchema } from '@shared/schema';

const router = Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized - Please log in' });
  }
  next();
};

// Create a collaborative series
router.post('/series', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Validate input
    const collaborativeSeriesData = insertCollaborativeSeriesSchema.parse({
      ...req.body,
      ownerId: userId,
    });
    
    // Check if user owns the series
    const userSeries = await storage.getSeries(collaborativeSeriesData.seriesId);
    if (!userSeries || userSeries.userId !== userId) {
      return res.status(403).json({ message: 'You can only share series that you own' });
    }
    
    // Create the collaborative series
    const collaborativeSeries = await storage.createCollaborativeSeries(collaborativeSeriesData);
    
    // Add the owner as a collaborator with full access
    await storage.createCollaborator({
      collaborativeSeriesId: collaborativeSeries.id,
      userId,
      role: 'owner',
      permissions: {
        manageCollaborators: true,
        manageSettings: true,
        editContent: true,
        addCharacters: true,
        editCharacters: true,
        addLocations: true,
        editLocations: true,
        addBooks: true,
        editBooks: true,
        addComments: true,
      },
    });
    
    res.status(201).json(collaborativeSeries);
  } catch (error) {
    console.error('Error creating collaborative series:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to create collaborative series' });
  }
});

// Get all collaborative series where user is owner or collaborator
router.get('/series', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const series = await storage.getCollaborativeSeriesByUser(userId);
    res.json(series);
  } catch (error) {
    console.error('Error getting collaborative series:', error);
    res.status(500).json({ message: 'Failed to get collaborative series' });
  }
});

// Get a specific collaborative series
router.get('/series/:id', isAuthenticated, async (req, res) => {
  try {
    const seriesId = parseInt(req.params.id);
    const userId = req.user.id;
    
    const collaborativeSeries = await storage.getCollaborativeSeries(seriesId);
    if (!collaborativeSeries) {
      return res.status(404).json({ message: 'Collaborative series not found' });
    }
    
    // Check if user has access to the series
    const hasAccess = await storage.userHasAccessToCollaborativeSeries(userId, seriesId);
    if (!hasAccess && !collaborativeSeries.isPublic) {
      return res.status(403).json({ message: 'You do not have access to this series' });
    }
    
    res.json(collaborativeSeries);
  } catch (error) {
    console.error('Error getting collaborative series:', error);
    res.status(500).json({ message: 'Failed to get collaborative series' });
  }
});

// Update a collaborative series
router.patch('/series/:id', isAuthenticated, async (req, res) => {
  try {
    const seriesId = parseInt(req.params.id);
    const userId = req.user.id;
    
    // Check if user is the owner or has admin permissions
    const collaborator = await storage.getCollaborator(seriesId, userId);
    if (!collaborator || (collaborator.role !== 'owner' && !collaborator.permissions.manageSettings)) {
      return res.status(403).json({ message: 'You do not have permission to update this series' });
    }
    
    const updates = req.body;
    // Don't allow changing owner or seriesId
    delete updates.ownerId;
    delete updates.seriesId;
    
    const updatedSeries = await storage.updateCollaborativeSeries(seriesId, updates);
    res.json(updatedSeries);
  } catch (error) {
    console.error('Error updating collaborative series:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to update collaborative series' });
  }
});

// Delete a collaborative series
router.delete('/series/:id', isAuthenticated, async (req, res) => {
  try {
    const seriesId = parseInt(req.params.id);
    const userId = req.user.id;
    
    // Check if user is the owner
    const collaborativeSeries = await storage.getCollaborativeSeries(seriesId);
    if (!collaborativeSeries) {
      return res.status(404).json({ message: 'Collaborative series not found' });
    }
    
    if (collaborativeSeries.ownerId !== userId) {
      return res.status(403).json({ message: 'Only the owner can delete a collaborative series' });
    }
    
    await storage.deleteCollaborativeSeries(seriesId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting collaborative series:', error);
    res.status(500).json({ message: 'Failed to delete collaborative series' });
  }
});

// Get all collaborators for a series
router.get('/series/:id/collaborators', isAuthenticated, async (req, res) => {
  try {
    const seriesId = parseInt(req.params.id);
    const userId = req.user.id;
    
    // Check if user has access to the series
    const hasAccess = await storage.userHasAccessToCollaborativeSeries(userId, seriesId);
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have access to this series' });
    }
    
    const collaborators = await storage.getCollaboratorsBySeriesId(seriesId);
    res.json(collaborators);
  } catch (error) {
    console.error('Error getting collaborators:', error);
    res.status(500).json({ message: 'Failed to get collaborators' });
  }
});

// Add a new collaborator directly (without invitation)
router.post('/series/:id/collaborators', isAuthenticated, async (req, res) => {
  try {
    const seriesId = parseInt(req.params.id);
    const userId = req.user.id;
    
    // Check if user is the owner or has admin permissions
    const collaborator = await storage.getCollaborator(seriesId, userId);
    if (!collaborator || (collaborator.role !== 'owner' && !collaborator.permissions.manageCollaborators)) {
      return res.status(403).json({ message: 'You do not have permission to add collaborators' });
    }
    
    const collaboratorData = insertCollaboratorSchema.parse({
      ...req.body,
      collaborativeSeriesId: seriesId,
    });
    
    // Don't allow adding someone as an owner
    if (collaboratorData.role === 'owner') {
      return res.status(400).json({ message: 'Cannot add another user as an owner' });
    }
    
    const newCollaborator = await storage.createCollaborator(collaboratorData);
    res.status(201).json(newCollaborator);
  } catch (error) {
    console.error('Error adding collaborator:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to add collaborator' });
  }
});

// Update a collaborator's role or permissions
router.patch('/series/:seriesId/collaborators/:id', isAuthenticated, async (req, res) => {
  try {
    const seriesId = parseInt(req.params.seriesId);
    const collaboratorId = parseInt(req.params.id);
    const userId = req.user.id;
    
    // Check if user is the owner or has admin permissions
    const userCollaborator = await storage.getCollaborator(seriesId, userId);
    if (!userCollaborator || (userCollaborator.role !== 'owner' && !userCollaborator.permissions.manageCollaborators)) {
      return res.status(403).json({ message: 'You do not have permission to update collaborators' });
    }
    
    // Get the target collaborator
    const targetCollaborator = await storage.getCollaboratorById(collaboratorId);
    if (!targetCollaborator) {
      return res.status(404).json({ message: 'Collaborator not found' });
    }
    
    // Don't allow changing the owner's role
    const collaborativeSeries = await storage.getCollaborativeSeries(seriesId);
    if (targetCollaborator.userId === collaborativeSeries.ownerId && req.body.role && req.body.role !== 'owner') {
      return res.status(400).json({ message: 'Cannot change the owner\'s role' });
    }
    
    // Don't allow changing someone's role to owner
    if (req.body.role === 'owner' && targetCollaborator.userId !== collaborativeSeries.ownerId) {
      return res.status(400).json({ message: 'Cannot change a collaborator\'s role to owner' });
    }
    
    const updatedCollaborator = await storage.updateCollaborator(collaboratorId, req.body);
    res.json(updatedCollaborator);
  } catch (error) {
    console.error('Error updating collaborator:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to update collaborator' });
  }
});

// Remove a collaborator
router.delete('/series/:seriesId/collaborators/:id', isAuthenticated, async (req, res) => {
  try {
    const seriesId = parseInt(req.params.seriesId);
    const collaboratorId = parseInt(req.params.id);
    const userId = req.user.id;
    
    // Check if user is the owner or has admin permissions
    const userCollaborator = await storage.getCollaborator(seriesId, userId);
    if (!userCollaborator || (userCollaborator.role !== 'owner' && !userCollaborator.permissions.manageCollaborators)) {
      return res.status(403).json({ message: 'You do not have permission to remove collaborators' });
    }
    
    // Get the target collaborator
    const targetCollaborator = await storage.getCollaboratorById(collaboratorId);
    if (!targetCollaborator) {
      return res.status(404).json({ message: 'Collaborator not found' });
    }
    
    // Don't allow removing the owner
    const collaborativeSeries = await storage.getCollaborativeSeries(seriesId);
    if (targetCollaborator.userId === collaborativeSeries.ownerId) {
      return res.status(400).json({ message: 'Cannot remove the owner from the collaboration' });
    }
    
    await storage.deleteCollaborator(collaboratorId);
    res.status(204).send();
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ message: 'Failed to remove collaborator' });
  }
});

// ========== Collaboration Invites ==========

// Create a new invitation
router.post('/series/:id/invites', isAuthenticated, async (req, res) => {
  try {
    const seriesId = parseInt(req.params.id);
    const userId = req.user.id;
    
    // Check if user is the owner or has admin permissions
    const collaborator = await storage.getCollaborator(seriesId, userId);
    if (!collaborator || (collaborator.role !== 'owner' && !collaborator.permissions.manageCollaborators)) {
      return res.status(403).json({ message: 'You do not have permission to invite collaborators' });
    }
    
    // Generate a unique invite code
    const inviteCode = randomBytes(16).toString('hex');
    
    // Set expiration date (default to 7 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    const inviteData = insertCollaborationInviteSchema.parse({
      ...req.body,
      collaborativeSeriesId: seriesId,
      inviterId: userId,
      inviteCode,
      expiresAt: req.body.expiresAt || expiresAt,
      status: 'pending',
    });
    
    const invite = await storage.createCollaborationInvite(inviteData);
    
    // TODO: Send email to invitee if email service is configured
    
    res.status(201).json(invite);
  } catch (error) {
    console.error('Error creating invitation:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to create invitation' });
  }
});

// Get all invites for a series
router.get('/series/:id/invites', isAuthenticated, async (req, res) => {
  try {
    const seriesId = parseInt(req.params.id);
    const userId = req.user.id;
    
    // Check if user is the owner or has admin permissions
    const collaborator = await storage.getCollaborator(seriesId, userId);
    if (!collaborator || (collaborator.role !== 'owner' && !collaborator.permissions.manageCollaborators)) {
      return res.status(403).json({ message: 'You do not have permission to view invites' });
    }
    
    const invites = await storage.getCollaborationInvitesBySeriesId(seriesId);
    res.json(invites);
  } catch (error) {
    console.error('Error getting invites:', error);
    res.status(500).json({ message: 'Failed to get invites' });
  }
});

// Cancel an invite
router.delete('/series/:seriesId/invites/:id', isAuthenticated, async (req, res) => {
  try {
    const seriesId = parseInt(req.params.seriesId);
    const inviteId = parseInt(req.params.id);
    const userId = req.user.id;
    
    // Check if user is the owner or has admin permissions
    const collaborator = await storage.getCollaborator(seriesId, userId);
    if (!collaborator || (collaborator.role !== 'owner' && !collaborator.permissions.manageCollaborators)) {
      return res.status(403).json({ message: 'You do not have permission to cancel invites' });
    }
    
    await storage.deleteCollaborationInvite(inviteId);
    res.status(204).send();
  } catch (error) {
    console.error('Error canceling invite:', error);
    res.status(500).json({ message: 'Failed to cancel invite' });
  }
});

// Accept an invite by code
router.post('/invites/:code/accept', isAuthenticated, async (req, res) => {
  try {
    const code = req.params.code;
    const userId = req.user.id;
    
    // Find the invite by code
    const invite = await storage.getCollaborationInviteByCode(code);
    if (!invite) {
      return res.status(404).json({ message: 'Invitation not found or has been canceled' });
    }
    
    // Check if invite has expired
    if (invite.expiresAt && new Date() > new Date(invite.expiresAt)) {
      return res.status(400).json({ message: 'Invitation has expired' });
    }
    
    // Check if invite is still pending
    if (invite.status !== 'pending') {
      return res.status(400).json({ message: `Invitation has already been ${invite.status}` });
    }
    
    // Update the invite with the user's ID and status
    await storage.updateCollaborationInvite(invite.id, {
      inviteeId: userId,
      status: 'accepted',
    });
    
    // Create the collaborator record
    const collaborator = await storage.createCollaborator({
      collaborativeSeriesId: invite.collaborativeSeriesId,
      userId,
      role: invite.role,
      permissions: {}, // Default permissions based on role can be set in the method
    });
    
    res.json(collaborator);
  } catch (error) {
    console.error('Error accepting invite:', error);
    res.status(500).json({ message: 'Failed to accept invite' });
  }
});

// Get all pending invites for the current user
router.get('/invites/pending', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email || '';
    
    // Query for invites based on email match and pending status
    const pendingInvites = await storage.getPendingInvitesForUser(userId, userEmail);
    
    // Enhance invite data with series name and inviter info
    const enhancedInvites = await Promise.all(pendingInvites.map(async (invite) => {
      const series = await storage.getCollaborativeSeries(invite.collaborativeSeriesId);
      const inviter = await storage.getUser(invite.inviterId);
      
      return {
        ...invite,
        seriesName: series?.name,
        inviterName: inviter?.displayName || inviter?.username
      };
    }));
    
    res.json(enhancedInvites);
  } catch (error) {
    console.error('Error getting pending invites:', error);
    res.status(500).json({ message: 'Failed to get pending invites' });
  }
});

// Decline an invite by code
router.post('/invites/:code/decline', isAuthenticated, async (req, res) => {
  try {
    const code = req.params.code;
    const userId = req.user.id;
    
    // Find the invite by code
    const invite = await storage.getCollaborationInviteByCode(code);
    if (!invite) {
      return res.status(404).json({ message: 'Invitation not found or has been canceled' });
    }
    
    // Check if invite is still pending
    if (invite.status !== 'pending') {
      return res.status(400).json({ message: `Invitation has already been ${invite.status}` });
    }
    
    // Update the invite status
    await storage.updateCollaborationInvite(invite.id, {
      inviteeId: userId,
      status: 'declined',
    });
    
    res.status(200).json({ message: 'Invitation declined' });
  } catch (error) {
    console.error('Error declining invite:', error);
    res.status(500).json({ message: 'Failed to decline invite' });
  }
});

// ========== Comments ==========

// Add a comment
router.post('/comments', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const commentData = insertCommentSchema.parse({
      ...req.body,
      userId,
    });
    
    // Check if user has permission to comment on the content
    // This requires checking if the user has access to the series that the content belongs to
    let hasAccess = false;
    
    if (commentData.bookId) {
      const book = await storage.getBook(commentData.bookId);
      if (book) {
        const series = await storage.getSeries(book.seriesId);
        if (series) {
          hasAccess = await storage.userHasAccessToSeries(userId, series.id);
        }
      }
    } else if (commentData.chapterId) {
      const chapter = await storage.getChapter(commentData.chapterId);
      if (chapter) {
        const book = await storage.getBook(chapter.bookId);
        if (book) {
          const series = await storage.getSeries(book.seriesId);
          if (series) {
            hasAccess = await storage.userHasAccessToSeries(userId, series.id);
          }
        }
      }
    }
    // Add similar checks for characterId, locationId, etc.
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have permission to comment on this content' });
    }
    
    const comment = await storage.createComment(commentData);
    res.status(201).json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to create comment' });
  }
});

// Get comments for a specific content
router.get('/comments', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, chapterId, characterId, locationId, timelineEventId } = req.query;
    
    // Check if user has permission to view comments for the content
    // This check is simplified here - in a real app, you would check for each content type
    let hasAccess = false;
    
    if (bookId) {
      const book = await storage.getBook(parseInt(bookId as string));
      if (book) {
        const series = await storage.getSeries(book.seriesId);
        if (series) {
          hasAccess = await storage.userHasAccessToSeries(userId, series.id);
        }
      }
    }
    // Add similar checks for other content types
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have permission to view comments on this content' });
    }
    
    const comments = await storage.getComments({
      bookId: bookId ? parseInt(bookId as string) : undefined,
      chapterId: chapterId ? parseInt(chapterId as string) : undefined,
      characterId: characterId ? parseInt(characterId as string) : undefined,
      locationId: locationId ? parseInt(locationId as string) : undefined,
      timelineEventId: timelineEventId ? parseInt(timelineEventId as string) : undefined,
    });
    
    res.json(comments);
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ message: 'Failed to get comments' });
  }
});

// Update a comment
router.patch('/comments/:id', isAuthenticated, async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const userId = req.user.id;
    
    // Get the comment
    const comment = await storage.getComment(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the comment author
    if (comment.userId !== userId) {
      return res.status(403).json({ message: 'You can only update your own comments' });
    }
    
    // Update the comment
    const updatedComment = await storage.updateComment(commentId, {
      ...req.body,
      isEdited: true,
    });
    
    res.json(updatedComment);
  } catch (error) {
    console.error('Error updating comment:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to update comment' });
  }
});

// Delete a comment
router.delete('/comments/:id', isAuthenticated, async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const userId = req.user.id;
    
    // Get the comment
    const comment = await storage.getComment(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    // Check if user is the comment author
    if (comment.userId !== userId) {
      // Check if user is a moderator or owner of the content
      // This is a simplified check - in a real app, you would check based on the content type
      let isModeratorOrOwner = false;
      
      // For demonstration, let's say we're not implementing this full check yet
      if (!isModeratorOrOwner) {
        return res.status(403).json({ message: 'You can only delete your own comments' });
      }
    }
    
    // Delete the comment
    await storage.deleteComment(commentId);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
});

// ========== Feedback Requests ==========

// Create a feedback request
router.post('/feedback/requests', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const requestData = insertFeedbackRequestSchema.parse({
      ...req.body,
      userId,
    });
    
    // Check if user has permission to request feedback for the content
    let hasAccess = false;
    
    if (requestData.bookId) {
      const book = await storage.getBook(requestData.bookId);
      if (book) {
        const series = await storage.getSeries(book.seriesId);
        if (series && series.userId === userId) {
          hasAccess = true;
        }
      }
    } else if (requestData.chapterId) {
      const chapter = await storage.getChapter(requestData.chapterId);
      if (chapter) {
        const book = await storage.getBook(chapter.bookId);
        if (book) {
          const series = await storage.getSeries(book.seriesId);
          if (series && series.userId === userId) {
            hasAccess = true;
          }
        }
      }
    }
    
    if (!hasAccess) {
      return res.status(403).json({ message: 'You do not have permission to request feedback on this content' });
    }
    
    const request = await storage.createFeedbackRequest(requestData);
    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating feedback request:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to create feedback request' });
  }
});

// Get feedback requests for a user (either created by the user or public)
router.get('/feedback/requests', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookId, chapterId, isPublic } = req.query;
    
    const requests = await storage.getFeedbackRequests({
      userId,
      bookId: bookId ? parseInt(bookId as string) : undefined,
      chapterId: chapterId ? parseInt(chapterId as string) : undefined,
      isPublic: isPublic === 'true',
    });
    
    res.json(requests);
  } catch (error) {
    console.error('Error getting feedback requests:', error);
    res.status(500).json({ message: 'Failed to get feedback requests' });
  }
});

// Get a specific feedback request
router.get('/feedback/requests/:id', isAuthenticated, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const userId = req.user.id;
    
    const request = await storage.getFeedbackRequest(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Feedback request not found' });
    }
    
    // Check if user has access (owner or public)
    if (request.userId !== userId && !request.isPublic) {
      return res.status(403).json({ message: 'You do not have permission to view this feedback request' });
    }
    
    res.json(request);
  } catch (error) {
    console.error('Error getting feedback request:', error);
    res.status(500).json({ message: 'Failed to get feedback request' });
  }
});

// Close a feedback request
router.post('/feedback/requests/:id/close', isAuthenticated, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const userId = req.user.id;
    
    const request = await storage.getFeedbackRequest(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Feedback request not found' });
    }
    
    // Check if user is the owner
    if (request.userId !== userId) {
      return res.status(403).json({ message: 'Only the owner can close a feedback request' });
    }
    
    const updatedRequest = await storage.updateFeedbackRequest(requestId, {
      status: 'closed',
      closedAt: new Date(),
    });
    
    res.json(updatedRequest);
  } catch (error) {
    console.error('Error closing feedback request:', error);
    res.status(500).json({ message: 'Failed to close feedback request' });
  }
});

// Add a response to a feedback request
router.post('/feedback/requests/:id/responses', isAuthenticated, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const userId = req.user.id;
    
    const request = await storage.getFeedbackRequest(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Feedback request not found' });
    }
    
    // Check if the request is still open
    if (request.status !== 'open') {
      return res.status(400).json({ message: 'This feedback request is closed' });
    }
    
    // Check if user has access to respond
    // You can implement more complex rules here, like requiring a minimum subscription level
    
    const responseData = insertFeedbackResponseSchema.parse({
      ...req.body,
      feedbackRequestId: requestId,
      userId,
    });
    
    const response = await storage.createFeedbackResponse(responseData);
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating feedback response:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid input', errors: error.errors });
    }
    res.status(500).json({ message: 'Failed to create feedback response' });
  }
});

// Get responses for a feedback request
router.get('/feedback/requests/:id/responses', isAuthenticated, async (req, res) => {
  try {
    const requestId = parseInt(req.params.id);
    const userId = req.user.id;
    
    const request = await storage.getFeedbackRequest(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Feedback request not found' });
    }
    
    // Check if user has access (owner or public)
    if (request.userId !== userId && !request.isPublic) {
      return res.status(403).json({ message: 'You do not have permission to view responses to this feedback request' });
    }
    
    const responses = await storage.getFeedbackResponses(requestId);
    res.json(responses);
  } catch (error) {
    console.error('Error getting feedback responses:', error);
    res.status(500).json({ message: 'Failed to get feedback responses' });
  }
});

export default router;