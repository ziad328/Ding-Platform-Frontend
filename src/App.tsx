import './App.css'
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom'
import HomePage from './pages/home/HomePage'
import MainLayout from './layout/MainLayout';
import NotFoundPage from './pages/notfound/NotFoundPage';
import ProfilePage from './pages/profile/ProfilePage'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<MainLayout />} >
      <Route index element={<HomePage />} />
      <Route path='*' element={<NotFoundPage />} />
      <Route path='/about' element={<ProfilePage />} />
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
