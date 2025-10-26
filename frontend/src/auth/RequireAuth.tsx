import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import { useAuth } from './AuthContext';

function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const outletContext = useOutletContext();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet context={outletContext} />;
}

export default RequireAuth;

