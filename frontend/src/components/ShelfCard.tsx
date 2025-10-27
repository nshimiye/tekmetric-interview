import { useTranslation } from 'react-i18next';
import type { CardTypeMap } from '@mui/material/Card';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Button from './Button';
import type { LibraryBook } from '../store/slices/librarySlice';
import type { Memo } from '../library/libraryStorage';
import type { OverridableComponent } from '@mui/material/OverridableComponent';

interface StyledShelfCardProps {
  backgroundImage?: string | null;
  component: string,
}

const StyledShelfCard = styled(Card, {
  shouldForwardProp: (prop) => prop !== 'backgroundImage',
})<StyledShelfCardProps>(({ theme, backgroundImage }) => ({
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
})) as OverridableComponent<CardTypeMap<StyledShelfCardProps, "div">>;

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


const OneLineText = styled(Typography)(() => ({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  width: '100%'
})) as typeof Typography;

const ShelfSnippet = styled(OneLineText)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(14),
}));


const FullWidthButton = styled(Button)(() => ({
  width: '100%',
}));

const StyledCardActions = styled(CardActions)(({ theme }) => ({
  marginTop: 'auto',
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  position: 'relative',
  zIndex: 2,
}));

const getLatestMemoSnippet = (memos: Memo[]): string | null => {
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

interface ShelfCardProps {
  book: LibraryBook;
  memos: Memo[];
  onViewMemos: (book: LibraryBook) => void;
}

function ShelfCard({ book, memos, onViewMemos }: ShelfCardProps) {
  const { t } = useTranslation();
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
      aria-label={`${book.title}${authorsText ? ` ${t('book.by')} ${authorsText}` : ''}`}
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
            {t('book.by')} {authorsText}
          </OneLineText>
        )}

        {snippet && (
          <ShelfSnippet variant="body2">
            &quot;{snippet}&quot;
          </ShelfSnippet>
        )}

        <Typography variant="caption">
          {t('book.memoCount', { count: memoCount })}
        </Typography>
      </ShelfCardContent>

      <StyledCardActions>
        <FullWidthButton onClick={() => onViewMemos(book)}>
          {t('book.viewMemos')}
        </FullWidthButton>
      </StyledCardActions>
    </StyledShelfCard>
  );
}

export default ShelfCard;

