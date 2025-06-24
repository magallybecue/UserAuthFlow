export interface DashboardStats {
  monthlyUploads: number;
  processedItems: number;
  pendingReview: number;
  matchRate: number;
}

export interface Upload {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  status: 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  totalItems?: number;
  processedItems?: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  userId: string;
}

export interface UploadItem {
  id: string;
  originalName: string;
  quantity?: string;
  unit?: string;
  rowNumber: number;
  uploadId: string;
}

export interface MatchedItem {
  id: string;
  confidenceScore: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_FOUND' | 'MANUAL';
  originalText: string;
  matchedText?: string;
  uploadId: string;
  uploadItemId: string;
  materialId?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  material?: Material;
  uploadItem?: UploadItem;
}

export interface Material {
  id: string;
  code: string;
  name: string;
  unit?: string;
  active: boolean;
  categoryId: string;
  subcategoryId?: string;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface Subcategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  categoryId: string;
}

export interface FileUploadData {
  descriptionColumn: string;
  quantityColumn?: string;
}

export interface SearchMaterialsParams {
  q: string;
  categoryId?: string;
  limit?: number;
}
