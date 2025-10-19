import './App.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import HomePage from './pages/home/HomePage'
import MainLayout from './layout/MainLayout';
import NotFoundPage from './pages/notfound/NotFoundPage';
import ProfilePage from './pages/profile/ProfilePage'
import SignUpPage from './pages/authentication/SignUpPage';
import SignInPage from './pages/authentication/SingInPage';
import ForgotPasswordPage from './pages/authentication/ForgotPasswordPage';
import ResetPasswordPage from './pages/authentication/ResetPasswordPage';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<MainLayout />} >
      <Route index element={<HomePage />} />
      <Route path='*' element={<NotFoundPage />} />
      <Route path='/profile' element={<ProfilePage />} />
      <Route path='/auth/signup' element={<SignUpPage />} />
      <Route path='/auth/signin' element={<SignInPage />} />
      <Route path='/auth/forgot-password' element={<ForgotPasswordPage />} />
      <Route path='/auth/reset-password' element={<ResetPasswordPage />} />
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
