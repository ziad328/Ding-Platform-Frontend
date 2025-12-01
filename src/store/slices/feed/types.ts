export interface FeedPost {
    id: string;
    content: string;
    authorId: string;
    authorName: string;
    createdAt: string;
    mediaUrls: string[];
    privacy: string;
}

export interface FeedPagination {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasMore: boolean;
}

export interface FeedData {
    data: FeedPost[];
}

export interface FeedResponse {
    code: number;
    success: boolean;
    message: string;
    data: FeedData;
}

export interface FeedQueryParams {
    page?: number;
    limit?: number;
}

export interface FeedState {
    posts: FeedPost[];
    loading: boolean;
    error: string | null;
    currentPage: number;
    hasMore: boolean;
    totalPosts: number;
}
