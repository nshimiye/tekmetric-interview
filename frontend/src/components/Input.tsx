import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import type { OutlinedInputProps } from '@mui/material/OutlinedInput';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled } from '@mui/material/styles';

const StyledTextarea = styled('textarea')(({ theme }) => ({
  fontFamily: theme.typography.fontFamily,
  fontSize: '1rem',
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.custom.designTokens.borderPanel}`,
  padding: theme.spacing(2.5, 3),
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  lineHeight: 1.5,
  minHeight: 140,
  resize: 'vertical',
  '&:focus': {
    outline: `3px solid ${theme.custom.designTokens.focusRingSubtle}`,
    outlineOffset: 2,
  },
  '&::placeholder': {
    color: theme.palette.text.disabled,
  },
  '&:disabled': {
    backgroundColor: theme.palette.action.disabledBackground,
    cursor: 'not-allowed',
  },
}));

interface InputBaseProps {
  label?: string;
  helperText?: string;
  id?: string;
  name?: string;
}

export function FormInput({ label, helperText, id, ...props }: InputBaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const controlId = id ?? props.name;

  const inputProps = props as OutlinedInputProps;
  return (
    <FormControl fullWidth>
      {label && <FormLabel htmlFor={controlId}>{label}</FormLabel>}
      <OutlinedInput id={controlId} {...inputProps} />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
}

type TextAreaProps = InputBaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

export function FormTextArea({ label, helperText, id, ...props }: TextAreaProps) {
  const controlId = id ?? props.name;

    const textareaProps = props as TextareaHTMLAttributes<HTMLTextAreaElement>;
    return (
      <FormControl fullWidth>
        {label && <FormLabel htmlFor={controlId}>{label}</FormLabel>}
        <StyledTextarea id={controlId} {...textareaProps} />
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
}
