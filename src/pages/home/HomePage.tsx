
import { useGetSessionsQuery } from '../../store/slices/session/sessionApi';
import { useDispatch, useSelector } from "react-redux";
import { useRefreshMutation, useSendLogOutMutation } from "../../store/slices/auth/authApi";
import { selectCurrentUser, setCredentials } from "../../store/slices/auth/auth";

const HomePage = () => {
    const { data: sessionsResponse, error, isLoading } = useGetSessionsQuery();
    const sessions = (sessionsResponse as any)?.data?.data || (sessionsResponse as any)?.data || sessionsResponse || [];
    const [sendLogOut] = useSendLogOutMutation();
    const [refresh] = useRefreshMutation();
    const user = useSelector(selectCurrentUser);

    const dispatch = useDispatch();

    const handleLogOut = () => {
        sendLogOut();
    }

    const handleRefresh = async () => {
        const result = await refresh();
        if ("data" in result && result.data) {
            const refreshData = result.data as any;
            dispatch(setCredentials({ accessToken: refreshData?.data?.accessToken, user }));
        } else {
            console.error("Refresh failed:", result.error);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg-primary">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-primary-400 mx-auto mb-4"></div>
                    <div className="text-lg text-gray-600 dark:text-dark-text-secondary">Loading sessions...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg-primary">
                <div className="text-center">
                    <div className="text-red-500 dark:text-red-400 text-6xl mb-4">⚠️</div>
                    <div className="text-lg text-red-600 dark:text-red-400 mb-4">Error loading sessions</div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-blue-600 dark:bg-primary-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-primary-700 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg-primary">
            {/* Header */}
            <div className="bg-white dark:bg-dark-bg-secondary shadow-sm border-b dark:border-dark-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-blue-600 dark:bg-primary-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-lg">
                                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary">
                                    Welcome back, {user?.name || 'User'}!
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-dark-text-muted">{user?.email}</p>
                            </div>
                        </div>

                        <div className="flex space-x-3">
                            <button
                                onClick={handleRefresh}
                                className="px-4 py-2 bg-blue-600 dark:bg-primary-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-primary-700 transition-colors flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Refresh</span>
                            </button>
                            <button
                                onClick={handleLogOut}
                                className="px-4 py-2 bg-red-600 dark:bg-semantic-r-800 text-white rounded-lg hover:bg-red-700 dark:hover:bg-semantic-r-900 transition-colors flex items-center space-x-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* User Info Card */}
                <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm border dark:border-dark-border p-6 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-dark-text-primary mb-4">Account Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-dark-text-muted">Name</label>
                            <p className="text-lg text-gray-900 dark:text-dark-text-primary">{user?.name || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-dark-text-muted">Email</label>
                            <p className="text-lg text-gray-900 dark:text-dark-text-primary">{user?.email || 'N/A'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-dark-text-muted">Status</label>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user?.active ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400'
                                }`}>
                                {user?.active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-dark-text-muted">Email Verified</label>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user?.emailVerified ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                                }`}>
                                {user?.emailVerified ? 'Verified' : 'Not Verified'}
                            </span>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-dark-text-muted">Member Since</label>
                            <p className="text-lg text-gray-900 dark:text-dark-text-primary">
                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-dark-text-muted">Last Updated</label>
                            <p className="text-lg text-gray-900 dark:text-dark-text-primary">
                                {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sessions Section */}
                <div className="bg-white dark:bg-dark-bg-secondary rounded-lg shadow-sm border dark:border-dark-border">
                    <div className="px-6 py-4 border-b dark:border-dark-border">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-dark-text-primary">Active Sessions</h2>
                        <p className="text-sm text-gray-500 dark:text-dark-text-muted mt-1">Manage your active sessions across different devices</p>
                    </div>

                    <div className="p-6">
                        {sessions && Array.isArray(sessions) && sessions.length > 0 ? (
                            <div className="space-y-4">
                                {sessions.map((session, index) => (
                                    <div key={session.id || index} className="border dark:border-dark-border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-dark-bg-tertiary transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-blue-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-blue-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">
                                                        Session {index + 1}
                                                        {session.isCurrent && (
                                                            <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs rounded-full">
                                                                Current Session
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-dark-text-muted">Device and browser information</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${session.status === 'active'
                                                    ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400'
                                                }`}>
                                                {session.status || 'Unknown'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <label className="font-medium text-gray-500 dark:text-dark-text-muted">IP Address</label>
                                                <p className="text-gray-900 dark:text-dark-text-primary font-mono">{session.ipAddress || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="font-medium text-gray-500 dark:text-dark-text-muted">Created</label>
                                                <p className="text-gray-900 dark:text-dark-text-primary">
                                                    {session.createdAt ? new Date(session.createdAt).toLocaleString() : 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="font-medium text-gray-500 dark:text-dark-text-muted">Last Activity</label>
                                                <p className="text-gray-900 dark:text-dark-text-primary">
                                                    {session.updatedAt ? new Date(session.updatedAt).toLocaleString() : 'N/A'}
                                                </p>
                                            </div>
                                            <div className="md:col-span-2 lg:col-span-1">
                                                <label className="font-medium text-gray-500 dark:text-dark-text-muted">User Agent</label>
                                                <p className="text-gray-900 dark:text-dark-text-primary text-xs break-all">
                                                    {session.userAgent || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-dark-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-dark-text-primary">No sessions found</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-muted">No active sessions to display.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;