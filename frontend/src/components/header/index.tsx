import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import LanguageSwitcher from '../LanguageSwitcher';
import BookSearchForm from '../BookSearchForm';
import type { PublicUser } from '../../auth/AuthContext';
import { useSearch } from './hooks';
import UserMenu from './UserMenu';
import {
  StyledAppBar,
  HeaderContainer,
  LogoLink,
  SearchFormWrapper,
} from './styles';
import { Box } from '@mui/material';

interface HeaderProps {
  isAuthenticated: boolean;
  user: PublicUser | null;
  onLogout: () => void;
}

function Header({ isAuthenticated, user, onLogout }: HeaderProps) {
  const { t } = useTranslation();
  const { searchTerm, handleSearchChange, handleSearchSubmit } = useSearch();

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
              {t('header.logo')}
            </LogoLink>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              width={{ xs: '100%', sm: 'auto' }}
              spacing={8}
            >
              {isAuthenticated ? (
                <>
                  <SearchFormWrapper>
                    <BookSearchForm
                      searchTerm={searchTerm}
                      onSearchTermChange={handleSearchChange}
                      onSubmit={handleSearchSubmit}
                      size="small"
                      inputId="book-search-input"
                    />
                  </SearchFormWrapper>

                  <UserMenu user={user} onLogout={onLogout} />
                </>
              ) : (
                <>
                    <Button component={Link} to="/register" >
                      {t('header.createAccount')}
                    </Button>
                    <Box display="flex" justifyContent="center">
                      <LanguageSwitcher />
                    </Box>
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

