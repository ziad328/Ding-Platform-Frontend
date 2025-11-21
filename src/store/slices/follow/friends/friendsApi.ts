import { apiSlice } from '../../../ApiSlice';
import type { FriendsPayload } from '../types';

interface FriendsResponse {
  code: number;
  success: boolean;
  message: string;
  data: FriendsPayload;
}

const defaultFriendsPayload: FriendsPayload = {
  data: [],
  count: 0,
};

export const friendsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getFriends: builder.query<FriendsPayload, void>({
      query: () => ({
        url: 'social/friends',
        method: 'GET',
      }),
      transformResponse: (response: FriendsResponse) => response?.data ?? defaultFriendsPayload,
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ userId }) => ({ type: 'Friends' as const, id: userId })),
              { type: 'Friends' as const, id: 'LIST' },
            ]
          : [{ type: 'Friends' as const, id: 'LIST' }],
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
  }),
  overrideExisting: false,
});

export const { useGetFriendsQuery, useLazyGetFriendsQuery, useDeleteFriendMutation } = friendsApi;

