import { forwardRef, ReactNode } from 'react';
import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button';

const variantToColor = {
  primary: 'primary',
  secondary: 'secondary',
} as const;

type ButtonVariant = keyof typeof variantToColor;

interface ButtonProps extends Omit<MuiButtonProps, 'color' | 'variant'> {
  variant?: ButtonVariant;
  type?: 'button' | 'submit' | 'reset';
  children: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', type = 'button', children, ...rest },
  ref,
) {
  const color = variantToColor[variant] ?? 'primary';

  return (
    <MuiButton
      ref={ref}
      type={type}
      color={color}
      data-variant={variant}
      {...rest}
    >
      {children}
    </MuiButton>
  );
});

export default Button;

