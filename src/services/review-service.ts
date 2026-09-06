import type {
  ReviewResponse,
  ReviewSummary,
  CreateReviewPayload,
} from '../types/reviews';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://api.kawadswad.in';

export const ReviewService = {
  async getReviews(
    productId: string,
    limit = 20,
    skip = 0,
  ): Promise<ReviewResponse[]> {
    const params = new URLSearchParams({
      limit: String(limit),
      skip: String(skip),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/reviews/${encodeURIComponent(productId)}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        'Unable to load product reviews.',
      );
    }

    return (await response.json()) as ReviewResponse[];
  },

  async getSummary(
    productId: string,
  ): Promise<ReviewSummary> {
    const response = await fetch(
      `${API_BASE_URL}/api/reviews/${encodeURIComponent(productId)}/summary`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        'Unable to load review summary.',
      );
    }

    return (await response.json()) as ReviewSummary;
  },

  async createReview(
    payload: CreateReviewPayload,
  ): Promise<ReviewResponse> {
    const response = await fetch(
      `${API_BASE_URL}/api/reviews`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      let errorMessage =
        'Unable to submit your review.';

      try {
        const errorData = (await response.json()) as {
          detail?: string | unknown;
        };

        if (errorData.detail) {
          errorMessage =
            typeof errorData.detail === 'string'
              ? errorData.detail
              : JSON.stringify(
                  errorData.detail,
                );
        }
      } catch {
        // Keep default error message.
      }

      throw new Error(errorMessage);
    }

    return (await response.json()) as ReviewResponse;
  },
};
