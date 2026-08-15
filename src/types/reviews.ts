// src/types/reviews.ts

export type ReviewStatus =
  | 'pending'
  | 'approved'
  | 'rejected';

export interface CreateReviewPayload {
  productId: string;
  sku: string;
  rating: number;
  title?: string;
  comment: string;
  customerName: string;
  orderId?: string;
}

export interface ReviewResponse {
  reviewId: string;
  productId: string;
  sku: string;
  rating: number;
  title?: string | null;
  comment: string;
  customerName: string;
  verifiedPurchase: boolean;
  status: ReviewStatus;
  createdAt: string;
}

export interface ReviewSummary {
  productId: string;
  averageRating: number;
  reviewCount: number;
}
