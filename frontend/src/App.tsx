import { Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from './auth/RequireAuth';
import RequireGuest from './auth/RequireGuest';
import AppShell from './components/AppShell';
import BookMemoScreen from './screens/book-memo-screen';
import HomeScreen from './screens/home-screen';
import LoginScreen from './screens/login-screen';
import RegisterScreen from './screens/register-screen';

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route element={<RequireAuth />}>
          <Route index element={<HomeScreen />} />
          <Route path="books/:bookId" element={<BookMemoScreen />} />
        </Route>
        <Route element={<RequireGuest />}>
          <Route path="login" element={<LoginScreen />} />
          <Route path="register" element={<RegisterScreen />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
