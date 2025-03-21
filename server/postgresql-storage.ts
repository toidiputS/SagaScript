import { IStorage } from './storage';
import { db } from './db';
import { collaborationMethods } from './postgresql-storage-collaboration';
import {
  users,
  series,
  books,
  chapters,
  characters,
  characterRelationships,
  locations,
  writingStats,
  achievements,
  userAchievements,
  subscriptionPlans,
  subscriptions,
  timelineEvents,
  rewardTypes,
  writingMilestones,
  userRewards,
  writingStreaks,
  writingGoals,
  pointLedger,
  type User,
  type InsertUser,
  type Series,
  type InsertSeries,
  type Book,
  type InsertBook,
  type Chapter,
  type InsertChapter,
  type Character,
  type InsertCharacter,
  type CharacterRelationship,
  type InsertCharacterRelationship,
  type Location,
  type InsertLocation,
  type WritingStat,
  type InsertWritingStat,
  type Achievement,
  type InsertAchievement,
  type UserAchievement,
  type InsertUserAchievement,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
  type Subscription,
  type InsertSubscription,
  type TimelineEvent,
  type InsertTimelineEvent,
  type RewardType,
  type InsertRewardType,
  type WritingMilestone,
  type InsertWritingMilestone,
  type UserReward,
  type InsertUserReward,
  type WritingStreak,
  type InsertWritingStreak,
  type WritingGoal,
  type InsertWritingGoal,
  type PointLedgerEntry,
  type InsertPointLedgerEntry
} from '@shared/schema';
import { eq, and, isNull, desc, asc, sql, inArray } from 'drizzle-orm';
import { Pool } from '@neondatabase/serverless';
import connectPg from 'connect-pg-simple';
import session from 'express-session';

const PostgresSessionStore = connectPg(session);

export class PostgreSQLStorage implements IStorage {
  public sessionStore: session.Store;
  private pool: Pool;

