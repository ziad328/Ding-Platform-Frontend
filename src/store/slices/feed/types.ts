export interface FeedPost {
    id: number;
    author: string;
    role: string;
    time: string;
    content: string;
    likes: number;
    comments: number;
    image?: string | null;
}

export interface FeedPagination {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasMore: boolean;
}

export interface FeedData {
    posts: FeedPost[];
    pagination: FeedPagination;
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
