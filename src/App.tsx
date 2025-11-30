import './App.css'
import { lazy, Suspense } from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'

// Layouts are kept as static imports since they're needed immediately
import MainLayout from './layout/MainLayout';
import AuthLayout from './layout/AuthLayout';
import PublicLayout from './layout/PublicLayout';

// Lazy load all page components for code-splitting
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

// Loading fallback component
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.2rem',
    color: '#666'
  }}>
    Loading...
  </div>
)

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      {/* Public Routes - Landing Page */}
      <Route element={<PublicLayout />}>
        <Route path='/welcome' element={
          <Suspense fallback={<LoadingFallback />}>
            <LandingPage />
          </Suspense>
        } />
      </Route>

      {/* Authentication Routes */}
      <Route path='/auth' element={<AuthLayout />}>
        <Route path='signup' element={
          <Suspense fallback={<LoadingFallback />}>
            <SignUpPage />
          </Suspense>
        } />
        <Route path='signin' element={
          <Suspense fallback={<LoadingFallback />}>
            <SignInPage />
          </Suspense>
        } />
        <Route path='email-login' element={
          <Suspense fallback={<LoadingFallback />}>
            <EmailLoginPage />
          </Suspense>
        } />
        <Route path='forgot-password' element={
          <Suspense fallback={<LoadingFallback />}>
            <ForgotPasswordPage />
          </Suspense>
        } />
        <Route path='reset-password' element={
          <Suspense fallback={<LoadingFallback />}>
            <ResetPasswordPage />
          </Suspense>
        } />
        <Route path='verfiy-otp' element={
          <Suspense fallback={<LoadingFallback />}>
            <OTPVerificationPage />
          </Suspense>
        } />
      </Route>

      {/* Protected Routes - Main App */}
      <Route path='/' element={<MainLayout />}>
        <Route index element={
          <Suspense fallback={<LoadingFallback />}>
            <HomePage />
          </Suspense>
        } />
        <Route path='profile' element={
          <Suspense fallback={<LoadingFallback />}>
            <ProfilePage />
          </Suspense>
        } />
        <Route path='profile/suggested-friends' element={
          <Suspense fallback={<LoadingFallback />}>
            <SuggestedFriendsPage />
          </Suspense>
        } />
        <Route path='profile/suggested-followers' element={
          <Suspense fallback={<LoadingFallback />}>
            <SuggestedFollowersPage />
          </Suspense>
        } />
        <Route path='profile/friends' element={
          <Suspense fallback={<LoadingFallback />}>
            <FriendsPage />
          </Suspense>
        } />
        <Route path='profile/followers' element={
          <Suspense fallback={<LoadingFallback />}>
            <FollowersPage />
          </Suspense>
        } />
        <Route path='profile/following' element={
          <Suspense fallback={<LoadingFallback />}>
            <FollowingPage />
          </Suspense>
        } />
        <Route path='*' element={
          <Suspense fallback={<LoadingFallback />}>
            <NotFoundPage />
          </Suspense>
        } />
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