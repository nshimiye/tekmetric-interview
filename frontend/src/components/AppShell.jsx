import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { styled } from '@mui/material/styles';
import Header from './Header';
import { useAuth } from '../auth/AuthContext';

// Redux imports
import {
  loadLibrary,
  clearLibrary,
} from '../store/slices/librarySlice';

// Styled Components
const RootContainer = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  display: 'flex',
  flexDirection: 'column',
}));

const MainContent = styled('main')(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(6),
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  [theme.breakpoints.up('md')]: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(10),
  },
}));

function AppShell() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user, logout } = useAuth();
  const userId = user?.id ?? null;

  // Load library when user logs in
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      dispatch(clearLibrary());
      return;
    }

    dispatch(loadLibrary({ userId }));
  }, [dispatch, isAuthenticated, userId]);

  const handleLogout = () => {
    logout();
    dispatch(clearLibrary());
    navigate('/login', { replace: true });
  };

  return (
    <RootContainer>
      <Header
        isAuthenticated={isAuthenticated}
        user={user}
        onLogout={handleLogout}
      />

      <MainContent>
        <Outlet />
      </MainContent>
    </RootContainer>
  );
}

export default AppShell;
