import { useState, ChangeEvent, FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthContext';

interface LoginFormState {
  email: string;
  password: string;
}

export function useLoginScreen() {
  const { t } = useTranslation();
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
        : t('login.errorDefault');
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formState,
    errorMessage,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
}

