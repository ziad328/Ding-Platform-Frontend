import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

// ─────────────────────────────────────────────────────────────────────────────
// NoroChatUI slice — manages local UI state for the NoroChat feature.
// This is separate from the 'chat' slice which handles real-time DM messaging.
// Registered in the store under the key 'noroChat'.
// ─────────────────────────────────────────────────────────────────────────────

interface NoroChatUIState {
  /** The currently selected/active chat session ID, or null if on the welcome screen */
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

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectActiveSessionId = (state: RootState) =>
  state.noroChat.activeSessionId;
