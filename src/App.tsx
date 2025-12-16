import './App.css'
import { lazy, Suspense } from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import MainLayout from './layout/MainLayout';
import AuthLayout from './layout/AuthLayout';
import PublicLayout from './layout/PublicLayout';

// Lazy load all page components
const HomePage = lazy(() => import('./pages/home/HomePage'))
const NotFoundPage = lazy(() => import('./pages/notfound/NotFoundPage'))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage.tsx'))
const SuggestedFriendsPage = lazy(() => import('./pages/profile/SuggestedFriendsPage.tsx'))
const SuggestedFollowersPage = lazy(() => import('./pages/profile/SuggestedFollowersPage.tsx'))
const FriendsPage = lazy(() => import('./pages/profile/FriendsPage.tsx'))
const FollowersPage = lazy(() => import('./pages/profile/FollowersPage.tsx'))
const FollowingPage = lazy(() => import('./pages/profile/FollowingPage.tsx'))
const SignUpPage = lazy(() => import('./pages/authentication/SignUpPage'))
const SignInPage = lazy(() => import('./pages/authentication/SingInPage'))
const ForgotPasswordPage = lazy(() => import('./pages/authentication/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/authentication/ResetPasswordPage'))
const EmailLoginPage = lazy(() => import('./pages/authentication/EmailLoginPage'))
const OTPVerificationPage = lazy(() => import('./pages/authentication/OTPVerificationPage'))
const LandingPage = lazy(() => import('./pages/landing/LandingPage'))
const MessagesPage = lazy(() => import('./pages/messages/MessagesPage'))

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
    <Suspense fallback={
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem'
      }}>
        Loading...
      </div>
    }>
      <RouterProvider router={router} />
    </Suspense>
  )
}

export default App