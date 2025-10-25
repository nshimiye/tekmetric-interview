import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import BookMemoScreen from './screens/BookMemoScreen';
import HomeScreen from './screens/HomeScreen';

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomeScreen />} />
        <Route path="books/:bookId" element={<BookMemoScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
