import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { toggleTheme, selectIsDark } from '../store/slices/theme/themeSlice';

export const useDarkMode = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(selectIsDark);

  // Sync DOM class and localStorage whenever the Redux state changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    dispatch(toggleTheme());
  };

  return { isDarkMode, toggleDarkMode };
};
