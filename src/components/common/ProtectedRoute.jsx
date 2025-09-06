import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // If a user is logged in but tries to access a page for a different role,
    // redirect them to their own dashboard.
    const homePath = user.role === 'admin' ? '/admin-dashboard' : '/user-dashboard';
    return <Navigate to={homePath} replace />;
  }

  return children;
};

export default ProtectedRoute;
