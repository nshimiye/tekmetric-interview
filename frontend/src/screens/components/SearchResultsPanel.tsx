import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import ResultCard from './ResultCard';
import type {
  BookSearchResult} from '../../store/slices/searchSlice';
import {
  selectSearchStatus,
  selectSearchResults,
  selectSearchError,
  selectLastSearchQuery,
  selectLastResultFromCache,
  clearSearch,
  clearSearchCache,
  searchBooks,
} from '../../store/slices/searchSlice';
import type { AppDispatch } from '../../store';

const ResultsPanelSection = styled(Paper)(({ theme }) => ({
  // borderRadius: theme.shape.borderRadius * 3,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  padding: theme.spacing(3),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(5),
    gap: theme.spacing(4),
  },
})) as typeof Paper;

const PanelBody = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
}));

const CarouselArea = styled('div')({
  position: 'relative',
});

const CarouselHeading = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(16),
  fontWeight: 400,
  color: theme.palette.text.secondary,
})) as typeof Typography;

interface CarouselNavButtonProps {
  placement?: 'left' | 'right';
}

const CarouselNavButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== 'placement',
})<CarouselNavButtonProps>(({ theme, placement = 'left' }) => {
  const basePosition = {
    left: theme.spacing(-1),
    right: 'auto' as const,
  };
  const altPosition = {
    right: theme.spacing(-1),
    left: 'auto' as const,
  };

  return {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'none',
    boxShadow: `0 12px 28px ${theme.custom.designTokens.overlayShadowStrong}`,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
    ...(placement === 'left' ? basePosition : altPosition),
    [theme.breakpoints.up('sm')]: {
      display: 'inline-flex',
      ...(placement === 'left'
        ? { left: theme.spacing(-3.5), right: 'auto' }
        : { right: theme.spacing(-3.5), left: 'auto' }),
    },
  };
});

const CarouselTrack = styled('ul')(({ theme }) => ({
  listStyle: 'none',
  margin: 0,
  padding: theme.spacing(1.5, 1, 1.5),
  display: 'flex',
  gap: theme.spacing(2.5),
  overflowX: 'auto',
  scrollSnapType: 'x proximity',
  scrollBehavior: 'smooth',
  WebkitOverflowScrolling: 'touch',
  '&::-webkit-scrollbar': {
    display: 'none',
  },
  scrollbarWidth: 'none',
  [theme.breakpoints.up('md')]: {
    gap: theme.spacing(3.5),
  },
}));

const CarouselItem = styled('li')(({ theme }) => ({
  flex: '0 0 auto',
  width: '82%',
  scrollSnapAlign: 'start',
  [theme.breakpoints.up('sm')]: {
    width: 280,
  },
  [theme.breakpoints.up('md')]: {
    width: 280,
  },
}));

interface SearchResultsPanelProps {
  onAddMemo: (book: BookSearchResult) => void;
  onAddToShelf: (book: BookSearchResult) => void;
  savedBookIds: Set<string>;
}

