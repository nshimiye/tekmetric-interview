import { useState, ChangeEvent, FormEvent } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '../components/Button';
import Input from '../components/Input';
import ContentContainer from '../components/layout/ContentContainer';
import { useAuth } from '../auth/AuthContext';

interface RegisterFormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function RegisterScreen() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formState, setFormState] = useState<RegisterFormState>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (formState.password.trim() !== formState.confirmPassword.trim()) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await register({
        name: formState.name,
        email: formState.email,
        password: formState.password,
      });
      navigate('/', { replace: true });
    } catch (error) {
      const message = error && typeof error === 'object' && 'message' in error 
        ? String(error.message) 
        : 'Unable to register at the moment.';
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
            Create an account
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Save your memos and revisit them any time you like.
          </Typography>
        </Stack>

        {errorMessage && (
          <Alert severity="error" variant="outlined">
            {errorMessage}
          </Alert>
        )}

        <Stack spacing={2.5}>
          <Input
            label="Name"
            name="name"
            autoComplete="name"
            value={formState.name}
            onChange={handleChange}
          />

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
            autoComplete="new-password"
            value={formState.password}
            onChange={handleChange}
          />

          <Input
            label="Confirm password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={formState.confirmPassword}
            onChange={handleChange}
          />
        </Stack>

        <Stack spacing={2.5}>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>

          <Typography variant="body2" color="text.secondary">
            Already registered?{' '}
            <Link component={RouterLink} to="/login">
              Sign in
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </ContentContainer>
  );
}

export default RegisterScreen;

