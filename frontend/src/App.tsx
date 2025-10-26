import { Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from './auth/RequireAuth';
import AppShell from './components/AppShell';
import BookMemoScreen from './screens/book-memo-screen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route element={<RequireAuth />}>
          <Route index element={<HomeScreen />} />
          <Route path="books/:bookId" element={<BookMemoScreen />} />
        </Route>
        <Route path="login" element={<LoginScreen />} />
        <Route path="register" element={<RegisterScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;

