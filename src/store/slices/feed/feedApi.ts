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
            transformResponse: (response: FeedResponse) => response.data,
            async onQueryStarted({ page = 1 }, { dispatch, queryFulfilled }) {
                dispatch(setFeedLoading());
                try {
                    const { data } = await queryFulfilled;

                    // If first page, set posts; otherwise append
                    if (page === 1) {
                        dispatch(setFeedPosts(data.data));
                    } else {
                        dispatch(appendFeedPosts(data.data));
                    }

                    // Update pagination state - since API doesn't return pagination info,
                    // we'll determine hasMore based on the number of posts returned
                    const hasMore = data.data.length >= 20; // If we got a full page, there might be more
                    dispatch(setHasMore(hasMore));
                    dispatch(setTotalPosts(data.data.length)); // This is just the current batch
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
