import { useEffect } from 'react';
import { MemoBody } from './BookMemoScreen.styles';
import { useTranslation } from 'react-i18next';
import MemoListSection from './MemoListSection';
import MemoItem from './MemoItem';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectIsLoadingMoreForBook,
  selectPaginationForBook,
  selectSharedMemos,
} from '../../../store/slices/publicMemosSlice';
import { loadMorePublicMemos } from '../../../store/thunks/publicMemosThunks';
import { useAuth } from '../../../auth/AuthContext';
import type { AppDispatch } from '../../../store';
import { Box, Typography, CircularProgress, Button } from '@mui/material';

interface CommunityMemosSectionProps {
  bookId: string;
}

const MEMOS_PER_PAGE = 10;

const LoadingSpinner = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        py: 4
      }}
    >
      <CircularProgress size={32} />
      <Typography variant="body2" color="text.secondary">
        Loading memos...
      </Typography>
    </Box>
  );
};


function CommunityMemosSection({ bookId }: CommunityMemosSectionProps) {
  const { user } = useAuth();
  if (!user) {
    throw new Error('User must be logged in to access CommunityMemosSection');
  }
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const memos = useSelector(selectSharedMemos(bookId, user.id));
  const pagination = useSelector(selectPaginationForBook(bookId));
  const isLoadingMore = useSelector(selectIsLoadingMoreForBook(bookId));

  useEffect(() => {
    dispatch(loadMorePublicMemos({
      bookId,
      page: 1,
      limit: MEMOS_PER_PAGE
    }));
  }, [bookId, dispatch]);

  const handleLoadMore = () => {
    dispatch(loadMorePublicMemos({
      bookId,
      page: pagination.page + 1,
      limit: MEMOS_PER_PAGE
    }));
  };


  if (!memos || memos.length === 0) {
    if (isLoadingMore) {
      return (
        <MemoListSection
          title={t('memo.community')}
          ariaLabel="Shared memos from other readers"
        >
          <LoadingSpinner />
        </MemoListSection>
      );
    }
    return null;
  }


  return (
    <MemoListSection
      title={t('memo.community')}
      ariaLabel="Shared memos from other readers"
    >
      {memos.map((memo) => (
        <MemoItem
          key={memo.id}
          id={memo.id}
          body={memo.body}
          timestamp={memo.sharedAt}
          footer={
            <MemoBody variant="body2" color="text.secondary">
              By {memo.author.name}
            </MemoBody>
          }
        />
      ))}

      {pagination?.hasMore && (
        <Button variant="text" onClick={handleLoadMore}
          disabled={isLoadingMore} loading={isLoadingMore}
          loadingPosition="start">
          {isLoadingMore ? 'Loading...' : 'Load more'}
        </Button>
      )}
    </MemoListSection>
  );
}

export default CommunityMemosSection;
