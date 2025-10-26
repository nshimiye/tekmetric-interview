import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import MemoEditor from './components/MemoEditor';
import UserMemosSection from './components/UserMemosSection';
import CommunityMemosSection from './components/CommunityMemosSection';
import BookDetailsCard from './components/BookDetailsCard';
import { useBookMemoScreen } from './hooks';
import {
  StyledContentContainer,
  MemoLayout,
  MemoColumn,
  BookColumn,
  StyledBreadcrumbs,
  BreadcrumbLink,
} from './styles';

function BookMemoScreen() {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>();

  const {
    selectedBook,
    savedMemos,
    sharedMemos,
    canViewSharedMemos,
    draftMemo,
    status,
    memoInputRef,
    handleMemoChange,
    handleSaveMemo,
    handleClearDraft,
    handleToggleMemoPublic,
  } = useBookMemoScreen(bookId);

  if (!selectedBook) {
    return <Navigate to="/" replace />;
  }

  return (
    <StyledContentContainer>
      <MemoLayout>
        <MemoColumn>
          <StyledBreadcrumbs aria-label="breadcrumb">
            <BreadcrumbLink
              component="button"
              variant="body1"
              onClick={() => navigate('/')}
            >
              Home
            </BreadcrumbLink>
            <Typography variant="body1" color="text.primary">
              {selectedBook.title}
            </Typography>
          </StyledBreadcrumbs>

          <MemoEditor
            draftMemo={draftMemo}
            onMemoChange={handleMemoChange}
            onSaveMemo={handleSaveMemo}
            onClearDraft={handleClearDraft}
            status={status}
            memoInputRef={memoInputRef}
          />

          <UserMemosSection
            memos={savedMemos}
            onToggleMemoPublic={handleToggleMemoPublic}
          />

          {canViewSharedMemos && (
            <CommunityMemosSection memos={sharedMemos} />
          )}
        </MemoColumn>

        <BookColumn>
          <BookDetailsCard book={selectedBook} />
        </BookColumn>
      </MemoLayout>
    </StyledContentContainer>
  );
}

export default BookMemoScreen;

