export interface FeedPost {
    id: string;
    author: string;
    time: string;
    content: string;
    likes: number;
    comments: number;
    image: string | null;
}

export interface FeedPagination {
    currentPage: number;
    totalPages: number;
    totalPosts: number;
    hasMore: boolean;
}

export interface FeedData {
    data: FeedPost[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
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
