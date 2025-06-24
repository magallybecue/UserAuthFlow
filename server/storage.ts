import {
  users,
  uploads,
  uploadItems,
  matchedItems,
  materials,
  categories,
  subcategories,
  userLogs,
  apiKeys,
  type User,
  type UpsertUser,
  type Upload,
  type UploadItem,
  type MatchedItem,
  type Material,
  type Category,
  type Subcategory,
  type InsertUpload,
  type InsertUploadItem,
  type InsertMatchedItem,
  type InsertMaterial,
  type InsertUserLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, or, count, sql } from "drizzle-orm";
import { nanoid } from "nanoid";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Upload operations
  createUpload(upload: InsertUpload): Promise<Upload>;
  getUpload(id: string): Promise<Upload | undefined>;
  getUploadsByUser(userId: string): Promise<Upload[]>;
  updateUploadStatus(id: string, status: string, processedItems?: number): Promise<void>;
  completeUpload(id: string): Promise<void>;

  // Upload items operations
  createUploadItems(items: InsertUploadItem[]): Promise<UploadItem[]>;
  getUploadItems(uploadId: string): Promise<UploadItem[]>;

  // Matched items operations
  createMatchedItems(items: InsertMatchedItem[]): Promise<MatchedItem[]>;
  getMatchedItems(uploadId: string): Promise<MatchedItem[]>;
  updateMatchedItemStatus(id: string, status: string, reviewedBy?: string): Promise<void>;
  updateMatchedItemMaterial(id: string, materialId: string, status: string, reviewedBy?: string): Promise<void>;

  // Material operations
  searchMaterials(query: string, categoryId?: string, limit?: number): Promise<Material[]>;
  getMaterial(id: string): Promise<Material | undefined>;
  getMaterialByCode(code: string): Promise<Material | undefined>;
  getCategories(): Promise<Category[]>;
  getSubcategories(categoryId?: string): Promise<Subcategory[]>;

  // Statistics
  getUserStats(userId: string): Promise<{
    monthlyUploads: number;
    processedItems: number;
    pendingReview: number;
    matchRate: number;
  }>;

  // User logs
  createUserLog(log: InsertUserLog): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Upload operations
  async createUpload(upload: InsertUpload): Promise<Upload> {
    const [newUpload] = await db
      .insert(uploads)
      .values({
        ...upload,
        id: nanoid(),
      })
      .returning();
    return newUpload;
  }

  async getUpload(id: string): Promise<Upload | undefined> {
    const [upload] = await db.select().from(uploads).where(eq(uploads.id, id));
    return upload;
  }

  async getUploadsByUser(userId: string): Promise<Upload[]> {
    return await db
      .select()
      .from(uploads)
      .where(eq(uploads.userId, userId))
      .orderBy(desc(uploads.createdAt));
  }

  async updateUploadStatus(id: string, status: string, processedItems?: number): Promise<void> {
    const updateData: any = { status, updatedAt: new Date() };
    if (processedItems !== undefined) {
      updateData.processedItems = processedItems;
    }

    await db
      .update(uploads)
      .set(updateData)
      .where(eq(uploads.id, id));
  }

  async completeUpload(id: string): Promise<void> {
    await db
      .update(uploads)
      .set({
        status: 'COMPLETED',
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(uploads.id, id));
  }

  // Upload items operations
  async createUploadItems(items: InsertUploadItem[]): Promise<UploadItem[]> {
    const itemsWithIds = items.map(item => ({
      ...item,
      id: nanoid(),
    }));

    return await db.insert(uploadItems).values(itemsWithIds).returning();
  }

  async getUploadItems(uploadId: string): Promise<UploadItem[]> {
    return await db
      .select()
      .from(uploadItems)
      .where(eq(uploadItems.uploadId, uploadId))
      .orderBy(uploadItems.rowNumber);
  }

  // Matched items operations
  async createMatchedItems(items: InsertMatchedItem[]): Promise<MatchedItem[]> {
    const itemsWithIds = items.map(item => ({
      ...item,
      id: nanoid(),
    }));

    return await db.insert(matchedItems).values(itemsWithIds).returning();
  }

  async getMatchedItems(uploadId: string): Promise<MatchedItem[]> {
    return await db
      .select({
        id: matchedItems.id,
        confidenceScore: matchedItems.confidenceScore,
        status: matchedItems.status,
        originalText: matchedItems.originalText,
        matchedText: matchedItems.matchedText,
        uploadId: matchedItems.uploadId,
        uploadItemId: matchedItems.uploadItemId,
        materialId: matchedItems.materialId,
        reviewedAt: matchedItems.reviewedAt,
        reviewedBy: matchedItems.reviewedBy,
        material: materials,
        uploadItem: uploadItems,
      })
      .from(matchedItems)
      .leftJoin(materials, eq(matchedItems.materialId, materials.id))
      .leftJoin(uploadItems, eq(matchedItems.uploadItemId, uploadItems.id))
      .where(eq(matchedItems.uploadId, uploadId));
  }

  async updateMatchedItemStatus(id: string, status: string, reviewedBy?: string): Promise<void> {
    await db
      .update(matchedItems)
      .set({
        status: status as any,
        reviewedAt: new Date(),
        reviewedBy,
      })
      .where(eq(matchedItems.id, id));
  }

  async updateMatchedItemMaterial(id: string, materialId: string, status: string, reviewedBy?: string): Promise<void> {
    // Get material details for matched text
    const [material] = await db.select().from(materials).where(eq(materials.id, materialId));
    
    await db
      .update(matchedItems)
      .set({
        materialId,
        matchedText: material?.name,
        status: status as any,
        reviewedAt: new Date(),
        reviewedBy,
      })
      .where(eq(matchedItems.id, id));
  }

  // Material operations
  async searchMaterials(query: string, categoryId?: string, limit = 50): Promise<Material[]> {
    let whereClause = like(materials.name, `%${query}%`);
    
    if (categoryId) {
      whereClause = and(whereClause, eq(materials.categoryId, categoryId)) as any;
    }

    return await db
      .select()
      .from(materials)
      .where(whereClause)
      .limit(limit);
  }

  async getMaterial(id: string): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.id, id));
    return material;
  }

  async getMaterialByCode(code: string): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.code, code));
    return material;
  }

  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getSubcategories(categoryId?: string): Promise<Subcategory[]> {
    const query = db.select().from(subcategories);
    
    if (categoryId) {
      return await query.where(eq(subcategories.categoryId, categoryId)).orderBy(subcategories.name);
    }
    
    return await query.orderBy(subcategories.name);
  }

  // Statistics
  async getUserStats(userId: string): Promise<{
    monthlyUploads: number;
    processedItems: number;
    pendingReview: number;
    matchRate: number;
  }> {
    // Monthly uploads
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const [monthlyUploadsResult] = await db
      .select({ count: count() })
      .from(uploads)
      .where(
        and(
          eq(uploads.userId, userId),
          sql`${uploads.createdAt} >= ${oneMonthAgo}`
        )
      );

    // Processed items (total)
    const [processedItemsResult] = await db
      .select({ sum: sql<number>`COALESCE(SUM(${uploads.processedItems}), 0)` })
      .from(uploads)
      .where(eq(uploads.userId, userId));

    // Pending review items
    const [pendingReviewResult] = await db
      .select({ count: count() })
      .from(matchedItems)
      .innerJoin(uploads, eq(matchedItems.uploadId, uploads.id))
      .where(
        and(
          eq(uploads.userId, userId),
          eq(matchedItems.status, 'PENDING')
        )
      );

    // Match rate calculation
    const [matchRateResult] = await db
      .select({
        total: count(),
        matched: sql<number>`COUNT(CASE WHEN ${matchedItems.status} IN ('APPROVED', 'MANUAL') THEN 1 END)`,
      })
      .from(matchedItems)
      .innerJoin(uploads, eq(matchedItems.uploadId, uploads.id))
      .where(eq(uploads.userId, userId));

    const matchRate = matchRateResult.total > 0 
      ? Math.round((matchRateResult.matched / matchRateResult.total) * 100)
      : 0;

    return {
      monthlyUploads: monthlyUploadsResult.count,
      processedItems: processedItemsResult.sum || 0,
      pendingReview: pendingReviewResult.count,
      matchRate,
    };
  }

  // User logs
  async createUserLog(log: InsertUserLog): Promise<void> {
    await db.insert(userLogs).values({
      ...log,
      id: nanoid(),
    });
  }
}

export const storage = new DatabaseStorage();
