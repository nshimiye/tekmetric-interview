import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { styled } from '@mui/material/styles';
import Header from './header';
import { useAuth } from '../auth/AuthContext';

// Redux imports
import { loadLibrary } from '../store/slices/librarySlice';
import { loadPublicMemos } from '../store/slices/publicMemosSlice';
import { clearSearch } from '../store/slices/searchSlice';
import type { AppDispatch } from '../store';

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
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    dispatch(loadPublicMemos());
  }, [dispatch]);

  // Load library and set search user when user logs in
  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated || !userId) {
      dispatch(loadLibrary({ userId: null }));
      return;
    }

    dispatch(loadLibrary({ userId }));
  }, [dispatch, isAuthenticated, isLoading, userId]);

  const handleLogout = () => {
    logout();
    dispatch(loadLibrary({ userId: null }));
    dispatch(clearSearch());
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
