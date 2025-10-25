import { forwardRef } from 'react';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
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

const Input = forwardRef(function Input(
  { label, helperText, multiline = false, id, ...props },
  ref,
) {
  const controlId = id ?? props.name;

  if (multiline) {
    return (
      <FormControl fullWidth>
        {label && <FormLabel htmlFor={controlId}>{label}</FormLabel>}
        <StyledTextarea id={controlId} ref={ref} {...props} />
        {helperText && <FormHelperText>{helperText}</FormHelperText>}
      </FormControl>
    );
  }

  return (
    <FormControl fullWidth>
      {label && <FormLabel htmlFor={controlId}>{label}</FormLabel>}
      <OutlinedInput id={controlId} inputRef={ref} {...props} />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
});

export default Input;
