import './App.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import HomePage from './pages/home/HomePage'
import MainLayout from './layout/MainLayout';
import AuthLayout from './layout/AuthLayout';
import PublicLayout from './layout/PublicLayout';
import NotFoundPage from './pages/notfound/NotFoundPage';
import ProfilePage from './pages/profile/ProfilePage.tsx'
import SuggestedFriendsPage from './pages/profile/SuggestedFriendsPage.tsx';
import SuggestedFollowersPage from './pages/profile/SuggestedFollowersPage.tsx';
import FriendsPage from './pages/profile/FriendsPage.tsx';
import FollowersPage from './pages/profile/FollowersPage.tsx';
import FollowingPage from './pages/profile/FollowingPage.tsx';
import SignUpPage from './pages/authentication/SignUpPage';
import SignInPage from './pages/authentication/SingInPage';
import ForgotPasswordPage from './pages/authentication/ForgotPasswordPage';
import ResetPasswordPage from './pages/authentication/ResetPasswordPage';
import EmailLoginPage from './pages/authentication/EmailLoginPage';
import OTPVerificationPage from './pages/authentication/OTPVerificationPage';
import LandingPage from './pages/landing/LandingPage';
import MessagesPage from './pages/messages/MessagesPage';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public Routes - Landing Page */}
      <Route element={<PublicLayout />}>
        <Route path='/welcome' element={<LandingPage />} />
      </Route>

      {/* Authentication Routes */}
      <Route path='/auth' element={<AuthLayout />}>
        <Route path='signup' element={<SignUpPage />} />
        <Route path='signin' element={<SignInPage />} />
        <Route path='email-login' element={<EmailLoginPage />} />
        <Route path='forgot-password' element={<ForgotPasswordPage />} />
        <Route path='reset-password' element={<ResetPasswordPage />} />
        <Route path='verfiy-otp' element={<OTPVerificationPage />} />
      </Route>

      {/* Protected Routes - Main App */}
      <Route path='/' element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path='profile' element={<ProfilePage />} />
        <Route path='profile/suggested-friends' element={<SuggestedFriendsPage />} />
        <Route path='profile/suggested-followers' element={<SuggestedFollowersPage />} />
        <Route path='profile/friends' element={<FriendsPage />} />
        <Route path='profile/followers' element={<FollowersPage />} />
        <Route path='profile/following' element={<FollowingPage />} />
        <Route path='messages' element={<MessagesPage />} />
        <Route path='*' element={<NotFoundPage />} />
      </Route>
    </>
  )
);

function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App