import { apiSlice } from '../../ApiSlice';
import {
    setFeedPosts,
    appendFeedPosts,
    setFeedLoading,
    setFeedError,
    setHasMore,
    setTotalPosts,
} from './feed';
import type { FeedData, FeedResponse, FeedQueryParams } from './types';

export const feedApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getFeed: builder.query<FeedData, FeedQueryParams>({
            query: ({ page = 1, limit = 20 } = {}) => ({
                url: `feed?page=${page}&limit=${limit}`,
                method: 'GET',
            }),
            transformResponse: (response: FeedResponse | FeedData) =>
                (response as FeedResponse).data ?? (response as FeedData),
            async onQueryStarted({ page = 1 }, { dispatch, queryFulfilled }) {
                dispatch(setFeedLoading());
                try {
                    const { data } = await queryFulfilled;

                    // If first page, set posts; otherwise append
                    if (page === 1) {
                        dispatch(setFeedPosts(data.posts));
                    } else {
                        dispatch(appendFeedPosts(data.posts));
                    }

                    // Update pagination state
                    dispatch(setHasMore(data.pagination.hasMore));
                    dispatch(setTotalPosts(data.pagination.totalPosts));
                } catch (error) {
                    dispatch(
                        setFeedError(
                            error instanceof Error ? error.message : 'Failed to load feed'
                        )
                    );
                }
            },
        }),
    }),
    overrideExisting: false,
});

export const { useGetFeedQuery, useLazyGetFeedQuery } = feedApi;