function SearchResultsPanel({
  onAddMemo,
  onAddToShelf,
  savedBookIds,
}: SearchResultsPanelProps) {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get search state from Redux
  const status = useSelector(selectSearchStatus);
  const results = useSelector(selectSearchResults);
  const error = useSelector(selectSearchError);
  const lastQuery = useSelector(selectLastSearchQuery);
  const lastResultFromCache = useSelector(selectLastResultFromCache);
  const safeResults = Array.isArray(results) ? results : [];
  const carouselTrackRef = useRef<HTMLUListElement>(null);
  const [carouselState, setCarouselState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });

  const hasResults = status === 'success' && safeResults.length > 0;
  const readableQuery =
    lastQuery && lastQuery.trim().length > 0
      ? `"${lastQuery}"`
      : 'your search';
  const headingText =
    status === 'loading'
      ? t('search.searchingFor', { query: readableQuery })
      : t('search.resultsFor', { query: readableQuery });

  const updateCarouselState = useCallback(() => {
    const track = carouselTrackRef.current;
    if (!track) {
      setCarouselState((prev) =>
        prev.canScrollLeft || prev.canScrollRight
          ? { canScrollLeft: false, canScrollRight: false }
          : prev,
      );
      return;
    }

    const { scrollLeft, clientWidth, scrollWidth } = track;
    const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);

    setCarouselState((prev) => {
      const next = {
        canScrollLeft: scrollLeft > 0,
        canScrollRight: scrollLeft < maxScrollLeft - 1,
      };

      if (
        prev.canScrollLeft === next.canScrollLeft &&
        prev.canScrollRight === next.canScrollRight
      ) {
        return prev;
      }

      return next;
    });
  }, []);

  const scrollCarouselBy = useCallback(
    (direction: number) => {
      const track = carouselTrackRef.current;
      if (!track) {
        return;
      }

      const scrollStep = Math.max(track.clientWidth * 0.85, 240);
      if (typeof track.scrollBy === 'function') {
        track.scrollBy({
          left: direction * scrollStep,
          behavior: 'smooth',
        });
      } else {
        track.scrollLeft += direction * scrollStep;
      }

      if (typeof window !== 'undefined' && window.requestAnimationFrame) {
        window.requestAnimationFrame(() => {
          updateCarouselState();
        });
      } else {
        updateCarouselState();
      }
    },
    [updateCarouselState],
  );

  useEffect(() => {
    if (!hasResults) {
      return;
    }

    const track = carouselTrackRef.current;
    if (!track) {
      return;
    }

    if (typeof track.scrollTo === 'function') {
      track.scrollTo({ left: 0 });
    } else {
      track.scrollLeft = 0;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateCarouselState();
  }, [hasResults, updateCarouselState]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      updateCarouselState();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [updateCarouselState]);

  // Reset carousel state when search is cleared
  useEffect(() => {
    if (status !== 'idle') {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCarouselState((prev) =>
      prev.canScrollLeft || prev.canScrollRight
        ? { canScrollLeft: false, canScrollRight: false }
        : prev,
    );
  }, [status]);

  const handleClear = () => {
    dispatch(clearSearch());

    setCarouselState((prev) =>
      prev.canScrollLeft || prev.canScrollRight
        ? { canScrollLeft: false, canScrollRight: false }
        : prev,
    );
  };

  const handleClearCache = () => {
    // Clear the cache first
    dispatch(clearSearchCache());
    // Then re-run the search with the same query to get fresh results
    if (lastQuery && lastQuery.trim().length > 0) {
      dispatch(searchBooks(lastQuery));
    }
  };

  if (status === 'idle') {
    return null;
  }

  let feedback = null;

  if (!hasResults) {
    if (status === 'loading') {
      feedback = (
        <Typography
          variant="body2"
          role="status"
          aria-live="polite"
          color="text.secondary"
        >
          {t('search.searching')}
        </Typography>
      );
    } else if (status === 'error') {
      feedback = (
        <Typography variant="body2" role="alert" color="error.main">
          {error ?? t('search.error')}
        </Typography>
      );
    } else if (status === 'success') {
      feedback = (
        <Typography variant="body2" color="text.secondary">
          {t('search.noResults', { query: readableQuery })}
        </Typography>
      );
    }
  }

  return (
    <ResultsPanelSection component="section" elevation={2}>
      <Stack
        component="header"
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
      >
        <Stack spacing={0.5}>
          <CarouselHeading component="h2">
            {headingText}
          </CarouselHeading>
          {lastResultFromCache && hasResults && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ maxWidth: 600 }}
            >
              {t('search.cachedResults')}
            </Typography>
          )}
        </Stack>

        <Stack direction="row" spacing={2}>
          <Button type="button" variant="outlined" onClick={handleClear}>
            {t('search.clearSearch')}
          </Button>
          {lastResultFromCache && hasResults && (
            <Button 
              type="button" 
              onClick={handleClearCache}
              title={t('search.retryTitle')}
            >
              {t('search.retrySearch')}
            </Button>
          )}
        </Stack>
      </Stack>

      <PanelBody>
        {hasResults ? (
          <CarouselArea>
            <CarouselNavButton
              aria-label={t('search.scrollLeft')}
              onClick={() => scrollCarouselBy(-1)}
              disabled={!carouselState.canScrollLeft}
              size="large"
              placement="left"
            >
              <ChevronLeftIcon />
            </CarouselNavButton>

            <CarouselTrack
              ref={carouselTrackRef}
              onScroll={updateCarouselState}
              aria-label={t('search.booksMatchingSearch')}
            >
              {safeResults.map((result) => {
                const isSaved =
                  savedBookIds instanceof Set && savedBookIds.has(result.id);

                return (
                  <CarouselItem key={result.id}>
                    <ResultCard
                      result={result}
                      isSaved={isSaved}
                      onAddMemo={onAddMemo}
                      onAddToShelf={onAddToShelf}
                    />
                  </CarouselItem>
                );
              })}
            </CarouselTrack>

            <CarouselNavButton
              aria-label={t('search.scrollRight')}
              onClick={() => scrollCarouselBy(1)}
              disabled={!carouselState.canScrollRight}
              size="large"
              placement="right"
            >
              <ChevronRightIcon />
            </CarouselNavButton>
          </CarouselArea>
        ) : (
          feedback
        )}
      </PanelBody>
    </ResultsPanelSection>
  );
}

export default SearchResultsPanel;

