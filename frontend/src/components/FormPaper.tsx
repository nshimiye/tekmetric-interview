import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

// TODO: find out how to use the component prop with styled()
// FormPaper is supposed to always be rendered using form html tag
export const FormPaper = styled(Paper)(({ theme }) => ({
    maxWidth: 420,
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(4),
    padding: theme.spacing(4),
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(8),
    },
  })) as typeof Paper;

