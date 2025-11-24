import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/sidebar/Sidebar";
import { useSelector } from "react-redux";
import { selectCurrentToken, selectCurrentUser } from "../store/slices/auth/auth";
import { useDarkMode } from "../hook/useDarkMode";

function MainLayout() {
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);

  const isAuthenticated = token && user;

  // Initialize dark mode for all pages (including authentication pages)
  useDarkMode();

  return (
    <div className="h-screen bg-neutral-w-200 dark:bg-dark-bg-primary overflow-hidden flex flex-col">
      {isAuthenticated && <Navbar />}

      <div className="flex flex-1 overflow-hidden w-full">
        {isAuthenticated && <Sidebar />}

        <main className={`flex-1 overflow-y-auto ${isAuthenticated ? 'pb-14 md:pb-0 px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6' : ''}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;