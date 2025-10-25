import { forwardRef } from 'react';
import MuiButton from '@mui/material/Button';

const variantToColor = {
  primary: 'primary',
  secondary: 'secondary',
};

const Button = forwardRef(function Button(
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
