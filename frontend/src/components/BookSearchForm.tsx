import type { FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { styled } from '@mui/material/styles';
import Button from './Button';

const SearchForm = styled('form')(({ theme }) => ({
  width: '100%',
  maxWidth: 560,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    flexDirection: 'row',
  },
}));

interface BookSearchFormProps {
  searchTerm: string;
  onSearchTermChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  size?: 'small' | 'medium';
  autoFocus?: boolean;
  inputId?: string;
}

function BookSearchForm({
  searchTerm,
  onSearchTermChange,
  onSubmit,
  size = 'small',
  inputId,
}: BookSearchFormProps) {
  const { t } = useTranslation();

  return (
    <SearchForm role="search" onSubmit={onSubmit}>
      <TextField
        id={inputId}
        type="search"
        name="query"
        size={size}
        placeholder={t('header.searchPlaceholder')}
        value={searchTerm}
        onChange={onSearchTermChange}
        fullWidth
        autoComplete="off"
        inputProps={{
          'aria-label': t('header.searchAriaLabel'),
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
      <Button type="submit" size={size}>
        {t('header.searchButton')}
      </Button>
    </SearchForm>
  );
}

export default BookSearchForm;

