import { apiSlice } from '../../ApiSlice';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface UpdatePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

export type VisibilityLevel = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';

export interface ProfilePrivacyData {
  profileVisibility: VisibilityLevel;
  postsVisibility: VisibilityLevel;
  emailVisibility: VisibilityLevel;
  allowCameraAccess: boolean;
}

// Shape returned by GET /profile/me (only the fields we care about)
export interface MyProfileResponse {
  id: string;
  username: string;
  displayName: string;
  privacy?: ProfilePrivacyData;
  // profile slice stores it as privacySettings — handle both shapes
  privacySettings?: ProfilePrivacyData;
}

// ─── Settings API ───────────────────────────────────────────────────────────

export const settingsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    // ── Security ────────────────────────────────────────────────────────────

    updatePassword: builder.mutation<any, UpdatePasswordPayload>({
      query: (body) => ({
        url: 'auth/update-password',
        method: 'PATCH',
        body,
      }),
    }),

    // ── Profile Privacy ─────────────────────────────────────────────────────

    getMyProfile: builder.query<MyProfileResponse, void>({
      query: () => 'profile/me',
      transformResponse: (raw: any): MyProfileResponse => {
        const d = raw?.data ?? raw;
        return d;
      },
      providesTags: [{ type: 'Profile', id: 'ME' }],
    }),

    updateProfilePrivacy: builder.mutation<any, Partial<ProfilePrivacyData>>({
      query: (body) => ({
        url: 'profile/privacy',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'Profile', id: 'ME' }],
    }),

    // ── Danger Zone ─────────────────────────────────────────────────────────

    toggleUserActivity: builder.mutation<any, string>({
      query: (userId) => ({
        url: `users/${userId}/toggle-activity`,
        method: 'PATCH',
      }),
    }),

    deleteUser: builder.mutation<any, string>({
      query: (userId) => ({
        url: `users/${userId}`,
        method: 'DELETE',
      }),
    }),
  }),

  overrideExisting: false,
});

export const {
  useUpdatePasswordMutation,
  useGetMyProfileQuery,
  useUpdateProfilePrivacyMutation,
  useToggleUserActivityMutation,
  useDeleteUserMutation,
} = settingsApi;
