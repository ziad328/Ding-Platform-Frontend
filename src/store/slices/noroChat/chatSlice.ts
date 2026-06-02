/**
 * noroChatSlice — local UI state for the NoroChat feature.
 * Tracks the currently active chat session ID.
 * Separate from the 'chat' slice which handles real-time DM messaging.
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

interface NoroChatUIState {
  activeSessionId: string | null;
}

const initialState: NoroChatUIState = {
  activeSessionId: null,
};

const noroChatSlice = createSlice({
  name: 'noroChat',
  initialState,
  reducers: {
    setActiveSession: (state, action: PayloadAction<string>) => {
      state.activeSessionId = action.payload;
    },
    clearActiveSession: (state) => {
      state.activeSessionId = null;
    },
  },
});

export const { setActiveSession, clearActiveSession } = noroChatSlice.actions;
export default noroChatSlice.reducer;
export const selectActiveSessionId = (state: RootState) => state.noroChat.activeSessionId;
