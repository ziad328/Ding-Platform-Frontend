import { Outlet, Navigate, useLocation } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Sidebar from "../components/sidebar/Sidebar";
import { useSelector } from "react-redux";
import { selectCurrentToken, selectCurrentUser } from "../store/slices/auth/auth";
import { useDarkMode } from "../hook/useDarkMode";
import ScrollToTop from "../components/common/ScrollToTop";
import ChatSocketBootstrap from "../components/messages/ChatSocketBootstrap";

function MainLayout() {
  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();

  // Initialize dark mode
  useDarkMode();

  // Check if we're on the messages page - no padding needed there
  const isMessagesPage = location.pathname === '/messages';

  // If user is not authenticated, redirect to welcome page
  if (!token || !user) {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <div className="h-screen bg-neutral-w-200 dark:bg-dark-bg-primary overflow-hidden flex flex-col">
      <ScrollToTop />
      <ChatSocketBootstrap />
      <Navbar />

      <div className="flex flex-1 overflow-hidden w-full">
        <Sidebar />

        <main className={`flex-1 overflow-y-auto pb-14 md:pb-0 ${isMessagesPage ? '' : 'px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;