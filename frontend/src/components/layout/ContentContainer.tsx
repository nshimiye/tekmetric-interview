import { forwardRef, ReactNode } from 'react';
import Box, { BoxProps } from '@mui/material/Box';

interface ContentContainerProps extends BoxProps {
  children: ReactNode;
}

const ContentContainer = forwardRef<HTMLDivElement, ContentContainerProps>(function ContentContainer(
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

