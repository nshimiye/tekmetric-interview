import { useState, ChangeEvent, FormEvent } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '../components/Button';
import Input from '../components/Input';
import ContentContainer from '../components/layout/ContentContainer';
import { useAuth } from '../auth/AuthContext';

interface LoginFormState {
  email: string;
  password: string;
}

function LoginScreen() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname ?? '/';

  const [formState, setFormState] = useState<LoginFormState>({
    email: '',
    password: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await login(formState);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error 
        ? String(error.message) 
        : 'Unable to sign in right now.';
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ContentContainer component="section" gap={6}>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          maxWidth: 420,
          width: '100%',
          px: { xs: 3, sm: 4 },
          py: { xs: 4, sm: 5 },
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        }}
        elevation={0}
      >
        <Stack spacing={1}>
          <Typography variant="h4" component="h1">
            Welcome back
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Log in to continue capturing your book memos.
          </Typography>
        </Stack>

        {errorMessage && (
          <Alert severity="error" variant="outlined">
            {errorMessage}
          </Alert>
        )}

        <Stack spacing={2.5}>
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={formState.email}
            onChange={handleChange}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={formState.password}
            onChange={handleChange}
          />
        </Stack>

        <Stack spacing={2.5}>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </Button>

          <Typography variant="body2" color="text.secondary">
            Need an account?{' '}
            <Link component={RouterLink} to="/register">
              Create one
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </ContentContainer>
  );
}

export default LoginScreen;

