import './App.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import HomePage from './pages/home/HomePage'
import MainLayout from './layout/MainLayout';
import NotFoundPage from './pages/notfound/NotFoundPage';
import ProfilePage from './pages/profile/ProfilePage'
import SignUpPage from './pages/authentication/SignUpPage';
import SignInPage from './pages/authentication/SingInPage';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<MainLayout />} >
      <Route index element={<HomePage />} />
      <Route path='*' element={<NotFoundPage />} />
      <Route path='/profile' element={<ProfilePage />} />
      <Route path='/auth/Signup' element={<SignUpPage />} />
      <Route path='/auth/Signin' element={<SignInPage />} />
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
