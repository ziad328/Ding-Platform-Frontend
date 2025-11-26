import { apiSlice } from '../../ApiSlice';
import { setProfile, setProfileError, setProfileLoading } from './profile';
import type { ProfileData } from './profile';

interface ProfileApiResponse {
  code: number;
  success: boolean;
  message: string;
  data: ProfileData;
}

export const profileApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentProfile: builder.query<ProfileData, void>({
      query: () => ({ url: 'profile/me', method: 'GET' }),
      transformResponse: (response: ProfileApiResponse | ProfileData) =>
        (response as ProfileApiResponse).data ?? (response as ProfileData),
      async onQueryStarted(_args, { dispatch, queryFulfilled }) {
        dispatch(setProfileLoading());
        try {
          const { data } = await queryFulfilled;
          dispatch(setProfile(data));
        } catch (error) {
          dispatch(setProfileError(error instanceof Error ? error.message : 'Failed to load profile'));
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetCurrentProfileQuery } = profileApi;

