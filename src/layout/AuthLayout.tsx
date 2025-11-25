import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentToken, selectCurrentUser } from "../store/slices/auth/auth";
import { useDarkMode } from "../hook/useDarkMode";

function AuthLayout() {
    const token = useSelector(selectCurrentToken);
    const user = useSelector(selectCurrentUser);

    // Initialize dark mode
    useDarkMode();

    // If user is authenticated, redirect to home
    if (token && user) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen bg-neutral-w-200 dark:bg-dark-bg-primary">
            <Outlet />
        </div>
    );
}

export default AuthLayout;
