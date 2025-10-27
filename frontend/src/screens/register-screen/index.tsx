import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import {FormInput} from '../../components/Input';
import ContentContainer from '../../components/layout/ContentContainer';
import { FormPaper } from '../../components/FormPaper';
import { useRegisterScreen } from './hooks';

function RegisterScreen() {
  const { t } = useTranslation();
  const {
    formState,
    errorMessage,
    isSubmitting,
    handleChange,
    handleSubmit,
  } = useRegisterScreen();

  return (
    <ContentContainer component="section" gap={6}>
      <FormPaper component="form" onSubmit={handleSubmit}>
        <Stack spacing={1}>
          <Typography variant="h4" component="h1">
            {t('register.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('register.subtitle')}
          </Typography>
        </Stack>

        {errorMessage && (
          <Alert severity="error" variant="outlined">
            {errorMessage}
          </Alert>
        )}

        <Stack spacing={2.5}>
          <FormInput
            label={t('register.name')}
            name="name"
            autoComplete="name"
            value={formState.name}
            onChange={handleChange}
          />

          <FormInput
            label={t('register.email')}
            name="email"
            type="email"
            autoComplete="email"
            value={formState.email}
            onChange={handleChange}
          />

          <FormInput
            label={t('register.password')}
            name="password"
            type="password"
            autoComplete="new-password"
            value={formState.password}
            onChange={handleChange}
          />

          <FormInput
            label={t('register.confirmPassword')}
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={formState.confirmPassword}
            onChange={handleChange}
          />
        </Stack>

        <Stack spacing={2.5}>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? t('register.creatingAccount') : t('register.createAccount')}
          </Button>

          <Typography variant="body2" color="text.secondary">
            {t('register.alreadyRegistered')}{' '}
            <Link component={RouterLink} to="/login">
              {t('register.signIn')}
            </Link>
          </Typography>
        </Stack>
      </FormPaper>
    </ContentContainer>
  );
}

export default RegisterScreen;

