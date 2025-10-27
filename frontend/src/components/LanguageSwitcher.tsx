import type { MouseEvent } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
import LanguageIcon from '@mui/icons-material/Language';
import { styled, alpha } from '@mui/material/styles';

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  width: 40,
  height: 40,
  color: theme.palette.text.secondary,
  transition: 'all 0.2s ease-in-out',
  border: `1px solid ${theme.palette.primary.main}`,
  '&:hover': {
    transform: 'scale(1.05)',
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
}));

const StyledLanguageIcon = styled(LanguageIcon)(() => ({
  fontSize: '1.25rem',
}));

const languages = [
  { code: 'en', name: 'language.english' },
  { code: 'fr', name: 'language.french' },
  { code: 'es', name: 'language.spanish' },
];

function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const isOpen = Boolean(anchorEl);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    handleClose();
  };

  return (
    <>
      <Tooltip title={t('language.select')}>
        <StyledIconButton
          onClick={handleOpen}
          aria-controls={isOpen ? 'language-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={isOpen ? 'true' : undefined}
          aria-label={t('language.select')}
        >
          <StyledLanguageIcon />
        </StyledIconButton>
      </Tooltip>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {languages.map((language) => (
          <MenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            selected={i18n.language === language.code}
          >
            {t(language.name)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default LanguageSwitcher;

