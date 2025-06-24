import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { nanoid } from "nanoid";
import multer from "multer";
import csv from "csv-parser";
import XLSX from "xlsx";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado'));
    }
  }
});

// Validation schemas
const uploadFileSchema = z.object({
  descriptionColumn: z.string(),
  quantityColumn: z.string().optional(),
});

const updateMatchStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'MANUAL']),
  materialId: z.string().optional(),
});

const searchMaterialsSchema = z.object({
  query: z.string().min(1),
  categoryId: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Upload routes
  app.post('/api/uploads', isAuthenticated, upload.single('file'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }

      // Create upload record
      const uploadRecord = await storage.createUpload({
        fileName: file.filename,
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        userId,
      });

      // Log the action
      await storage.createUserLog({
        action: 'UPLOAD_FILE',
        details: `Uploaded file: ${file.originalname}`,
        userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      res.json(uploadRecord);
    } catch (error) {
      console.error("Error creating upload:", error);
      res.status(500).json({ message: "Failed to process upload" });
    }
  });

  app.post('/api/uploads/:id/process', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const uploadId = req.params.id;
      const validation = uploadFileSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request parameters" });
      }

      const { descriptionColumn, quantityColumn } = validation.data;

      // Get upload record
      const upload = await storage.getUpload(uploadId);
      if (!upload || upload.userId !== userId) {
        return res.status(404).json({ message: "Upload not found" });
      }

      // Process file based on type
      const filePath = path.join('uploads', upload.fileName);
      let items: any[] = [];

      if (upload.mimeType === 'text/csv') {
        // Process CSV
        items = await new Promise((resolve, reject) => {
          const results: any[] = [];
          fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', reject);
        });
      } else {
        // Process Excel
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        items = XLSX.utils.sheet_to_json(worksheet);
      }

      // Create upload items
      const uploadItems = items.map((item, index) => ({
        originalName: item[descriptionColumn] || '',
        quantity: quantityColumn ? item[quantityColumn] : null,
        rowNumber: index + 1,
        uploadId,
      }));

      await storage.createUploadItems(uploadItems);

      // Update upload with total items
      await storage.updateUploadStatus(uploadId, 'PROCESSING', 0);

      // Start processing (simulate async processing)
      processUploadAsync(uploadId, uploadItems);

      res.json({ message: "Processing started", totalItems: items.length });
    } catch (error) {
      console.error("Error processing upload:", error);
      res.status(500).json({ message: "Failed to process file" });
    }
  });

  app.get('/api/uploads', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const uploads = await storage.getUploadsByUser(userId);
      res.json(uploads);
    } catch (error) {
      console.error("Error fetching uploads:", error);
      res.status(500).json({ message: "Failed to fetch uploads" });
    }
  });

  app.get('/api/uploads/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const uploadId = req.params.id;
      
      const upload = await storage.getUpload(uploadId);
      if (!upload || upload.userId !== userId) {
        return res.status(404).json({ message: "Upload not found" });
      }

      res.json(upload);
    } catch (error) {
      console.error("Error fetching upload:", error);
      res.status(500).json({ message: "Failed to fetch upload" });
    }
  });

  // Review routes
  app.get('/api/uploads/:id/matches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const uploadId = req.params.id;

      // Verify upload ownership
      const upload = await storage.getUpload(uploadId);
      if (!upload || upload.userId !== userId) {
        return res.status(404).json({ message: "Upload not found" });
      }

      const matches = await storage.getMatchedItems(uploadId);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  app.patch('/api/matches/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matchId = req.params.id;
      const validation = updateMatchStatusSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request parameters" });
      }

      const { status, materialId } = validation.data;

      if (materialId) {
        await storage.updateMatchedItemMaterial(matchId, materialId, status, userId);
      } else {
        await storage.updateMatchedItemStatus(matchId, status, userId);
      }

      res.json({ message: "Match status updated" });
    } catch (error) {
      console.error("Error updating match status:", error);
      res.status(500).json({ message: "Failed to update match status" });
    }
  });

  // Material search routes
  app.get('/api/materials/search', isAuthenticated, async (req: any, res) => {
    try {
      const validation = searchMaterialsSchema.safeParse({
        query: req.query.q,
        categoryId: req.query.categoryId,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      });

      if (!validation.success) {
        return res.status(400).json({ message: "Invalid search parameters" });
      }

      const { query, categoryId, limit } = validation.data;
      const materials = await storage.searchMaterials(query, categoryId, limit);
      
      res.json(materials);
    } catch (error) {
      console.error("Error searching materials:", error);
      res.status(500).json({ message: "Failed to search materials" });
    }
  });

  app.get('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/subcategories', isAuthenticated, async (req: any, res) => {
    try {
      const categoryId = req.query.categoryId as string;
      const subcategories = await storage.getSubcategories(categoryId);
      res.json(subcategories);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      res.status(500).json({ message: "Failed to fetch subcategories" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Async processing simulation
async function processUploadAsync(uploadId: string, uploadItems: any[]) {
  try {
    const totalItems = uploadItems.length;
    let processedCount = 0;

    for (const item of uploadItems) {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 100));

      // Simple matching algorithm (in real implementation, this would be more sophisticated)
      const matchResult = await simulateMatching(item.originalName);

      if (matchResult) {
        await storage.createMatchedItems([{
          confidenceScore: matchResult.score,
          status: matchResult.score >= 80 ? 'APPROVED' : 'PENDING',
          originalText: item.originalName,
          matchedText: matchResult.materialName,
          uploadId,
          uploadItemId: item.id,
          materialId: matchResult.materialId,
        }]);
      } else {
        await storage.createMatchedItems([{
          confidenceScore: 0,
          status: 'NOT_FOUND',
          originalText: item.originalName,
          matchedText: null,
          uploadId,
          uploadItemId: item.id,
          materialId: null,
        }]);
      }

      processedCount++;
      await storage.updateUploadStatus(uploadId, 'PROCESSING', processedCount);
    }

    // Complete upload
    await storage.completeUpload(uploadId);
  } catch (error) {
    console.error("Error processing upload:", error);
    await storage.updateUploadStatus(uploadId, 'FAILED');
  }
}

// Simple matching simulation (replace with actual matching algorithm)
async function simulateMatching(description: string): Promise<{
  materialId: string;
  materialName: string;
  score: number;
} | null> {
  // This is a simplified matching algorithm
  // In a real implementation, you would use fuzzy matching, NLP, etc.
  
  const materials = await storage.searchMaterials(description.substring(0, 10), undefined, 5);
  
  if (materials.length > 0) {
    const bestMatch = materials[0];
    const score = Math.random() * 40 + 60; // Random score between 60-100
    
    return {
      materialId: bestMatch.id,
      materialName: bestMatch.name,
      score: Math.round(score),
    };
  }
  
  return null;
}
