import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { useAuth } from './AuthContext';

function RequireGuest() {
  const { isAuthenticated, isLoading } = useAuth();
  const outletContext = useOutletContext();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet context={outletContext} />;
}

export default RequireGuest;

