import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import { styled, alpha } from '@mui/material/styles';

export const StyledAppBar = styled(AppBar)(({ theme }) => ({
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
  backgroundColor: alpha(theme.palette.background.paper, 0.92),
  backdropFilter: 'blur(12px)',
}));

export const HeaderContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
}));

export const LogoLink = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  color: theme.palette.text.primary,
  textDecoration: 'none',
  letterSpacing: '0.02em',
  '&:hover': {
    color: theme.palette.primary.main,
  },
})) as typeof Typography;

export const SearchFormWrapper = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 560,
  [theme.breakpoints.up('md')]: {
    marginLeft: 'auto',
  },
}));

export const UserAvatar = styled(Avatar)(({ theme }) => ({
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

export const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    marginTop: theme.spacing(1.5),
    minWidth: 200,
    borderRadius: theme.shape.borderRadius,
    boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.15)}`,
  },
}));

export const UserInfoSection = styled('div')(({ theme }) => ({
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const UserName = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.primary,
}));

export const UserEmail = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
}));

export const AvatarContainer = styled(Box)(() => ({
  textAlign: 'center',
}));
