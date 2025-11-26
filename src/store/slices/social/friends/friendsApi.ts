import { apiSlice } from '../../../ApiSlice';
import type { FriendRequestsPayload, FriendsPayload, FriendsQueryParams } from '../types';

interface PaginatedFriendsResponse<TData> {
  code: number;
  success: boolean;
  message: string;
  data: {
    data: TData;
    meta: {
      limit: number;
      offset: number;
      total: number;
      hasMore: boolean;
      nextOffset: number | null;
    };
  };
}

type FriendsResponse = PaginatedFriendsResponse<FriendsPayload['data']>;
type FriendRequestsResponse = PaginatedFriendsResponse<FriendRequestsPayload['data']>;

const normalizePayload = (payload: FriendsResponse['data'] | FriendRequestsResponse['data']) => {
  const meta = payload?.meta;

  if (!meta) {
    return {
      data: payload?.data ?? [],
      count: 0,
      hasMore: false,
      total: 0,
      nextOffset: null,
    };
  }

  return {
    data: payload.data,
    count: meta.total,
    hasMore: meta.hasMore,
    total: meta.total,
    nextOffset: meta.nextOffset,
  };
};

export const friendsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFriends: builder.query<FriendsPayload, FriendsQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        const queryString = queryParams.toString();
        return {
          url: `social/friends${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      transformResponse: (response: FriendsResponse) => normalizePayload(response?.data),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ userId }) => ({ type: 'Friends' as const, id: userId })),
              { type: 'Friends' as const, id: 'LIST' },
            ]
          : [{ type: 'Friends' as const, id: 'LIST' }],
    }),
    getFriendRequests: builder.query<FriendRequestsPayload, FriendsQueryParams | void>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.offset) queryParams.append('offset', params.offset.toString());
        const queryString = queryParams.toString();
        return {
          url: `social/friends/requests${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
        };
      },
      transformResponse: (response: FriendRequestsResponse) => normalizePayload(response?.data),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ userId }) => ({ type: 'FriendRequests' as const, id: userId })),
              { type: 'FriendRequests' as const, id: 'LIST' },
            ]
          : [{ type: 'FriendRequests' as const, id: 'LIST' }],
      keepUnusedDataFor: 30,
    }),
    deleteFriend: builder.mutation<void, string>({
      query: (userId: string) => ({
        url: `social/friends/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: 'Friends', id: userId },
        { type: 'Friends', id: 'LIST' },
      ],
    }),
    toggleFriendRequest: builder.mutation<{ success: boolean }, string>({
      query: (userId) => ({
        url: `social/friends/request/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: 'Friends', id: userId },
        { type: 'Friends', id: 'LIST' },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetFriendsQuery,
  useLazyGetFriendsQuery,
  useGetFriendRequestsQuery,
  useLazyGetFriendRequestsQuery,
  useDeleteFriendMutation,
  useToggleFriendRequestMutation,
} = friendsApi;

