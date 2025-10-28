import { useState, useMemo, useEffect, useRef } from 'react';
import { MemoBody } from './BookMemoScreen.styles';
import type { PublicMemo } from '../../../api/publicMemos';
import { useTranslation } from 'react-i18next';
import MemoListSection from './MemoListSection';
import MemoItem from './MemoItem';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

interface CommunityMemosSectionProps {
  memos: PublicMemo[];
}

const MEMOS_PER_PAGE = 10;

function CommunityMemosSection({ memos }: CommunityMemosSectionProps) {
  const { t } = useTranslation();
  const [displayCount, setDisplayCount] = useState(MEMOS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  
  if (!memos || memos.length === 0) {
    return null;
  }

  // Get the memos to display (from start up to displayCount)
  const displayedMemos = useMemo(() => {
    return memos.slice(0, displayCount);
  }, [memos, displayCount]);

  // Check if there are more memos to load
  const hasMore = displayCount < memos.length;

  // Set up intersection observer for infinite scroll
  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // When the sentinel element is visible and we have more to load
        if (entries[0].isIntersecting) {
          setIsLoading((prevLoading) => {
            if (prevLoading) return prevLoading;
            
            // Check if we have more to load
            setDisplayCount((prevCount) => {
              const hasMore = prevCount < memos.length;
              if (!hasMore) return prevCount;
              
              // Simulate a small delay for better UX (feels more natural)
              setTimeout(() => {
                setIsLoading(false);
              }, 300);
              
              return prevCount + MEMOS_PER_PAGE;
            });
            
            return true;
          });
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentTarget);

    return () => {
      observer.unobserve(currentTarget);
    };
  }, [memos.length]); // Only recreate if total memos count changes

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
          {isLoading && (
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
