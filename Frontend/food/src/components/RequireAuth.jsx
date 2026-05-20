import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Protects routes that require authentication.
 * Optionally checks for a specific role.
 */
const RequireAuth = ({ children, allowedRole }) => {
    const { isLoggedIn, role } = useSelector((state) => state.auth);
    const location = useLocation();

    if (!isLoggedIn) {
        // Redirect to login, preserving the attempted URL
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If a specific role is required, check it
    if (allowedRole && role !== allowedRole) {
        // Redirect to appropriate home based on actual role
        const redirectTo = role === 'OWNER' ? '/owner' : '/';
        return <Navigate to={redirectTo} replace />;
    }

    // Authorized → render the protected route subtree.
    return children;
};

export default RequireAuth;
