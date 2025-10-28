import { useState, useMemo, useEffect, useRef, useEffectEvent } from 'react';
import { MemoBody } from './BookMemoScreen.styles';
import { useTranslation } from 'react-i18next';
import MemoListSection from './MemoListSection';
import MemoItem from './MemoItem';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectSharedMemos, 
  selectPaginationForBook,
  selectIsLoadingMoreForBook 
} from '../../../store/slices/publicMemosSlice';
import { loadMorePublicMemos } from '../../../store/thunks/publicMemosThunks';
import { useAuth } from '../../../auth/AuthContext';
import type { AppDispatch } from '../../../store';

interface CommunityMemosSectionProps {
  bookId: string;
}

const MEMOS_PER_PAGE = 10;

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

  const [displayCount, setDisplayCount] = useState(MEMOS_PER_PAGE);
  const observerTarget = useRef<HTMLDivElement>(null);
  const hasInitiallyLoaded = useRef(false);
  
  // Load first page of memos if we don't have pagination info yet
  useEffect(() => {
    if (!hasInitiallyLoaded.current && !pagination && memos.length === 0) {
      hasInitiallyLoaded.current = true;
      dispatch(loadMorePublicMemos({ 
        bookId, 
        page: 1, 
        limit: MEMOS_PER_PAGE 
      }));
    }
  }, [dispatch, bookId, pagination, memos.length]);
  
  if (!memos || memos.length === 0) {
    if (isLoadingMore) {
      return (
        <MemoListSection
          title={t('memo.community')}
          ariaLabel="Shared memos from other readers"
        >
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
        </MemoListSection>
      );
    }
    return null;
  }

  // Get the memos to display (from start up to displayCount)
  const displayedMemos = useMemo(() => {
    return memos.slice(0, displayCount);
  }, [memos, displayCount]);

  // Check if there are more memos to load from frontend state
  const hasFrontendMore = displayCount < memos.length;
  
  // Check if there are more memos to load from backend
  const hasBackendMore = pagination?.hasMore ?? false;
  
  // Overall check if we have any more memos
  const hasMore = hasFrontendMore || hasBackendMore;

  // Non-reactive event handler for loading more memos
  const onLoadMore = useEffectEvent(() => {
    if (isLoadingMore) return;
    
    // If we have more memos in frontend state, just display them
    if (hasFrontendMore) {
      setDisplayCount(prev => prev + MEMOS_PER_PAGE);
    } 
    // Otherwise, fetch more from backend
    else if (hasBackendMore) {
      const nextPage = (pagination?.page ?? 0) + 1;
      dispatch(loadMorePublicMemos({ 
        bookId, 
        page: nextPage, 
        limit: MEMOS_PER_PAGE 
      }));
    }
  });

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentTarget);

    return () => {
      observer.unobserve(currentTarget);
    };
  }, []); // No dependencies needed! useEffectEvent handles reactive values

  return (
    <MemoListSection
      title={t('memo.community')}
      ariaLabel="Shared memos from other readers"
    >
      {displayedMemos.map((memo) => (
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
      {hasMore && (
        <>
          {/* Invisible sentinel element to trigger loading */}
          <div ref={observerTarget} style={{ height: '1px' }} />
          {isLoadingMore && (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                mt: 3,
                mb: 2 
              }}
            >
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary">
                Loading more memos...
              </Typography>
            </Box>
          )}
        </>
      )}
    </MemoListSection>
  );
}

export default CommunityMemosSection;
