import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { styled, alpha } from '@mui/material/styles';
import ClearIcon from '@mui/icons-material/Clear';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import SearchIcon from '@mui/icons-material/Search';
import Button from './Button';

// Redux imports
import {
  searchBooks,
  setSearchTerm,
  clearSearch as clearSearchAction,
  selectSearchTerm,
  selectSearchStatus,
} from '../store/slices/searchSlice';
import { Box } from '@mui/material';

// Styled Components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
  backgroundColor: alpha(theme.palette.background.paper, 0.92),
  backdropFilter: 'blur(12px)',
}));

const HeaderContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

const LogoLink = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.text.primary,
  textDecoration: 'none',
  letterSpacing: '0.02em',
  '&:hover': {
    color: theme.palette.primary.main,
  },
}));

const SearchForm = styled('form')(({ theme }) => ({
  width: '100%',
  maxWidth: 560,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
  },
  [theme.breakpoints.up('md')]: {
    marginLeft: 'auto',
  },
}));

const UserAvatar = styled(Avatar)(({ theme }) => ({
  width: 40,
  height: 40,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontSize: '1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    marginTop: theme.spacing(1.5),
    minWidth: 200,
    borderRadius: theme.shape.borderRadius,
    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
  },
}));

const UserInfoSection = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const UserName = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

const UserEmail = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
}));

function Header({
  isAuthenticated,
  user,
  onLogout,
}) {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const isMenuOpen = Boolean(anchorEl);
  
  // Redux state
  const searchTerm = useSelector(selectSearchTerm);
  const searchStatus = useSelector(selectSearchStatus);
  
  // Ref for managing abort controller
  const activeRequest = useRef(null);

  // Cleanup on unmount
  useEffect(
    () => () => {
      if (activeRequest.current) {
        activeRequest.current.abort();
      }
    },
    [],
  );

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    onLogout();
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    dispatch(setSearchTerm(value));
  };

  const clearSearch = useCallback(() => {
    if (activeRequest.current) {
      activeRequest.current.abort();
      activeRequest.current = null;
    }

    dispatch(clearSearchAction());
  }, [dispatch]);

  const handleSearchSubmit = async (event) => {
    event.preventDefault();

    const query = searchTerm.trim();
    if (query.length === 0) {
      clearSearch();
      return;
    }

    if (activeRequest.current) {
      activeRequest.current.abort();
    }

    const controller = new AbortController();
    activeRequest.current = controller;

    try {
      await dispatch(searchBooks(query)).unwrap();
    } catch (error) {
      // Error is handled by the slice
      if (error.name !== 'AbortError') {
        console.error('Search error:', error);
      }
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
      }
    }
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <StyledAppBar position="sticky" color="inherit" elevation={0}>
      <HeaderContainer maxWidth="lg">
        <Stack direction="column" gap={3}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
            gap={2}
          >
            <LogoLink component={Link} to="/" variant="h5">
              Book Memo
            </LogoLink>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              width={{ xs: '100%', sm: 'auto' }}
              spacing={8}
            >
              {isAuthenticated ? (
                <>
                  <SearchForm role="search" onSubmit={handleSearchSubmit}>
                    <TextField
                      type="search"
                      name="query"
                      size="small"
                      placeholder="Search books by title, author, or ISBN..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      fullWidth
                      autoComplete="off"
                      inputProps={{
                        'aria-label': 'Search books',
                        inputMode: 'search',
                        role: 'searchbox',
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon aria-hidden="true" color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />

        
                      <Button
                        type="submit"
                        size="small"
                      >
                        Search
                      </Button>
                  </SearchForm>

<Box sx={{ textAlign: 'center' }}>
                  <Tooltip title="Account settings">
                    <IconButton
                      onClick={handleMenuOpen}
                      size="small"
                      aria-controls={isMenuOpen ? 'account-menu' : undefined}
                      aria-haspopup="true"
                      aria-expanded={isMenuOpen ? 'true' : undefined}
                    >
                      <UserAvatar>{getUserInitials()}</UserAvatar>
                    </IconButton>
                  </Tooltip>
</Box>
                  <StyledMenu
                    id="account-menu"
                    anchorEl={anchorEl}
                    open={isMenuOpen}
                    onClose={handleMenuClose}
                    onClick={handleMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <UserInfoSection>
                      <UserName variant="body1">{user?.name}</UserName>
                      <UserEmail variant="body2">
                        {user?.email || 'User account'}
                      </UserEmail>
                    </UserInfoSection>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Log out</ListItemText>
                    </MenuItem>
                  </StyledMenu>
                </>
              ) : (
                <>
                  <Button
                    component={Link}
                    to="/login"
                    variant="secondary"
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    Sign in
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    Create account
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </Stack>
      </HeaderContainer>
    </StyledAppBar>
  );
}

export default Header;

