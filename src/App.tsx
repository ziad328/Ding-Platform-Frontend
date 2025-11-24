import './App.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Navigate } from 'react-router-dom'
import HomePage from './pages/home/HomePage'
import MainLayout from './layout/MainLayout';
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
import { useSelector } from 'react-redux';
import { selectCurrentToken, selectCurrentUser } from './store/slices/auth/auth';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);

  if (!token || !user) {
    return <Navigate to="/welcome" replace />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<MainLayout />} >
      <Route index element={
        <ProtectedRoute>
          <HomePage />
        </ProtectedRoute>
      } />
      <Route path='/welcome' element={<LandingPage />} />
      <Route path='*' element={<NotFoundPage />} />
      <Route path='/profile' element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path='/profile/suggested-friends' element={<ProtectedRoute><SuggestedFriendsPage /></ProtectedRoute>} />
      <Route path='/profile/suggested-followers' element={<ProtectedRoute><SuggestedFollowersPage /></ProtectedRoute>} />
      <Route path='/profile/friends' element={<ProtectedRoute><FriendsPage /></ProtectedRoute>} />
      <Route path='/profile/followers' element={<ProtectedRoute><FollowersPage /></ProtectedRoute>} />
      <Route path='/profile/following' element={<ProtectedRoute><FollowingPage /></ProtectedRoute>} />
      <Route path='/auth/signup' element={<SignUpPage />} />
      <Route path='/auth/signin' element={<SignInPage />} />
      <Route path='/auth/email-login' element={<EmailLoginPage />} />
      <Route path='/auth/forgot-password' element={<ForgotPasswordPage />} />
      <Route path='/auth/reset-password' element={<ResetPasswordPage />} />
      <Route path='/auth/verfiy-otp' element={<OTPVerificationPage />} />
    </Route>
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