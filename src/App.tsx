import './App.css'
import { lazy, Suspense } from 'react'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import MainLayout from './layout/MainLayout';
import AuthLayout from './layout/AuthLayout';
import PublicLayout from './layout/PublicLayout';
import { Toaster } from 'sonner';

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
const ReelsPage = lazy(() => import('./pages/reels/ReelsPage'))
const MarketplacePage = lazy(() => import('./pages/marketplace/MarketplacePage'))
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'))

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
        <Route path='reels' element={<ReelsPage />} />
        <Route path='marketplace' element={<MarketplacePage />} />
        <Route path='settings' element={<SettingsPage />} />
        <Route path='*' element={<NotFoundPage />} />
      </Route>
    </>
  )
);

function App() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen text-2xl bg-white dark:bg-neutral-b-900 text-neutral-b-500 dark:text-neutral-b-300">
        Loading...
      </div>
    }>
      <Toaster
        position="top-right"
        closeButton
        offset="70px"
        style={{ right: 12 }}
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'Manrope, Poppins, sans-serif',
          },
          classNames: {
            toast: 'bg-white dark:bg-[#1E293B] border border-[#E2E8F0] dark:border-[#475569] shadow-lg',
            title: 'text-[#0C1024] dark:text-[#F1F5F9]',
            description: 'text-[#5D6778] dark:text-[#94A3B8]',
            error: 'bg-red-50 dark:bg-[#1E293B] border-[#B81616] dark:border-[#CC4F3C]',
            success: 'bg-green-50 dark:bg-[#1E293B] border-[#036B30] dark:border-[#428553]',
            warning: 'bg-yellow-50 dark:bg-[#1E293B] border-[#E4A704] dark:border-[#EDB648]',
            closeButton: 'bg-[#E2E8F0] dark:bg-[#334155] hover:bg-[#CBD5E1] dark:hover:bg-[#475569] text-[#5D6778] dark:text-[#94A3B8]',
          },
        }}
      />
      <RouterProvider router={router} />
    </Suspense>
  )
}

export default App