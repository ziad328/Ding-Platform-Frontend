import { Outlet, Navigate, useLocation } from "react-router-dom";
import Sidebar from "../components/sidebar/Sidebar";
import { useSelector } from "react-redux";
import { selectCurrentToken, selectCurrentUser } from "../store/slices/auth/auth";
import { useDarkMode } from "../hook/useDarkMode";
import ScrollToTop from "../components/common/ScrollToTop";
import ChatSocketBootstrap from "../components/messages/ChatSocketBootstrap";

function MainLayout() {
  const token = useSelector(selectCurrentToken);
  const user  = useSelector(selectCurrentUser);
  const location = useLocation();
  useDarkMode();

  const isFullWidthPage = location.pathname === '/messages' || location.pathname === '/noro';

  if (!token || !user) {
    return <Navigate to="/welcome" replace />;
  }

  return (
    <div className="h-screen bg-neutral-w-200 dark:bg-dark-bg-primary overflow-hidden">
      <ScrollToTop />
      <ChatSocketBootstrap />
      <Sidebar />

      {/* Main content — offset by collapsed sidebar width on desktop */}
      <main
        className={`h-full overflow-y-auto pb-16 md:pb-0 md:ml-[72px]
          ${isFullWidthPage ? '' : 'px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6'}`}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;