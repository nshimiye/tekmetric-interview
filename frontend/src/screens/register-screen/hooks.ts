import type { ChangeEvent, FormEvent } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthContext';

interface RegisterFormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function useRegisterScreen() {
  const { t } = useTranslation();
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
      setErrorMessage(t('register.passwordMismatch'));
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
        : t('register.errorDefault');
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

