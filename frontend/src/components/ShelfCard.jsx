import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Button from './Button';

const StyledShelfCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'backgroundImage',
})(({ theme, backgroundImage }) => ({
  height: '100%',
  aspectRatio: '3 / 4',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  overflow: 'hidden',
  border: `1px solid ${theme.custom.designTokens.borderPanel}`,
  backgroundImage: backgroundImage
    ? `url(${backgroundImage})`
    : theme.custom.gradients.hero(),
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(to bottom, 
      rgba(250, 250, 250, 0.3) 0%, 
      rgba(250, 250, 250, 1) 50%, 
      rgba(250, 250, 250, 1) 100%
    )`,
    zIndex: 1,
  },
}));

const ShelfCardContent = styled(CardContent)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  gap: theme.spacing(2),
  position: 'relative',
  zIndex: 2,
  marginTop: 'auto',
}));


const OneLineText = styled(Typography)(({ theme }) => ({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  width: '100%'
}));

const ShelfSnippet = styled(OneLineText)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(14),
}));


const FullWidthButton = styled(Button)(() => ({
  width: '100%',
}));

const getLatestMemoSnippet = (memos) => {
  if (!Array.isArray(memos) || memos.length === 0) {
    return null;
  }

  const latestMemo = memos[memos.length - 1];
  if (!latestMemo?.body) {
    return null;
  }

  const body = latestMemo.body.trim();
  if (body.length === 0) {
    return null;
  }

  return body.length > 120 ? `${body.slice(0, 120)}…` : body;
};

function ShelfCard({ book, memos, onViewMemos }) {
  const snippet = getLatestMemoSnippet(memos);
  const authorsText =
    Array.isArray(book.authors) && book.authors.length > 0
      ? book.authors.join(', ')
      : null;
  const memoCount = Array.isArray(memos) ? memos.length : 0;

  return (
    <StyledShelfCard
      component="article"
      role="listitem"
      backgroundImage={book.thumbnail}
      aria-label={`${book.title}${authorsText ? ` by ${authorsText}` : ''}`}
    >
      <ShelfCardContent>
        <OneLineText
          variant="h6"
          component="h3"
        >
          {book.title}
        </OneLineText>

        {authorsText && (
          <OneLineText variant="body2"
          >
            by {authorsText}
          </OneLineText>
        )}

        {snippet && (
          <ShelfSnippet variant="body2">
            "{snippet}"
          </ShelfSnippet>
        )}

        <Typography variant="caption">
          {memoCount} memo{memoCount === 1 ? '' : 's'}
        </Typography>
      </ShelfCardContent>

      <CardActions sx={{ mt: 'auto', px: 3, pb: 3, position: 'relative', zIndex: 2 }}>
        <FullWidthButton onClick={() => onViewMemos(book)}>
          View memos
        </FullWidthButton>
      </CardActions>
    </StyledShelfCard>
  );
}

export default ShelfCard;

