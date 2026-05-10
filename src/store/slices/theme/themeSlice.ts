import { createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

interface ThemeState {
  isDark: boolean;
}

const getInitialTheme = (): boolean => {
  try {
    return localStorage.getItem('theme') === 'dark';
  } catch {
    return false;
  }
};

const initialState: ThemeState = {
  isDark: getInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.isDark = !state.isDark;
    },
    setTheme(state, action: { payload: 'light' | 'dark' }) {
      state.isDark = action.payload === 'dark';
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;

export const selectIsDark = (state: RootState) => state.theme.isDark;
