import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Post from '../profile/Post';
import { FeedLoadingSkeleton, FeedPostSkeleton } from './FeedSkeletons';
import { useLazyGetFeedQuery } from '../../store/slices/feed/feedApi';
import {
    selectFeedPosts,
    selectFeedLoading,
    selectFeedError,
    selectCurrentPage,
    selectHasMore,
    incrementPage,
} from '../../store/slices/feed/feed';

const FeedPosts = () => {
    const dispatch = useDispatch();
    const posts = useSelector(selectFeedPosts);
    const loading = useSelector(selectFeedLoading);
    const error = useSelector(selectFeedError);
    const currentPage = useSelector(selectCurrentPage);
    const hasMore = useSelector(selectHasMore);

    const [triggerFetch, { isFetching }] = useLazyGetFeedQuery();
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const isInitialLoad = useRef(true);

    // Initial load
    useEffect(() => {
        if (isInitialLoad.current) {
            triggerFetch({ page: 1, limit: 20 });
            isInitialLoad.current = false;
        }
    }, [triggerFetch]);

    // Load more when scrolling to 80% of posts
    const handleLoadMore = useCallback(() => {
        if (!isFetching && hasMore && posts && posts.length > 0) {
            dispatch(incrementPage());
            triggerFetch({ page: currentPage + 1, limit: 20 });
        }
    }, [isFetching, hasMore, posts, currentPage, dispatch, triggerFetch]);

    // Set up intersection observer for infinite scroll
    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting) {
                    handleLoadMore();
                }
            },
            {
                root: null,
                rootMargin: '200px', // Start loading 200px before reaching the trigger
                threshold: 0.1,
            }
        );

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [handleLoadMore]);

    // Calculate position for load more trigger (at 80% of posts)
    const triggerIndex = posts ? Math.floor(posts.length * 0.8) : 0;

    // Initial loading state
    if (loading && (!posts || posts.length === 0)) {
        return (
            <div className="space-y-3 sm:space-y-4">
                <FeedLoadingSkeleton count={4} />
            </div>
        );
    }

    // Error state
    if (error && (!posts || posts.length === 0)) {
        return (
            <div className="bg-white dark:bg-dark-bg-secondary rounded-lg sm:rounded-xl shadow-sm p-6 sm:p-8 text-center">
                <p className="text-neutral-b-700 dark:text-dark-text-secondary text-sm sm:text-base mb-4">
                    {error}
                </p>
                <button
                    onClick={() => triggerFetch({ page: 1, limit: 20 })}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-primary-600 dark:bg-primary-500 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 transition-colors cursor-pointer"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // Empty state
    if (posts.length === 0 && !loading) {
        return (
            <div className="bg-white dark:bg-dark-bg-secondary rounded-lg sm:rounded-xl shadow-sm p-8 sm:p-12 text-center">
                <p className="text-neutral-b-700 dark:text-dark-text-secondary text-base sm:text-lg">
                    No posts yet. Be the first to share something!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3 sm:space-y-4">
            {posts && posts.map((post, index) => (
                <div key={post.id}>
                    <Post post={post} />
                    {/* Place load more trigger at 80% of posts */}
                    {index === triggerIndex && hasMore && (
                        <div ref={loadMoreRef} className="h-1" />
                    )}
                </div>
            ))}

            {/* Show loading skeletons when fetching more */}
            {isFetching && posts && posts.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                    <FeedPostSkeleton />
                    <FeedPostSkeleton withImage />
                </div>
            )}

            {/* End of feed message */}
            {!hasMore && posts && posts.length > 0 && (
                <div className="text-center py-6 sm:py-8">
                    <p className="text-neutral-b-500 dark:text-dark-text-muted text-xs sm:text-sm">
                        You've reached the end of your feed
                    </p>
                </div>
            )}
        </div>
    );
};

export default FeedPosts;
