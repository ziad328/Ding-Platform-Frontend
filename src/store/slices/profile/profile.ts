import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

export interface ProfileUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface PrivacySettings {
  id: string;
  profileVisibility: string;
  postsVisibility: string;
  friendsVisibility: string;
  bioVisibility: string;
  emailVisibility: string;
  phoneVisibility: string;
  locationVisibility: string;
  dateOfBirthVisibility: string;
  whoCanSendFriendRequests: string;
  whoCanMessageMe: string;
  allowCameraAccess: boolean;
  allowMicrophoneAccess: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileData {
  id: string;
  userId: string;
  bio: string | null;
  coverPhoto: string | null;
  dateOfBirth: string | null;
  location: string | null;
  website: string | null;
  phoneNumber: string | null;
  user: ProfileUser;
  privacySettings: PrivacySettings;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileState {
  data: ProfileData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  isLoading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfileLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    setProfile(state, action: PayloadAction<ProfileData>) {
      state.data = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setProfileError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    resetProfile: () => initialState,
  },
});

export const { setProfileLoading, setProfile, setProfileError, resetProfile } = profileSlice.actions;
export default profileSlice.reducer;

export const selectProfile = (state: RootState) => state.profile.data;
export const selectProfileLoading = (state: RootState) => state.profile.isLoading;
export const selectProfileError = (state: RootState) => state.profile.error;

