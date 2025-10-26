import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Button from '../../components/Button';

const StyledResultCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2.5),
  height: '100%',
}));

const ResultCover = styled('div')(({ theme }) => ({
  width: '100%',
  aspectRatio: '3 / 4',
  borderRadius: theme.shape.borderRadius * 2.5,
  border: `1px solid ${theme.custom.designTokens.borderMuted}`,
  overflow: 'hidden',
  backgroundColor: theme.custom.designTokens.backgroundBody,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const ResultThumbnailImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const NoCoverText = styled(Typography)(({ theme }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  textAlign: 'center',
}));

const OneLineText = styled(Typography)(({ theme }) => ({
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  width: '100%'
}));
const ResultTitle = styled(OneLineText)(({ theme }) => ({
  fontSize: '1.05rem',
  fontWeight: 600,
}));

const ResultDescription = styled(Typography)(() => ({
  display: '-webkit-box',
  WebkitLineClamp: 3, // Limit to 3 lines
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
}));

const ResultMeta = styled('div')(({ theme }) => ({
  marginTop: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
}));

const ResultActionsRow = styled(Stack)(() => ({
  width: '100%',
}));

const ResultActionButton = styled(Button)(() => ({
  flex: 1,
  minWidth: 100,
}));

function ResultCard({ result, isSaved, onAddMemo, onAddToShelf }) {
  return (
    <StyledResultCard component="article" variant="outlined">
      <ResultCover>
        {result.thumbnail ? (
          <ResultThumbnailImage
            src={result.thumbnail}
            alt={`Cover of ${result.title}`}
            loading="lazy"
          />
        ) : (
          <NoCoverText variant="caption" component="span" color="text.secondary">
            No cover available
          </NoCoverText>
        )}
      </ResultCover>

      <Box>
        <ResultTitle variant="h6" component="h3">
          {result.title}
        </ResultTitle>
        {Array.isArray(result.authors) && result.authors.length > 0 && (
          <Typography variant="body2" color="text.secondary">
            by {result.authors.join(', ')}
          </Typography>
        )}
      </Box>

      {result.description && (
        <ResultDescription variant="body2" color="text.secondary">
          {result.description}
        </ResultDescription>
      )}

      <ResultMeta>
        <Typography variant="caption" color="text.secondary">
          {result.publishedDate
            ? `Published ${result.publishedDate}`
            : 'Publication date unknown'}
        </Typography>

        <ResultActionsRow direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <ResultActionButton
            type="button"
            onClick={() => {
              if (typeof onAddMemo === 'function') {
                onAddMemo(result);
              }
            }}
          >
            Add memo
          </ResultActionButton>
          <ResultActionButton
            type="button"
            variant="secondary"
            disabled={isSaved}
            onClick={() => {
              if (!isSaved && typeof onAddToShelf === 'function') {
                onAddToShelf(result);
              }
            }}
          >
            {isSaved ? 'In shelf' : 'Add to Shelf'}
          </ResultActionButton>
        </ResultActionsRow>

      </ResultMeta>
    </StyledResultCard>
  );
}

export default ResultCard;

