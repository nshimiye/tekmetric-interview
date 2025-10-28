import type { MouseEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import LogoutIcon from '@mui/icons-material/Logout';
import LanguageSwitcher from '../LanguageSwitcher';
import type { PublicUser } from '../../auth/AuthContext';
import {
  UserAvatar,
  StyledMenu,
  UserInfoSection,
  UserName,
  UserEmail,
  AvatarContainer,
} from './styles';

interface UserMenuProps {
  user: PublicUser | null;
  onLogout: () => void;
}

function UserMenu({ user, onLogout }: UserMenuProps) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    onLogout();
  };

  const getUserInitials = (): string => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <>
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
        <LanguageSwitcher />
        <AvatarContainer>
          <Tooltip title={t('header.accountSettings')}>
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
        </AvatarContainer>
      </Stack>
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
          <ListItemText>{t('header.logout')}</ListItemText>
        </MenuItem>
      </StyledMenu>
    </>
  );
}

export default UserMenu;