  constructor() {
    this.pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.sessionStore = new PostgresSessionStore({ 
      pool: this.pool,
      createTableIfMissing: true
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const results = await db.select().from(users).where(eq(users.id, id));
      return results[0];
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const results = await db.select().from(users).where(eq(users.username, username));
      return results[0];
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const results = await db.insert(users).values(user).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateStripeCustomerId(userId: number, customerId: string): Promise<User | undefined> {
    try {
      const results = await db.update(users)
        .set({ stripeCustomerId: customerId })
        .where(eq(users.id, userId))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating stripe customer ID:', error);
      return undefined;
    }
  }

  async updateUserStripeInfo(userId: number, data: { customerId: string; subscriptionId: string; }): Promise<User | undefined> {
    try {
      const results = await db.update(users)
        .set({ 
          stripeCustomerId: data.customerId,
          stripeSubscriptionId: data.subscriptionId 
        })
        .where(eq(users.id, userId))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating user stripe info:', error);
      return undefined;
    }
  }

  // Series methods
  async getSeries(id: number): Promise<Series | undefined> {
    try {
      const results = await db.select().from(series).where(eq(series.id, id));
      return results[0];
    } catch (error) {
      console.error('Error getting series:', error);
      return undefined;
    }
  }

  async getAllSeriesByUser(userId: number): Promise<Series[]> {
    try {
      return await db.select().from(series).where(eq(series.userId, userId));
    } catch (error) {
      console.error('Error getting all series by user:', error);
      return [];
    }
  }

  async createSeries(newSeries: InsertSeries): Promise<Series> {
    try {
      const results = await db.insert(series).values(newSeries).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating series:', error);
      throw error;
    }
  }

  async updateSeries(id: number, seriesUpdate: Partial<Series>): Promise<Series | undefined> {
    try {
      const results = await db.update(series)
        .set(seriesUpdate)
        .where(eq(series.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating series:', error);
      return undefined;
    }
  }

  async deleteSeries(id: number): Promise<boolean> {
    try {
      const results = await db.delete(series).where(eq(series.id, id)).returning();
      return results.length > 0;
    } catch (error) {
      console.error('Error deleting series:', error);
      return false;
    }
  }

  // Book methods
  async getBook(id: number): Promise<Book | undefined> {
    try {
      const results = await db.select().from(books).where(eq(books.id, id));
      return results[0];
    } catch (error) {
      console.error('Error getting book:', error);
      return undefined;
    }
  }

  async getBooksBySeries(seriesId: number): Promise<Book[]> {
    try {
      return await db.select().from(books)
        .where(eq(books.seriesId, seriesId))
        .orderBy(asc(books.position));
    } catch (error) {
      console.error('Error getting books by series:', error);
      return [];
    }
  }

  async createBook(book: InsertBook): Promise<Book> {
    try {
      const results = await db.insert(books).values(book).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating book:', error);
      throw error;
    }
  }

  async updateBook(id: number, bookUpdate: Partial<Book>): Promise<Book | undefined> {
    try {
      const results = await db.update(books)
        .set(bookUpdate)
        .where(eq(books.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating book:', error);
      return undefined;
    }
  }

  async deleteBook(id: number): Promise<boolean> {
    try {
      const results = await db.delete(books).where(eq(books.id, id)).returning();
      return results.length > 0;
    } catch (error) {
      console.error('Error deleting book:', error);
      return false;
    }
  }

  async updateBookPositions(booksToUpdate: { id: number; position: number; }[]): Promise<boolean> {
    try {
      // Using a transaction to update all positions
      await db.transaction(async (tx) => {
        for (const book of booksToUpdate) {
          await tx.update(books)
            .set({ position: book.position })
            .where(eq(books.id, book.id));
        }
      });
      return true;
    } catch (error) {
      console.error('Error updating book positions:', error);
      return false;
    }
  }

  // Chapter methods
  async getChapter(id: number): Promise<Chapter | undefined> {
    try {
      const results = await db.select().from(chapters).where(eq(chapters.id, id));
      return results[0];
    } catch (error) {
      console.error('Error getting chapter:', error);
      return undefined;
    }
  }

  async getChaptersByBook(bookId: number): Promise<Chapter[]> {
    try {
      return await db.select().from(chapters)
        .where(eq(chapters.bookId, bookId))
        .orderBy(asc(chapters.position));
    } catch (error) {
      console.error('Error getting chapters by book:', error);
      return [];
    }
  }

  async createChapter(chapter: InsertChapter): Promise<Chapter> {
    try {
      const results = await db.insert(chapters).values(chapter).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating chapter:', error);
      throw error;
    }
  }

  async updateChapter(id: number, chapterUpdate: Partial<Chapter>): Promise<Chapter | undefined> {
    try {
      const results = await db.update(chapters)
        .set(chapterUpdate)
        .where(eq(chapters.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating chapter:', error);
      return undefined;
    }
  }

  async deleteChapter(id: number): Promise<boolean> {
    try {
      const results = await db.delete(chapters).where(eq(chapters.id, id)).returning();
      return results.length > 0;
    } catch (error) {
      console.error('Error deleting chapter:', error);
      return false;
    }
  }

  async updateChapterPositions(chaptersToUpdate: { id: number; position: number; }[]): Promise<boolean> {
    try {
      await db.transaction(async (tx) => {
        for (const chapter of chaptersToUpdate) {
          await tx.update(chapters)
            .set({ position: chapter.position })
            .where(eq(chapters.id, chapter.id));
        }
      });
      return true;
    } catch (error) {
      console.error('Error updating chapter positions:', error);
      return false;
    }
  }

  // Character methods
  async getCharacter(id: number): Promise<Character | undefined> {
    try {
      const results = await db.select().from(characters).where(eq(characters.id, id));
      return results[0];
    } catch (error) {
      console.error('Error getting character:', error);
      return undefined;
    }
  }

  async getCharactersBySeries(seriesId: number): Promise<Character[]> {
    try {
      return await db.select().from(characters).where(eq(characters.seriesId, seriesId));
    } catch (error) {
      console.error('Error getting characters by series:', error);
      return [];
    }
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    try {
      const results = await db.insert(characters).values(character).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating character:', error);
      throw error;
    }
  }

  async updateCharacter(id: number, characterUpdate: Partial<Character>): Promise<Character | undefined> {
    try {
      const results = await db.update(characters)
        .set(characterUpdate)
        .where(eq(characters.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating character:', error);
      return undefined;
    }
  }

  async deleteCharacter(id: number): Promise<boolean> {
    try {
      const results = await db.delete(characters).where(eq(characters.id, id)).returning();
      return results.length > 0;
    } catch (error) {
      console.error('Error deleting character:', error);
      return false;
    }
  }

  // Character Relationship methods
  async getCharacterRelationship(id: number): Promise<CharacterRelationship | undefined> {
    try {
      const results = await db.select().from(characterRelationships).where(eq(characterRelationships.id, id));
      return results[0];
    } catch (error) {
      console.error('Error getting character relationship:', error);
      return undefined;
    }
  }

  async getCharacterRelationshipsByCharacter(characterId: number): Promise<CharacterRelationship[]> {
    try {
      return await db.select().from(characterRelationships)
        .where(
          sql`${characterRelationships.sourceCharacterId} = ${characterId} OR ${characterRelationships.targetCharacterId} = ${characterId}`
        );
    } catch (error) {
      console.error('Error getting character relationships by character:', error);
      return [];
    }
  }

  async getCharacterRelationshipsBySeries(seriesId: number): Promise<CharacterRelationship[]> {
    try {
      const seriesCharacters = await this.getCharactersBySeries(seriesId);
      const characterIds = seriesCharacters.map(c => c.id);
      
      if (characterIds.length === 0) return [];
      
      return await db.select().from(characterRelationships)
        .where(
          sql`${characterRelationships.sourceCharacterId} IN (${characterIds.join(',')}) OR ${characterRelationships.targetCharacterId} IN (${characterIds.join(',')})`
        );
    } catch (error) {
      console.error('Error getting character relationships by series:', error);
      return [];
    }
  }

  async createCharacterRelationship(relationship: InsertCharacterRelationship): Promise<CharacterRelationship> {
    try {
      const results = await db.insert(characterRelationships).values(relationship).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating character relationship:', error);
      throw error;
    }
  }

  async updateCharacterRelationship(id: number, relationshipUpdate: Partial<CharacterRelationship>): Promise<CharacterRelationship | undefined> {
    try {
      const results = await db.update(characterRelationships)
        .set(relationshipUpdate)
        .where(eq(characterRelationships.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating character relationship:', error);
      return undefined;
    }
  }

  async deleteCharacterRelationship(id: number): Promise<boolean> {
    try {
      const results = await db.delete(characterRelationships).where(eq(characterRelationships.id, id)).returning();
      return results.length > 0;
    } catch (error) {
      console.error('Error deleting character relationship:', error);
      return false;
    }
  }

  // Location methods
  async getLocation(id: number): Promise<Location | undefined> {
    try {
      const results = await db.select().from(locations).where(eq(locations.id, id));
      return results[0];
    } catch (error) {
      console.error('Error getting location:', error);
      return undefined;
    }
  }

  async getLocationsBySeries(seriesId: number): Promise<Location[]> {
    try {
      return await db.select().from(locations).where(eq(locations.seriesId, seriesId));
    } catch (error) {
      console.error('Error getting locations by series:', error);
      return [];
    }
  }

  async createLocation(location: InsertLocation): Promise<Location> {
    try {
      const results = await db.insert(locations).values(location).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  }

  async updateLocation(id: number, locationUpdate: Partial<Location>): Promise<Location | undefined> {
    try {
      const results = await db.update(locations)
        .set(locationUpdate)
        .where(eq(locations.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating location:', error);
      return undefined;
    }
  }

  async deleteLocation(id: number): Promise<boolean> {
    try {
      const results = await db.delete(locations).where(eq(locations.id, id)).returning();
      return results.length > 0;
    } catch (error) {
      console.error('Error deleting location:', error);
      return false;
    }
  }

  // Writing Stats methods
  async getWritingStatsByUser(userId: number, period?: 'day' | 'week' | 'month' | 'year'): Promise<WritingStat[]> {
    try {
      let query = db.select().from(writingStats).where(eq(writingStats.userId, userId));
      
      if (period) {
        let dateFilter;
        const now = new Date();
        
        switch (period) {
          case 'day':
            // Get stats from today
            dateFilter = sql`DATE(${writingStats.date}) = CURRENT_DATE`;
            break;
          case 'week':
            // Get stats from the last 7 days
            dateFilter = sql`${writingStats.date} >= CURRENT_DATE - INTERVAL '7 days'`;
            break;
          case 'month':
            // Get stats from the last 30 days
            dateFilter = sql`${writingStats.date} >= CURRENT_DATE - INTERVAL '30 days'`;
            break;
          case 'year':
            // Get stats from the last 365 days
            dateFilter = sql`${writingStats.date} >= CURRENT_DATE - INTERVAL '365 days'`;
            break;
        }
        
        // Apply the date filter
        if (dateFilter) {
          query = db.select()
            .from(writingStats)
            .where(and(
              eq(writingStats.userId, userId),
              dateFilter
            ));
        }
      }
      
      const results = await query.orderBy(desc(writingStats.date));
      return results;
    } catch (error) {
      console.error('Error getting writing stats by user:', error);
      return [];
    }
  }

  async createWritingStat(stat: InsertWritingStat): Promise<WritingStat> {
    try {
      // Ensure date is set
      const statWithDate = {
        ...stat,
        date: stat.date || new Date()
      };
      
      const results = await db.insert(writingStats).values(statWithDate).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating writing stat:', error);
      throw error;
    }
  }

  // Achievement methods
  async getAchievements(): Promise<Achievement[]> {
    try {
      return await db.select().from(achievements);
    } catch (error) {
      console.error('Error getting achievements:', error);
      return [];
    }
  }

  async getAchievement(id: number): Promise<Achievement | undefined> {
    try {
      const results = await db.select().from(achievements).where(eq(achievements.id, id));
      return results[0];
    } catch (error) {
      console.error('Error getting achievement:', error);
      return undefined;
    }
  }

  async createAchievement(achievement: InsertAchievement): Promise<Achievement> {
    try {
      const results = await db.insert(achievements).values(achievement).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating achievement:', error);
      throw error;
    }
  }

  // User Achievement methods
  async getUserAchievements(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    try {
      const results = await db.select({
        userAchievement: userAchievements,
        achievement: achievements
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));
      
      return results.map(r => ({
        ...r.userAchievement,
        achievement: r.achievement
      }));
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  async createUserAchievement(userAchievement: InsertUserAchievement): Promise<UserAchievement> {
    try {
      const results = await db.insert(userAchievements).values(userAchievement).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating user achievement:', error);
      throw error;
    }
  }

  async checkAndAwardAchievements(userId: number): Promise<UserAchievement[]> {
    // This is a complex method that would require analyzing user activity and progress
    // against all available achievements. Simplified implementation for now.
    try {
      return [];
    } catch (error) {
      console.error('Error checking and awarding achievements:', error);
      return [];
    }
  }

  // Subscription Plan methods
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      return await db.select().from(subscriptionPlans);
    } catch (error) {
      console.error('Error getting subscription plans:', error);
      return [];
    }
  }

  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    try {
      const results = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, id));
      return results[0];
    } catch (error) {
      console.error('Error getting subscription plan:', error);
      return undefined;
    }
  }

  async createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    try {
      const results = await db.insert(subscriptionPlans).values(plan).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      throw error;
    }
  }

  async updateSubscriptionPlan(id: number, planUpdate: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    try {
      const results = await db.update(subscriptionPlans)
        .set(planUpdate)
        .where(eq(subscriptionPlans.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      return undefined;
    }
  }

  async deleteSubscriptionPlan(id: number): Promise<boolean> {
    try {
      const results = await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, id)).returning();
      return results.length > 0;
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      return false;
    }
  }

  // User Subscription methods
  async getUserSubscription(userId: number): Promise<Subscription | undefined> {
    try {
      const results = await db.select()
        .from(subscriptions)
        .where(eq(subscriptions.userId, userId))
        .orderBy(desc(subscriptions.createdAt))
        .limit(1);
      return results[0];
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return undefined;
    }
  }

  async getAllSubscriptions(): Promise<Subscription[]> {
    try {
      return await db.select().from(subscriptions);
    } catch (error) {
      console.error('Error getting all subscriptions:', error);
      return [];
    }
  }

  async createUserSubscription(subscription: InsertSubscription): Promise<Subscription> {
    try {
      const results = await db.insert(subscriptions).values(subscription).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating user subscription:', error);
      throw error;
    }
  }

  async updateUserSubscription(id: number, subscriptionUpdate: Partial<Subscription>): Promise<Subscription | undefined> {
    try {
      const results = await db.update(subscriptions)
        .set(subscriptionUpdate)
        .where(eq(subscriptions.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating user subscription:', error);
      return undefined;
    }
  }

  async cancelUserSubscription(id: number): Promise<Subscription | undefined> {
    try {
      const results = await db.update(subscriptions)
        .set({ 
          status: 'canceled',
          cancelAtPeriodEnd: true 
        })
        .where(eq(subscriptions.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error canceling user subscription:', error);
      return undefined;
    }
  }

  async updateUserPlan(userId: number, planName: string): Promise<User | undefined> {
    try {
      const results = await db.update(users)
        .set({ plan: planName })
        .where(eq(users.id, userId))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating user plan:', error);
      return undefined;
    }
  }

  // Timeline Event methods
  async getTimelineEvent(id: number): Promise<TimelineEvent | undefined> {
    try {
      const results = await db.select().from(timelineEvents).where(eq(timelineEvents.id, id));
      return results[0];
    } catch (error) {
      console.error('Error getting timeline event:', error);
      return undefined;
    }
  }

  async getTimelineEventsBySeries(seriesId: number): Promise<TimelineEvent[]> {
    try {
      return await db.select()
        .from(timelineEvents)
        .where(eq(timelineEvents.seriesId, seriesId))
        .orderBy(asc(timelineEvents.position));
    } catch (error) {
      console.error('Error getting timeline events by series:', error);
      return [];
    }
  }

  async getTimelineEventsByBook(bookId: number): Promise<TimelineEvent[]> {
    try {
      return await db.select()
        .from(timelineEvents)
        .where(eq(timelineEvents.bookId, bookId))
        .orderBy(asc(timelineEvents.position));
    } catch (error) {
      console.error('Error getting timeline events by book:', error);
      return [];
    }
  }

  async getTimelineEventsByCharacter(characterId: number): Promise<TimelineEvent[]> {
    try {
      // This is a more complex query since characterIds is stored as a JSONB array
      return await db.select()
        .from(timelineEvents)
        .where(sql`${characterId}::text = ANY(SELECT jsonb_array_elements_text(${timelineEvents.characterIds}))`)
        .orderBy(asc(timelineEvents.position));
    } catch (error) {
      console.error('Error getting timeline events by character:', error);
      return [];
    }
  }

  async createTimelineEvent(event: InsertTimelineEvent): Promise<TimelineEvent> {
    try {
      const results = await db.insert(timelineEvents).values(event).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating timeline event:', error);
      throw error;
    }
  }

  async updateTimelineEvent(id: number, eventUpdate: Partial<TimelineEvent>): Promise<TimelineEvent | undefined> {
    try {
      const results = await db.update(timelineEvents)
        .set(eventUpdate)
        .where(eq(timelineEvents.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating timeline event:', error);
      return undefined;
    }
  }

  async deleteTimelineEvent(id: number): Promise<boolean> {
    try {
      const results = await db.delete(timelineEvents).where(eq(timelineEvents.id, id)).returning();
      return results.length > 0;
    } catch (error) {
      console.error('Error deleting timeline event:', error);
      return false;
    }
  }

  async updateTimelineEventPositions(eventsToUpdate: { id: number; position: number; }[]): Promise<boolean> {
    try {
      await db.transaction(async (tx) => {
        for (const event of eventsToUpdate) {
          await tx.update(timelineEvents)
            .set({ position: event.position })
            .where(eq(timelineEvents.id, event.id));
        }
      });
      return true;
    } catch (error) {
      console.error('Error updating timeline event positions:', error);
      return false;
    }
  }

  // === Micro Reward System Methods ===
  
  // Reward Types
  async getRewardTypes(): Promise<RewardType[]> {
    try {
      return await db.select().from(rewardTypes).where(eq(rewardTypes.isActive, true));
    } catch (error) {
      console.error('Error getting reward types:', error);
      return [];
    }
  }

  async getRewardType(id: number): Promise<RewardType | undefined> {
    try {
      const results = await db.select().from(rewardTypes).where(eq(rewardTypes.id, id));
      return results[0];
    } catch (error) {
      console.error('Error getting reward type:', error);
      return undefined;
    }
  }

  async createRewardType(rewardType: InsertRewardType): Promise<RewardType> {
    try {
      const results = await db.insert(rewardTypes).values(rewardType).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating reward type:', error);
      throw error;
    }
  }

  async updateRewardType(id: number, updates: Partial<RewardType>): Promise<RewardType | undefined> {
    try {
      const results = await db.update(rewardTypes)
        .set(updates)
        .where(eq(rewardTypes.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating reward type:', error);
      return undefined;
    }
  }

  async deleteRewardType(id: number): Promise<boolean> {
    try {
      const results = await db.delete(rewardTypes).where(eq(rewardTypes.id, id)).returning();
      return results.length > 0;
    } catch (error) {
      console.error('Error deleting reward type:', error);
      return false;
    }
  }

  // Writing Milestones
  async getWritingMilestones(tier?: string): Promise<WritingMilestone[]> {
    try {
      if (tier) {
        return await db.select()
          .from(writingMilestones)
          .where(eq(writingMilestones.tier, tier));
      } else {
        return await db.select().from(writingMilestones);
      }
    } catch (error) {
      console.error('Error getting writing milestones:', error);
      return [];
    }
  }

  async getWritingMilestone(id: number): Promise<WritingMilestone | undefined> {
    try {
      const results = await db.select().from(writingMilestones).where(eq(writingMilestones.id, id));
      return results[0];
    } catch (error) {
      console.error('Error getting writing milestone:', error);
      return undefined;
    }
  }

  async createWritingMilestone(milestone: InsertWritingMilestone): Promise<WritingMilestone> {
    try {
      const results = await db.insert(writingMilestones).values(milestone).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating writing milestone:', error);
      throw error;
    }
  }

  async updateWritingMilestone(id: number, updates: Partial<WritingMilestone>): Promise<WritingMilestone | undefined> {
    try {
      const results = await db.update(writingMilestones)
        .set(updates)
        .where(eq(writingMilestones.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating writing milestone:', error);
      return undefined;
    }
  }

  async deleteWritingMilestone(id: number): Promise<boolean> {
    try {
      const results = await db.delete(writingMilestones).where(eq(writingMilestones.id, id)).returning();
      return results.length > 0;
    } catch (error) {
      console.error('Error deleting writing milestone:', error);
      return false;
    }
  }

  // User Rewards
  async getUserRewards(userId: number): Promise<(UserReward & { rewardType: RewardType })[]> {
    try {
      const results = await db.select({
        userReward: userRewards,
        rewardType: rewardTypes
      })
      .from(userRewards)
      .innerJoin(rewardTypes, eq(userRewards.rewardTypeId, rewardTypes.id))
      .where(eq(userRewards.userId, userId));
      
      return results.map(r => ({
        ...r.userReward,
        rewardType: r.rewardType
      }));
    } catch (error) {
      console.error('Error getting user rewards:', error);
      return [];
    }
  }

  async getUserReward(id: number): Promise<UserReward | undefined> {
    try {
      const results = await db.select().from(userRewards).where(eq(userRewards.id, id));
      return results[0];
    } catch (error) {
      console.error('Error getting user reward:', error);
      return undefined;
    }
  }

  async createUserReward(reward: InsertUserReward): Promise<UserReward> {
    try {
      const results = await db.insert(userRewards).values(reward).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating user reward:', error);
      throw error;
    }
  }

  async redeemUserReward(id: number): Promise<UserReward | undefined> {
    try {
      const results = await db.update(userRewards)
        .set({
          isRedeemed: true,
          redeemedAt: new Date()
        })
        .where(eq(userRewards.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error redeeming user reward:', error);
      return undefined;
    }
  }

  // Writing Streaks
  async getWritingStreak(userId: number): Promise<WritingStreak | undefined> {
    try {
      const results = await db.select().from(writingStreaks).where(eq(writingStreaks.userId, userId));
      return results[0];
    } catch (error) {
      console.error('Error getting writing streak:', error);
      return undefined;
    }
  }

  async createWritingStreak(streak: InsertWritingStreak): Promise<WritingStreak> {
    try {
      const results = await db.insert(writingStreaks).values(streak).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating writing streak:', error);
      throw error;
    }
  }

  async updateWritingStreak(userId: number, updates: Partial<WritingStreak>): Promise<WritingStreak | undefined> {
    try {
      const results = await db.update(writingStreaks)
        .set(updates)
        .where(eq(writingStreaks.userId, userId))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating writing streak:', error);
      return undefined;
    }
  }

  async incrementWritingStreak(userId: number): Promise<WritingStreak | undefined> {
    try {
      const streak = await this.getWritingStreak(userId);
      
      if (!streak) {
        // Create a new streak if none exists
        return await this.createWritingStreak({
          userId, 
          currentStreak: 1,
          longestStreak: 1,
          lastWritingDay: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
          totalWritingDays: 1
        });
      }
      
      // Update existing streak
      const results = await db.update(writingStreaks)
        .set({
          currentStreak: sql`${writingStreaks.currentStreak} + 1`,
          longestStreak: sql`GREATEST(${writingStreaks.longestStreak}, ${writingStreaks.currentStreak} + 1)`,
          lastWritingDay: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
          totalWritingDays: sql`${writingStreaks.totalWritingDays} + 1`
        })
        .where(eq(writingStreaks.userId, userId))
        .returning();
      
      return results[0];
    } catch (error) {
      console.error('Error incrementing writing streak:', error);
      return undefined;
    }
  }

  async resetWritingStreak(userId: number): Promise<WritingStreak | undefined> {
    try {
      const results = await db.update(writingStreaks)
        .set({
          currentStreak: 0,
          lastWritingDay: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
        })
        .where(eq(writingStreaks.userId, userId))
        .returning();
      
      return results[0];
    } catch (error) {
      console.error('Error resetting writing streak:', error);
      return undefined;
    }
  }

  // Writing Goals
  async getUserWritingGoals(userId: number): Promise<WritingGoal[]> {
    try {
      return await db.select().from(writingGoals).where(eq(writingGoals.userId, userId));
    } catch (error) {
      console.error('Error getting user writing goals:', error);
      return [];
    }
  }

  async getWritingGoal(id: number): Promise<WritingGoal | undefined> {
    try {
      const results = await db.select().from(writingGoals).where(eq(writingGoals.id, id));
      return results[0];
    } catch (error) {
      console.error('Error getting writing goal:', error);
      return undefined;
    }
  }

  async createWritingGoal(goal: InsertWritingGoal): Promise<WritingGoal> {
    try {
      const results = await db.insert(writingGoals).values(goal).returning();
      return results[0];
    } catch (error) {
      console.error('Error creating writing goal:', error);
      throw error;
    }
  }

  async updateWritingGoal(id: number, updates: Partial<WritingGoal>): Promise<WritingGoal | undefined> {
    try {
      const results = await db.update(writingGoals)
        .set(updates)
        .where(eq(writingGoals.id, id))
        .returning();
      return results[0];
    } catch (error) {
      console.error('Error updating writing goal:', error);
      return undefined;
    }
  }

  async deleteWritingGoal(id: number): Promise<boolean> {
    try {
      const results = await db.delete(writingGoals).where(eq(writingGoals.id, id)).returning();
      return results.length > 0;
    } catch (error) {
      console.error('Error deleting writing goal:', error);
      return false;
    }
  }

  async incrementGoalProgress(id: number, amount: number): Promise<WritingGoal | undefined> {
    try {
      const goal = await this.getWritingGoal(id);
      if (!goal) return undefined;
      
      // Update progress and check if completed
      const newCurrentValue = goal.currentValue + amount;
      const isCompleted = newCurrentValue >= goal.targetValue;
      
      const updates = {
        currentValue: newCurrentValue,
        isCompleted,
        completedAt: isCompleted ? new Date() : null
      };
      
      return await this.updateWritingGoal(id, updates);
    } catch (error) {
      console.error('Error incrementing goal progress:', error);
      return undefined;
    }
  }

  async completeWritingGoal(id: number): Promise<WritingGoal | undefined> {
    try {
      const results = await db.update(writingGoals)
        .set({
          isCompleted: true,
          completedAt: new Date()
        })
        .where(eq(writingGoals.id, id))
        .returning();
      
      return results[0];
    } catch (error) {
      console.error('Error completing writing goal:', error);
      return undefined;
    }
  }

  // Points System
  async getUserPoints(userId: number): Promise<number> {
    try {
      const result = await db.select({ 
        total: sql`SUM(${pointLedger.points})` 
      })
      .from(pointLedger)
      .where(eq(pointLedger.userId, userId));
      
      return Number(result[0]?.total) || 0;
    } catch (error) {
      console.error('Error getting user points:', error);
      return 0;
    }
  }

  async addPointsTransaction(transaction: InsertPointLedgerEntry): Promise<PointLedgerEntry> {
    try {
      const results = await db.insert(pointLedger).values(transaction).returning();
      return results[0];
    } catch (error) {
      console.error('Error adding points transaction:', error);
      throw error;
    }
  }

  async getPointsLedger(userId: number, limit: number = 50): Promise<PointLedgerEntry[]> {
    try {
      return await db.select()
        .from(pointLedger)
        .where(eq(pointLedger.userId, userId))
        .orderBy(desc(pointLedger.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error getting points ledger:', error);
      return [];
    }
  }

  // Milestone Tracking
  async checkAndAwardMilestones(userId: number, context?: {
    wordCount?: number;
    chapterId?: number;
    bookId?: number;
    seriesId?: number;
  }): Promise<UserReward[]> {
    // This is a complex method that would require analyzing user progress
    // against all available milestones. Simplified implementation for now.
    try {
      return [];
    } catch (error) {
      console.error('Error checking and awarding milestones:', error);
      return [];
    }
  }
}