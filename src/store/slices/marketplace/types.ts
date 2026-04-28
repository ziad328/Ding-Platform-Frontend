// ─── Pagination Wrapper ────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── Product ───────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  quantity: number;
  images: string[];
  sellerId: string;
  sellerName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductPayload {
  title: string;
  description: string;
  price: number;
  currency: string;
  quantity: number;
  images: string[];
}

export interface UpdateProductPayload {
  price?: number;
  quantity?: number;
}

// ─── Seller ────────────────────────────────────────────────────────────────

export interface SellerProfile {
  id: string;
  userId: string;
  businessName: string;
  phoneNumber: string;
  city: string;
  status: SellerStatus;
  createdAt: string;
  updatedAt: string;
}

export type SellerStatus = 'ACTIVE' | 'BANNED' | 'SUSPENDED';

export interface UpdateSellerProfilePayload {
  businessName?: string;
  phoneNumber?: string;
  city?: string;
}

// ─── Seller Application ────────────────────────────────────────────────────

export interface SellerApplication {
  id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  status: ApplicationStatus;
  businessName: string;
  phoneNumber: string;
  city: string;
  declineReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'DECLINED';

// ─── Deal / Transaction ────────────────────────────────────────────────────

export interface Deal {
  id: string;
  productId: string;
  productTitle?: string;
  buyerId: string;
  buyerName?: string;
  sellerId: string;
  sellerName?: string;
  amount: number;
  currency: string;
  status: DealStatus;
  createdAt: string;
  updatedAt: string;
}

export type DealStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

// ─── Admin Audit Log ───────────────────────────────────────────────────────

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetId: string;
  targetType: string;
  details?: string;
  createdAt: string;
}

// ─── API Query Params ──────────────────────────────────────────────────────

export interface PaginationParams {
  page?: number;
  limit?: number;
}
