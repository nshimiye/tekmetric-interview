import { forwardRef, ReactNode } from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import { styled } from '@mui/material/styles';

interface ContentContainerProps extends BoxProps {
  children: ReactNode;
}

const StyledBox = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 1180,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(8),
}));

const ContentContainer = forwardRef<HTMLDivElement, ContentContainerProps>(function ContentContainer(
  { children, ...props },
  ref,
) {
  return (
    <StyledBox
      ref={ref}
      {...props}
    >
      {children}
    </StyledBox>
  );
});

export default ContentContainer;

