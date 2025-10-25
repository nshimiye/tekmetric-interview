import { forwardRef } from 'react';
import Box from '@mui/material/Box';

const ContentContainer = forwardRef(function ContentContainer(
  { sx, children, ...props },
  ref,
) {
  return (
    <Box
      ref={ref}
      sx={{
        width: '100%',
        maxWidth: 1180,
        display: 'flex',
        flexDirection: 'column',
        gap: (theme) => theme.spacing(8),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  );
});

export default ContentContainer;
