import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  boolean,
  integer,
  real,
  serial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  plan: varchar("plan", { enum: ['FREE', 'PRO', 'ENTERPRISE'] }).default('FREE'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories do CATMAT
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey(),
  code: varchar("code").unique().notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
});

// Subcategories do CATMAT
export const subcategories = pgTable("subcategories", {
  id: varchar("id").primaryKey(),
  code: varchar("code").unique().notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  categoryId: varchar("category_id").notNull(),
});

// Materials do CATMAT
export const materials = pgTable("materials", {
  id: varchar("id").primaryKey(),
  code: varchar("code").unique().notNull(), // Código CATMAT
  name: text("name").notNull(), // Descrição padronizada
  unit: varchar("unit"), // Unidade de fornecimento
  active: boolean("active").default(true),
  searchVector: text("search_vector"), // Texto otimizado para busca
  keywords: jsonb("keywords"), // Palavras-chave extraídas como JSON array
  categoryId: varchar("category_id").notNull(),
  subcategoryId: varchar("subcategory_id"),
}, (table) => [
  index("idx_materials_name").on(table.name),
  index("idx_materials_code").on(table.code),
]);

// Uploads de arquivos pelos usuários
export const uploads = pgTable("uploads", {
  id: varchar("id").primaryKey(),
  fileName: varchar("file_name").notNull(),
  originalName: varchar("original_name").notNull(),
  fileSize: integer("file_size").notNull(),
  mimeType: varchar("mime_type").notNull(),
  status: varchar("status", { enum: ['PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED'] }).default('PROCESSING'),
  totalItems: integer("total_items"),
  processedItems: integer("processed_items"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  userId: varchar("user_id").notNull(),
});

// Itens individuais de cada upload
export const uploadItems = pgTable("upload_items", {
  id: varchar("id").primaryKey(),
  originalName: text("original_name").notNull(),
  quantity: varchar("quantity"),
  unit: varchar("unit"),
  rowNumber: integer("row_number").notNull(),
  uploadId: varchar("upload_id").notNull(),
});

// Resultado do matching entre item original e material CATMAT
export const matchedItems = pgTable("matched_items", {
  id: varchar("id").primaryKey(),
  confidenceScore: real("confidence_score").notNull(),
  status: varchar("status", { enum: ['PENDING', 'APPROVED', 'REJECTED', 'NOT_FOUND', 'MANUAL'] }).default('PENDING'),
  originalText: text("original_text").notNull(),
  matchedText: text("matched_text"),
  uploadId: varchar("upload_id").notNull(),
  uploadItemId: varchar("upload_item_id").notNull(),
  materialId: varchar("material_id"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: varchar("reviewed_by"),
});

// Chaves de API para integrações
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  key: varchar("key").unique().notNull(),
  active: boolean("active").default(true),
  lastUsed: timestamp("last_used"),
  requestCount: integer("request_count").default(0),
  dailyLimit: integer("daily_limit").default(1000),
  userId: varchar("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Logs de sincronização com API Compras.gov
export const syncLogs = pgTable("sync_logs", {
  id: varchar("id").primaryKey(),
  status: varchar("status", { enum: ['RUNNING', 'COMPLETED', 'FAILED'] }).default('RUNNING'),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  totalRecords: integer("total_records"),
  newRecords: integer("new_records"),
  updatedRecords: integer("updated_records"),
  deletedRecords: integer("deleted_records"),
  errorCount: integer("error_count"),
  errorMessage: text("error_message"),
  details: jsonb("details"),
});

// Logs de atividade dos usuários
export const userLogs = pgTable("user_logs", {
  id: varchar("id").primaryKey(),
  action: varchar("action", { 
    enum: ['LOGIN', 'LOGOUT', 'UPLOAD_FILE', 'DOWNLOAD_RESULT', 'API_REQUEST', 'PROFILE_UPDATE'] 
  }).notNull(),
  details: text("details"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").notNull(),
});

// Configurações do sistema
export const systemConfig = pgTable("system_config", {
  id: varchar("id").primaryKey(),
  key: varchar("key").unique().notNull(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  uploads: many(uploads),
  apiKeys: many(apiKeys),
  userLogs: many(userLogs),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  subcategories: many(subcategories),
  materials: many(materials),
}));

export const subcategoriesRelations = relations(subcategories, ({ one, many }) => ({
  category: one(categories, {
    fields: [subcategories.categoryId],
    references: [categories.id],
  }),
  materials: many(materials),
}));

export const materialsRelations = relations(materials, ({ one, many }) => ({
  category: one(categories, {
    fields: [materials.categoryId],
    references: [categories.id],
  }),
  subcategory: one(subcategories, {
    fields: [materials.subcategoryId],
    references: [subcategories.id],
  }),
  matchedItems: many(matchedItems),
}));

export const uploadsRelations = relations(uploads, ({ one, many }) => ({
  user: one(users, {
    fields: [uploads.userId],
    references: [users.id],
  }),
  uploadItems: many(uploadItems),
  matchedItems: many(matchedItems),
}));

export const uploadItemsRelations = relations(uploadItems, ({ one, many }) => ({
  upload: one(uploads, {
    fields: [uploadItems.uploadId],
    references: [uploads.id],
  }),
  matchedItem: many(matchedItems),
}));

export const matchedItemsRelations = relations(matchedItems, ({ one }) => ({
  upload: one(uploads, {
    fields: [matchedItems.uploadId],
    references: [uploads.id],
  }),
  uploadItem: one(uploadItems, {
    fields: [matchedItems.uploadItemId],
    references: [uploadItems.id],
  }),
  material: one(materials, {
    fields: [matchedItems.materialId],
    references: [materials.id],
  }),
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

export const userLogsRelations = relations(userLogs, ({ one }) => ({
  user: one(users, {
    fields: [userLogs.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories);
export const insertSubcategorySchema = createInsertSchema(subcategories);
export const insertMaterialSchema = createInsertSchema(materials);
export const insertUploadSchema = createInsertSchema(uploads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertUploadItemSchema = createInsertSchema(uploadItems).omit({
  id: true,
});
export const insertMatchedItemSchema = createInsertSchema(matchedItems).omit({
  id: true,
});
export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertUserLogSchema = createInsertSchema(userLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Subcategory = typeof subcategories.$inferSelect;
export type Material = typeof materials.$inferSelect;
export type Upload = typeof uploads.$inferSelect;
export type UploadItem = typeof uploadItems.$inferSelect;
export type MatchedItem = typeof matchedItems.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;
export type UserLog = typeof userLogs.$inferSelect;
export type SystemConfig = typeof systemConfig.$inferSelect;

export type InsertUpload = z.infer<typeof insertUploadSchema>;
export type InsertUploadItem = z.infer<typeof insertUploadItemSchema>;
export type InsertMatchedItem = z.infer<typeof insertMatchedItemSchema>;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type InsertUserLog = z.infer<typeof insertUserLogSchema>;
