import { eq, and, inArray, or, sql, desc } from 'drizzle-orm';
import { db } from './db';
import {
  collaborativeSeries,
  collaborators,
  collaborationInvites,
  comments,
  feedbackRequests,
  feedbackResponses,
  series,
  users,
  type CollaborativeSeries,
  type InsertCollaborativeSeries,
  type Collaborator,
  type InsertCollaborator,
  type CollaborationInvite,
  type InsertCollaborationInvite,
  type Comment,
  type InsertComment,
  type FeedbackRequest,
  type InsertFeedbackRequest,
  type FeedbackResponse,
  type InsertFeedbackResponse
} from '@shared/schema';

/**
 * PostgreSQL collaboration storage methods
 * 
 * These methods handle all database operations related to collaboration features
 */
export const collaborationMethods = {
  // =========== Collaborative Series ===========
  
  async createCollaborativeSeries(seriesData: InsertCollaborativeSeries): Promise<CollaborativeSeries> {
    try {
      const results = await db.insert(collaborativeSeries).values(seriesData).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating collaborative series:', error);
      throw error;
    }
  },
  
  async getCollaborativeSeries(id: number): Promise<CollaborativeSeries | undefined> {
    try {
      const results = await db.select().from(collaborativeSeries).where(eq(collaborativeSeries.id, id));
      return results[0];
    } catch (error) {
      console.error('Error getting collaborative series:', error);
      return undefined;
    }
  },
  
  async getCollaborativeSeriesByUser(userId: number): Promise<CollaborativeSeries[]> {
    try {
      // Get series where user is owner
      const ownedSeries = await db
        .select()
        .from(collaborativeSeries)
        .where(eq(collaborativeSeries.ownerId, userId));
      
      // Get series where user is a collaborator
      const userCollaborations = await db
        .select({
          collaborativeSeries: collaborativeSeries
        })
        .from(collaborators)
        .innerJoin(
          collaborativeSeries,
          eq(collaborators.collaborativeSeriesId, collaborativeSeries.id)
        )
        .where(eq(collaborators.userId, userId));
      
      const collaboratedSeries = userCollaborations.map(record => record.collaborativeSeries);
      
      // Combine and deduplicate
      const allSeries = [...ownedSeries];
      for (const series of collaboratedSeries) {
        if (!allSeries.some(s => s.id === series.id)) {
          allSeries.push(series);
        }
      }
      
      return allSeries;
    } catch (error) {
      console.error('Error getting collaborative series by user:', error);
      return [];
    }
  },
  
  async updateCollaborativeSeries(id: number, updates: Partial<CollaborativeSeries>): Promise<CollaborativeSeries | undefined> {
    try {
      const results = await db
        .update(collaborativeSeries)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(collaborativeSeries.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating collaborative series:', error);
      return undefined;
    }
  },
  
  async deleteCollaborativeSeries(id: number): Promise<boolean> {
    try {
      // First, delete all related records
      await db.delete(collaborators).where(eq(collaborators.collaborativeSeriesId, id));
      await db.delete(collaborationInvites).where(eq(collaborationInvites.collaborativeSeriesId, id));
      
      // Then delete the series
      const results = await db
        .delete(collaborativeSeries)
        .where(eq(collaborativeSeries.id, id))
        .returning();
      
      return results.length > 0;
    } catch (error) {
      console.error('Error deleting collaborative series:', error);
      return false;
    }
  },
  
  async userHasAccessToCollaborativeSeries(userId: number, collaborativeSeriesId: number): Promise<boolean> {
    try {
      // Check if user is the owner
      const series = await db
        .select()
        .from(collaborativeSeries)
        .where(
          and(
            eq(collaborativeSeries.id, collaborativeSeriesId),
            eq(collaborativeSeries.ownerId, userId)
          )
        );
      
      if (series.length > 0) {
        return true;
      }
      
      // Check if user is a collaborator
      const collaborator = await db
        .select()
        .from(collaborators)
        .where(
          and(
            eq(collaborators.collaborativeSeriesId, collaborativeSeriesId),
            eq(collaborators.userId, userId)
          )
        );
      
      return collaborator.length > 0;
    } catch (error) {
      console.error('Error checking user access to collaborative series:', error);
      return false;
    }
  },
  
  async userHasAccessToSeries(userId: number, seriesId: number): Promise<boolean> {
    try {
      // Check if user is the owner of the series
      const userSeries = await db
        .select()
        .from(series)
        .where(
          and(
            eq(series.id, seriesId),
            eq(series.userId, userId)
          )
        );
      
      if (userSeries.length > 0) {
        return true;
      }
      
      // Check if the series is part of a collaborative series where the user is a collaborator
      const collaborativeSeries = await db
        .select()
        .from(collaborativeSeries)
        .where(eq(collaborativeSeries.seriesId, seriesId));
      
      if (collaborativeSeries.length === 0) {
        return false;
      }
      
      for (const cs of collaborativeSeries) {
        const hasAccess = await this.userHasAccessToCollaborativeSeries(userId, cs.id);
        if (hasAccess) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking user access to series:', error);
      return false;
    }
  },
  
  // =========== Collaborators ===========
  
  async createCollaborator(collaboratorData: InsertCollaborator): Promise<Collaborator> {
    try {
      // Set default permissions based on role if not provided
      if (!collaboratorData.permissions || Object.keys(collaboratorData.permissions).length === 0) {
        switch (collaboratorData.role) {
          case 'owner':
            collaboratorData.permissions = {
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
            };
            break;
          case 'editor':
            collaboratorData.permissions = {
              manageCollaborators: false,
              manageSettings: false,
              editContent: true,
              addCharacters: true,
              editCharacters: true,
              addLocations: true,
              editLocations: true,
              addBooks: true,
              editBooks: true,
              addComments: true,
            };
            break;
          case 'contributor':
            collaboratorData.permissions = {
              manageCollaborators: false,
              manageSettings: false,
              editContent: true,
              addCharacters: false,
              editCharacters: false,
              addLocations: false,
              editLocations: false,
              addBooks: false,
              editBooks: false,
              addComments: true,
            };
            break;
          case 'viewer':
          default:
            collaboratorData.permissions = {
              manageCollaborators: false,
              manageSettings: false,
              editContent: false,
              addCharacters: false,
              editCharacters: false,
              addLocations: false,
              editLocations: false,
              addBooks: false,
              editBooks: false,
              addComments: true,
            };
            break;
        }
      }
      
      const results = await db.insert(collaborators).values(collaboratorData).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating collaborator:', error);
      throw error;
    }
  },
  
  async getCollaborator(collaborativeSeriesId: number, userId: number): Promise<Collaborator | undefined> {
    try {
      const results = await db
        .select()
        .from(collaborators)
        .where(
          and(
            eq(collaborators.collaborativeSeriesId, collaborativeSeriesId),
            eq(collaborators.userId, userId)
          )
        );
      return results[0];
    } catch (error) {
      console.error('Error getting collaborator:', error);
      return undefined;
    }
  },
  
  async getCollaboratorById(id: number): Promise<Collaborator | undefined> {
    try {
      const results = await db
        .select()
        .from(collaborators)
        .where(eq(collaborators.id, id));
      return results[0];
    } catch (error) {
      console.error('Error getting collaborator by ID:', error);
      return undefined;
    }
  },
  
  async getCollaboratorsBySeriesId(collaborativeSeriesId: number): Promise<(Collaborator & { user: { username: string, displayName: string } })[]> {
    try {
      const results = await db
        .select({
          collaborator: collaborators,
          user: {
            username: users.username,
            displayName: users.displayName
          }
        })
        .from(collaborators)
        .innerJoin(users, eq(collaborators.userId, users.id))
        .where(eq(collaborators.collaborativeSeriesId, collaborativeSeriesId));
      
      return results.map(record => ({
        ...record.collaborator,
        user: record.user
      }));
    } catch (error) {
      console.error('Error getting collaborators by series ID:', error);
      return [];
    }
  },
  
  async updateCollaborator(id: number, updates: Partial<Collaborator>): Promise<Collaborator | undefined> {
    try {
      const results = await db
        .update(collaborators)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(collaborators.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating collaborator:', error);
      return undefined;
    }
  },
  
  async deleteCollaborator(id: number): Promise<boolean> {
    try {
      const results = await db
        .delete(collaborators)
        .where(eq(collaborators.id, id))
        .returning();
      return results.length > 0;
    } catch (error) {
      console.error('Error deleting collaborator:', error);
      return false;
    }
  },
  
  // =========== Collaboration Invites ===========
  
  async createCollaborationInvite(inviteData: InsertCollaborationInvite): Promise<CollaborationInvite> {
    try {
      const results = await db.insert(collaborationInvites).values(inviteData).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating collaboration invite:', error);
      throw error;
    }
  },
  
  async getCollaborationInvite(id: number): Promise<CollaborationInvite | undefined> {
    try {
      const results = await db
        .select()
        .from(collaborationInvites)
        .where(eq(collaborationInvites.id, id));
      return results[0];
    } catch (error) {
      console.error('Error getting collaboration invite:', error);
      return undefined;
    }
  },
  
  async getCollaborationInviteByCode(code: string): Promise<CollaborationInvite | undefined> {
    try {
      const results = await db
        .select()
        .from(collaborationInvites)
        .where(eq(collaborationInvites.inviteCode, code));
      return results[0];
    } catch (error) {
      console.error('Error getting collaboration invite by code:', error);
      return undefined;
    }
  },
  
  async getCollaborationInvitesBySeriesId(collaborativeSeriesId: number): Promise<CollaborationInvite[]> {
    try {
      return await db
        .select()
        .from(collaborationInvites)
        .where(eq(collaborationInvites.collaborativeSeriesId, collaborativeSeriesId))
        .orderBy(desc(collaborationInvites.createdAt));
    } catch (error) {
      console.error('Error getting collaboration invites by series ID:', error);
      return [];
    }
  },
  
  async updateCollaborationInvite(id: number, updates: Partial<CollaborationInvite>): Promise<CollaborationInvite | undefined> {
    try {
      const results = await db
        .update(collaborationInvites)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(collaborationInvites.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating collaboration invite:', error);
      return undefined;
    }
  },
  
  async deleteCollaborationInvite(id: number): Promise<boolean> {
    try {
      const results = await db
        .delete(collaborationInvites)
        .where(eq(collaborationInvites.id, id))
        .returning();
      return results.length > 0;
    } catch (error) {
      console.error('Error deleting collaboration invite:', error);
      return false;
    }
  },
  
  // =========== Comments ===========
  
  async createComment(commentData: InsertComment): Promise<Comment> {
    try {
      const results = await db.insert(comments).values(commentData).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  },
  
  async getComment(id: number): Promise<Comment | undefined> {
    try {
      const results = await db
        .select()
        .from(comments)
        .where(eq(comments.id, id));
      return results[0];
    } catch (error) {
      console.error('Error getting comment:', error);
      return undefined;
    }
  },
  
  async getComments(filters: {
    bookId?: number;
    chapterId?: number;
    characterId?: number;
    locationId?: number;
    timelineEventId?: number;
    parentCommentId?: number;
  }): Promise<(Comment & { user: { username: string, displayName: string } })[]> {
    try {
      let query = db
        .select({
          comment: comments,
          user: {
            username: users.username,
            displayName: users.displayName
          }
        })
        .from(comments)
        .innerJoin(users, eq(comments.userId, users.id))
        .where(eq(comments.status, 'active'));
      
      // Apply filters
      if (filters.bookId) {
        query = query.where(eq(comments.bookId, filters.bookId));
      }
      if (filters.chapterId) {
        query = query.where(eq(comments.chapterId, filters.chapterId));
      }
      if (filters.characterId) {
        query = query.where(eq(comments.characterId, filters.characterId));
      }
      if (filters.locationId) {
        query = query.where(eq(comments.locationId, filters.locationId));
      }
      if (filters.timelineEventId) {
        query = query.where(eq(comments.timelineEventId, filters.timelineEventId));
      }
      if (filters.parentCommentId) {
        query = query.where(eq(comments.parentCommentId, filters.parentCommentId));
      } else {
        // If not looking for replies, get top-level comments
        query = query.where(sql`${comments.parentCommentId} IS NULL`);
      }
      
      const results = await query.orderBy(desc(comments.createdAt));
      
      return results.map(record => ({
        ...record.comment,
        user: record.user
      }));
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  },
  
  async updateComment(id: number, updates: Partial<Comment>): Promise<Comment | undefined> {
    try {
      const results = await db
        .update(comments)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(comments.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating comment:', error);
      return undefined;
    }
  },
  
  async deleteComment(id: number): Promise<boolean> {
    try {
      // First, mark all child comments as deleted
      await db
        .update(comments)
        .set({
          status: 'deleted',
          updatedAt: new Date()
        })
        .where(eq(comments.parentCommentId, id));
      
      // Then mark this comment as deleted
      const results = await db
        .update(comments)
        .set({
          status: 'deleted',
          updatedAt: new Date()
        })
        .where(eq(comments.id, id))
        .returning();
      
      return results.length > 0;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  },
  
  // =========== Feedback Requests ===========
  
  async createFeedbackRequest(requestData: InsertFeedbackRequest): Promise<FeedbackRequest> {
    try {
      const results = await db.insert(feedbackRequests).values(requestData).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating feedback request:', error);
      throw error;
    }
  },
  
  async getFeedbackRequest(id: number): Promise<FeedbackRequest | undefined> {
    try {
      const results = await db
        .select()
        .from(feedbackRequests)
        .where(eq(feedbackRequests.id, id));
      return results[0];
    } catch (error) {
      console.error('Error getting feedback request:', error);
      return undefined;
    }
  },
  
  async getFeedbackRequests(filters: {
    userId: number;
    bookId?: number;
    chapterId?: number;
    isPublic?: boolean;
  }): Promise<FeedbackRequest[]> {
    try {
      let query = db.select().from(feedbackRequests);
      
      // User's own requests or public requests
      if (filters.isPublic) {
        query = query.where(
          or(
            eq(feedbackRequests.userId, filters.userId),
            eq(feedbackRequests.isPublic, true)
          )
        );
      } else {
        // Only user's own requests
        query = query.where(eq(feedbackRequests.userId, filters.userId));
      }
      
      // Apply additional filters
      if (filters.bookId) {
        query = query.where(eq(feedbackRequests.bookId, filters.bookId));
      }
      if (filters.chapterId) {
        query = query.where(eq(feedbackRequests.chapterId, filters.chapterId));
      }
      
      return await query.orderBy(desc(feedbackRequests.createdAt));
    } catch (error) {
      console.error('Error getting feedback requests:', error);
      return [];
    }
  },
  
  async updateFeedbackRequest(id: number, updates: Partial<FeedbackRequest>): Promise<FeedbackRequest | undefined> {
    try {
      const results = await db
        .update(feedbackRequests)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(feedbackRequests.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating feedback request:', error);
      return undefined;
    }
  },
  
  async deleteFeedbackRequest(id: number): Promise<boolean> {
    try {
      // First delete all responses
      await db.delete(feedbackResponses).where(eq(feedbackResponses.feedbackRequestId, id));
      
      // Then delete the request
      const results = await db
        .delete(feedbackRequests)
        .where(eq(feedbackRequests.id, id))
        .returning();
      
      return results.length > 0;
    } catch (error) {
      console.error('Error deleting feedback request:', error);
      return false;
    }
  },
  
  // =========== Feedback Responses ===========
  
  async createFeedbackResponse(responseData: InsertFeedbackResponse): Promise<FeedbackResponse> {
    try {
      const results = await db.insert(feedbackResponses).values(responseData).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating feedback response:', error);
      throw error;
    }
  },
  
  async getFeedbackResponse(id: number): Promise<FeedbackResponse | undefined> {
    try {
      const results = await db
        .select()
        .from(feedbackResponses)
        .where(eq(feedbackResponses.id, id));
      return results[0];
    } catch (error) {
      console.error('Error getting feedback response:', error);
      return undefined;
    }
  },
  
  async getFeedbackResponses(feedbackRequestId: number): Promise<(FeedbackResponse & { user: { username: string, displayName: string } })[]> {
    try {
      const results = await db
        .select({
          response: feedbackResponses,
          user: {
            username: users.username,
            displayName: users.displayName
          }
        })
        .from(feedbackResponses)
        .innerJoin(users, eq(feedbackResponses.userId, users.id))
        .where(eq(feedbackResponses.feedbackRequestId, feedbackRequestId))
        .orderBy(desc(feedbackResponses.createdAt));
      
      return results.map(record => ({
        ...record.response,
        user: record.user
      }));
    } catch (error) {
      console.error('Error getting feedback responses:', error);
      return [];
    }
  },
  
  async updateFeedbackResponse(id: number, updates: Partial<FeedbackResponse>): Promise<FeedbackResponse | undefined> {
    try {
      const results = await db
        .update(feedbackResponses)
        .set({
          ...updates,
          updatedAt: new Date()
        })
        .where(eq(feedbackResponses.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating feedback response:', error);
      return undefined;
    }
  },
  
  async deleteFeedbackResponse(id: number): Promise<boolean> {
    try {
      const results = await db
        .delete(feedbackResponses)
        .where(eq(feedbackResponses.id, id))
        .returning();
      
      return results.length > 0;
    } catch (error) {
      console.error('Error deleting feedback response:', error);
      return false;
    }
  }
};